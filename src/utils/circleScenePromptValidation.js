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

function mentionsSegment(promptText, name) {
  return promptText.toUpperCase().includes(String(name ?? '').toUpperCase());
}

function mentionsAny(promptText, patterns) {
  return patterns.some((pattern) => promptText.includes(pattern));
}

function mentionsConnectedSegment(promptText, name) {
  const upper = String(name ?? '').toUpperCase();
  const chineseMatches = [...promptText.matchAll(/\u8fde\u63a5([^。；，,]+)/g)].map((match) => String(match[1] ?? '').toUpperCase());
  const englishMatches = [...promptText.matchAll(/connect\s+([^.;,]+)/gi)].map((match) => String(match[1] ?? '').toUpperCase());
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

  if (mentionsConnectedSegment(promptText, 'AC') && !segmentPairs.has(pairKey('A', 'C'))) {
    errors.push('missing_segment_ac');
  }
  if (mentionsConnectedSegment(promptText, 'AD') && !segmentPairs.has(pairKey('A', 'D'))) {
    errors.push('missing_segment_ad');
  }
  if (mentionsConnectedSegment(promptText, 'BC') && !segmentPairs.has(pairKey('B', 'C'))) {
    errors.push('missing_segment_bc');
  }
  if (mentionsConnectedSegment(promptText, 'BD') && !segmentPairs.has(pairKey('B', 'D'))) {
    errors.push('missing_segment_bd');
  }
  if (mentionsConnectedSegment(promptText, 'AE') && !segmentPairs.has(pairKey('A', 'E'))) {
    errors.push('missing_segment_ae');
  }

  if (mentionsSegment(promptText, 'CD') && mentionsSegment(promptText, 'AB') && mentionsSegment(promptText, 'E') && mentionsAny(promptText, ['\u5782\u76f4', '⊥', 'perpendicular'])) {
    if (!hasIntersectionPoint(relations, 'E', 'AB', 'CD')) {
      errors.push('missing_intersection_e_ab_cd');
    }
    if (!hasRightAngleAtPoint(relations, 'E')) {
      errors.push('missing_right_angle_at_e');
    }
  }

  if (mentionsSegment(promptText, 'AC') && mentionsAny(promptText, ['=', '＝', '\u5df2\u77e5', 'known']) && !hasGiven(scene, 'AC')) {
    errors.push('missing_given_ac');
  }
  if (mentionsSegment(promptText, 'AD') && mentionsAny(promptText, ['=', '＝', '\u5df2\u77e5', 'known']) && !hasGiven(scene, 'AD')) {
    errors.push('missing_given_ad');
  }
  if (mentionsAny(promptText, ['\u70b9E', 'point E']) && !hasPoint(scene, 'E')) {
    errors.push('missing_point_e');
  }
  if (mentionsSegment(promptText, 'DE') && mentionsAny(promptText, ['=', '＝', 'x', 'X', '\u8bbe', 'let']) && !hasPoint(scene, 'E')) {
    errors.push('missing_point_e');
  }
  if (mentionsSegment(promptText, 'AE') && !hasPoint(scene, 'E')) {
    errors.push('missing_point_e');
  }
  if (mentionsSegment(promptText, 'AD') && mentionsSegment(promptText, 'A') && mentionsAny(promptText, ['\u5782\u76f4AD', 'perpendicular to AD', '⊥AD']) && !hasRightAngleAtPoint(relations, 'A')) {
    errors.push('missing_right_angle_at_a');
  }

  return {
    ok: errors.length === 0,
    errors,
    scene,
  };
}
