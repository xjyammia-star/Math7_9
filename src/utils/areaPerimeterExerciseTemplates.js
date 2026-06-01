import { validateRenderContract } from './exerciseRenderContracts.js';

const HISTORY_KEY = 'math7-9:area-perimeter-kind-history:v1';
const HISTORY_LIMIT = 8;

const AREA_PERIMETER_BLUEPRINT = {
  Easy: {
    families: ['rectangle_area', 'rectangle_perimeter', 'square_area', 'square_perimeter'],
  },
  Medium: {
    families: [
      'rectangle_area_reverse',
      'rectangle_perimeter_reverse',
      'square_area_reverse',
      'square_perimeter_reverse',
    ],
  },
  Hard: {
    families: [
      'triangle_area',
      'triangle_perimeter',
      'circle_area',
      'circle_circumference',
      'sector_area',
    ],
  },
};

const AREA_PERIMETER_RENDER_CONTRACTS = {
  rectangle_area: {
    questionIncludes: ['长方形的面积', 'area of the rectangle'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"8"', '"label_height":"5"'],
  },
  rectangle_perimeter: {
    questionIncludes: ['长方形的周长', 'perimeter of the rectangle'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"9"', '"label_height":"4"'],
  },
  square_area: {
    questionIncludes: ['正方形的面积', 'area of the square'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"6"', '"label_height":"6"'],
  },
  square_perimeter: {
    questionIncludes: ['正方形的周长', 'perimeter of the square'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"7"', '"label_height":"7"'],
  },
  rectangle_area_reverse: {
    questionIncludes: ['面积为', '已知面积', '求 BC 的长度', 'find the missing side'],
    diagramIncludes: ['"template":"rectangle"', '"label_area":"40 cm²"', '"label_height":"?"'],
  },
  rectangle_perimeter_reverse: {
    questionIncludes: ['周长为', '已知周长', '求 BC 的长度', 'find the missing side'],
    diagramIncludes: ['"template":"rectangle"', '"label_perimeter":"26 cm"', '"label_height":"?"'],
  },
  square_area_reverse: {
    questionIncludes: ['正方形的边长', 'side length of the square'],
    diagramIncludes: ['"template":"rectangle"', '"label_area":"49 cm²"', '"label_width":"?"', '"label_height":"?"'],
  },
  square_perimeter_reverse: {
    questionIncludes: ['正方形的边长', 'side length of the square'],
    diagramIncludes: ['"template":"rectangle"', '"label_perimeter":"32 cm"', '"label_width":"?"', '"label_height":"?"'],
  },
  triangle_area: {
    questionIncludes: ['三角形的面积', 'area of the triangle'],
    diagramIncludes: ['"template":"triangle"', '"right_angle":"B"', '"label_area":"?"'],
  },
  triangle_perimeter: {
    questionIncludes: ['三角形的周长', 'perimeter of the triangle'],
    diagramIncludes: ['"template":"triangle"', '"label_perimeter":"?"'],
  },
  circle_area: {
    questionIncludes: ['圆的面积', 'area of the circle'],
    diagramIncludes: ['"template":"circle"', '"label_area":"?"'],
  },
  circle_circumference: {
    questionIncludes: ['圆的周长', 'circumference of the circle'],
    diagramIncludes: ['"template":"circle"', '"label_circumference":"?"'],
  },
  sector_area: {
    questionIncludes: ['扇形的面积', 'area of the sector'],
    diagramIncludes: ['"template":"circle_sector"', '"label_area":"?"'],
  },
};

const AREA_PERIMETER_VARIANT_LIBRARY = {
  rectangle_area: {
    kind: 'rectangle_area',
    shape: 'rectangle',
    width: 8,
    height: 5,
    answer: 40,
  },
  rectangle_perimeter: {
    kind: 'rectangle_perimeter',
    shape: 'rectangle',
    width: 9,
    height: 4,
    answer: 26,
  },
  square_area: {
    kind: 'square_area',
    shape: 'square',
    side: 6,
    answer: 36,
  },
  square_perimeter: {
    kind: 'square_perimeter',
    shape: 'square',
    side: 7,
    answer: 28,
  },
  rectangle_area_reverse: {
    kind: 'rectangle_area_reverse',
    shape: 'rectangle',
    width: 8,
    height: 5,
    unknownSide: 'height',
    area: 40,
    answer: 5,
  },
  rectangle_perimeter_reverse: {
    kind: 'rectangle_perimeter_reverse',
    shape: 'rectangle',
    width: 9,
    height: 4,
    unknownSide: 'height',
    perimeter: 26,
    answer: 4,
  },
  square_area_reverse: {
    kind: 'square_area_reverse',
    shape: 'square',
    side: 7,
    area: 49,
    answer: 7,
  },
  square_perimeter_reverse: {
    kind: 'square_perimeter_reverse',
    shape: 'square',
    side: 8,
    perimeter: 32,
    answer: 8,
  },
  triangle_area: {
    kind: 'triangle_area',
    shape: 'triangle',
    points: [
      { x: 0, y: 6 },
      { x: 0, y: 0 },
      { x: 8, y: 0 },
    ],
    rightAngle: 'B',
    legB: 6,
    legC: 8,
    sides: [6, 8, 10],
    area: 24,
    answer: 24,
  },
  triangle_perimeter: {
    kind: 'triangle_perimeter',
    shape: 'triangle',
    sides: [5, 6, 7],
    answer: 18,
  },
  circle_area: {
    kind: 'circle_area',
    shape: 'circle',
    radius: 5,
    area: 25 * Math.PI,
    answer: 25 * Math.PI,
  },
  circle_circumference: {
    kind: 'circle_circumference',
    shape: 'circle',
    radius: 6,
    circumference: 12 * Math.PI,
    answer: 12 * Math.PI,
  },
  sector_area: {
    kind: 'sector_area',
    shape: 'sector',
    radius: 6,
    angle: 120,
    area: 12 * Math.PI,
    answer: 12 * Math.PI,
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
    text.includes('area and perimeter') ||
    text.includes('面积与周长') ||
    text.includes('面积') ||
    text.includes('周长')
  );
}

function normalizeDifficulty(difficulty = 'Easy') {
  if (difficulty === 'Medium' || difficulty === 'Hard') return difficulty;
  return 'Easy';
}

function getDifficultyFamilies(difficulty) {
  return AREA_PERIMETER_BLUEPRINT[normalizeDifficulty(difficulty)].families;
}

function getVarietyStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readHistoryMap() {
  const storage = getVarietyStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function makeHistoryKey(conceptTitle, grade, difficulty, curriculum) {
  const normalizedTitle = String(conceptTitle ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  return `${curriculum ?? 'general'}|${grade}|${difficulty}|${normalizedTitle}`;
}

function readRecentKinds(historyKey) {
  const history = readHistoryMap();
  return Array.isArray(history[historyKey]) ? history[historyKey] : [];
}

function writeRecentKinds(historyKey, kinds) {
  const storage = getVarietyStorage();
  if (!storage || kinds.length === 0) return;

  const history = readHistoryMap();
  const previous = Array.isArray(history[historyKey]) ? history[historyKey] : [];
  history[historyKey] = [...kinds, ...previous.filter((kind) => !kinds.includes(kind))].slice(0, HISTORY_LIMIT);

  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage failures.
  }
}

function rotateKinds(pool, count, recentKinds) {
  const uniquePool = Array.from(new Set(pool.filter(Boolean)));
  if (uniquePool.length === 0) return [];

  const recent = recentKinds.find((kind) => uniquePool.includes(kind));
  const startIndex = recent ? (uniquePool.indexOf(recent) + 1) % uniquePool.length : 0;
  const ordered = [...uniquePool.slice(startIndex), ...uniquePool.slice(0, startIndex)];

  const targetCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (targetCount === 0) return [];
  const selected = [];
  while (selected.length < targetCount) {
    selected.push(...ordered);
  }
  return selected.slice(0, targetCount);
}

function formatLength(value, unit = 'cm') {
  return `${value} ${unit}`;
}

function formatArea(value) {
  return `${value} cm²`;
}

function formatPerimeter(value) {
  return `${value} cm`;
}

function buildQuestionText(item, lang) {
  const zh = lang === 'zh';
  switch (item.kind) {
    case 'rectangle_area':
      return zh
        ? `在长方形 ABCD 中，AB = ${item.width} cm，BC = ${item.height} cm。求长方形的面积。`
        : `In rectangle ABCD, AB = ${item.width} cm and BC = ${item.height} cm. Find the area of the rectangle.`;
    case 'rectangle_perimeter':
      return zh
        ? `在长方形 ABCD 中，AB = ${item.width} cm，BC = ${item.height} cm。求长方形的周长。`
        : `In rectangle ABCD, AB = ${item.width} cm and BC = ${item.height} cm. Find the perimeter of the rectangle.`;
    case 'square_area':
      return zh
        ? `在正方形 ABCD 中，边长为 ${item.side} cm。求正方形的面积。`
        : `In square ABCD, the side length is ${item.side} cm. Find the area of the square.`;
    case 'square_perimeter':
      return zh
        ? `在正方形 ABCD 中，边长为 ${item.side} cm。求正方形的周长。`
        : `In square ABCD, the side length is ${item.side} cm. Find the perimeter of the square.`;
    case 'rectangle_area_reverse':
      return zh
        ? `在长方形 ABCD 中，AB = ${item.width} cm，面积为 ${formatArea(item.area)}。求 BC 的长度。`
        : `In rectangle ABCD, AB = ${item.width} cm and the area is ${formatArea(item.area)}. Find the length of BC.`;
    case 'rectangle_perimeter_reverse':
      return zh
        ? `在长方形 ABCD 中，AB = ${item.width} cm，周长为 ${formatPerimeter(item.perimeter)}。求 BC 的长度。`
        : `In rectangle ABCD, AB = ${item.width} cm and the perimeter is ${formatPerimeter(item.perimeter)}. Find the length of BC.`;
    case 'square_area_reverse':
      return zh
        ? `在正方形 ABCD 中，面积为 ${formatArea(item.area)}。求正方形的边长。`
        : `In square ABCD, the area is ${formatArea(item.area)}. Find the side length of the square.`;
    case 'square_perimeter_reverse':
      return zh
        ? `在正方形 ABCD 中，周长为 ${formatPerimeter(item.perimeter)}。求正方形的边长。`
        : `In square ABCD, the perimeter is ${formatPerimeter(item.perimeter)}. Find the side length of the square.`;
    case 'triangle_area':
      return zh
        ? `在直角三角形 ABC 中，∠B = 90°，AB = ${item.legB} cm，BC = ${item.legC} cm。求三角形的面积。`
        : `In right triangle ABC, ∠B = 90°, AB = ${item.legB} cm and BC = ${item.legC} cm. Find the area of the triangle.`;
    case 'triangle_perimeter':
      return zh
        ? `在三角形 ABC 中，AB = ${item.sides[0]} cm，BC = ${item.sides[1]} cm，CA = ${item.sides[2]} cm。求三角形的周长。`
        : `In triangle ABC, AB = ${item.sides[0]} cm, BC = ${item.sides[1]} cm, and CA = ${item.sides[2]} cm. Find the perimeter of the triangle.`;
    case 'circle_area':
      return zh
        ? `在圆 O 中，半径为 ${item.radius} cm。求圆的面积。`
        : `In circle O, the radius is ${item.radius} cm. Find the area of the circle.`;
    case 'circle_circumference':
      return zh
        ? `在圆 O 中，半径为 ${item.radius} cm。求圆的周长。`
        : `In circle O, the radius is ${item.radius} cm. Find the circumference of the circle.`;
    case 'sector_area':
      return zh
        ? `在扇形 OAB 中，OA = ${item.radius} cm，∠AOB = ${item.angle}°。求扇形的面积。`
        : `In sector OAB, OA = ${item.radius} cm and ∠AOB = ${item.angle}°. Find the area of the sector.`;
    default:
      return '';
  }
}

function buildDiagramSpec(item) {
  switch (item.kind) {
    case 'rectangle_area':
      return {
        template: 'rectangle',
        width: item.width,
        height: item.height,
        labels: ['A', 'B', 'C', 'D'],
        label_width: String(item.width),
        label_height: String(item.height),
      };
    case 'rectangle_perimeter':
      return {
        template: 'rectangle',
        width: item.width,
        height: item.height,
        labels: ['A', 'B', 'C', 'D'],
        label_width: String(item.width),
        label_height: String(item.height),
      };
    case 'square_area':
      return {
        template: 'rectangle',
        width: item.side,
        height: item.side,
        labels: ['A', 'B', 'C', 'D'],
        label_width: String(item.side),
        label_height: String(item.side),
      };
    case 'square_perimeter':
      return {
        template: 'rectangle',
        width: item.side,
        height: item.side,
        labels: ['A', 'B', 'C', 'D'],
        label_width: String(item.side),
        label_height: String(item.side),
      };
    case 'rectangle_area_reverse':
      return {
        template: 'rectangle',
        width: item.width,
        height: item.height,
        labels: ['A', 'B', 'C', 'D'],
        label_width: String(item.width),
        label_height: '?',
        label_area: formatArea(item.area),
      };
    case 'rectangle_perimeter_reverse':
      return {
        template: 'rectangle',
        width: item.width,
        height: item.height,
        labels: ['A', 'B', 'C', 'D'],
        label_width: String(item.width),
        label_height: '?',
        label_perimeter: formatPerimeter(item.perimeter),
      };
    case 'square_area_reverse':
      return {
        template: 'rectangle',
        width: item.side,
        height: item.side,
        labels: ['A', 'B', 'C', 'D'],
        label_width: '?',
        label_height: '?',
        label_area: formatArea(item.area),
      };
    case 'square_perimeter_reverse':
      return {
        template: 'rectangle',
        width: item.side,
        height: item.side,
        labels: ['A', 'B', 'C', 'D'],
        label_width: '?',
        label_height: '?',
        label_perimeter: formatPerimeter(item.perimeter),
      };
    case 'triangle_area':
      return {
        template: 'triangle',
        points: item.points,
        labels: ['A', 'B', 'C'],
        right_angle: item.rightAngle,
        label_AB: String(item.legB),
        label_BC: String(item.legC),
        label_CA: '?',
        label_area: '?',
      };
    case 'triangle_perimeter':
      return {
        template: 'triangle',
        sides: item.sides,
        labels: ['A', 'B', 'C'],
        label_AB: String(item.sides[0]),
        label_BC: String(item.sides[1]),
        label_CA: String(item.sides[2]),
        label_perimeter: '?',
      };
    case 'circle_area':
      return {
        template: 'circle',
        radius: item.radius,
        label_O: 'O',
        label_A: 'A',
        label_radius: formatLength(item.radius),
        label_area: '?',
      };
    case 'circle_circumference':
      return {
        template: 'circle',
        radius: item.radius,
        label_O: 'O',
        label_A: 'A',
        label_radius: formatLength(item.radius),
        label_circumference: '?',
      };
    case 'sector_area':
      return {
        template: 'circle_sector',
        radius: item.radius,
        angle: item.angle,
        label_O: 'O',
        label_A: 'A',
        label_B: 'B',
        label_radius: formatLength(item.radius),
        label_angle: `${item.angle}°`,
        label_area: '?',
      };
    default:
      return null;
  }
}

function validateAreaPerimeterExerciseItem(item) {
  const issues = [];
  if (!item || typeof item !== 'object') {
    return ['item must be an object'];
  }

  if (!Object.prototype.hasOwnProperty.call(AREA_PERIMETER_VARIANT_LIBRARY, item.kind)) {
    issues.push(`unsupported kind: ${String(item.kind)}`);
    return issues;
  }

  switch (item.kind) {
    case 'rectangle_area':
    case 'rectangle_perimeter':
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
      break;
    case 'square_area':
    case 'square_perimeter':
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
      break;
    case 'rectangle_area_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.area)) {
        issues.push('rectangle reverse-area item must include positive width, height, and area');
      }
      if (item.answer !== item.height) {
        issues.push('rectangle reverse-area answer does not match the missing height');
      }
      break;
    case 'rectangle_perimeter_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.perimeter)) {
        issues.push('rectangle reverse-perimeter item must include positive width, height, and perimeter');
      }
      if (item.answer !== item.height) {
        issues.push('rectangle reverse-perimeter answer does not match the missing height');
      }
      break;
    case 'square_area_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.area)) {
        issues.push('square reverse-area item must include positive side and area');
      }
      if (item.answer !== item.side) {
        issues.push('square reverse-area answer does not match the side length');
      }
      break;
    case 'square_perimeter_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.perimeter)) {
        issues.push('square reverse-perimeter item must include positive side and perimeter');
      }
      if (item.answer !== item.side) {
        issues.push('square reverse-perimeter answer does not match the side length');
      }
      break;
    case 'triangle_area':
      if (!Array.isArray(item.points) || item.points.length < 3) {
        issues.push('triangle area item must include three points');
      }
      if (!isFinitePositiveNumber(item.legB) || !isFinitePositiveNumber(item.legC)) {
        issues.push('triangle area item must include positive leg lengths');
      }
      if (item.answer !== (item.legB * item.legC) / 2) {
        issues.push('triangle area answer does not match legB × legC / 2');
      }
      break;
    case 'triangle_perimeter':
      if (!Array.isArray(item.sides) || item.sides.length < 3 || item.sides.some((side) => !isFinitePositiveNumber(side))) {
        issues.push('triangle perimeter item must include three positive side lengths');
      } else {
        const perimeter = item.sides[0] + item.sides[1] + item.sides[2];
        if (item.answer !== perimeter) {
          issues.push('triangle perimeter answer does not match the sum of the three sides');
        }
      }
      break;
    case 'circle_area':
      if (!isFinitePositiveNumber(item.radius)) issues.push('circle area item must include a positive radius');
      if (item.answer !== Math.PI * item.radius * item.radius) {
        issues.push('circle area answer does not match πr²');
      }
      break;
    case 'circle_circumference':
      if (!isFinitePositiveNumber(item.radius)) issues.push('circle circumference item must include a positive radius');
      if (item.answer !== 2 * Math.PI * item.radius) {
        issues.push('circle circumference answer does not match 2πr');
      }
      break;
    case 'sector_area':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.angle)) {
        issues.push('sector area item must include positive radius and angle');
      } else if (item.angle > 360) {
        issues.push('sector angle must not exceed 360 degrees');
      } else if (item.answer !== (item.angle / 360) * Math.PI * item.radius * item.radius) {
        issues.push('sector area answer does not match (angle / 360) × πr²');
      }
      break;
    default:
      break;
  }

  return issues;
}

function validateRenderedAreaPerimeterExerciseItem(item, rendered) {
  const issues = validateAreaPerimeterExerciseItem(item);
  const spec = JSON.stringify(buildDiagramSpec(item));
  if (!rendered.includes(spec)) {
    issues.push(`rendered diagram block does not match the expected ${item.kind} spec`);
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

function buildAreaPerimeterExerciseItems(count, {
  lang = 'zh',
  difficulty = 'Easy',
  grade = '8',
  curriculum = null,
  persistHistory = true,
} = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const families = getDifficultyFamilies(normalizedDifficulty);
  const historyKey = makeHistoryKey('area-perimeter', grade, normalizedDifficulty, curriculum);
  const recentKinds = readRecentKinds(historyKey);
  const pickedKinds = rotateKinds(families, safeCount, recentKinds);
  const items = pickedKinds.map((kind) => ({ ...AREA_PERIMETER_VARIANT_LIBRARY[kind], lang, difficulty: normalizedDifficulty, grade, curriculum }));

  if (persistHistory) {
    writeRecentKinds(historyKey, pickedKinds);
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

function buildAreaPerimeterExerciseBatch({
  count,
  lang = 'zh',
  difficulty = 'Easy',
  grade = '8',
  curriculum = null,
  persistHistory = true,
} = {}) {
  const items = buildAreaPerimeterExerciseItems(count, {
    lang,
    difficulty,
    grade,
    curriculum,
    persistHistory,
  });

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

export {
  buildAreaPerimeterExerciseBatch,
  buildAreaPerimeterExerciseItems,
  isAreaPerimeterConcept,
  validateAreaPerimeterExerciseItems,
};
