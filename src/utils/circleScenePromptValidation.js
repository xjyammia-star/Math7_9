import { normalizeCircleScene } from './circleSceneSchema.js';

function normalizeText(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

function pairKey(a, b) {
  return [String(a ?? '').toUpperCase(), String(b ?? '').toUpperCase()].sort().join('');
}

function relationPairSet(relations, type) {
  const keys = new Set();
  for (const relation of relations) {
    if (!relation || relation.type !== type || !Array.isArray(relation.points) || relation.points.length !== 2) continue;
    keys.add(pairKey(relation.points[0], relation.points[1]));
  }
  return keys;
}

function hasIntersectionPoint(relations, pointName, first, second) {
  const target = String(pointName ?? '').toUpperCase();
  const expected = new Set([String(first ?? '').toUpperCase(), String(second ?? '').toUpperCase()]);
  return relations.some((relation) =>
    relation &&
    relation.type === 'intersection' &&
    String(relation.point ?? '').toUpperCase() === target &&
    Array.isArray(relation.of) &&
    relation.of.length >= 2 &&
    relation.of.every((value) => expected.has(String(value ?? '').toUpperCase()))
  );
}

function hasRightAngleAtPoint(relations, pointName) {
  const target = String(pointName ?? '').toUpperCase();
  return relations.some((relation) =>
    relation &&
    relation.type === 'right_angle' &&
    Array.isArray(relation.points) &&
    relation.points.length === 3 &&
    String(relation.points[1] ?? '').toUpperCase() === target
  );
}

function hasGiven(scene, name) {
  const target = String(name ?? '').toUpperCase();
  return (scene.givens ?? []).some((given) => String(given?.name ?? given?.label ?? given?.key ?? '').toUpperCase() === target);
}

function hasPoint(scene, name) {
  const target = String(name ?? '').toUpperCase();
  return (scene.points ?? []).some((point) => String(point?.name ?? point?.label ?? point?.id ?? '').toUpperCase() === target);
}

function getPoint(scene, name) {
  const target = String(name ?? '').toUpperCase();
  return (scene.points ?? []).find((point) => String(point?.name ?? point?.label ?? point?.id ?? '').toUpperCase() === target) ?? null;
}

function mentionsSegment(promptText, name) {
  return promptText.toUpperCase().includes(String(name ?? '').toUpperCase());
}

function mentionsAny(promptText, patterns) {
  return patterns.some((pattern) => promptText.includes(pattern));
}

function mentionsConnectedSegment(promptText, name) {
  const upper = String(name ?? '').toUpperCase();
  const chineseMatches = [...promptText.matchAll(/\u8fde\u63a5([^\u3002\uff1b,\n]+)/g)].map((match) => String(match[1] ?? '').toUpperCase());
  const englishMatches = [...promptText.matchAll(/connect\s+([^.;,\n]+)/gi)].map((match) => String(match[1] ?? '').toUpperCase());
  const chineseWindow = new RegExp(`\\u8fde\\u63a5[^\\u3002\\uff1b\\n]{0,24}${upper}`);
  const englishWindow = new RegExp(`connect[^.;\\n]{0,24}${upper}`, 'i');
  return (
    mentionsAny(promptText, [`\u8fde\u63a5${upper}`, `connect ${upper}`, `connect${upper}`]) ||
    chineseWindow.test(promptText) ||
    englishWindow.test(promptText) ||
    chineseMatches.some((fragment) => fragment.includes(upper)) ||
    englishMatches.some((fragment) => fragment.includes(upper))
  );
}

function hasArcMembership(relations, pointName, arcName, arcSide) {
  const targetPoint = String(pointName ?? '').toUpperCase();
  const targetArc = String(arcName ?? '').toUpperCase();
  const targetSide = String(arcSide ?? '').toLowerCase();
  return relations.some((relation) =>
    relation &&
    relation.type === 'arc_membership' &&
    String(relation.point ?? '').toUpperCase() === targetPoint &&
    String(relation.arc ?? '').toUpperCase() === targetArc &&
    String(relation.arcSide ?? relation.side ?? '').toLowerCase() === targetSide
  );
}

function findNamedPoints(promptText) {
  const names = new Set();
  for (const match of promptText.matchAll(/\u70b9([A-Z])/g)) {
    names.add(String(match[1] ?? '').toUpperCase());
  }
  for (const match of promptText.matchAll(/\bpoint\s+([A-Z])\b/gi)) {
    names.add(String(match[1] ?? '').toUpperCase());
  }
  return [...names];
}

function getMentionedArcPointRequirements(promptText) {
  const requirements = [];
  const patterns = [
    { regex: /\u70b9([A-Z])\u5728\u52a3\u5f27([A-Z]{2})\u4e0a/g, arcSide: 'minor' },
    { regex: /\u70b9([A-Z])\u5728\u4f18\u5f27([A-Z]{2})\u4e0a/g, arcSide: 'major' },
    { regex: /\bpoint\s+([A-Z])\s+on\s+minor\s+arc\s+([A-Z]{2})\b/gi, arcSide: 'minor' },
    { regex: /\bpoint\s+([A-Z])\s+on\s+major\s+arc\s+([A-Z]{2})\b/gi, arcSide: 'major' },
  ];

  for (const { regex, arcSide } of patterns) {
    for (const match of promptText.matchAll(regex)) {
      requirements.push({
        pointName: String(match[1] ?? '').toUpperCase(),
        arcName: String(match[2] ?? '').toUpperCase(),
        arcSide,
      });
    }
  }

  return requirements;
}

function addIfMentionedSegmentError(promptText, segmentPairs, errors, segmentName) {
  const [first, second] = String(segmentName).toUpperCase().split('');
  if (mentionsConnectedSegment(promptText, segmentName) && !segmentPairs.has(pairKey(first, second))) {
    errors.push(`missing_segment_${String(segmentName).toLowerCase()}`);
  }
}

function extractNamedCoordinate(promptText, pointName) {
  const target = String(pointName ?? '').toUpperCase();
  const patterns = [
    new RegExp(`点${target}(?:的坐标(?:为|是)?|坐标为|坐标是)?\\s*[（(]\\s*([+-]?\\d+(?:\\.\\d+)?)\\s*[,，]\\s*([+-]?\\d+(?:\\.\\d+)?)\\s*[)）]`, 'i'),
    new RegExp(`\\b${target}\\s*[（(]\\s*([+-]?\\d+(?:\\.\\d+)?)\\s*[,，]\\s*([+-]?\\d+(?:\\.\\d+)?)\\s*[)）]`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = promptText.match(pattern);
    if (!match) continue;
    const x = Number(match[1]);
    const y = Number(match[2]);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { x, y };
    }
  }

  return null;
}

export function validateCirclePromptSanity(prompt) {
  const promptText = normalizeText(prompt);
  const errors = [];
  const hasOriginCircleCue =
    /平面直角坐标系|coordinate system/i.test(promptText) &&
    /原点O|O为原点|以O为原点|圆心O在原点|圆心在原点O|⊙O经过原点O/i.test(promptText);

  if (hasOriginCircleCue) {
    const tangentAxisRegex = /过点?([A-Z])作[^。；,\n]*?切线[^。；,\n]*?交\s*([xy])\s*轴于点?([A-Z])/gi;
    for (const match of promptText.matchAll(tangentAxisRegex)) {
      const tangentPoint = String(match[1] ?? '').toUpperCase();
      const axis = String(match[2] ?? '').toLowerCase();
      const coordinate = extractNamedCoordinate(promptText, tangentPoint);
      if (!coordinate) continue;

      if ((axis === 'x' && Math.abs(coordinate.y) < 1e-9) || (axis === 'y' && Math.abs(coordinate.x) < 1e-9)) {
        errors.push(`degenerate_tangent_axis_intersection_${tangentPoint.toLowerCase()}_${axis}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function validateCircleSceneAgainstPrompt(prompt, sceneInput) {
  const promptText = normalizeText(prompt);
  const scene = normalizeCircleScene(sceneInput);
  const relations = Array.isArray(scene.relations) ? scene.relations : [];
  const errors = [];

  const diameterPairs = relationPairSet(relations, 'diameter');
  const chordPairs = relationPairSet(relations, 'chord');
  const segmentPairs = relationPairSet(relations, 'segment');

  if (mentionsSegment(promptText, 'AB') && mentionsAny(promptText, ['\u76f4\u5f84', 'diameter']) && !diameterPairs.has(pairKey('A', 'B'))) {
    errors.push('missing_diameter_ab');
  }

  if (mentionsSegment(promptText, 'CD') && mentionsAny(promptText, ['\u5f26', 'chord']) && !chordPairs.has(pairKey('C', 'D'))) {
    errors.push('missing_chord_cd');
  }

  addIfMentionedSegmentError(promptText, segmentPairs, errors, 'AC');
  addIfMentionedSegmentError(promptText, segmentPairs, errors, 'AD');
  addIfMentionedSegmentError(promptText, segmentPairs, errors, 'BC');
  addIfMentionedSegmentError(promptText, segmentPairs, errors, 'BD');
  addIfMentionedSegmentError(promptText, segmentPairs, errors, 'AE');
  addIfMentionedSegmentError(promptText, segmentPairs, errors, 'AF');
  addIfMentionedSegmentError(promptText, segmentPairs, errors, 'CF');

  if (mentionsSegment(promptText, 'CD') && mentionsSegment(promptText, 'AB') && mentionsSegment(promptText, 'E') && mentionsAny(promptText, ['\u5782\u76f4', 'perpendicular'])) {
    if (!hasIntersectionPoint(relations, 'E', 'AB', 'CD')) {
      errors.push('missing_intersection_e_ab_cd');
    }
    if (!hasRightAngleAtPoint(relations, 'E')) {
      errors.push('missing_right_angle_at_e');
    }
  }

  if (mentionsSegment(promptText, 'AF') && mentionsSegment(promptText, 'CD') && mentionsAny(promptText, ['\u4ea4\u4e8e\u70b9P', '\u4ea4CD\u4e8e\u70b9P', 'intersect', 'meet'])) {
    if (!hasIntersectionPoint(relations, 'P', 'AF', 'CD')) {
      errors.push('missing_intersection_p_af_cd');
    }
  }

  if (mentionsSegment(promptText, 'AC') && mentionsAny(promptText, ['=', '\u5df2\u77e5', 'known']) && !hasGiven(scene, 'AC')) {
    errors.push('missing_given_ac');
  }
  if (mentionsSegment(promptText, 'AD') && mentionsAny(promptText, ['=', '\u5df2\u77e5', 'known']) && !hasGiven(scene, 'AD')) {
    errors.push('missing_given_ad');
  }
  if (mentionsSegment(promptText, 'CE') && mentionsAny(promptText, ['=', '\u5df2\u77e5', 'known']) && !hasGiven(scene, 'CE')) {
    errors.push('missing_given_ce');
  }

  if (mentionsSegment(promptText, 'AD') && mentionsSegment(promptText, 'A') && mentionsAny(promptText, ['\u5782\u76f4AD', 'perpendicular to AD']) && !hasRightAngleAtPoint(relations, 'A')) {
    errors.push('missing_right_angle_at_a');
  }

  for (const pointName of findNamedPoints(promptText)) {
    if (!hasPoint(scene, pointName)) {
      errors.push(`missing_point_${pointName.toLowerCase()}`);
    }
  }

  for (const requirement of getMentionedArcPointRequirements(promptText)) {
    const point = getPoint(scene, requirement.pointName);
    if (!point) {
      errors.push(`missing_point_${requirement.pointName.toLowerCase()}`);
      continue;
    }
    const pointArcSide = String(point.arcSide ?? '').toLowerCase();
    if (pointArcSide && pointArcSide !== requirement.arcSide) {
      errors.push(`arc_side_mismatch_${requirement.pointName.toLowerCase()}`);
      continue;
    }
    if (!pointArcSide && !hasArcMembership(relations, requirement.pointName, requirement.arcName, requirement.arcSide)) {
      errors.push(`missing_arc_membership_${requirement.pointName.toLowerCase()}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    scene,
  };
}
