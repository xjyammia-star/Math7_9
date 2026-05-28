import assert from 'node:assert/strict';
import { explicitLabel, explicitLabels } from '../src/utils/diagramLabelPolicy.js';

assert.equal(explicitLabel('A'), 'A');
assert.equal(explicitLabel('  B  '), 'B');
assert.equal(explicitLabel(''), '');
assert.equal(explicitLabel(undefined), '');
assert.equal(explicitLabel(null), '');

assert.deepEqual(explicitLabels(['P', 'Q', 'R'], 3), ['P', 'Q', 'R']);
assert.deepEqual(explicitLabels(undefined, 3), ['', '', '']);
assert.deepEqual(explicitLabels(['A'], 4), ['A', '', '', '']);

console.log('diagram label policy test passed');
