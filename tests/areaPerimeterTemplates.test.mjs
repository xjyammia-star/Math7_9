import assert from 'node:assert/strict';
import {
  buildAreaPerimeterExerciseBatch,
  buildAreaPerimeterExerciseItems,
  isAreaPerimeterConcept,
  renderAreaPerimeterExerciseItem,
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
  't_shape_area',
  't_shape_perimeter',
  't_shape_area_reverse',
  't_shape_perimeter_reverse',
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

const easyKinds = new Set(easyBatch.map((item) => item.kind));
const mediumKinds = new Set(mediumBatch.map((item) => item.kind));
const hardKinds = new Set(hardBatch.map((item) => item.kind));

assert.ok(easyKinds.has('triangle_area'));
assert.ok(easyKinds.has('circle_area'));
assert.ok(easyKinds.has('circle_circumference'));
assert.ok(mediumKinds.has('circle_area_reverse'));
assert.ok(mediumKinds.has('circle_circumference_reverse'));
assert.ok(hardKinds.has('l_shape_area'));
assert.ok(hardKinds.has('sector_area_reverse'));
assert.ok(hardKinds.has('t_shape_area') || hardKinds.has('t_shape_perimeter_reverse'));
assert.ok(!hardKinds.has('circle_area'));
assert.ok(!hardKinds.has('rectangle_area'));

const easyCircleItem = easyBatch.find((item) => item.kind === 'circle_area' || item.kind === 'circle_circumference');
assert.ok(easyCircleItem);
assert.doesNotMatch(renderAreaPerimeterExerciseItem(easyCircleItem, 0, 'zh'), /\n\{\}\n/);
assert.match(renderAreaPerimeterExerciseItem(easyCircleItem, 0, 'zh'), /"template":"circle"/);

const hardTItem = hardBatch.find((item) => item.kind.startsWith('t_shape_'));
assert.ok(hardTItem);
assert.match(renderAreaPerimeterExerciseItem(hardTItem, 0, 'zh'), /"template":"coordinate_points"/);
assert.match(renderAreaPerimeterExerciseItem(hardTItem, 0, 'zh'), /"label_top_width"/);

const hardSingles = Array.from({ length: 10 }, () => buildAreaPerimeterExerciseItems(1, { lang: 'zh', difficulty: 'Hard', grade: '8' }));
const hardSingleKeys = hardSingles.map((batch) => batch[0].key);
const hardSingleKinds = hardSingles.map((batch) => batch[0].kind);
assert.ok(new Set(hardSingleKeys).size >= 2);
assert.ok(new Set(hardSingleKinds).size >= 2);

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
