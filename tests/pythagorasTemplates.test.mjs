import assert from 'node:assert/strict';
import {
  buildPythagorasExerciseBatch,
  buildPythagorasExerciseItems,
  isPythagorasConcept,
  validatePythagorasExerciseItems,
} from '../src/utils/pythagorasExerciseTemplates.js';

assert.equal(
  isPythagorasConcept('pythagoras', 'Pythagorean Theorem', 'Sides of a right triangle'),
  true
);

assert.equal(
  isPythagorasConcept('circles', 'Circles', 'Circle theorems and tangents'),
  false
);

const items = buildPythagorasExerciseItems(4, { lang: 'zh', difficulty: 'Medium' });

assert.equal(items.length, 4);
assert.deepEqual(
  items.map((item) => item.kind),
  ['find_hypotenuse', 'find_leg_ab', 'find_leg_bc', 'find_hypotenuse']
);

assert.deepEqual(validatePythagorasExerciseItems(items), []);

const rendered = buildPythagorasExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Medium' });
const diagramBlocks = rendered.match(/```math-diagram/g) ?? [];

assert.equal(diagramBlocks.length, 4);
assert.match(rendered, /"template":"right_triangle"/);
assert.match(rendered, /"label_AC":"\?"/);
assert.match(rendered, /"label_BC":"\?"/);

console.log('pythagoras template test passed');
