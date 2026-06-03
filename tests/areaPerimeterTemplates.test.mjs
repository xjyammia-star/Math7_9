import assert from 'node:assert/strict';
import {
  buildAreaPerimeterExerciseBatch,
  buildAreaPerimeterExerciseItems,
  isAreaPerimeterConcept,
  renderAreaPerimeterExerciseItem,
  validateAreaPerimeterExerciseItems,
} from '../src/utils/areaPerimeterExerciseTemplates.js';
import {
  buildCompositeAreaPerimeterDiagramSpec,
  buildCompositeAreaPerimeterQuestionText,
  validateCompositeAreaPerimeterItem,
} from '../src/utils/areaPerimeterCompositeFamilies.js';

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
  'adjacent_squares_diagonal_area',
  'adjacent_squares_diagonal_area_reverse',
  'adjacent_squares_diagonal_tall_area',
  'adjacent_squares_diagonal_tall_area_reverse',
  'overlap_rectangles_union_area',
  'overlap_rectangles_union_area_reverse',
  'overlap_rectangles_union_perimeter',
  'rectangle_triangle_cut_area',
  'rectangle_triangle_cut_perimeter',
  'rectangle_triangle_cut_area_reverse',
  'rectangle_frame_area',
  'rectangle_frame_perimeter',
  'rectangle_frame_area_reverse',
  'rectangle_frame_perimeter_reverse',
  'house_shape_area',
  'house_shape_perimeter',
  'house_shape_area_reverse',
  'circle_rectangle_cut_area',
  'circle_rectangle_cut_perimeter',
  'circle_rectangle_cut_area_reverse',
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
assert.ok(hardKinds.has('adjacent_squares_diagonal_area'));
assert.ok(hardKinds.has('adjacent_squares_diagonal_area_reverse'));
assert.ok(hardKinds.has('adjacent_squares_diagonal_tall_area'));
assert.ok(hardKinds.has('adjacent_squares_diagonal_tall_area_reverse'));
assert.ok(hardKinds.has('rectangle_triangle_cut_area'));
assert.ok(hardKinds.has('circle_rectangle_cut_area'));
assert.ok(!hardKinds.has('circle_area'));
assert.ok(!hardKinds.has('rectangle_area'));

const easyCircleItem = easyBatch.find((item) => item.kind === 'circle_area' || item.kind === 'circle_circumference');
assert.ok(easyCircleItem);
assert.doesNotMatch(renderAreaPerimeterExerciseItem(easyCircleItem, 0, 'zh'), /\n\{\}\n/);
assert.match(renderAreaPerimeterExerciseItem(easyCircleItem, 0, 'zh'), /"template":"circle"/);
assert.doesNotMatch(renderAreaPerimeterExerciseItem(easyCircleItem, 0, 'zh'), /"\?"/);

const hardTItem = hardBatch.find((item) => item.kind.startsWith('t_shape_'));
assert.ok(hardTItem);
assert.match(renderAreaPerimeterExerciseItem(hardTItem, 0, 'zh'), /"template":"coordinate_points"/);
assert.match(renderAreaPerimeterExerciseItem(hardTItem, 0, 'zh'), /"label_top_width"/);
assert.match(renderAreaPerimeterExerciseItem(hardTItem, 0, 'zh'), /"polygons":\[\{/);

const hardLItem = hardBatch.find((item) => item.kind === 'l_shape_area' || item.kind === 'l_shape_perimeter');
assert.ok(hardLItem);
assert.match(renderAreaPerimeterExerciseItem(hardLItem, 0, 'zh'), /"polygons":\[\{/);

const hardAdjacentItem = hardBatch.find((item) => item.kind === 'adjacent_squares_diagonal_area');
assert.ok(hardAdjacentItem);
assert.match(renderAreaPerimeterExerciseItem(hardAdjacentItem, 0, 'zh'), /"template":"composite_overlay"/);
assert.match(renderAreaPerimeterExerciseItem(hardAdjacentItem, 0, 'zh'), /"kind":"segLabel"/);

const hardAdjacentReverseItem = hardBatch.find((item) => item.kind === 'adjacent_squares_diagonal_area_reverse');
assert.ok(hardAdjacentReverseItem);
assert.match(renderAreaPerimeterExerciseItem(hardAdjacentReverseItem, 0, 'zh'), /"template":"composite_overlay"/);
assert.match(renderAreaPerimeterExerciseItem(hardAdjacentReverseItem, 0, 'zh'), /"text":"\d+ cm²"/);

const hardAdjacentTallItem = hardBatch.find((item) => item.kind === 'adjacent_squares_diagonal_tall_area');
assert.ok(hardAdjacentTallItem);
assert.match(renderAreaPerimeterExerciseItem(hardAdjacentTallItem, 0, 'zh'), /"template":"composite_overlay"/);

const hardAdjacentTallReverseItem = hardBatch.find((item) => item.kind === 'adjacent_squares_diagonal_tall_area_reverse');
assert.ok(hardAdjacentTallReverseItem);
assert.match(renderAreaPerimeterExerciseItem(hardAdjacentTallReverseItem, 0, 'zh'), /"template":"composite_overlay"/);
assert.match(renderAreaPerimeterExerciseItem(hardAdjacentTallReverseItem, 0, 'zh'), /"text":"\d+ cm²"/);

const hardRectTriangleItem = hardBatch.find((item) => item.kind === 'rectangle_triangle_cut_area');
assert.ok(hardRectTriangleItem);
assert.match(renderAreaPerimeterExerciseItem(hardRectTriangleItem, 0, 'zh'), /"template":"composite_overlay"/);
assert.match(renderAreaPerimeterExerciseItem(hardRectTriangleItem, 0, 'zh'), /"kind":"poly"/);

const hardCircleRectItem = hardBatch.find((item) => item.kind === 'circle_rectangle_cut_area');
assert.ok(hardCircleRectItem);
assert.match(renderAreaPerimeterExerciseItem(hardCircleRectItem, 0, 'zh'), /"template":"composite_overlay"/);
assert.match(renderAreaPerimeterExerciseItem(hardCircleRectItem, 0, 'zh'), /"kind":"circle"/);

const mediumParallelogramReverse = {
  kind: 'parallelogram_area_reverse',
  template: 'parallelogram',
  base: 8,
  side: 5,
  angle: 30,
  height: 2.5,
  area: 20,
  answer: 2.5,
};
const mediumParallelogramReverseRendered = renderAreaPerimeterExerciseItem(mediumParallelogramReverse, 0, 'zh');
assert.match(mediumParallelogramReverseRendered, /"label_base":"\d+ cm"/);
assert.doesNotMatch(mediumParallelogramReverseRendered, /"label_height":"\?"/);
assert.doesNotMatch(mediumParallelogramReverseRendered, /"label_side":"\d+ cm"/);
assert.doesNotMatch(mediumParallelogramReverseRendered, /"label_angle":"\d+°"/);

const easyTriangleAreaItem = {
  kind: 'triangle_area',
  template: 'triangle',
  points: [
    { x: 0, y: 6, label: 'A' },
    { x: 0, y: 0, label: 'B' },
    { x: 8, y: 0, label: 'C' },
  ],
  legA: 6,
  legB: 8,
  hypotenuse: 10,
  answer: 24,
};
const easyTriangleAreaRendered = renderAreaPerimeterExerciseItem(easyTriangleAreaItem, 0, 'zh');
assert.match(easyTriangleAreaRendered, /"AB":"\d+ cm"/);
assert.match(easyTriangleAreaRendered, /"BC":"\d+ cm"/);
assert.doesNotMatch(easyTriangleAreaRendered, /"CA":"\d+ cm"/);

const mediumAnnulusReverseItem = {
  kind: 'circle_annulus_area_reverse',
  template: 'circle_annulus',
  outerRadius: 6,
  innerRadius: 3,
  area: 27 * Math.PI,
  answer: 3,
};
const mediumAnnulusReverseRendered = renderAreaPerimeterExerciseItem(mediumAnnulusReverseItem, 0, 'zh');
assert.match(mediumAnnulusReverseRendered, /"label_outer_radius":"6 cm"/);
assert.doesNotMatch(mediumAnnulusReverseRendered, /"label_inner_radius":"\?"/);
assert.match(mediumAnnulusReverseRendered, /"label_area":"27π cm²"/);

const mediumSectorReverseItem = {
  kind: 'sector_area_reverse',
  template: 'circle_sector',
  radius: 6,
  angle: 120,
  area: 12 * Math.PI,
  answer: 6,
};
const mediumSectorReverseRendered = renderAreaPerimeterExerciseItem(mediumSectorReverseItem, 0, 'zh');
assert.doesNotMatch(mediumSectorReverseRendered, /"label_radius":"\?"/);
assert.match(mediumSectorReverseRendered, /"label_angle":"120°"/);
assert.match(mediumSectorReverseRendered, /"label_area":"12π cm²"/);

const hardWideBatch = buildAreaPerimeterExerciseItems(24, { lang: 'zh', difficulty: 'Hard', grade: '8' });
const hardWideKinds = new Set(hardWideBatch.map((item) => item.kind));
assert.ok(hardWideKinds.has('overlap_rectangles_union_area') || hardWideKinds.has('overlap_rectangles_union_area_reverse'));
assert.ok(hardWideKinds.has('rectangle_frame_area') || hardWideKinds.has('rectangle_frame_perimeter') || hardWideKinds.has('rectangle_frame_area_reverse'));
assert.ok(hardWideKinds.has('house_shape_area') || hardWideKinds.has('house_shape_perimeter') || hardWideKinds.has('house_shape_area_reverse'));

const circleCutNonReverseItem = {
  kind: 'circle_rectangle_cut_perimeter',
  radius: 10,
  rectW: 4,
  rectH: 6,
  answer: 2 * Math.PI * 10 + 2 * (4 + 6),
  scene: { zh: '圆形挖空', en: 'circle cut-out' },
};
assert.deepEqual(validateCompositeAreaPerimeterItem(circleCutNonReverseItem), []);
const circleCutNonReverseDiagram = JSON.stringify(buildCompositeAreaPerimeterDiagramSpec(circleCutNonReverseItem));
assert.match(buildCompositeAreaPerimeterQuestionText(circleCutNonReverseItem, 'zh'), /求剩余图形的周长/);
assert.doesNotMatch(circleCutNonReverseDiagram, /"text":"\?"/);
assert.doesNotMatch(circleCutNonReverseDiagram, /290\.1592653589793/);

const circleCutReverseItem = {
  kind: 'circle_rectangle_cut_area_reverse',
  radius: 10,
  rectW: 4,
  rectH: 6,
  area: Math.PI * 10 * 10 - 4 * 6,
  answer: 4,
  scene: { zh: '圆形挖空', en: 'circle cut-out' },
};
assert.deepEqual(validateCompositeAreaPerimeterItem(circleCutReverseItem), []);
const circleCutReverseQuestion = buildCompositeAreaPerimeterQuestionText(circleCutReverseItem, 'zh');
const circleCutReverseDiagram = JSON.stringify(buildCompositeAreaPerimeterDiagramSpec(circleCutReverseItem));
assert.match(circleCutReverseQuestion, /100π - 24 cm²/);
assert.doesNotMatch(circleCutReverseQuestion, /290\.1592653589793/);
assert.match(circleCutReverseDiagram, /100π - 24 cm²/);
assert.doesNotMatch(circleCutReverseDiagram, /290\.1592653589793/);
assert.doesNotMatch(circleCutReverseDiagram, /"text":"\?"/);

const overlapRectanglesItem = {
  kind: 'overlap_rectangles_union_area',
  baseWidth: 24,
  baseHeight: 12,
  towerWidth: 15,
  towerHeight: 21,
  overlapWidth: 9,
  overlapHeight: 12,
  answer: 24 * 12 + 15 * 21 - 9 * 12,
  scene: { zh: '重叠长方形', en: 'overlapping rectangles' },
};
assert.deepEqual(validateCompositeAreaPerimeterItem(overlapRectanglesItem), []);
const overlapRectanglesQuestion = buildCompositeAreaPerimeterQuestionText(overlapRectanglesItem, 'zh');
const overlapRectanglesDiagram = JSON.stringify(buildCompositeAreaPerimeterDiagramSpec(overlapRectanglesItem));
assert.match(overlapRectanglesQuestion, /重叠/);
assert.match(overlapRectanglesDiagram, /"kind":"poly"/);
assert.doesNotMatch(overlapRectanglesDiagram, /"text":"\?"/);

const overlapRectanglesPerimeterItem = {
  kind: 'overlap_rectangles_union_perimeter',
  baseWidth: 24,
  baseHeight: 12,
  towerWidth: 15,
  towerHeight: 21,
  overlapWidth: 9,
  overlapHeight: 12,
  answer: 2 * (24 - 9 + 15 + 21),
  scene: { zh: '重叠长方形', en: 'overlapping rectangles' },
};
assert.deepEqual(validateCompositeAreaPerimeterItem(overlapRectanglesPerimeterItem), []);
assert.match(buildCompositeAreaPerimeterQuestionText(overlapRectanglesPerimeterItem, 'zh'), /周长/);

const frameReverseItem = {
  kind: 'rectangle_frame_area_reverse',
  outerWidth: 40,
  outerHeight: 28,
  innerWidth: 16,
  innerHeight: 12,
  area: 40 * 28 - 16 * 12,
  answer: 16,
  scene: { zh: '长方形相框', en: 'rectangular frame' },
};
assert.deepEqual(validateCompositeAreaPerimeterItem(frameReverseItem), []);
const frameReverseQuestion = buildCompositeAreaPerimeterQuestionText(frameReverseItem, 'zh');
const frameReverseDiagram = JSON.stringify(buildCompositeAreaPerimeterDiagramSpec(frameReverseItem));
assert.match(frameReverseQuestion, /相框/);
assert.match(frameReverseDiagram, /"text":"928 cm²"/);
assert.doesNotMatch(frameReverseDiagram, /"label":"\?"/);

const framePerimeterReverseItem = {
  kind: 'rectangle_frame_perimeter_reverse',
  outerWidth: 40,
  outerHeight: 28,
  innerWidth: 16,
  innerHeight: 12,
  perimeter: 2 * (40 + 28) + 2 * (16 + 12),
  answer: 16,
  scene: { zh: '长方形相框', en: 'rectangular frame' },
};
assert.deepEqual(validateCompositeAreaPerimeterItem(framePerimeterReverseItem), []);
assert.match(buildCompositeAreaPerimeterQuestionText(framePerimeterReverseItem, 'zh'), /周长/);

const houseReverseItem = {
  kind: 'house_shape_area_reverse',
  width: 12,
  wallHeight: 10,
  roofRise: 8,
  area: 12 * 10 + (12 * 8) / 2,
  answer: 8,
  scene: { zh: '小房子图形', en: 'house shape' },
};
assert.deepEqual(validateCompositeAreaPerimeterItem(houseReverseItem), []);
const houseReverseQuestion = buildCompositeAreaPerimeterQuestionText(houseReverseItem, 'zh');
const houseReverseDiagram = JSON.stringify(buildCompositeAreaPerimeterDiagramSpec(houseReverseItem));
assert.match(houseReverseQuestion, /小房子/);
assert.match(houseReverseDiagram, /"text":"168 cm²"/);
assert.match(houseReverseDiagram, /"kind":"seg"/);
assert.match(houseReverseDiagram, /"dash":"5,4"/);
assert.doesNotMatch(houseReverseDiagram, /"a":\{"x":0,"y":10\},"b":\{"x":6,"y":18\},"label":"10 cm"/);

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

function spotCheckAreaPerimeter(difficulty, rounds, count) {
  const seenKinds = new Set();

  for (let round = 0; round < rounds; round += 1) {
    globalThis.localStorage.clear();
    const items = buildAreaPerimeterExerciseItems(count, { lang: 'zh', difficulty, grade: '8' });
    assert.equal(items.length, count);
    assert.deepEqual(validateAreaPerimeterExerciseItems(items), []);

    const renderedBatch = buildAreaPerimeterExerciseBatch({ count, lang: 'zh', difficulty, grade: '8' });
    assert.doesNotMatch(renderedBatch, /undefined/);

    items.forEach((item, index) => {
      seenKinds.add(item.kind);
      const renderedItem = renderAreaPerimeterExerciseItem(item, index, 'zh');
      assert.doesNotMatch(renderedItem, /undefined/);
      assert.doesNotMatch(renderedItem, /"\?"/);
    });
  }

  return seenKinds;
}

const easySpotKinds = spotCheckAreaPerimeter('Easy', 3, 6);
const mediumSpotKinds = spotCheckAreaPerimeter('Medium', 3, 6);
const hardSpotKinds = spotCheckAreaPerimeter('Hard', 6, 8);

assert.ok(easySpotKinds.size >= 4);
assert.ok(mediumSpotKinds.size >= 5);
assert.ok(hardSpotKinds.size >= 8);
assert.ok([...hardSpotKinds].some((kind) => kind.startsWith('circle_rectangle_cut')));
assert.ok([...hardSpotKinds].some((kind) => kind.startsWith('adjacent_squares_diagonal')));
assert.ok([...hardSpotKinds].some((kind) => kind.startsWith('overlap_rectangles_union')));
assert.ok([...hardSpotKinds].some((kind) => kind.startsWith('rectangle_frame')));
assert.ok([...hardSpotKinds].some((kind) => kind.startsWith('house_shape')));
assert.ok([...hardSpotKinds].some((kind) => kind.startsWith('rectangle_triangle_cut')));

console.log('area-perimeter template test passed');
