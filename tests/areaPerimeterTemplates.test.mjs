import assert from 'node:assert/strict';
import {
  buildAreaPerimeterExerciseBatch,
  buildAreaPerimeterExerciseItems,
  isAreaPerimeterConcept,
  validateAreaPerimeterExerciseItems,
} from '../src/utils/areaPerimeterExerciseTemplates.js';

const storage = new Map();
globalThis.localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(String(key), String(value));
  },
  removeItem(key) {
    storage.delete(key);
  },
  clear() {
    storage.clear();
  },
};

const allowedHardKinds = new Set([
  'l_shape_area',
  'l_shape_perimeter',
  'trapezoid_area',
  'trapezoid_area_reverse',
  'parallelogram_area',
  'parallelogram_perimeter',
  'parallelogram_area_reverse',
  'triangle_area',
  'triangle_perimeter',
  'circle_annulus_area',
  'circle_annulus_area_reverse',
  'sector_area',
  'sector_area_reverse',
]);

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
assert.deepEqual(validateAreaPerimeterExerciseItems(easyItems), []);

const mediumItems = buildAreaPerimeterExerciseItems(4, { lang: 'zh', difficulty: 'Medium', grade: '8' });
assert.equal(mediumItems.length, 4);
assert.deepEqual(validateAreaPerimeterExerciseItems(mediumItems), []);

const easyBatch1 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Easy', grade: '8' });
const easyBatch2 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Easy', grade: '8' });
const easyBatch3 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Easy', grade: '8' });

const mediumBatch1 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Medium', grade: '8' });
const mediumBatch2 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Medium', grade: '8' });
const mediumBatch3 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Medium', grade: '8' });

const hardBatch1 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Hard', grade: '8' });
const hardBatch2 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Hard', grade: '8' });
const hardBatch3 = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Hard', grade: '8' });

for (const batch of [easyBatch1, easyBatch2, easyBatch3, mediumBatch1, mediumBatch2, mediumBatch3, hardBatch1, hardBatch2, hardBatch3]) {
  assert.equal(batch.length, 30);
  assert.equal(new Set(batch.map((item) => item.key)).size, 30);
  assert.ok(batch.every((item) => item.scene && typeof item.scene.zh === 'string' && typeof item.scene.en === 'string'));
}

const overlapCount = (a, b) => {
  const setA = new Set(a.map((item) => item.key));
  return b.reduce((count, item) => count + (setA.has(item.key) ? 1 : 0), 0);
};

assert.equal(overlapCount(easyBatch1, easyBatch2), 0);
assert.equal(overlapCount(easyBatch2, easyBatch3), 0);
assert.equal(overlapCount(mediumBatch1, mediumBatch2), 0);
assert.equal(overlapCount(mediumBatch2, mediumBatch3), 0);
assert.equal(overlapCount(hardBatch1, hardBatch2), 0);
assert.equal(overlapCount(hardBatch2, hardBatch3), 0);

const hardItems = buildAreaPerimeterExerciseItems(13, { lang: 'zh', difficulty: 'Hard', grade: '8' });
assert.equal(hardItems.length, 13);
assert.ok(hardItems.every((item) => allowedHardKinds.has(item.kind)));
assert.ok(hardItems.every((item) => item.scene && typeof item.scene.zh === 'string'));
assert.deepEqual(validateAreaPerimeterExerciseItems(hardItems), []);

const easyRendered = buildAreaPerimeterExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Easy', grade: '8' });
const mediumRendered = buildAreaPerimeterExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Medium', grade: '8' });
const hardRendered = buildAreaPerimeterExerciseBatch({ count: 13, lang: 'zh', difficulty: 'Hard', grade: '8' });

assert.equal((easyRendered.match(/```math-diagram/g) ?? []).length, 4);
assert.equal((mediumRendered.match(/```math-diagram/g) ?? []).length, 4);
assert.equal((hardRendered.match(/```math-diagram/g) ?? []).length, 13);
assert.doesNotMatch(easyRendered, /undefined/);
assert.doesNotMatch(mediumRendered, /undefined/);
assert.doesNotMatch(hardRendered, /undefined/);

console.log('area-perimeter template test passed');
