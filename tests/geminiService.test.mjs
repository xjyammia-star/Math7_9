import assert from 'node:assert/strict';
import { detectOutputIssues, shouldStripDiagramArtifactsAfterRepair, wrapUnfencedCircleSceneBlock } from '../src/services/geminiService.ts';
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
assert.match(wrappedCircleScene, /"template":"circle_scene"/);

const rawBareCircleSceneLeak = [
  '1. 如图，完成圆题。',
  '{',
  '  "conceptId": "circle",',
  '  "figureType": "circle",',
  '  "center": "O",',
  '  "points": [',
  '    { "name": "O", "role": "center_point" },',
  '    { "name": "A", "role": "tangent_point" },',
  '    { "name": "B", "role": "tangent_point" },',
  '    { "name": "C", "role": "arc_point", "arcSide": "minor" }',
  '  ],',
  '  "relations": [',
  '    { "type": "tangent", "line": "PA", "touches": "A" },',
  '    { "type": "tangent", "line": "PB", "touches": "B" },',
  '    { "type": "arc_membership", "point": "C", "arc": "AB", "arcSide": "minor" }',
  '  ],',
  '  "givens": [],',
  '  "targets": [],',
  '  "display": {}',
  '}',
].join('\n');

const wrappedBareCircleScene = wrapUnfencedCircleSceneBlock(rawBareCircleSceneLeak);
assert.match(wrappedBareCircleScene, /```math-diagram/);
assert.match(wrappedBareCircleScene, /"template":"circle_scene"/);

const mismatchedCircleExercise = [
  '\u5982\u56fe\uff0cAB\u662f\u2299O\u7684\u76f4\u5f84\uff0c\u5f26CD\u5782\u76f4\u4e8eAB\u4e8e\u70b9E\uff0c\u4ea4\u2299O\u4e8e\u70b9C\uff0cD\u3002\u8fde\u63a5AC\uff0cAD\uff0cBC\u3002\u5df2\u77e5AC=\u221a2\uff0cAD=\u221a6\uff0c\u6c42\u25b3ABD\u7684\u9762\u79ef\u3002',
  '```math-diagram',
  JSON.stringify({
    template: 'circle_scene',
    scene: {
      conceptId: 'circles',
      figureType: 'circle',
      center: 'O',
      points: [
        { name: 'O', role: 'center_point' },
        { name: 'A', role: 'tangent_point' },
        { name: 'B', role: 'tangent_point' },
        { name: 'C', role: 'arc_point', arcSide: 'minor' },
        { name: 'D', role: 'arc_point', arcSide: 'major' },
        { name: 'E', role: 'foot_point' },
      ],
      relations: [
        { type: 'chord', points: ['C', 'D'] },
        { type: 'segment', points: ['A', 'C'] },
        { type: 'segment', points: ['B', 'C'] },
        { type: 'intersection', point: 'E', of: ['AB', 'CD'] },
        { type: 'right_angle', points: ['C', 'E', 'A'] },
      ],
      givens: [
        { name: 'AC', value: 1.414 },
        { name: 'AD', value: 2.449 },
      ],
      targets: [{ name: 'area_triangle_ABD' }],
      display: {},
    },
  }),
  '```',
].join('\n');

assert.ok(
  detectOutputIssues(mismatchedCircleExercise, 'Circles', 'Circle theorems', 'must_draw', 'circles').includes('circle_scene_semantic_mismatch')
);

console.log('gemini service request body test passed');
