import { validateRenderContract } from './exerciseRenderContracts.js';

const AREA_PERIMETER_VARIANTS = [
  {
    kind: 'rectangle_area',
    shape: 'rectangle',
    width: 8,
    height: 5,
    questionTarget: 'area',
    answer: 40,
  },
  {
    kind: 'rectangle_perimeter',
    shape: 'rectangle',
    width: 9,
    height: 4,
    questionTarget: 'perimeter',
    answer: 26,
  },
  {
    kind: 'square_area',
    shape: 'square',
    side: 6,
    questionTarget: 'area',
    answer: 36,
  },
  {
    kind: 'square_perimeter',
    shape: 'square',
    side: 7,
    questionTarget: 'perimeter',
    answer: 28,
  },
];

const AREA_PERIMETER_RENDER_CONTRACTS = {
  rectangle_area: {
    questionIncludes: ['area of the rectangle', '面积'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"8"', '"label_height":"5"'],
  },
  rectangle_perimeter: {
    questionIncludes: ['perimeter of the rectangle', '周长'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"9"', '"label_height":"4"'],
  },
  square_area: {
    questionIncludes: ['area of the square', '面积'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"6"', '"label_height":"6"'],
  },
  square_perimeter: {
    questionIncludes: ['perimeter of the square', '周长'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"7"', '"label_height":"7"'],
  },
};

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isAreaPerimeterConcept(conceptId = '', conceptTitle = '', conceptDesc = '') {
  const text = `${conceptId} ${conceptTitle} ${conceptDesc}`.toLowerCase();
  return (
    text.includes('area-perimeter') ||
    text.includes('area & perimeter') ||
    text.includes('面积与周长')
  );
}

function buildRectangleQuestion(item, lang) {
  const zh = lang === 'zh';
  if (item.kind === 'rectangle_area') {
    return zh
      ? `在长方形ABCD中，AB = ${item.width} cm，BC = ${item.height} cm。求长方形的面积。`
      : `In rectangle ABCD, AB = ${item.width} cm and BC = ${item.height} cm. Find the area of the rectangle.`;
  }

  return zh
    ? `在长方形ABCD中，AB = ${item.width} cm，BC = ${item.height} cm。求长方形的周长。`
    : `In rectangle ABCD, AB = ${item.width} cm and BC = ${item.height} cm. Find the perimeter of the rectangle.`;
}

function buildSquareQuestion(item, lang) {
  const zh = lang === 'zh';
  if (item.kind === 'square_area') {
    return zh
      ? `在正方形ABCD中，边长为 ${item.side} cm。求正方形的面积。`
      : `In square ABCD, the side length is ${item.side} cm. Find the area of the square.`;
  }

  return zh
    ? `在正方形ABCD中，边长为 ${item.side} cm。求正方形的周长。`
    : `In square ABCD, the side length is ${item.side} cm. Find the perimeter of the square.`;
}

function buildQuestionText(item, lang) {
  if (item.shape === 'rectangle') return buildRectangleQuestion(item, lang);
  if (item.shape === 'square') return buildSquareQuestion(item, lang);
  return '';
}

function buildDiagramSpec(item) {
  if (item.shape === 'rectangle') {
    return {
      template: 'rectangle',
      width: item.width,
      height: item.height,
      labels: ['A', 'B', 'C', 'D'],
      label_width: String(item.width),
      label_height: String(item.height),
    };
  }

  return {
    template: 'rectangle',
    width: item.side,
    height: item.side,
    labels: ['A', 'B', 'C', 'D'],
    label_width: String(item.side),
    label_height: String(item.side),
  };
}

function validateAreaPerimeterExerciseItem(item) {
  const issues = [];
  if (!item || typeof item !== 'object') {
    return ['item must be an object'];
  }

  if (!['rectangle_area', 'rectangle_perimeter', 'square_area', 'square_perimeter'].includes(item.kind)) {
    issues.push(`unsupported kind: ${String(item.kind)}`);
  }

  if (item.shape === 'rectangle') {
    if (!isFinitePositiveNumber(item.width)) issues.push('rectangle width must be a positive finite number');
    if (!isFinitePositiveNumber(item.height)) issues.push('rectangle height must be a positive finite number');
    if (issues.length === 0) {
      const area = item.width * item.height;
      const perimeter = 2 * (item.width + item.height);
      if (item.kind === 'rectangle_area' && item.answer !== area) {
        issues.push('rectangle area answer does not match width × height');
      }
      if (item.kind === 'rectangle_perimeter' && item.answer !== perimeter) {
        issues.push('rectangle perimeter answer does not match 2 × (width + height)');
      }
    }
  }

  if (item.shape === 'square') {
    if (!isFinitePositiveNumber(item.side)) issues.push('square side must be a positive finite number');
    if (issues.length === 0) {
      const area = item.side * item.side;
      const perimeter = 4 * item.side;
      if (item.kind === 'square_area' && item.answer !== area) {
        issues.push('square area answer does not match side × side');
      }
      if (item.kind === 'square_perimeter' && item.answer !== perimeter) {
        issues.push('square perimeter answer does not match 4 × side');
      }
    }
  }

  return issues;
}

function validateRenderedAreaPerimeterExerciseItem(item, rendered) {
  const issues = validateAreaPerimeterExerciseItem(item);
  const spec = JSON.stringify(buildDiagramSpec(item));
  if (!rendered.includes(spec)) {
    issues.push('rendered diagram block does not match the expected rectangle spec');
  }

  validateRenderContract(rendered, AREA_PERIMETER_RENDER_CONTRACTS[item.kind], item.kind)
    .forEach((issue) => issues.push(issue));

  return issues;
}

function renderAreaPerimeterExerciseItem(item, index, lang) {
  const question = buildQuestionText(item, lang);
  const diagram = JSON.stringify(buildDiagramSpec(item));
  return `${index + 1}. ${question}\n\n\`\`\`math-diagram\n${diagram}\n\`\`\``;
}

export {
  buildAreaPerimeterExerciseBatch,
  buildAreaPerimeterExerciseItems,
  isAreaPerimeterConcept,
  validateAreaPerimeterExerciseItems,
};

function buildAreaPerimeterExerciseItems(count, { lang = 'zh' } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const items = [];
  for (let i = 0; i < safeCount; i += 1) {
    const base = AREA_PERIMETER_VARIANTS[i % AREA_PERIMETER_VARIANTS.length];
    items.push({ ...base, lang });
  }
  return items;
}

function validateAreaPerimeterExerciseItems(items) {
  const issues = [];
  if (!Array.isArray(items) || items.length === 0) {
    return ['items must be a non-empty array'];
  }

  items.forEach((item, index) => {
    const itemIssues = validateAreaPerimeterExerciseItem(item);
    itemIssues.forEach((issue) => issues.push(`item ${index + 1}: ${issue}`));
  });

  return issues;
}

function buildAreaPerimeterExerciseBatch({ count, lang = 'zh' } = {}) {
  const items = buildAreaPerimeterExerciseItems(count, { lang });
  const issues = validateAreaPerimeterExerciseItems(items);
  if (issues.length > 0) {
    throw new Error(`Invalid area/perimeter exercise batch: ${issues.join('; ')}`);
  }

  const rendered = items.map((item, index) => renderAreaPerimeterExerciseItem(item, index, lang));
  const renderedIssues = items.flatMap((item, index) => validateRenderedAreaPerimeterExerciseItem(item, rendered[index]));
  if (renderedIssues.length > 0) {
    throw new Error(`Area/perimeter render validation failed: ${renderedIssues.join('; ')}`);
  }

  return rendered.join('\n\n');
}
