import assert from 'node:assert/strict';
import {
  buildAreaPerimeterExerciseBatch,
  buildAreaPerimeterExerciseItems,
  isAreaPerimeterConcept,
  validateAreaPerimeterExerciseItems,
} from '../src/utils/areaPerimeterExerciseTemplates.js';

assert.equal(
  isAreaPerimeterConcept('area-perimeter', 'Area & Perimeter', 'Area formulas for triangles, quadrilaterals, circles'),
  true
);

assert.equal(
  isAreaPerimeterConcept('pythagoras', 'Pythagorean Theorem', 'Right triangle sides'),
  false
);

const easyItems = buildAreaPerimeterExerciseItems(4, { lang: 'zh', difficulty: 'Easy', grade: '8' });
assert.equal(easyItems.length, 4);
assert.deepEqual(new Set(easyItems.map((item) => item.kind)), new Set([
  'rectangle_area',
  'rectangle_perimeter',
  'square_area',
  'square_perimeter',
]));
assert.deepEqual(validateAreaPerimeterExerciseItems(easyItems), []);

const mediumItems = buildAreaPerimeterExerciseItems(4, { lang: 'zh', difficulty: 'Medium', grade: '8' });
assert.equal(mediumItems.length, 4);
assert.deepEqual(new Set(mediumItems.map((item) => item.kind)), new Set([
  'rectangle_area_reverse',
  'rectangle_perimeter_reverse',
  'square_area_reverse',
  'square_perimeter_reverse',
]));
assert.deepEqual(validateAreaPerimeterExerciseItems(mediumItems), []);

const hardItems = buildAreaPerimeterExerciseItems(13, { lang: 'zh', difficulty: 'Hard', grade: '8' });
assert.equal(hardItems.length, 13);
assert.deepEqual(new Set(hardItems.map((item) => item.kind)), new Set([
  'l_shape_area',
  'l_shape_perimeter',
  'trapezoid_area',
  'parallelogram_area',
  'parallelogram_perimeter',
  'triangle_area',
  'triangle_perimeter',
  'circle_area',
  'circle_circumference',
  'circle_area_reverse',
  'circle_circumference_reverse',
  'circle_annulus_area',
  'sector_area',
]));
assert.deepEqual(validateAreaPerimeterExerciseItems(hardItems), []);

const easyRendered = buildAreaPerimeterExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Easy', grade: '8' });
const mediumRendered = buildAreaPerimeterExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Medium', grade: '8' });
const hardRendered = buildAreaPerimeterExerciseBatch({ count: 13, lang: 'zh', difficulty: 'Hard', grade: '8' });

assert.equal((easyRendered.match(/```math-diagram/g) ?? []).length, 4);
assert.equal((mediumRendered.match(/```math-diagram/g) ?? []).length, 4);
assert.equal((hardRendered.match(/```math-diagram/g) ?? []).length, 13);

assert.match(easyRendered, /"template":"rectangle"/);
assert.match(mediumRendered, /"label_area":"40 cm/);
assert.match(mediumRendered, /"label_perimeter":"26 cm"/);
assert.match(mediumRendered, /"label_width":"\?"/);

assert.match(hardRendered, /"template":"coordinate_points"/);
assert.match(hardRendered, /"template":"parallelogram"/);
assert.match(hardRendered, /"template":"triangle"/);
assert.match(hardRendered, /"template":"circle"/);
assert.match(hardRendered, /"template":"circle_annulus"/);
assert.match(hardRendered, /"template":"circle_sector"/);
assert.match(hardRendered, /"axes":false/);
assert.match(hardRendered, /"label_area":"\?"/);
assert.match(hardRendered, /"label_perimeter":"\?"/);
assert.match(hardRendered, /"label_radius":"\?"/);

console.log('area-perimeter template test passed');
