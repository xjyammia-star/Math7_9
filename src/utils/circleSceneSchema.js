const ALLOWED_POINT_ROLES = new Set([
  'external_point',
  'tangent_point',
  'arc_point',
  'intersection_point',
  'foot_point',
]);

const ALLOWED_RELATION_TYPES = new Set([
  'tangent',
  'arc_membership',
  'tangent_at_point',
  'intersection',
  'collinear',
  'diameter',
  'chord',
  'line',
  'helper_line',
]);

function asText(value) {
  return String(value ?? '').trim();
}

function asFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeNamedValueList(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => (item && typeof item === 'object' ? { ...item } : null))
    .filter(Boolean);
}

function normalizeCircleScene(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      conceptId: 'circles',
      figureType: 'circle',
      center: 'O',
      points: [],
      relations: [],
      givens: [],
      targets: [],
      display: {},
    };
  }

  const scene = { ...input };
  scene.conceptId = asText(scene.conceptId || scene.concept_id || 'circles') || 'circles';
  scene.figureType = asText(scene.figureType || scene.figure_type || scene.type || 'circle') || 'circle';
  scene.center = (asText(scene.center || scene.centerPoint || scene.label_O || 'O') || 'O').toUpperCase();
  scene.points = normalizeNamedValueList(scene.points);
  scene.relations = normalizeNamedValueList(scene.relations);
  scene.givens = normalizeNamedValueList(scene.givens);
  scene.targets = normalizeNamedValueList(scene.targets);
  scene.display = scene.display && typeof scene.display === 'object' && !Array.isArray(scene.display) ? { ...scene.display } : {};

  scene.points = scene.points.map((point) => ({
    ...point,
    name: (asText(point.name || point.label || point.point || point.id) || '').toUpperCase(),
    role: asText(point.role || point.kind || 'intersection_point'),
    arcSide: point.arcSide ? asText(point.arcSide) : undefined,
  })).filter((point) => point.name);

  scene.relations = scene.relations.map((relation) => ({
    ...relation,
    type: asText(relation.type || relation.kind || relation.relation),
    point: relation.point ? (asText(relation.point) || '').toUpperCase() : relation.point,
    touches: relation.touches ? (asText(relation.touches) || '').toUpperCase() : relation.touches,
    line: relation.line ? (asText(relation.line) || '').toUpperCase() : relation.line,
    arc: relation.arc ? (asText(relation.arc) || '').toUpperCase() : relation.arc,
    of: Array.isArray(relation.of) ? relation.of.map((item) => (asText(item) || '').toUpperCase()).filter(Boolean) : relation.of,
  })).filter((relation) => relation.type);

  scene.givens = scene.givens.map((given) => ({
    ...given,
    name: (asText(given.name || given.label || given.key) || '').toUpperCase(),
    value: given.value ?? given.number ?? given.amount,
  })).filter((given) => given.name);

  scene.targets = scene.targets.map((target) => ({
    ...target,
    name: (asText(target.name || target.label || target.key) || '').toUpperCase(),
  })).filter((target) => target.name);

  return scene;
}

function extractCircleScene(text) {
  const source = String(text ?? '');
  const match = source.match(/```math-diagram\s*([\s\S]*?)```/i);
  if (!match) return null;

  const jsonText = String(match[1] ?? '').trim();
  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (parsed.template === 'circle_scene' && parsed.scene && typeof parsed.scene === 'object') {
        return { ...parsed, scene: normalizeCircleScene(parsed.scene) };
      }
      if (parsed.conceptId === 'circles' || parsed.template === 'circle_scene') {
        return {
          template: 'circle_scene',
          scene: normalizeCircleScene(parsed.scene ? parsed.scene : parsed),
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

function detectCircleSceneIssues(text) {
  const source = String(text ?? '');
  const legacyMatch = source.match(/```math-diagram\s*([\s\S]*?)```/i);
  if (legacyMatch) {
    try {
      const parsed = JSON.parse(String(legacyMatch[1] ?? '').trim());
      const template = String(parsed?.template ?? parsed?.type ?? '').trim();
      if (template.startsWith('circle') && template !== 'circle_scene') {
        return [];
      }
    } catch {
      // Fall through to scene validation.
    }
  }

  const extracted = extractCircleScene(text);
  if (!extracted) {
    return ['circle_scene_invalid'];
  }

  const validation = validateCircleScene(extracted.scene);
  return validation.ok ? [] : ['circle_scene_invalid'];
}

function validateCircleScene(scene) {
  const normalized = normalizeCircleScene(scene);
  const errors = [];

  if (normalized.conceptId !== 'circles') {
    errors.push('conceptId must be circles');
  }
  if (normalized.figureType !== 'circle') {
    errors.push('figureType must be circle');
  }
  if (!normalized.center) {
    errors.push('center is required');
  }
  if (!Array.isArray(normalized.points) || normalized.points.length === 0) {
    errors.push('points are required');
  }

  const seenNames = new Set();
  const pointMap = new Map();
  for (const point of normalized.points) {
    if (!point.name) {
      errors.push('point name is required');
      continue;
    }
    if (seenNames.has(point.name)) {
      errors.push(`duplicate point ${point.name}`);
    }
    seenNames.add(point.name);
    if (!ALLOWED_POINT_ROLES.has(point.role)) {
      errors.push(`unsupported point role ${point.role || '(missing)'}`);
    }
    pointMap.set(point.name, point);
    if (point.arcSide && !['minor', 'major'].includes(point.arcSide)) {
      errors.push(`invalid arcSide for point ${point.name}`);
    }
  }

  for (const relation of normalized.relations) {
    if (!ALLOWED_RELATION_TYPES.has(relation.type)) {
      errors.push(`unsupported relation type ${relation.type || '(missing)'}`);
      continue;
    }
    if (relation.type === 'arc_membership') {
      const point = pointMap.get(asText(relation.point));
      const arcSide = asText(relation.arcSide || relation.side);
      if (!point) {
        errors.push('arc_membership references missing point');
      }
      if (!['minor', 'major'].includes(arcSide)) {
        errors.push('arc_membership requires arcSide minor or major');
      }
      if (point && point.arcSide && arcSide && point.arcSide !== arcSide) {
        errors.push(`arc side mismatch for point ${point.name}`);
      }
    }
    if (relation.type === 'tangent') {
      const touches = asText(relation.touches || relation.point || relation.tangentPoint);
      if (!touches || !pointMap.has(touches)) {
        errors.push('tangent relation requires a matching point');
      }
    }
    if (relation.type === 'tangent_at_point') {
      const point = pointMap.get(asText(relation.point));
      if (!point) {
        errors.push('tangent_at_point references missing point');
      }
      if (point && point.role !== 'arc_point' && point.role !== 'tangent_point') {
        errors.push(`tangent_at_point expects arc/tangent point, got ${point.role}`);
      }
    }
    if (relation.type === 'intersection') {
      const pointName = asText(relation.point);
      const of = relation.of;
      if (!pointName || !pointMap.has(pointName)) {
        errors.push('intersection relation requires a named point');
      }
      if (!Array.isArray(of) || of.length < 2 || of.some((item) => !asText(item))) {
        errors.push('intersection relation requires two sources');
      }
    }
    if (relation.type === 'collinear') {
      if (!Array.isArray(relation.points) || relation.points.length < 3) {
        errors.push('collinear relation requires at least three points');
      }
    }
  }

  for (const given of normalized.givens) {
    if (!given.name) {
      errors.push('given name is required');
    }
    if (asFiniteNumber(given.value) === null) {
      errors.push(`given ${given.name || '(unnamed)'} requires a numeric value`);
    }
  }

  for (const target of normalized.targets) {
    if (!target.name) {
      errors.push('target name is required');
    }
  }

  const hasExplicitUnknownLeak = Object.values(normalized.display || {}).some((value) => typeof value === 'string' && /\d/.test(value) && !/\?/.test(value));
  if (hasExplicitUnknownLeak) {
    errors.push('display leaks numeric labels');
  }

  return {
    ok: errors.length === 0,
    errors,
    scene: normalized,
  };
}

function sceneToRendererPayload(scene) {
  const normalized = normalizeCircleScene(scene);
  return {
    template: 'circle_scene',
    scene: normalized,
  };
}

export {
  ALLOWED_POINT_ROLES,
  ALLOWED_RELATION_TYPES,
  detectCircleSceneIssues,
  extractCircleScene,
  normalizeCircleScene,
  sceneToRendererPayload,
  validateCircleScene,
};
