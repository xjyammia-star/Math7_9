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

const items = buildAreaPerimeterExerciseItems(4, { lang: 'zh', difficulty: 'Easy' });

assert.equal(items.length, 4);
assert.deepEqual(
  items.map((item) => item.kind),
  ['rectangle_area', 'rectangle_perimeter', 'square_area', 'square_perimeter']
);

assert.deepEqual(validateAreaPerimeterExerciseItems(items), []);

const rendered = buildAreaPerimeterExerciseBatch({ count: 4, lang: 'zh', difficulty: 'Easy' });
const diagramBlocks = rendered.match(/```math-diagram/g) ?? [];

assert.equal(diagramBlocks.length, 4);
assert.match(rendered, /"template":"rectangle"/);
assert.match(rendered, /"label_width":"8"/);
assert.match(rendered, /"label_height":"5"/);
assert.match(rendered, /"width":6,"height":6/);

console.log('area-perimeter template test passed');
