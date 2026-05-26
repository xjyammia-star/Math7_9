import assert from 'node:assert/strict';
import { classifyDiagramNeed, explainDiagramPolicy, stripDiagramArtifacts } from '../src/utils/diagramPolicy.js';

assert.equal(
  classifyDiagramNeed({
    conceptTitle: '判断正误',
    conceptDesc: '判断下列说法的正误。',
    prompt: '请判断下列每个说法的正误。',
  }),
  'must_not_draw'
);

assert.equal(
  classifyDiagramNeed({
    conceptTitle: '扇形面积判断',
    conceptDesc: '已知两个扇形，判断它们的面积是否相同。',
    prompt: '请判断两个扇形的面积是否相同。',
  }),
  'prefer_draw'
);

assert.equal(
  classifyDiagramNeed({
    conceptTitle: '正方形面积',
    conceptDesc: '已知正方形边长为5厘米，求面积。',
    prompt: '已知正方形边长5cm，求它的面积。',
  }),
  'prefer_draw'
);

assert.equal(
  classifyDiagramNeed({
    conceptTitle: '坐标系中的点',
    conceptDesc: '在平面直角坐标系中标出点A(2, 3)和点B(-1, 4)，并求线段AB的长度。',
    prompt: '在平面直角坐标系中，求线段AB的长度。',
  }),
  'must_draw'
);

const summary = explainDiagramPolicy({
  conceptTitle: '三角形和平行线',
  conceptDesc: '已知三角形ABC中，DE平行于BC，判断角度关系。',
  prompt: '判断下列说法是否正确。',
});

assert.ok(['must_draw', 'prefer_draw', 'maybe_draw', 'must_not_draw'].includes(summary.policy));
assert.ok(typeof summary.reason === 'string' && summary.reason.length > 0);

const stripped = stripDiagramArtifacts([
  '1. 判断题',
  '```math-diagram',
  '{"template":"coordinate_points","points":[{"x":0,"y":0,"label":"A"}]}',
  '```',
  '',
  '2. 另一题',
].join('\n'));

assert.equal(stripped, '1. 判断题\n\n2. 另一题');

console.log('diagram policy test passed');
