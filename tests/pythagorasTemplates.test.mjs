import assert from 'node:assert/strict';
import {
  buildPythagorasExerciseBatch,
  buildPythagorasExerciseItems,
  isPythagorasConcept,
  validatePythagorasExerciseItems,
} from '../src/utils/pythagorasExerciseTemplates.js';

function makeSequenceRng(values) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

assert.equal(
  isPythagorasConcept('pythagoras', 'Pythagorean Theorem', 'Sides of a right triangle'),
  true
);

assert.equal(
  isPythagorasConcept('circles', 'Circles', 'Circle theorems and tangents'),
  false
);

const cnItems = buildPythagorasExerciseItems(3, {
  lang: 'en',
  curriculum: 'CN',
  grade: '7',
  difficulty: 'Easy',
  random: makeSequenceRng([0.01, 0.2, 0.41, 0.63, 0.85]),
  persistHistory: false,
});

assert.equal(cnItems.length, 3);
assert.equal(new Set(cnItems.map((item) => item.id)).size, 3);
assert.deepEqual(validatePythagorasExerciseItems(cnItems), []);
assert.ok(cnItems.every((item) => item.diagramTemplate === 'right_triangle'));

const cnBatchA = buildPythagorasExerciseBatch({
  count: 3,
  lang: 'en',
  curriculum: 'CN',
  grade: '7',
  difficulty: 'Easy',
  random: makeSequenceRng([0.01, 0.2, 0.41, 0.63, 0.85]),
  persistHistory: false,
});

const cnBatchB = buildPythagorasExerciseBatch({
  count: 3,
  lang: 'en',
  curriculum: 'CN',
  grade: '7',
  difficulty: 'Easy',
  random: makeSequenceRng([0.93, 0.72, 0.54, 0.31, 0.11]),
  persistHistory: false,
});

assert.notEqual(cnBatchA, cnBatchB);
assert.match(cnBatchA, /"template":"right_triangle"/);
assert.match(cnBatchA, /Find the length of AC/);

const ukBatch = buildPythagorasExerciseBatch({
  count: 2,
  lang: 'en',
  curriculum: 'UK',
  grade: '9',
  difficulty: 'Hard',
  random: makeSequenceRng([0.12, 0.89, 0.46, 0.77]),
  persistHistory: false,
});

assert.match(ukBatch, /Show that triangle ABC is right-angled at B/);
assert.match(ukBatch, /"template":"right_triangle"/);

const usBatch = buildPythagorasExerciseBatch({
  count: 2,
  lang: 'en',
  curriculum: 'US',
  grade: '8',
  difficulty: 'Medium',
  random: makeSequenceRng([0.16, 0.48, 0.84, 0.29]),
  persistHistory: false,
});

assert.match(usBatch, /"template":"ladder"/);
assert.match(usBatch, /How high up the wall does it reach/);

const ibBatch = buildPythagorasExerciseBatch({
  count: 2,
  lang: 'en',
  curriculum: 'IB',
  grade: '9',
  difficulty: 'Hard',
  random: makeSequenceRng([0.19, 0.37, 0.58, 0.76]),
  persistHistory: false,
});

assert.match(ibBatch, /"template":"coordinate_points"/);
assert.match(ibBatch, /coordinate grid/);

console.log('pythagoras template test passed');
