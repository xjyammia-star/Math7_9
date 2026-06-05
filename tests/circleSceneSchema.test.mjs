import assert from 'node:assert/strict';
import {
  coerceCircleScenePayload,
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
assert.deepEqual(
  detectCircleSceneIssues('```math-diagram\n{"template":"circle_chord","radius":13,"label_O":"O","label_A":"A","label_B":"B"}\n```'),
  ['circle_scene_invalid']
);
assert.deepEqual(
  detectCircleSceneIssues('```math-diagram\n{"template":"circle_tangent","radius":5,"label_O":"O","label_A":"A","label_B":"B","label_P":"P"}\n```'),
  ['circle_scene_invalid']
);

const explicitSceneBlock = [
  '```math-diagram',
  JSON.stringify({
    template: 'circle_scene',
    scene: {
      conceptId: 'circle',
      figureType: 'circle',
      center: 'C',
      points: [
        { id: 'C', x: 0, y: 0, label: 'C' },
        { id: 'A', x: 0, y: 3, label: 'A' },
        { id: 'B', x: 4, y: 0, label: 'B' },
        { id: 'D', x: 2.4, y: 1.8, label: 'D' },
      ],
      relations: [
        { type: 'segment', points: ['A', 'B'] },
        { type: 'segment', points: ['A', 'C'] },
        { type: 'segment', points: ['B', 'C'] },
        { type: 'circle', center: 'C', radius: 3 },
        { type: 'right_angle', points: ['A', 'C', 'B'] },
        { type: 'arc', center: 'C', radius: 3, start: 'A', end: 'D', label: '劣弧AD' },
      ],
      givens: [{ type: 'length', points: ['A', 'C'], value: 3 }],
      targets: [],
      display: {},
    },
  }),
  '```',
].join('\n');

assert.deepEqual(detectCircleSceneIssues(explicitSceneBlock), []);

const bareScenePayload = {
  conceptId: 'circle',
  figureType: 'circle',
  center: 'O',
  points: [
    { name: 'O', role: 'center_point' },
    { name: 'A', role: 'tangent_point' },
    { name: 'B', role: 'tangent_point' },
    { name: 'C', role: 'arc_point', arcSide: 'minor' },
  ],
  relations: [
    { type: 'tangent', line: 'PA', touches: 'A' },
    { type: 'tangent', line: 'PB', touches: 'B' },
    { type: 'arc_membership', point: 'C', arc: 'AB', arcSide: 'minor' },
  ],
  givens: [],
  targets: [],
  display: {},
};

assert.equal(coerceCircleScenePayload(bareScenePayload)?.template, 'circle_scene');
assert.equal(validateCircleScene(coerceCircleScenePayload(bareScenePayload)?.scene).ok, true);

const angleScene = {
  conceptId: 'circle',
  figureType: 'circle',
  center: 'O',
  points: [
    { id: 'O', x: 0, y: 0, label: 'O' },
    { id: 'A', x: -5, y: 0, label: 'A' },
    { id: 'B', x: 5, y: 0, label: 'B' },
    { id: 'C', x: 0, y: 4, label: 'C' },
    { id: 'E', x: 0, y: 0.8, label: 'E' },
  ],
  relations: [
    { type: 'segment', points: ['A', 'B'] },
    { type: 'segment', points: ['C', 'E'] },
    { type: 'circle', center: 'O', radius: 5 },
    { type: 'angle', points: ['A', 'E', 'C'], value: 30 },
  ],
  givens: [],
  targets: [],
  display: {},
};

assert.equal(validateCircleScene(angleScene).ok, true);

const looseIntersectionScene = {
  conceptId: 'circles',
  figureType: 'circle',
  center: 'O',
  points: [
    { name: 'O', role: 'center_point' },
    { name: 'A', role: 'tangent_point' },
    { name: 'B', role: 'tangent_point' },
    { name: 'C', role: 'arc_point', arcSide: 'minor' },
    { name: 'D', role: 'arc_point', arcSide: 'major' },
    { name: 'E', role: 'intersection_point' },
  ],
  relations: [
    { type: 'diameter', points: ['A', 'B'] },
    { type: 'chord', points: ['C', 'D'] },
    { type: 'intersection', point: 'E', line1: 'AB', line2: 'CD' },
  ],
  givens: [],
  targets: [],
  display: {},
};

assert.equal(validateCircleScene(looseIntersectionScene).ok, true);

console.log('circle scene schema test passed');
