const ALLOWED_POINT_ROLES = new Set([
  'external_point',
  'tangent_point',
  'arc_point',
  'intersection_point',
  'foot_point',
  'point',
  'center_point',
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
  'segment',
  'circle',
  'right_angle',
  'angle',
  'arc',
]);

function asText(value) {
  return String(value ?? '').trim();
}

function asFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function looksLikeCircleScene(value) {
  if (!isPlainObject(value)) return false;

  const conceptId = asText(value.conceptId || value.concept_id).toLowerCase();
  const figureType = asText(value.figureType || value.figure_type || value.type).toLowerCase();
  const hasPoints = Array.isArray(value.points);
  const hasRelations = Array.isArray(value.relations);
  const hasCenter = Boolean(asText(value.center || value.centerPoint || value.label_O));

  return conceptId === 'circles' ||
    conceptId === 'circle' ||
    figureType === 'circle' ||
    (hasPoints && hasRelations && hasCenter);
}

function normalizeNamedValueList(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => (item && typeof item === 'object' ? { ...item } : null))
    .filter(Boolean);
}

function normalizeIntersectionSources(relation) {
  const rawCandidates = [];

  if (Array.isArray(relation.of)) rawCandidates.push(...relation.of);
  if (Array.isArray(relation.lines)) rawCandidates.push(...relation.lines);
  if (Array.isArray(relation.sources)) rawCandidates.push(...relation.sources);
  if (relation.source1 != null) rawCandidates.push(relation.source1);
  if (relation.source2 != null) rawCandidates.push(relation.source2);
  if (relation.line1 != null) rawCandidates.push(relation.line1);
  if (relation.line2 != null) rawCandidates.push(relation.line2);
  if (typeof relation.of === 'string') rawCandidates.push(...String(relation.of).split(/[,\u3001]/));
  if (typeof relation.lines === 'string') rawCandidates.push(...String(relation.lines).split(/[,\u3001]/));

  return rawCandidates
    .map((item) => (asText(item) || '').toUpperCase())
    .filter(Boolean);
}

function coerceCircleScenePayload(input) {
  if (!isPlainObject(input)) return null;

  if (asText(input.template) === 'circle_scene') {
    const scene = isPlainObject(input.scene) ? input.scene : input;
    return {
      template: 'circle_scene',
      scene: normalizeCircleScene(scene),
    };
  }

  if (isPlainObject(input.scene) && looksLikeCircleScene(input.scene)) {
    return {
      template: 'circle_scene',
      scene: normalizeCircleScene(input.scene),
    };
  }

  if (looksLikeCircleScene(input)) {
    return {
      template: 'circle_scene',
      scene: normalizeCircleScene(input),
    };
  }

  return null;
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
    role: asText(point.role || point.kind || point.type || ((point.id || point.name || point.label) && asText(point.id || point.name || point.label).toUpperCase() === scene.center ? 'center_point' : 'point')),
    arcSide: point.arcSide ? asText(point.arcSide) : undefined,
    x: point.x,
    y: point.y,
  })).filter((point) => point.name);

  scene.relations = scene.relations.map((relation) => ({
    ...relation,
    type: asText(relation.type || relation.kind || relation.relation),
    point: relation.point ? (asText(relation.point) || '').toUpperCase() : relation.point,
    touches: relation.touches ? (asText(relation.touches) || '').toUpperCase() : relation.touches,
    line: relation.line ? (asText(relation.line) || '').toUpperCase() : relation.line,
    arc: relation.arc ? (asText(relation.arc) || '').toUpperCase() : relation.arc,
    center: relation.center ? (asText(relation.center) || '').toUpperCase() : relation.center,
    start: relation.start ? (asText(relation.start) || '').toUpperCase() : relation.start,
    end: relation.end ? (asText(relation.end) || '').toUpperCase() : relation.end,
    radius: relation.radius,
    label: relation.label,
    points: Array.isArray(relation.points) ? relation.points.map((item) => (asText(item) || '').toUpperCase()).filter(Boolean) : relation.points,
    of: normalizeIntersectionSources(relation),
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
    return coerceCircleScenePayload(parsed);
  } catch {
    return null;
  }
}

function detectCircleSceneIssues(text) {
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
  const hasExplicitCoordinates = normalized.points.some((point) => asFiniteNumber(point.x) !== null && asFiniteNumber(point.y) !== null);

  if (normalized.conceptId !== 'circles' && normalized.conceptId !== 'circle') {
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
    if (hasExplicitCoordinates && (asFiniteNumber(point.x) === null || asFiniteNumber(point.y) === null)) {
      errors.push(`point ${point.name} requires numeric x/y in explicit scene mode`);
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
    if (relation.type === 'segment') {
      if (!Array.isArray(relation.points) || relation.points.length !== 2 || relation.points.some((name) => !pointMap.has(name))) {
        errors.push('segment relation requires two existing points');
      }
    }
    if (relation.type === 'circle') {
      const center = asText(relation.center);
      if (!center || !pointMap.has(center)) {
        errors.push('circle relation requires an existing center point');
      }
      if (asFiniteNumber(relation.radius) === null) {
        errors.push('circle relation requires a numeric radius');
      }
    }
    if (relation.type === 'right_angle') {
      if (!Array.isArray(relation.points) || relation.points.length !== 3 || relation.points.some((name) => !pointMap.has(name))) {
        errors.push('right_angle relation requires three existing points');
      }
    }
    if (relation.type === 'angle') {
      if (!Array.isArray(relation.points) || relation.points.length !== 3 || relation.points.some((name) => !pointMap.has(name))) {
        errors.push('angle relation requires three existing points');
      }
      const value = relation.value ?? relation.label;
      if (value != null && String(value).trim() === '') {
        errors.push('angle relation value cannot be empty');
      }
    }
    if (relation.type === 'arc') {
      const center = asText(relation.center);
      const start = asText(relation.start);
      const end = asText(relation.end);
      if (!center || !pointMap.has(center) || !start || !pointMap.has(start) || !end || !pointMap.has(end)) {
        errors.push('arc relation requires existing center/start/end points');
      }
      if (asFiniteNumber(relation.radius) === null) {
        errors.push('arc relation requires a numeric radius');
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
  coerceCircleScenePayload,
  detectCircleSceneIssues,
  extractCircleScene,
  normalizeCircleScene,
  sceneToRendererPayload,
  validateCircleScene,
};
