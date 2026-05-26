import assert from 'node:assert/strict';
import {
  normalizeTutorPlainText,
  shouldRenderTutorContentWithMath,
} from '../src/utils/tutorMarkdown.js';

assert.equal(
  shouldRenderTutorContentWithMath('A $20 t-shirt is $3 off its original price.'),
  false
);

assert.equal(
  shouldRenderTutorContentWithMath('The discount is \\frac{1}{5}$ of the original price.'),
  false
);

assert.equal(
  shouldRenderTutorContentWithMath('Use $x+3=7$ to solve for $x$.'),
  true
);

assert.equal(
  normalizeTutorPlainText('The discount is \\frac{1}{5} of the price, and \\times means multiplication.'),
  'The discount is 1/5 of the price, and × means multiplication.'
);

console.log('tutor markdown test passed');
