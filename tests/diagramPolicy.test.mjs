import assert from 'node:assert/strict';
import { classifyDiagramNeed, stripDiagramArtifacts } from '../src/utils/diagramPolicy.js';

const policy = classifyDiagramNeed({
  conceptTitle: '判断正误',
  conceptDesc: '判断下列说法的正误。',
  prompt: '请判断下列每个说法的正误。',
});

assert.equal(policy, 'must_not_draw');

const stripped = stripDiagramArtifacts([
  '1. 判断题',
  '```math-diagram',
  '{"template":"cut_cube","data":{"side":2}}',
  '```',
  '',
  '2. 另一题',
].join('\n'));

assert.equal(stripped, '1. 判断题\n\n2. 另一题');

console.log('diagram policy test passed');
