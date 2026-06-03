import assert from 'node:assert/strict';
import {
  classifyDiagramNeed,
  explainDiagramPolicy,
  isForcedDiagramConcept,
  promoteStandaloneDiagramJsonBlocks,
  shouldRequireDiagramBlock,
  stripDiagramArtifacts,
} from '../src/utils/diagramPolicy.js';

assert.equal(
  classifyDiagramNeed({
    conceptId: 'factorisation',
    conceptTitle: 'Factorisation',
    conceptDesc: 'Common factor and difference of squares.',
    prompt: '如图所示，分解因式。',
  }),
  'must_not_draw'
);

assert.equal(
  classifyDiagramNeed({
    conceptId: 'circles',
    conceptTitle: 'Circles',
    conceptDesc: 'Circle theorems and tangents.',
    prompt: '如图所示，点A、B、C在同一圆上，求角。',
  }),
  'must_draw'
);

assert.equal(
  classifyDiagramNeed({
    conceptId: 'circles',
    conceptTitle: 'Circles',
    conceptDesc: 'Circle theorems and tangents.',
    prompt: '求圆中的一个角。',
  }),
  'must_draw'
);

assert.equal(
  classifyDiagramNeed({
    conceptId: 'coordinate-geometry',
    conceptTitle: 'Coordinate Geometry',
    conceptDesc: 'Distance, midpoint, equations of lines.',
    prompt: '点A(2, 3)和点B(-1, 4)在坐标系中，求线段AB的长度。',
  }),
  'must_draw'
);

const summary = explainDiagramPolicy({
  conceptId: 'circles',
  conceptTitle: 'Circles',
  conceptDesc: 'Circle theorems and tangents.',
  prompt: '如图所示，圆中有角。',
});

assert.ok(['must_draw', 'must_not_draw'].includes(summary.policy));
assert.ok(typeof summary.reason === 'string' && summary.reason.length > 0);

const promoted = promoteStandaloneDiagramJsonBlocks([
  '1. 第一题',
  '{"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"]}',
  '2. 第二题',
].join('\n'));

assert.match(promoted, /```math-diagram/);
assert.match(promoted, /"template":"circle_cyclic_quadrilateral"/);

const stripped = stripDiagramArtifacts([
  '1. 题目一',
  '```math-diagram',
  '{"template":"coordinate_points","points":[{"x":0,"y":0,"label":"A"}]}',
  '```',
  '',
  '2. 题目二',
].join('\n'));

assert.equal(stripped, '1. 题目一\n\n2. 题目二');

assert.equal(
  shouldRequireDiagramBlock({
    conceptId: 'circles',
    conceptTitle: 'circle chord length',
    conceptDesc: '圆O的半径为13 cm，AB到圆心O的距离为5 cm，求弦AB的长度。',
    prompt: '求弦AB的长度。',
  }),
  true
);

assert.equal(isForcedDiagramConcept('circles', 'Circles'), true);
assert.equal(isForcedDiagramConcept('', 'Circle theorems and tangents'), true);

console.log('diagram policy test passed');
