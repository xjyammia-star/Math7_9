import assert from 'node:assert/strict';
import { shouldStripDiagramArtifactsAfterRepair, wrapUnfencedCircleSceneBlock } from '../src/services/geminiService.ts';
import { buildChatCompletionBody } from '../src/utils/modelRequest.js';

const messages = [{ role: 'user', content: 'Hello' }];

const glmConfig = { model: 'ep-20260528150018-jh75j' };
const doubaoConfig = { model: 'doubao-seed-2-0-lite-250615' };

const glmBody = buildChatCompletionBody(glmConfig, messages, true, 256, 0.2, 'glm47');
assert.equal(glmBody.model, 'ep-20260528150018-jh75j');
assert.deepEqual(glmBody.thinking, { type: 'disabled' });
assert.deepEqual(glmBody.response_format, { type: 'json_object' });
assert.equal(glmBody.max_tokens, 256);
assert.equal(glmBody.temperature, 0.2);

const doubaoBody = buildChatCompletionBody(doubaoConfig, messages, false, 128, 0.7, 'doubao');
assert.equal(doubaoBody.model, 'doubao-seed-2-0-lite-250615');
assert.equal(doubaoBody.thinking, undefined);
assert.equal(doubaoBody.response_format, undefined);
assert.equal(doubaoBody.max_tokens, 128);
assert.equal(doubaoBody.temperature, 0.7);

assert.equal(
  shouldStripDiagramArtifactsAfterRepair(['circle_scene_invalid'], 'circles'),
  false,
);

assert.equal(
  shouldStripDiagramArtifactsAfterRepair(['template_mismatch'], 'area-perimeter'),
  true,
);

const rawCircleSceneLeak = [
  '1. 如图，求弦长。',
  '{',
  '  "template": "circle_scene",',
  '  "scene": {',
  '    "conceptId": "circles",',
  '    "figureType": "circle",',
  '    "points": [],',
  '    "relations": [],',
  '    "givens": [],',
  '    "targets": [],',
  '    "display": {}',
  '  }',
  '}',
].join('\n');

const wrappedCircleScene = wrapUnfencedCircleSceneBlock(rawCircleSceneLeak);
assert.match(wrappedCircleScene, /```math-diagram/);
assert.match(wrappedCircleScene, /"template": "circle_scene"/);

console.log('gemini service request body test passed');
