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

assert.match(cnZhBatch, /在直角三角形 ABC|在长方形 ABCD|在正方形 ABCD|判断它是否为直角三角形|证明三角形 ABC/);

const cnZhHarderBatch = buildPythagorasExerciseBatch({
  count: 1,
  lang: 'zh',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Challenge',
  random: makeSequenceRng([0.41, 0.22, 0.33]),
  recentKindKeys: ['rectangle_perimeter_diagonal', 'ladder_foot', 'coordinate_distance_shifted'],
  persistHistory: false,
});

assert.match(cnZhHarderBatch, /周长|梯子顶端离地|平面直角坐标系|判断它是否为直角三角形|证明三角形 ABC/);

const cnHardRotation = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.17, 0.29, 0.43]),
  recentKindKeys: ['rectangle_perimeter_diagonal', 'ladder_foot', 'coordinate_distance_shifted'],
  persistHistory: false,
});

assert.equal(cnHardRotation[0].kind, 'show_right_triangle');

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

const ukGrade6Fallback = buildPythagorasExerciseBatch({
  count: 1,
  lang: 'en',
  curriculum: 'UK',
  grade: '6',
  difficulty: 'Medium',
  random: makeSequenceRng([0.21, 0.43, 0.65]),
  persistHistory: false,
});

assert.match(ukGrade6Fallback, /"template":"(right_triangle|rectangle_diagonal|square_diagonal|ladder)"/);

const ukHardBatch = buildPythagorasExerciseBatch({
  count: 3,
  lang: 'en',
  curriculum: 'UK',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.13, 0.27, 0.49, 0.61, 0.83]),
  persistHistory: false,
});

assert.match(ukHardBatch, /perimeter is|the perimeter is/);
assert.match(ukHardBatch, /How far is the foot of the ladder from the wall/);
assert.match(ukHardBatch, /coordinate grid|right triangle|Show that triangle ABC/);

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

for (const [curriculum, grade, difficulty] of [
  ['US', '9', 'Easy'],
  ['US', '9', 'Medium'],
  ['UK', '8', 'Easy'],
  ['UK', '9', 'Easy'],
]) {
  const items = buildPythagorasExerciseItems(3, {
    lang: 'en',
    curriculum,
    grade,
    difficulty,
    random: makeSequenceRng([0.12, 0.34, 0.56, 0.78, 0.9]),
    persistHistory: false,
  });

  assert.equal(items.length, 3, `${curriculum} ${grade} ${difficulty} should return 3 items`);
  assert.equal(new Set(items.map((item) => item.id)).size, 3, `${curriculum} ${grade} ${difficulty} should not repeat ids`);

  const batch = buildPythagorasExerciseBatch({
    count: 3,
    lang: 'en',
    curriculum,
    grade,
    difficulty,
    random: makeSequenceRng([0.12, 0.34, 0.56, 0.78, 0.9]),
    persistHistory: false,
  });

  assert.equal((batch.match(/```math-diagram/g) ?? []).length, 3, `${curriculum} ${grade} ${difficulty} should render 3 exercises`);
}

const usHardBatch = buildPythagorasExerciseBatch({
  count: 3,
  lang: 'en',
  curriculum: 'US',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.14, 0.31, 0.52, 0.73, 0.88]),
  persistHistory: false,
});

assert.match(usHardBatch, /perimeter is|the perimeter is/);
assert.match(usHardBatch, /How far is the foot of the ladder from the wall/);
assert.match(usHardBatch, /coordinate grid|right triangle|Find the length of AC/);

const previousLocalStorage = globalThis.localStorage;
try {
  const memory = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
    },
  };

  const seenKinds = new Set();
  for (let i = 0; i < 12; i += 1) {
    const batch = buildPythagorasExerciseItems(1, {
      lang: 'en',
      curriculum: 'US',
      grade: '8',
      difficulty: 'Hard',
      random: makeSequenceRng([0.07, 0.19, 0.31, 0.43, 0.59, 0.71]),
      persistHistory: true,
    });
    seenKinds.add(batch[0].kind);
  }

  assert.ok(seenKinds.size >= 4);
} finally {
  globalThis.localStorage = previousLocalStorage;
}

const ibBatch = buildPythagorasExerciseBatch({
  count: 2,
  lang: 'en',
  curriculum: 'IB',
  grade: '9',
  difficulty: 'Hard',
  random: makeSequenceRng([0.19, 0.37, 0.58, 0.76]),
  persistHistory: false,
});

assert.match(ibBatch, /"template":"(coordinate_points|right_triangle|rectangle_diagonal)"/);
assert.match(ibBatch, /coordinate grid|right triangle|perimeter|周长/);

console.log('pythagoras template test passed');
