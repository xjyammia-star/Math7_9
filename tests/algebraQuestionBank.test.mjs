import assert from 'node:assert/strict';
import { buildBankItems, buildAlgebraExerciseBatch, isAlgebraQuestionBankConcept } from '../src/utils/algebraExerciseTemplates.js';

const supportedConcepts = [
  'arithmetic',
  'rational-numbers',
  'fractions-decimals',
  'ratio-proportion',
  'powers-roots',
  'indices-laws',
  'surds',
];

for (const conceptId of supportedConcepts) {
  assert.equal(isAlgebraQuestionBankConcept(conceptId, '', ''), true, `${conceptId} should be routed to the algebra question bank`);
}

for (const conceptId of supportedConcepts) {
  for (const difficulty of ['Easy', 'Medium', 'Hard']) {
    const items = buildBankItems(30, {
      conceptId,
      lang: 'zh',
      difficulty,
      grade: '8',
      curriculum: 'CN',
    });

    assert.equal(items.length, 30, `${conceptId} ${difficulty} should generate 30 items`);

    const kinds = items.map((item) => item.kind);
    const uniqueKinds = new Set(kinds);
    assert.equal(uniqueKinds.size, 10, `${conceptId} ${difficulty} should cover 10 distinct kinds`);

    for (let i = 1; i < kinds.length; i += 1) {
      assert.notEqual(kinds[i], kinds[i - 1], `${conceptId} ${difficulty} should not repeat the same kind consecutively`);
    }

    const questions = items.map((item) => item.question);
    const uniqueQuestions = new Set(questions);
    assert.equal(uniqueQuestions.size, 30, `${conceptId} ${difficulty} should generate 30 unique questions`);
  }
}

for (const conceptId of ['powers-roots', 'indices-laws', 'surds']) {
  const hardItems = buildBankItems(10, {
    conceptId,
    lang: 'zh',
    difficulty: 'Hard',
    grade: '8',
    curriculum: 'CN',
  });

  const hardText = hardItems.map((item) => item.question).join('\n');
  assert.ok(!/^计算[:：]?\s*[0-9]/m.test(hardText), `${conceptId} Hard should not fall back to simple calculate-only wording`);
  assert.ok(/(如果|已知|比较|再|反求|推导|判断|证明)/.test(hardText), `${conceptId} Hard should show challenge-style wording`);
}

const firstBatch = buildBankItems(5, {
  conceptId: 'arithmetic',
  lang: 'zh',
  difficulty: 'Hard',
  grade: '8',
  curriculum: 'CN',
});
const secondBatch = buildBankItems(5, {
  conceptId: 'arithmetic',
  lang: 'zh',
  difficulty: 'Hard',
  grade: '8',
  curriculum: 'CN',
});

assert.notEqual(firstBatch[firstBatch.length - 1].kind, secondBatch[0].kind, 'history should rotate the next batch start kind');

const rendered = buildAlgebraExerciseBatch({
  count: 4,
  conceptId: 'ratio-proportion',
  lang: 'zh',
  difficulty: 'Medium',
  grade: '8',
  curriculum: 'CN',
});
assert.ok(!rendered.includes('math-diagram'));
assert.ok(!rendered.includes('```'));
assert.match(rendered, /^1\.\s+/m);

const hardRatioBatch = buildBankItems(10, {
  conceptId: 'ratio-proportion',
  lang: 'zh',
  difficulty: 'Hard',
  grade: '8',
  curriculum: 'CN',
});
const hardRatioText = hardRatioBatch.map((item) => item.question).join('\n');
assert.ok(!hardRatioText.includes('化简比'), 'Hard ratio-proportion questions should not fall back to simple ratio simplification');
assert.ok(!hardRatioText.includes('单价是多少'), 'Hard ratio-proportion questions should not use the easy unit-rate wording');
assert.ok(!hardRatioText.includes('地图比例尺'), 'Hard ratio-proportion questions should not use the basic scale-map wording');

console.log('algebra question bank test passed');
