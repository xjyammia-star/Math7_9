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
  'trapezoid_area_reverse',
  'parallelogram_area_reverse',
  'circle_annulus_area_reverse',
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

const easyBatch = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Easy', grade: '8' });
const mediumBatch = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Medium', grade: '8' });
const hardBatch = buildAreaPerimeterExerciseItems(30, { lang: 'zh', difficulty: 'Hard', grade: '8' });

for (const batch of [easyBatch, mediumBatch, hardBatch]) {
  assert.equal(batch.length, 30);
  assert.equal(new Set(batch.map((item) => item.key)).size, 30);
  assert.ok(batch.every((item) => item.scene && typeof item.scene.zh === 'string' && typeof item.scene.en === 'string'));
}

const hardSingles = Array.from({ length: 10 }, () => buildAreaPerimeterExerciseItems(1, { lang: 'zh', difficulty: 'Hard', grade: '8' }));
assert.equal(new Set(hardSingles.map((batch) => batch[0].key)).size, hardSingles.length);

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
