import assert from 'node:assert/strict';
import { validateCircleSceneAgainstPrompt } from '../src/utils/circleScenePromptValidation.js';

const prompt = '\u5982\u56fe\uff0cAB\u662f\u2299O\u7684\u76f4\u5f84\uff0c\u5f26CD\u5782\u76f4\u4e8eAB\u4e8e\u70b9E\uff0c\u4ea4\u2299O\u4e8e\u70b9C\uff0cD\u3002\u8fde\u63a5AC\uff0cAD\uff0cBC\u3002\u5df2\u77e5AC=\u221a2\uff0cAD=\u221a6\uff0c\u6c42\u25b3ABD\u7684\u9762\u79ef\u3002';

const validScene = {
  conceptId: 'circles',
  figureType: 'circle',
  center: 'O',
  points: [
    { name: 'O', role: 'center_point' },
    { name: 'A', role: 'tangent_point' },
    { name: 'B', role: 'tangent_point' },
    { name: 'C', role: 'arc_point', arcSide: 'minor' },
    { name: 'D', role: 'arc_point', arcSide: 'major' },
    { name: 'E', role: 'foot_point' },
  ],
  relations: [
    { type: 'diameter', points: ['A', 'B'] },
    { type: 'chord', points: ['C', 'D'] },
    { type: 'segment', points: ['A', 'C'] },
    { type: 'segment', points: ['A', 'D'] },
    { type: 'segment', points: ['B', 'C'] },
    { type: 'intersection', point: 'E', of: ['AB', 'CD'] },
    { type: 'right_angle', points: ['C', 'E', 'A'] },
  ],
  givens: [
    { name: 'AC', value: 1.414 },
    { name: 'AD', value: 2.449 },
  ],
  targets: [{ name: 'area_triangle_ABD' }],
  display: {},
};

const missingDiameterScene = {
  ...validScene,
  relations: validScene.relations.filter((relation) => relation.type !== 'diameter'),
};

const missingSegmentScene = {
  ...validScene,
  relations: validScene.relations.filter((relation) => !(relation.type === 'segment' && relation.points.join('') === 'AD')),
};

const validationOk = validateCircleSceneAgainstPrompt(prompt, validScene);
assert.equal(validationOk.ok, true);

const missingDiameter = validateCircleSceneAgainstPrompt(prompt, missingDiameterScene);
assert.equal(missingDiameter.ok, false);
assert.ok(missingDiameter.errors.includes('missing_diameter_ab'));

const missingSegment = validateCircleSceneAgainstPrompt(prompt, missingSegmentScene);
assert.equal(missingSegment.ok, false);
assert.ok(missingSegment.errors.includes('missing_segment_ad'));

console.log('circle scene prompt validation test passed');
