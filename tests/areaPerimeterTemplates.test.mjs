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
assert.deepEqual(
  easyItems.map((item) => item.kind),
  ['rectangle_area', 'rectangle_perimeter', 'square_area', 'square_perimeter']
);
assert.deepEqual(validateAreaPerimeterExerciseItems(easyItems), []);

const mediumItems = buildAreaPerimeterExerciseItems(4, { lang: 'zh', difficulty: 'Medium', grade: '8' });
assert.equal(mediumItems.length, 4);
assert.deepEqual(
  mediumItems.map((item) => item.kind),
  [
    'rectangle_area_reverse',
    'rectangle_perimeter_reverse',
    'square_area_reverse',
    'square_perimeter_reverse',
  ]
);
assert.deepEqual(validateAreaPerimeterExerciseItems(mediumItems), []);

const hardItems = buildAreaPerimeterExerciseItems(5, { lang: 'zh', difficulty: 'Hard', grade: '8' });
assert.equal(hardItems.length, 5);
assert.deepEqual(
  hardItems.map((item) => item.kind),
  [
    'triangle_area',
    'triangle_perimeter',
    'circle_area',
    'circle_circumference',
    'sector_area',
  ]
);
assert.deepEqual(validateAreaPerimeterExerciseItems(hardItems), []);

const easyRendered = buildAreaPerimeterExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Easy', grade: '8' });
const mediumRendered = buildAreaPerimeterExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Medium', grade: '8' });
const hardRendered = buildAreaPerimeterExerciseBatch({ count: 5, lang: 'zh', difficulty: 'Hard', grade: '8' });

assert.equal((easyRendered.match(/```math-diagram/g) ?? []).length, 4);
assert.equal((mediumRendered.match(/```math-diagram/g) ?? []).length, 4);
assert.equal((hardRendered.match(/```math-diagram/g) ?? []).length, 5);

assert.match(easyRendered, /"template":"rectangle"/);
assert.match(mediumRendered, /"label_area":"40 cm²"/);
assert.match(mediumRendered, /"label_perimeter":"26 cm"/);
assert.match(mediumRendered, /"label_width":"\?"/);
assert.match(hardRendered, /"template":"triangle"/);
assert.match(hardRendered, /"template":"circle"/);
assert.match(hardRendered, /"template":"circle_sector"/);
assert.match(hardRendered, /"label_area":"\?"/);
assert.match(hardRendered, /"label_circumference":"\?"/);

assert.match(easyRendered, /求长方形的面积/);
assert.match(easyRendered, /求长方形的周长/);
assert.match(easyRendered, /求正方形的面积/);
assert.match(easyRendered, /求正方形的周长/);
assert.match(mediumRendered, /求 BC 的长度/);
assert.match(hardRendered, /求三角形的面积/);
assert.match(hardRendered, /求圆的周长/);
assert.match(hardRendered, /求扇形的面积/);

console.log('area-perimeter template test passed');
