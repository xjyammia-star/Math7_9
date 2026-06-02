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

function makeLocalStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    },
  };
}

const hardKindsExceptAuxiliary = [
  'cylinder_shortest_path',
  'rectangular_prism_surface_shortest_path',
  'rectangular_prism_surface_opposite_corners',
  'rectangle_fold_reflection_corner',
  'rectangular_prism_space_diagonal',
  'show_right_triangle',
  'direct_hypotenuse_surd',
  'ladder_foot',
  'coordinate_distance_shifted',
  'rectangle_area_diagonal',
  'rectangle_perimeter_diagonal',
];

const hardKindsExceptSurfacePath = [
  'cylinder_shortest_path',
  'rectangular_prism_surface_opposite_corners',
  'rectangle_fold_reflection_corner',
  'rectangular_prism_space_diagonal',
  'show_right_triangle',
  'direct_hypotenuse_surd',
  'ladder_foot',
  'coordinate_distance_shifted',
  'rectangle_area_diagonal',
  'rectangle_perimeter_diagonal',
  'auxiliary_angle_hidden_segment',
  'auxiliary_angle_hidden_leg',
];

const hardKindsExceptOppositeCorners = [
  'cylinder_shortest_path',
  'rectangular_prism_surface_shortest_path',
  'rectangle_fold_reflection_corner',
  'rectangular_prism_space_diagonal',
  'show_right_triangle',
  'direct_hypotenuse_surd',
  'ladder_foot',
  'coordinate_distance_shifted',
  'rectangle_area_diagonal',
  'rectangle_perimeter_diagonal',
  'auxiliary_angle_hidden_segment',
  'auxiliary_angle_hidden_leg',
];

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
assert.ok(cnItems.some((item) => item.kind === 'direct_hypotenuse'));
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
assert.match(cnBatch, /"labels":\{"A":"A","B":"B","C":"C","D":"D"\}/);
assert.match(cnBatch, /Find the length of AC|diagonal AC/);

const challengeItems = buildPythagorasExerciseItems(8, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Challenge',
  random: makeSequenceRng([0.05, 0.15, 0.25, 0.35, 0.45]),
  persistHistory: false,
});

const challengeKinds = new Set(challengeItems.map((item) => item.kind));
assert.equal(challengeItems.length, 8);
assert.ok(challengeKinds.size >= 6);
assert.ok(!challengeKinds.has('show_right_triangle'));
assert.ok(!challengeKinds.has('square_diagonal'));
assert.ok(!challengeKinds.has('direct_hypotenuse'));
assert.ok(
  challengeItems.every((item) =>
    [
      'auxiliary_angle_hidden_segment',
      'auxiliary_angle_hidden_leg',
      'cylinder_shortest_path',
      'rectangular_prism_surface_shortest_path',
      'rectangular_prism_surface_opposite_corners',
      'rectangular_prism_space_diagonal',
      'rectangle_fold_reflection_corner',
      'ladder_foot',
      'coordinate_distance_shifted',
    ].includes(item.kind)
  )
);

const cnZhBatch = buildPythagorasExerciseBatch({
  count: 1,
  lang: 'zh',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Challenge',
  random: makeSequenceRng([0.11, 0.22, 0.33]),
  persistHistory: false,
});

assert.ok(cnZhBatch.includes("```math-diagram"));;

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

assert.ok(cnZhHarderBatch.includes("```math-diagram"));;

const cnHardAuxiliary = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.02, 0.22, 0.42]),
  recentKindKeys: hardKindsExceptAuxiliary,
  persistHistory: false,
});

assert.ok(['auxiliary_angle_hidden_segment', 'auxiliary_angle_hidden_leg'].includes(cnHardAuxiliary[0].kind));
assert.match(
  buildPythagorasExerciseBatch({
    count: 1,
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.02, 0.22, 0.42]),
    recentKindKeys: hardKindsExceptAuxiliary,
    persistHistory: false,
  }),
  /auxiliary_angle_hidden_segment|45ยฐ|AB = AC|BD = 3|CE = 4|DE|angleMarks/
);

const cnHardAuxiliaryLeg = buildPythagorasExerciseItems(1, {
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.12, 0.32, 0.52]),
    recentKindKeys: [...hardKindsExceptAuxiliary, 'auxiliary_angle_hidden_segment'],
    persistHistory: false,
  });

assert.equal(cnHardAuxiliaryLeg[0].kind, 'auxiliary_angle_hidden_leg');
assert.match(
  buildPythagorasExerciseBatch({
    count: 1,
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.12, 0.32, 0.52]),
    recentKindKeys: [...hardKindsExceptAuxiliary, 'auxiliary_angle_hidden_segment'],
    persistHistory: false,
  }),
  /auxiliary_angle_hidden_leg|45เธขเธ|AB = AC|BD = 3|CE = 4|AD|angleMarks/
);

const cnHardSurfacePath = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.24, 0.42, 0.66]),
  recentKindKeys: hardKindsExceptSurfacePath,
  persistHistory: false,
});

assert.equal(cnHardSurfacePath[0].kind, 'rectangular_prism_surface_shortest_path');
assert.match(
  buildPythagorasExerciseBatch({
    count: 1,
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.24, 0.42, 0.66]),
    recentKindKeys: hardKindsExceptSurfacePath,
    persistHistory: false,
  }),
  /rectangular_prism_surface_shortest_path|surface|front bottom-left|上表面右上角|label_path/
);

const cnHardOppositeCorners = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.31, 0.57, 0.79]),
  recentKindKeys: hardKindsExceptOppositeCorners,
  persistHistory: false,
});

assert.equal(cnHardOppositeCorners[0].kind, 'rectangular_prism_surface_opposite_corners');
assert.match(
  buildPythagorasExerciseBatch({
    count: 1,
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.31, 0.57, 0.79]),
    recentKindKeys: hardKindsExceptOppositeCorners,
    persistHistory: false,
  }),
  /rectangular_prism_surface_opposite_corners|opposite corner|对角顶点|path_show_line/
);

const cnHardFoldReflection = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.37, 0.58, 0.81]),
  recentKindKeys: [
    'auxiliary_angle_hidden_leg',
    'auxiliary_angle_hidden_segment',
    'rectangular_prism_surface_shortest_path',
    'rectangular_prism_surface_opposite_corners',
    'rectangular_prism_space_diagonal',
    'cylinder_shortest_path',
    'show_right_triangle',
    'direct_hypotenuse_surd',
    'ladder_foot',
    'coordinate_distance_shifted',
    'rectangle_area_diagonal',
    'rectangle_perimeter_diagonal',
  ],
  persistHistory: false,
});

assert.equal(cnHardFoldReflection[0].kind, 'rectangle_fold_reflection_corner');
assert.match(
  buildPythagorasExerciseBatch({
    count: 1,
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.37, 0.58, 0.81]),
    recentKindKeys: [
      'auxiliary_angle_hidden_leg',
      'auxiliary_angle_hidden_segment',
      'rectangular_prism_surface_shortest_path',
      'rectangular_prism_surface_opposite_corners',
      'rectangular_prism_space_diagonal',
      'cylinder_shortest_path',
      'show_right_triangle',
      'direct_hypotenuse_surd',
      'ladder_foot',
      'coordinate_distance_shifted',
      'rectangle_area_diagonal',
      'rectangle_perimeter_diagonal',
    ],
    persistHistory: false,
  }),
  /rectangle_fold_reflection_corner|AB = 12 cm|AD = 8 cm|AE = 4 cm|CF = 2 cm|A'B|label_Ap:"A'|label_AB|label_AD|label_AE|label_CF|label_ApB/
);

const pythagorasTierFamilies = {
  Easy: ['direct_hypotenuse', 'rectangle_diagonal', 'square_diagonal', 'ladder_height'],
  Medium: ['direct_leg_ab', 'direct_leg_bc', 'square_side_from_diagonal', 'coordinate_distance'],
  Hard: [
    'auxiliary_angle_hidden_leg',
    'auxiliary_angle_hidden_segment',
    'rectangle_fold_reflection_corner',
    'rectangular_prism_surface_shortest_path',
    'rectangular_prism_surface_opposite_corners',
    'rectangular_prism_space_diagonal',
    'rectangle_area_diagonal',
    'rectangle_perimeter_diagonal',
    'ladder_foot',
    'coordinate_distance_shifted',
    'show_right_triangle',
    'direct_hypotenuse_surd',
  ],
};

const cnHardRotation = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.17, 0.29, 0.43]),
  recentKindKeys: ['rectangle_perimeter_diagonal', 'ladder_foot', 'coordinate_distance_shifted'],
  persistHistory: false,
});

assert.ok(pythagorasTierFamilies.Hard.includes(cnHardRotation[0].kind));

const cnGrade8Easy = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Easy',
  random: makeSequenceRng([0.11, 0.22, 0.33]),
  persistHistory: false,
});

const cnGrade8Hard = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'CN',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.11, 0.22, 0.33]),
  persistHistory: false,
});

assert.ok(pythagorasTierFamilies.Easy.includes(cnGrade8Easy[0].kind));
assert.ok(pythagorasTierFamilies.Hard.includes(cnGrade8Hard[0].kind));
assert.notEqual(cnGrade8Easy[0].kind, cnGrade8Hard[0].kind);
assert.ok(
  buildPythagorasExerciseBatch({
    count: 1,
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.03, 0.19, 0.41]),
    persistHistory: false,
  }).includes('```math-diagram')
);

const prismHard = buildPythagorasExerciseBatch({
  count: 1,
  lang: 'en',
  curriculum: 'US',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.07, 0.19, 0.31]),
  persistHistory: false,
});

assert.match(prismHard, /"template":"rectangle_fold"|"template":"rectangular_prism_net"|"template":"coordinate_points"|"template":"cylinder_unrolled"/);

function spotCheckPythagorasSamples(label, options, rounds, count) {
  const seenKinds = new Set();

  for (let round = 0; round < rounds; round += 1) {
    const sequence = [
      0.07 + round * 0.11,
      0.19 + round * 0.11,
      0.31 + round * 0.11,
      0.43 + round * 0.11,
      0.55 + round * 0.11,
    ];
    const items = buildPythagorasExerciseItems(count, {
      ...options,
      random: makeSequenceRng(sequence),
      persistHistory: false,
    });
    assert.equal(items.length, count, `${label} round ${round + 1} should produce ${count} items`);
    assert.deepEqual(validatePythagorasExerciseItems(items), []);
    assert.equal(new Set(items.map((item) => item.id)).size, count);
    items.forEach((item) => seenKinds.add(item.kind));

    const rendered = buildPythagorasExerciseBatch({
      ...options,
      count,
      random: makeSequenceRng(sequence),
      persistHistory: false,
    });
    assert.doesNotMatch(rendered, /undefined/);
    assert.match(rendered, /```math-diagram/);
  }

  return seenKinds;
}

const cnEasySpotKinds = spotCheckPythagorasSamples('CN easy', { lang: 'en', curriculum: 'CN', grade: '7', difficulty: 'Easy' }, 3, 3);
const cnMediumSpotKinds = spotCheckPythagorasSamples('CN medium', { lang: 'en', curriculum: 'CN', grade: '8', difficulty: 'Medium' }, 3, 3);
const cnHardSpotKinds = spotCheckPythagorasSamples('CN hard', { lang: 'en', curriculum: 'CN', grade: '8', difficulty: 'Hard' }, 4, 3);

assert.ok(cnEasySpotKinds.size >= 2);
assert.ok(cnMediumSpotKinds.size >= 2);
assert.ok(cnHardSpotKinds.size >= 3);
assert.ok([...cnHardSpotKinds].every((kind) => pythagorasTierFamilies.Hard.includes(kind)));

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

assert.ok(ukBatch.includes('```math-diagram'));

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

assert.match(ukHardBatch, /rectangular_prism_net|space diagonal|rectangle_fold_reflection_corner|rectangular_prism_surface_shortest_path|rectangular_prism_surface_opposite_corners|auxiliary_angle_hidden_segment|auxiliary_angle_hidden_leg|show_right_angle_mark":false|label_foot":"\?"|label_AC":"\?"|label_BC":"\?"|label_path":"\?"|simplest surd form|prove|show|coordinate grid/);
assert.match(ukHardBatch, /"label_foot":"\?"|rectangular_prism_net|space diagonal|label_path":"\?"|path_show_line":false|rectangle_fold|AB = [0-9]+ cm|AD = [0-9]+ cm|AE = [0-9]+ cm|CF = [0-9]+ cm/);

const usBatch = buildPythagorasExerciseBatch({
  count: 2,
  lang: 'en',
  curriculum: 'US',
  grade: '8',
  difficulty: 'Medium',
  random: makeSequenceRng([0.16, 0.48, 0.84, 0.29]),
  persistHistory: false,
});

assert.match(usBatch, /"template":"(square_diagonal|coordinate_points|right_triangle|rectangle_diagonal|ladder)"/);
assert.match(usBatch, /Find the length of (side )?(AB|BC|AC)|Find AB|Find BC|Find AC|How high up the wall does it reach\?|How far is the foot of the ladder from the wall\?/);

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

assert.match(usHardBatch, /rectangular_prism_net|space diagonal|rectangle_fold_reflection_corner|rectangular_prism_surface_shortest_path|rectangular_prism_surface_opposite_corners|auxiliary_angle_hidden_segment|auxiliary_angle_hidden_leg|show_right_angle_mark":false|label_foot":"\?"|label_AC":"\?"|label_BC":"\?"|label_path":"\?"|simplest surd form|prove|show|coordinate grid/);

const gbEasy = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'GB',
  grade: '8',
  difficulty: 'Easy',
  random: makeSequenceRng([0.11, 0.22, 0.33]),
  persistHistory: false,
});

const gbHard = buildPythagorasExerciseItems(1, {
  lang: 'en',
  curriculum: 'GB',
  grade: '8',
  difficulty: 'Hard',
  random: makeSequenceRng([0.11, 0.22, 0.33]),
  persistHistory: false,
});

assert.equal(gbEasy[0].curriculum, 'UK');
assert.equal(gbHard[0].curriculum, 'UK');
assert.ok(pythagorasTierFamilies.Hard.includes(gbHard[0].kind));
assert.notEqual(gbEasy[0].kind, gbHard[0].kind);

const repeatMemory = new Map();
const previousLocalStorageForRepeat = globalThis.localStorage;
try {
  globalThis.localStorage = {
    getItem(key) {
      return repeatMemory.has(key) ? repeatMemory.get(key) : null;
    },
    setItem(key, value) {
      repeatMemory.set(key, String(value));
    },
  };

  const repeatedKinds = [];
  for (let i = 0; i < 10; i += 1) {
    const items = buildPythagorasExerciseItems(1, {
      lang: 'en',
      curriculum: 'GB',
      grade: '8',
      difficulty: 'Hard',
      random: makeSequenceRng([0.11, 0.22, 0.33, 0.44, 0.55]),
      persistHistory: true,
    });
    repeatedKinds.push(items[0].kind);
  }

  assert.ok(new Set(repeatedKinds).size >= 3);
  assert.ok(repeatedKinds.some((kind) => kind !== repeatedKinds[0]));
} finally {
  globalThis.localStorage = previousLocalStorageForRepeat;
}

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

  assert.ok(seenKinds.size >= 3);
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

assert.match(ibBatch, /rectangular_prism_net|space diagonal|rectangle_fold_reflection_corner|rectangular_prism_surface_shortest_path|rectangular_prism_surface_opposite_corners|auxiliary_angle_hidden_segment|auxiliary_angle_hidden_leg|area is|perimeter|coordinate grid|On a coordinate grid|label_path/);

const previousLocalStorageForOrder = globalThis.localStorage;
try {
  globalThis.localStorage = makeLocalStorageMock();
  const hardOrderA = buildPythagorasExerciseItems(10, {
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.01, 0.2, 0.41, 0.63, 0.85, 0.96]),
    persistHistory: true,
  }).map((item) => item.kind).join(',');

  globalThis.localStorage = makeLocalStorageMock();
  const hardOrderB = buildPythagorasExerciseItems(10, {
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.96, 0.85, 0.63, 0.41, 0.2, 0.01]),
    persistHistory: true,
  }).map((item) => item.kind).join(',');

  globalThis.localStorage = makeLocalStorageMock();
  const hardOrderC = buildPythagorasExerciseItems(10, {
    lang: 'en',
    curriculum: 'CN',
    grade: '8',
    difficulty: 'Hard',
    random: makeSequenceRng([0.3, 0.6, 0.9, 0.15, 0.45, 0.75]),
    persistHistory: true,
  }).map((item) => item.kind).join(',');

  assert.ok(new Set([hardOrderA, hardOrderB, hardOrderC]).size > 1);
} finally {
  globalThis.localStorage = previousLocalStorageForOrder;
}

console.log('pythagoras template test passed');










