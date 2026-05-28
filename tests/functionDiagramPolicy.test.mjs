import assert from 'node:assert/strict';
import { getLinearFunctionAnnotations, getQuadraticFunctionAnnotations } from '../src/utils/functionDiagramPolicy.js';

assert.deepEqual(
  getLinearFunctionAnnotations({ slope: 2, intercept: -1 }),
  { xInterceptLabel: '', yInterceptLabel: '', showInterceptDots: false }
);

assert.deepEqual(
  getLinearFunctionAnnotations({
    slope: 2,
    intercept: -1,
    show_intercepts: true,
    label_x_intercept: '(0.50, 0)',
    label_y_intercept: '(0, -1)',
  }),
  { xInterceptLabel: '(0.50, 0)', yInterceptLabel: '(0, -1)', showInterceptDots: true }
);

assert.deepEqual(
  getQuadraticFunctionAnnotations({ a: 1, b: -2, c: -3 }),
  { vertexLabel: '', showVertexDot: false }
);

assert.deepEqual(
  getQuadraticFunctionAnnotations({
    a: 1,
    b: -2,
    c: -3,
    show_vertex: true,
    label_vertex: '(1, -4)',
  }),
  { vertexLabel: '(1, -4)', showVertexDot: true }
);

console.log('function diagram policy test passed');
