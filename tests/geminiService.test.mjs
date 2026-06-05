import assert from 'node:assert/strict';
import { buildDeterministicCircleIntersectionSceneFromPrompt, detectOutputIssues, getExerciseGenerationTemperature, getExerciseRepairTemperature, replaceOrAppendMathDiagramBlock, shouldRegenerateCircleExerciseFresh, shouldRetryCircleSceneRepair, shouldStripDiagramArtifactsAfterRepair, wrapUnfencedCircleSceneBlock } from '../src/services/geminiService.ts';
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

const deterministicChordIntersectionChinese = buildDeterministicCircleIntersectionSceneFromPrompt(
  '\u5982\u56fe\uff0c\u5728\u2299O\u4e2d\uff0c\u76f4\u5f84AB\u4e0e\u5f26CD\u76f8\u4ea4\u4e8e\u70b9E\uff0c\u4e14\u2220AEC=30\u00b0\u3002\u82e5AB=10,AE=2,\u6c42\u5f26CD\u7684\u957f\u3002'
);
assert.ok(deterministicChordIntersectionChinese);
assert.match(deterministicChordIntersectionChinese, /"template":"circle_scene"/);
assert.match(deterministicChordIntersectionChinese, /"type":"angle"/);
assert.match(deterministicChordIntersectionChinese, /"type":"intersection"/);

assert.equal(
  shouldStripDiagramArtifactsAfterRepair(['circle_scene_invalid'], 'circles'),
  false,
);

assert.equal(getExerciseGenerationTemperature('circles'), 0.35);
assert.equal(getExerciseGenerationTemperature('area-perimeter'), 0.95);
assert.equal(getExerciseRepairTemperature('circles', 1), 0.25);
assert.equal(getExerciseRepairTemperature('circles', 3), 0.12);
assert.equal(getExerciseRepairTemperature('area-perimeter', 1), 0.7);
assert.equal(shouldRetryCircleSceneRepair(['circle_scene_invalid'], 'circles'), true);
assert.equal(shouldRetryCircleSceneRepair(['circle_scene_semantic_mismatch'], 'circles'), true);
assert.equal(shouldRetryCircleSceneRepair(['template_mismatch'], 'area-perimeter'), false);
assert.equal(shouldRegenerateCircleExerciseFresh(['circle_scene_invalid'], 'circles'), true);
assert.equal(shouldRegenerateCircleExerciseFresh(['circle_scene_semantic_mismatch'], 'circles'), true);
assert.equal(shouldRegenerateCircleExerciseFresh(['missing_diagram_block'], 'circles'), true);
assert.equal(shouldRegenerateCircleExerciseFresh(['template_mismatch'], 'area-perimeter'), false);

const replacedBlock = replaceOrAppendMathDiagramBlock(
  '1. 如图，已知 AB 是直径。',
  '{"template":"circle_scene","scene":{"conceptId":"circles","figureType":"circle","center":"O","points":[{"name":"O","role":"center_point"},{"name":"A","role":"tangent_point"},{"name":"B","role":"tangent_point"}],"relations":[{"type":"diameter","points":["A","B"]}],"givens":[],"targets":[],"display":{}}}'
);
assert.match(replacedBlock, /```math-diagram/);
assert.match(replacedBlock, /"template":"circle_scene"/);

const deterministicChordIntersection = buildDeterministicCircleIntersectionSceneFromPrompt(
  '如图，在⊙O中，直径AB与弦CD相交于点E，且∠AEC=30°。若AB=10,AE=2,求弦CD的长。'
);
assert.ok(deterministicChordIntersection);
assert.match(deterministicChordIntersection, /"template":"circle_scene"/);
assert.match(deterministicChordIntersection, /"type":"angle"/);
assert.match(deterministicChordIntersection, /"type":"intersection"/);

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

const missingArcPointExercise = [
  '\u8bc1\u660e\u9898\uff1a\u5df2\u77e5AB\u662f\u2299O\u7684\u76f4\u5f84\uff0c\u5f26CD\u5782\u76f4\u4e8eAB\u4e8eE\uff0c\u4e14CE=4\uff0cO\u7684\u534a\u5f845\u3002\u70b9F\u5728\u52a3\u5f27BC\u4e0a(\u4e0d\u4e0eB\u3001C\u91cd\u5408)\uff0c\u8fde\u63a5AF\u4ea4CD\u4e8e\u70b9P\uff0c\u8fde\u63a5CF\u3002',
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
        { name: 'P', role: 'intersection_point' },
      ],
      relations: [
        { type: 'diameter', points: ['A', 'B'] },
        { type: 'chord', points: ['C', 'D'] },
        { type: 'intersection', point: 'E', of: ['AB', 'CD'] },
        { type: 'right_angle', points: ['C', 'E', 'A'] },
      ],
      givens: [
        { name: 'CE', value: 4 },
      ],
      targets: [],
      display: {},
    },
  }),
  '```',
].join('\n');

assert.ok(
  detectOutputIssues(missingArcPointExercise, 'Circles', 'Circle theorems', 'must_draw', 'circles').includes('circle_scene_semantic_mismatch')
);

const degenerateCoordinateExercise = [
  '\u5982\u56fe,\u5728\u5e73\u9762\u76f4\u89d2\u5750\u6807\u7cfb\u4e2d,\u2299O\u7ecf\u8fc7\u539f\u70b9O,\u70b9A\u3001B\u3001C\u5728\u2299O\u4e0a,\u4e14\u70b9A\u7684\u5750\u6807\u4e3a(4,0)\u3002\u8fde\u63a5AB\u3001BC\u3001AC\u3002\u5df2\u77e5\u2220ABC=60\u00b0,\u5f26BC\u7684\u957f\u4e3a2\u221a3,\u8fc7A\u4f5c\u2299O\u7684\u5207\u7ebf\u4ea4x\u8f74\u4e8eD\u3002\u6c42\u70b9D\u7684\u5750\u6807\u3002',
  '```math-diagram',
  JSON.stringify({
    template: 'circle_scene',
    scene: {
      conceptId: 'circles',
      figureType: 'circle',
      center: 'O',
      points: [],
      relations: [],
      givens: [],
      targets: [],
      display: {},
    },
  }),
  '```',
].join('\n');

const degenerateCoordinateIssues = detectOutputIssues(
  degenerateCoordinateExercise,
  'Circles',
  'Circle theorems',
  'must_draw',
  'circles'
);
assert.ok(degenerateCoordinateIssues.includes('circle_prompt_degenerate_tangent_axis_intersection_a_x'));

console.log('gemini service request body test passed');
