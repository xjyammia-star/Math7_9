import assert from 'node:assert/strict';
import { validateCirclePromptSanity, validateCircleSceneAgainstPrompt } from '../src/utils/circleScenePromptValidation.js';

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

const promptWithExtension = '\u5982\u56fe\uff0cO\u662f\u5706\u5fc3\uff0cAB\u662f\u76f4\u5f84\uff0c\u70b9C\u3001D\u5728\u5706\u4e0a\u4e14\u4f4d\u4e8eAB\u7684\u5f02\u4fa7\uff0c\u8fde\u63a5AC\u3001BC\u3001AD\u3001BD\u3002\u8fc7\u70b9A\u4f5c\u76f4\u7ebf\u5782\u76f4\u4e8eAD\uff0c\u4ea4CD\u7684\u5ef6\u957f\u7ebf\u4e8e\u70b9E\u3002';

const missingExtensionScene = {
  conceptId: 'circles',
  figureType: 'circle',
  center: 'O',
  points: [
    { name: 'O', role: 'center_point' },
    { name: 'A', role: 'tangent_point' },
    { name: 'B', role: 'tangent_point' },
    { name: 'C', role: 'arc_point', arcSide: 'minor' },
    { name: 'D', role: 'arc_point', arcSide: 'major' },
  ],
  relations: [
    { type: 'diameter', points: ['A', 'B'] },
    { type: 'segment', points: ['A', 'C'] },
    { type: 'segment', points: ['B', 'C'] },
    { type: 'segment', points: ['A', 'D'] },
  ],
  givens: [],
  targets: [],
  display: {},
};

const extensionValidation = validateCircleSceneAgainstPrompt(promptWithExtension, missingExtensionScene);
assert.equal(extensionValidation.ok, false);
assert.ok(extensionValidation.errors.includes('missing_segment_bd'));
assert.ok(extensionValidation.errors.includes('missing_point_e'));

const promptWithArcPoint = '\u8bc1\u660e\u9898\uff1a\u5df2\u77e5AB\u662f\u2299O\u7684\u76f4\u5f84\uff0c\u5f26CD\u5782\u76f4\u4e8eAB\u4e8eE\uff0c\u4e14CE=4\uff0cO\u7684\u534a\u5f845\u3002\u70b9F\u5728\u52a3\u5f27BC\u4e0a(\u4e0d\u4e0eB\u3001C\u91cd\u5408)\uff0c\u8fde\u63a5AF\u4ea4CD\u4e8e\u70b9P\uff0c\u8fde\u63a5CF\u3002';

const missingArcPointScene = {
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
    { name: 'P', role: 'intersection_point' },
  ],
  relations: [
    { type: 'diameter', points: ['A', 'B'] },
    { type: 'chord', points: ['C', 'D'] },
    { type: 'intersection', point: 'E', of: ['AB', 'CD'] },
    { type: 'right_angle', points: ['C', 'E', 'A'] },
  ],
  givens: [
    { name: 'CE', value: 4 },
  ],
  targets: [],
  display: {},
};

const arcPointValidation = validateCircleSceneAgainstPrompt(promptWithArcPoint, missingArcPointScene);
assert.equal(arcPointValidation.ok, false);
assert.ok(arcPointValidation.errors.includes('missing_point_f'));
assert.ok(arcPointValidation.errors.includes('missing_segment_af'));
assert.ok(arcPointValidation.errors.includes('missing_segment_cf'));
assert.ok(arcPointValidation.errors.includes('missing_intersection_p_af_cd'));

const degenerateCoordinatePrompt = '\u5982\u56fe,\u5728\u5e73\u9762\u76f4\u89d2\u5750\u6807\u7cfb\u4e2d,\u2299O\u7ecf\u8fc7\u539f\u70b9O,\u70b9A\u3001B\u3001C\u5728\u2299O\u4e0a,\u4e14\u70b9A\u7684\u5750\u6807\u4e3a(4,0)\u3002\u8fc7A\u4f5c\u2299O\u7684\u5207\u7ebf\u4ea4x\u8f74\u4e8e\u70b9D\u3002\u6c42\u70b9D\u7684\u5750\u6807\u3002';
const degenerateValidation = validateCirclePromptSanity(degenerateCoordinatePrompt);
assert.equal(degenerateValidation.ok, false);
assert.ok(degenerateValidation.errors.includes('degenerate_tangent_axis_intersection_a_x'));
