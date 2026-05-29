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
assert.equal(new Set(cnItems.map((item) => item.kind)).size, 3);
assert.deepEqual(validatePythagorasExerciseItems(cnItems), []);
assert.ok(cnItems.some((item) => item.kind === 'rectangle_diagonal'));
assert.ok(cnItems.some((item) => item.kind === 'square_diagonal'));
assert.ok(cnItems.some((item) => item.diagramTemplate === 'right_triangle'));

const cnBatch = buildPythagorasExerciseBatch({
  count: 3,
  lang: 'en',
  curriculum: 'CN',
  grade: '7',
  difficulty: 'Easy',
  random: makeSequenceRng([0.01, 0.2, 0.41, 0.63, 0.85]),
  persistHistory: false,
});

assert.match(cnBatch, /"template":"right_triangle"/);
assert.match(cnBatch, /"template":"rectangle_diagonal"/);
assert.match(cnBatch, /"template":"square_diagonal"/);
assert.match(cnBatch, /"labels":\{"A":"A","B":"B","C":"C","D":"D"\}/);
assert.match(cnBatch, /Find the length of AC|diagonal AC/);

const cnZhBatch = buildPythagorasExerciseBatch({
  count: 1,
  lang: 'zh',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Challenge',
  random: makeSequenceRng([0.11, 0.22, 0.33]),
  persistHistory: false,
});

assert.match(cnZhBatch, /三角形 ABC|长方形 ABCD|正方形 ABCD/);

const cnZhSquareBatch = buildPythagorasExerciseBatch({
  count: 1,
  lang: 'zh',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Challenge',
  random: makeSequenceRng([0.41, 0.22, 0.33]),
  recentKindKeys: new Set(['show_right_triangle', 'direct_hypotenuse_surd', 'direct_leg_bc']),
  persistHistory: false,
});

assert.match(cnZhSquareBatch, /\$\d+\\sqrt\{2\}\$ cm/);

const cnRepeatItems = buildPythagorasExerciseItems(3, {
  lang: 'en',
  curriculum: 'CN',
  grade: '7',
  difficulty: 'Easy',
  random: makeSequenceRng([0.93, 0.72, 0.54, 0.31, 0.11]),
  recentVariantKeys: new Set(cnItems.map((item) => item.id)),
  persistHistory: false,
});

assert.equal(cnRepeatItems.length, 3);
assert.equal(new Set(cnRepeatItems.map((item) => item.id)).size, 3);
assert.notDeepEqual(
  cnRepeatItems.map((item) => item.id).sort(),
  cnItems.map((item) => item.id).sort()
);

const ukBatch = buildPythagorasExerciseBatch({
  count: 2,
  lang: 'en',
  curriculum: 'UK',
  grade: '9',
  difficulty: 'Hard',
  random: makeSequenceRng([0.12, 0.89, 0.46, 0.77]),
  persistHistory: false,
});

assert.match(ukBatch, /Show that triangle ABC is right-angled at B|Work out the length of diagonal AC/);
assert.match(ukBatch, /"template":"(right_triangle|rectangle_diagonal)"/);

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
assert.match(usBatch, /"template":"rectangle_diagonal"/);
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
