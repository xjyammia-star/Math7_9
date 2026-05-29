const PYTHAGORAS_VARIANTS = [
  {
    kind: 'find_hypotenuse',
    legAB: 6,
    legBC: 8,
    hypotenuse: 10,
  },
  {
    kind: 'find_leg_ab',
    legAB: 12,
    legBC: 5,
    hypotenuse: 13,
  },
  {
    kind: 'find_leg_bc',
    legAB: 7,
    legBC: 24,
    hypotenuse: 25,
  },
  {
    kind: 'find_hypotenuse',
    legAB: 9,
    legBC: 12,
    hypotenuse: 15,
  },
  {
    kind: 'find_leg_ab',
    legAB: 24,
    legBC: 7,
    hypotenuse: 25,
  },
  {
    kind: 'find_leg_bc',
    legAB: 8,
    legBC: 15,
    hypotenuse: 17,
  },
];

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function formatLength(value, lang) {
  return lang === 'zh' ? `${value} cm` : `${value} cm`;
}

function buildQuestionText(item, lang) {
  if (lang === 'zh') {
    switch (item.kind) {
      case 'find_hypotenuse':
        return `在直角三角形ABC中，∠B = 90°，AB = ${formatLength(item.legAB, lang)}，BC = ${formatLength(item.legBC, lang)}。求 AC 的长度。`;
      case 'find_leg_ab':
        return `在直角三角形ABC中，∠B = 90°，BC = ${formatLength(item.legBC, lang)}，AC = ${formatLength(item.hypotenuse, lang)}。求 AB 的长度。`;
      case 'find_leg_bc':
        return `在直角三角形ABC中，∠B = 90°，AB = ${formatLength(item.legAB, lang)}，AC = ${formatLength(item.hypotenuse, lang)}。求 BC 的长度。`;
      default:
        return '';
    }
  }

  switch (item.kind) {
    case 'find_hypotenuse':
      return `In right triangle ABC, ∠B = 90°, AB = ${formatLength(item.legAB, lang)}, and BC = ${formatLength(item.legBC, lang)}. Find the length of AC.`;
    case 'find_leg_ab':
      return `In right triangle ABC, ∠B = 90°, BC = ${formatLength(item.legBC, lang)}, and AC = ${formatLength(item.hypotenuse, lang)}. Find the length of AB.`;
    case 'find_leg_bc':
      return `In right triangle ABC, ∠B = 90°, AB = ${formatLength(item.legAB, lang)}, and AC = ${formatLength(item.hypotenuse, lang)}. Find the length of BC.`;
    default:
      return '';
  }
}

function buildDiagramSpec(item) {
  const labels = { A: 'A', B: 'B', C: 'C' };
  const spec = {
    template: 'right_triangle',
    leg_h: item.legBC,
    leg_v: item.legAB,
    labels,
    label_AB: formatLength(item.legAB, 'en'),
    label_BC: formatLength(item.legBC, 'en'),
    label_AC: formatLength(item.hypotenuse, 'en'),
  };

  if (item.kind === 'find_hypotenuse') {
    spec.label_AC = '?';
  } else if (item.kind === 'find_leg_ab') {
    spec.label_AB = '?';
  } else if (item.kind === 'find_leg_bc') {
    spec.label_BC = '?';
  }

  return spec;
}

function validatePythagorasExerciseItem(item) {
  const issues = [];
  if (!item || typeof item !== 'object') {
    return ['item must be an object'];
  }

  if (!['find_hypotenuse', 'find_leg_ab', 'find_leg_bc'].includes(item.kind)) {
    issues.push(`unsupported kind: ${String(item.kind)}`);
  }
  if (!isFinitePositiveNumber(item.legAB)) issues.push('legAB must be a positive finite number');
  if (!isFinitePositiveNumber(item.legBC)) issues.push('legBC must be a positive finite number');
  if (!isFinitePositiveNumber(item.hypotenuse)) issues.push('hypotenuse must be a positive finite number');

  if (issues.length === 0) {
    const lhs = item.legAB ** 2 + item.legBC ** 2;
    const rhs = item.hypotenuse ** 2;
    if (Math.abs(lhs - rhs) > 1e-9) {
      issues.push('side lengths do not satisfy the Pythagorean theorem');
    }
  }

  return issues;
}

function validateRenderedPythagorasExerciseItem(item, rendered) {
  const issues = validatePythagorasExerciseItem(item);
  const block = JSON.stringify(buildDiagramSpec(item));

  if (!rendered.includes(block)) {
    issues.push('rendered diagram block does not match the expected triangle spec');
  }

  if (item.kind === 'find_hypotenuse' && !rendered.includes('AC 的长度') && !rendered.includes('Find the length of AC')) {
    issues.push('hypotenuse question text is missing the expected target');
  }
  if (item.kind === 'find_leg_ab' && !rendered.includes('AB 的长度') && !rendered.includes('Find the length of AB')) {
    issues.push('AB question text is missing the expected target');
  }
  if (item.kind === 'find_leg_bc' && !rendered.includes('BC 的长度') && !rendered.includes('Find the length of BC')) {
    issues.push('BC question text is missing the expected target');
  }

  return issues;
}

function renderPythagorasExerciseItem(item, index, lang) {
  const question = buildQuestionText(item, lang);
  const diagram = JSON.stringify(buildDiagramSpec(item));
  return `${index + 1}. ${question}\n\n\`\`\`math-diagram\n${diagram}\n\`\`\``;
}

export function isPythagorasConcept(conceptId = '', conceptTitle = '', conceptDesc = '') {
  const text = `${conceptId} ${conceptTitle} ${conceptDesc}`.toLowerCase();
  return (
    text.includes('pythagoras') ||
    text.includes('勾股') ||
    text.includes('pythagorean')
  );
}

export function buildPythagorasExerciseItems(count, { lang = 'zh' } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const items = [];
  for (let i = 0; i < safeCount; i += 1) {
    const base = PYTHAGORAS_VARIANTS[i % PYTHAGORAS_VARIANTS.length];
    items.push({
      ...base,
      lang,
    });
  }
  return items;
}

export function validatePythagorasExerciseItems(items) {
  const issues = [];
  if (!Array.isArray(items) || items.length === 0) {
    return ['items must be a non-empty array'];
  }

  items.forEach((item, index) => {
    const itemIssues = validatePythagorasExerciseItem(item);
    itemIssues.forEach((issue) => issues.push(`item ${index + 1}: ${issue}`));
  });

  return issues;
}

export function buildPythagorasExerciseBatch({ count, lang = 'zh' } = {}) {
  const items = buildPythagorasExerciseItems(count, { lang });
  const issues = validatePythagorasExerciseItems(items);
  if (issues.length > 0) {
    throw new Error(`Invalid Pythagoras exercise batch: ${issues.join('; ')}`);
  }

  const rendered = items.map((item, index) => renderPythagorasExerciseItem(item, index, lang));
  const renderedIssues = items.flatMap((item, index) => validateRenderedPythagorasExerciseItem(item, rendered[index]));
  if (renderedIssues.length > 0) {
    throw new Error(`Pythagoras render validation failed: ${renderedIssues.join('; ')}`);
  }

  return rendered.join('\n\n');
}
