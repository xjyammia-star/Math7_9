export const tierLabels = {
  Easy: { zh: '入门', en: 'Easy' },
  Medium: { zh: '进阶', en: 'Medium' },
  Hard: { zh: '挑战', en: 'Hard' },
};

export const minTierPoolSize = {
  Easy: 30,
  Medium: 30,
  Hard: 30,
};

export const genericProblemTypesByDifficulty = {
  Easy: [
    'direct calculation with one clear known formula',
    'single-step word problem with a concrete context',
    'read the given data and substitute directly',
    'identify the correct quantity from a short sentence',
    'compare two simple cases and choose the answer',
    'fill in one missing value from an obvious relation',
    'convert one unit and then calculate once',
    'interpret a basic table or chart',
    'find a simple pattern and continue it',
    'judge whether a statement is true or false with one reason',
  ],
  Medium: [
    'two-step calculation with one intermediate quantity',
    'reverse problem: start from the result and recover the input',
    'word problem with a small transformation of the usual formula',
    'compare two scenarios and explain the difference',
    'combine two related facts before calculating',
    'extract information from a diagram, table, or short graph',
    'estimate first, then calculate more exactly',
    'rewrite the situation as an equation or expression',
    'check a proposed answer and correct the mistake',
    'apply one concept in a slightly unfamiliar context',
  ],
  Hard: [
    'multi-step modeling problem with several constraints',
    'reasoning problem that combines two concepts',
    'proof or justification problem that asks for explanation',
    'reverse problem with hidden conditions to recover',
    'parameter-change problem: describe how the answer changes',
    'error analysis: identify and fix a wrong solution path',
    'construction problem: build an example that satisfies all conditions',
    'comparison problem with a subtle twist or trap',
    'diagram-based reasoning with explicit conditions',
    'challenge problem that needs an intermediate derivation before the final answer',
  ],
};

export function normalizeDifficulty(value) {
  const text = String(value ?? '').trim().toLowerCase();
  if (text.includes('hard') || text.includes('挑战')) return 'Hard';
  if (text.includes('medium') || text.includes('进阶')) return 'Medium';
  if (text.includes('easy') || text.includes('入门')) return 'Easy';
  return 'Easy';
}

export function buildDifficultyGuidance(difficulty, lang = 'en') {
  const normalized = normalizeDifficulty(difficulty);
  const label = tierLabels[normalized];

  if (lang === 'zh') {
    if (normalized === 'Easy') {
      return [
        `难度要求：${label.zh}。`,
        '- 只保留一个明确知识点和最短合理解法。',
        '- 题干必须清楚给出条件和数值，避免含糊说法。',
        '- 题目可以有生活场景，但不要增加额外推理层。',
      ].join('\n');
    }
    if (normalized === 'Medium') {
      return [
        `难度要求：${label.zh}。`,
        '- 必须比入门题多 1 到 2 个步骤。',
        '- 允许加入简单变形、补充条件或中间量。',
        '- 题目表达要更自然，但仍要保持清晰、可验证。',
      ].join('\n');
    }
    return [
      `难度要求：${label.zh}。`,
      '- 必须达到真正的压轴题思路，不要只是换数值。',
      '- 至少包含多步推理、一个关键转化，或两个知识点的联动。',
      '- 如果是几何或图形题，条件必须完整、图形必须能支撑推理，不能把答案标在图上。',
    ].join('\n');
  }

  if (normalized === 'Easy') {
    return [
      `Difficulty requirement: ${label.en}.`,
      '- Use one clear skill and the shortest reasonable solution path.',
      '- Give explicit conditions and numbers; avoid vague wording.',
      '- A short real-world context is fine, but do not add extra reasoning layers.',
    ].join('\n');
  }
  if (normalized === 'Medium') {
    return [
      `Difficulty requirement: ${label.en}.`,
      '- Require 1-2 extra steps beyond the easiest textbook version.',
      '- Add a small transformation, an intermediate quantity, or a second condition.',
      '- Keep the wording natural but still clearly verifiable.',
    ].join('\n');
  }
  return [
    `Difficulty requirement: ${label.en}.`,
    '- Make it a genuine challenge question, not just a number swap.',
    '- Include multi-step reasoning, a key transformation, or a linkage of two ideas.',
    '- For geometry or diagram-based questions, the conditions must be complete and the figure must support the reasoning; never label the answer on the figure.',
  ].join('\n');
}
