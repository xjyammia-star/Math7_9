import assert from 'node:assert/strict';
import {
  buildDifficultyGuidance,
  genericProblemTypesByDifficulty,
  minTierPoolSize,
  normalizeDifficulty,
  tierLabels,
} from '../src/utils/exerciseTierPolicy.js';

assert.equal(normalizeDifficulty('Easy'), 'Easy');
assert.equal(normalizeDifficulty('入门'), 'Easy');
assert.equal(normalizeDifficulty('Medium'), 'Medium');
assert.equal(normalizeDifficulty('进阶'), 'Medium');
assert.equal(normalizeDifficulty('Hard'), 'Hard');
assert.equal(normalizeDifficulty('挑战'), 'Hard');

assert.equal(tierLabels.Easy.zh, '入门');
assert.equal(tierLabels.Medium.zh, '进阶');
assert.equal(tierLabels.Hard.zh, '挑战');

assert.equal(minTierPoolSize.Easy, 30);
assert.equal(minTierPoolSize.Medium, 30);
assert.equal(minTierPoolSize.Hard, 30);

assert.ok(genericProblemTypesByDifficulty.Easy.length >= 8);
assert.ok(genericProblemTypesByDifficulty.Medium.length >= 8);
assert.ok(genericProblemTypesByDifficulty.Hard.length >= 8);

const easyGuide = buildDifficultyGuidance('Easy', 'en');
const mediumGuide = buildDifficultyGuidance('Medium', 'en');
const hardGuide = buildDifficultyGuidance('Hard', 'en');

assert.match(easyGuide, /shortest reasonable solution path/i);
assert.match(mediumGuide, /1-2 extra steps/i);
assert.match(hardGuide, /genuine challenge question/i);

console.log('exercise tier policy test passed');
