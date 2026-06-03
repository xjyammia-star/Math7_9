import assert from 'node:assert/strict';
import {
  detectCircleSceneIssues,
  extractCircleScene,
  normalizeCircleScene,
  validateCircleScene,
} from '../src/utils/circleSceneSchema.js';

const validBlock = [
  '```math-diagram',
  JSON.stringify({
    template: 'circle_scene',
    scene: {
      conceptId: 'circles',
      figureType: 'circle',
      center: 'O',
      points: [
        { name: 'P', role: 'external_point' },
        { name: 'A', role: 'tangent_point' },
        { name: 'B', role: 'tangent_point' },
        { name: 'C', role: 'arc_point', arcSide: 'minor' },
        { name: 'D', role: 'intersection_point' },
        { name: 'E', role: 'intersection_point' },
        { name: 'F', role: 'foot_point' },
      ],
      relations: [
        { type: 'tangent', line: 'PA', touches: 'A' },
        { type: 'tangent', line: 'PB', touches: 'B' },
        { type: 'arc_membership', point: 'C', arc: 'AB', arcSide: 'minor' },
        { type: 'tangent_at_point', point: 'C' },
        { type: 'intersection', point: 'D', of: ['tangent_at_C', 'PA'] },
        { type: 'intersection', point: 'E', of: ['tangent_at_C', 'PB'] },
        { type: 'intersection', point: 'F', of: ['OC', 'AB'] },
      ],
      givens: [
        { name: 'PA', value: 6 },
        { name: 'angle_APB', value: 60 },
      ],
      targets: [{ name: 'perimeter_triangle_CDE' }],
      display: { showCircle: true, showTangentAtC: true, showOC: true, hideDerivedNumericLabels: true },
    },
  }, null, 2),
  '```',
].join('\n');

const extracted = extractCircleScene(validBlock);
assert.ok(extracted);
assert.equal(extracted.template, 'circle_scene');
assert.equal(extracted.scene.conceptId, 'circles');
assert.equal(validateCircleScene(extracted.scene).ok, true);
assert.equal(normalizeCircleScene(extracted.scene).conceptId, 'circles');
assert.deepEqual(detectCircleSceneIssues(validBlock), []);

const invalidScene = {
  conceptId: 'circles',
  figureType: 'circle',
  center: 'O',
  points: [
    { name: 'C', role: 'arc_point', arcSide: 'major' },
  ],
  relations: [
    { type: 'arc_membership', point: 'C', arc: 'AB', arcSide: 'minor' },
  ],
  givens: [],
  targets: [],
  display: {},
};

assert.equal(validateCircleScene(invalidScene).ok, false);
assert.deepEqual(detectCircleSceneIssues('```math-diagram\n{"template":"circle_scene","scene":{"conceptId":"circles","figureType":"circle","points":[],"relations":[],"givens":[],"targets":[],"display":{}}}\n```'), ['circle_scene_invalid']);

console.log('circle scene schema test passed');
