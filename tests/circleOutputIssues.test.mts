import assert from 'node:assert/strict';
import { detectOutputIssues } from '../src/services/geminiService.ts';

const centerDistanceSource = '如图，点 O 为圆心，弦 AB 在圆内，且 AB 所在的直线与圆心 O 的距离为 5 cm。点 C 是弦 AB 的中点，连接 OC。';

const legacyWrongChordDiagram = [
  '```math-diagram',
  JSON.stringify({
    template: 'circle_chord',
    radius: 20,
    depth: 5,
    label_depth: 'h',
    show_perpendicular: true,
    label_O: 'O',
    label_A: 'A',
    label_B: 'B',
    label_C: 'C',
    label_radius: '20 cm',
    label_chord: '24 cm',
  }),
  '```',
].join('\n');

assert.deepEqual(
  detectOutputIssues(
    legacyWrongChordDiagram,
    'circles',
    centerDistanceSource,
    'must_draw',
    'circles',
  ).sort(),
  ['circle_scene_invalid'],
);

const legacyTangentDiagram = [
  '```math-diagram',
  JSON.stringify({
    template: 'circle_tangent',
    radius: 8,
    label_O: 'O',
    label_A: 'A',
    label_B: 'B',
    label_C: 'C',
    label_P: 'P',
  }),
  '```',
].join('\n');

assert.deepEqual(
  detectOutputIssues(
    legacyTangentDiagram,
    'circles',
    '点 P 是圆 O 外一点，PA、PB 为切线，点 C 在劣弧 AB 上。',
    'must_draw',
    'circles',
  ).sort(),
  ['circle_scene_invalid'],
);

console.log('circle output issues test passed');
