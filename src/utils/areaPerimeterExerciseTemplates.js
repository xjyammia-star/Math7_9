import { validateRenderContract } from './exerciseRenderContracts.js';

const HISTORY_KEY = 'math7-9:area-perimeter-kind-history:v3';
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
      'l_shape_area',
      'l_shape_perimeter',
      'trapezoid_area',
      'parallelogram_area',
      'parallelogram_perimeter',
      'triangle_area',
      'triangle_perimeter',
      'circle_area',
      'circle_circumference',
      'circle_area_reverse',
      'circle_circumference_reverse',
      'circle_annulus_area',
      'sector_area',
    ],
  },
};

const AREA_PERIMETER_RENDER_CONTRACTS = {
  rectangle_area: {
    questionIncludes: ['长方形', '面积'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"8 cm"', '"label_height":"5 cm"', '"label_area":"?"'],
  },
  rectangle_perimeter: {
    questionIncludes: ['长方形', '周长'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"9 cm"', '"label_height":"4 cm"', '"label_perimeter":"?"'],
  },
  square_area: {
    questionIncludes: ['正方形', '面积'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"6 cm"', '"label_height":"6 cm"', '"label_area":"?"'],
  },
  square_perimeter: {
    questionIncludes: ['正方形', '周长'],
    diagramIncludes: ['"template":"rectangle"', '"label_width":"7 cm"', '"label_height":"7 cm"', '"label_perimeter":"?"'],
  },
  rectangle_area_reverse: {
    questionIncludes: ['面积是', '求 BC'],
    diagramIncludes: ['"template":"rectangle"', '"label_area":"40 cm²"', '"label_height":"?"'],
  },
  rectangle_perimeter_reverse: {
    questionIncludes: ['周长是', '求 BC'],
    diagramIncludes: ['"template":"rectangle"', '"label_perimeter":"26 cm"', '"label_height":"?"'],
  },
  square_area_reverse: {
    questionIncludes: ['正方形', '面积是', '求边长'],
    diagramIncludes: ['"template":"rectangle"', '"label_area":"49 cm²"', '"label_width":"?"', '"label_height":"?"'],
  },
  square_perimeter_reverse: {
    questionIncludes: ['正方形', '周长是', '求边长'],
    diagramIncludes: ['"template":"rectangle"', '"label_perimeter":"32 cm"', '"label_width":"?"', '"label_height":"?"'],
  },
  l_shape_area: {
    questionIncludes: ['L 形', '面积'],
    diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_area":"?"'],
  },
  l_shape_perimeter: {
    questionIncludes: ['L 形', '周长'],
    diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_perimeter":"?"'],
  },
  trapezoid_area: {
    questionIncludes: ['梯形', '面积'],
    diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_area":"?"'],
  },
  parallelogram_area: {
    questionIncludes: ['平行四边形', '面积'],
    diagramIncludes: ['"template":"parallelogram"', '"label_area":"?"', '"label_height":"2.5 cm"'],
  },
  parallelogram_perimeter: {
    questionIncludes: ['平行四边形', '周长'],
    diagramIncludes: ['"template":"parallelogram"', '"label_perimeter":"?"'],
  },
  triangle_area: {
    questionIncludes: ['直角三角形', '面积'],
    diagramIncludes: ['"template":"triangle"', '"label_area":"?"'],
  },
  triangle_perimeter: {
    questionIncludes: ['直角三角形', '周长'],
    diagramIncludes: ['"template":"triangle"', '"label_perimeter":"?"'],
  },
  circle_area: {
    questionIncludes: ['圆', '面积'],
    diagramIncludes: ['"template":"circle"', '"label_area":"?"', '"label_radius":"5 cm"'],
  },
  circle_circumference: {
    questionIncludes: ['圆', '周长'],
    diagramIncludes: ['"template":"circle"', '"label_circumference":"?"', '"label_radius":"6 cm"'],
  },
  circle_area_reverse: {
    questionIncludes: ['圆的面积是', '求半径 OA'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_area":"25π cm²"'],
  },
  circle_circumference_reverse: {
    questionIncludes: ['圆的周长是', '求半径 OA'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_circumference":"12π cm"'],
  },
  circle_annulus_area: {
    questionIncludes: ['圆环', '面积'],
    diagramIncludes: ['"template":"circle_annulus"', '"label_area":"?"'],
  },
  sector_area: {
    questionIncludes: ['扇形', '面积'],
    diagramIncludes: ['"template":"circle_sector"', '"label_area":"?"'],
  },
};

const L_SHAPE_POINTS = [
  { x: 0, y: 0, label: 'A' },
  { x: 6, y: 0, label: 'B' },
  { x: 6, y: 2, label: 'C' },
  { x: 3, y: 2, label: 'D' },
  { x: 3, y: 5, label: 'E' },
  { x: 0, y: 5, label: 'F' },
];

const TRAPEZOID_POINTS = [
  { x: 0, y: 0, label: 'A' },
  { x: 8, y: 0, label: 'B' },
  { x: 6, y: 3, label: 'C' },
  { x: 2, y: 3, label: 'D' },
  { x: 2, y: 0, label: 'H' },
];

const TRIANGLE_POINTS = [
  { x: 0, y: 6, label: 'A' },
  { x: 0, y: 0, label: 'B' },
  { x: 8, y: 0, label: 'C' },
];

function clonePoints(points) {
  return points.map((point) => ({ ...point }));
}

function polygonArea(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
}

function polygonPerimeter(points) {
  if (!Array.isArray(points) || points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    total += Math.hypot(next.x - current.x, next.y - current.y);
  }
  return total;
}

const L_SHAPE_AREA = polygonArea(L_SHAPE_POINTS);
const L_SHAPE_PERIMETER = polygonPerimeter(L_SHAPE_POINTS);
const TRAPEZOID_AREA = polygonArea(TRAPEZOID_POINTS.slice(0, 4));
const TRIANGLE_AREA = polygonArea(TRIANGLE_POINTS);
const TRIANGLE_PERIMETER = polygonPerimeter(TRIANGLE_POINTS);

const AREA_PERIMETER_VARIANT_LIBRARY = {
  rectangle_area: {
    kind: 'rectangle_area',
    template: 'rectangle',
    width: 8,
    height: 5,
    answer: 40,
  },
  rectangle_perimeter: {
    kind: 'rectangle_perimeter',
    template: 'rectangle',
    width: 9,
    height: 4,
    answer: 26,
  },
  square_area: {
    kind: 'square_area',
    template: 'rectangle',
    side: 6,
    answer: 36,
  },
  square_perimeter: {
    kind: 'square_perimeter',
    template: 'rectangle',
    side: 7,
    answer: 28,
  },
  rectangle_area_reverse: {
    kind: 'rectangle_area_reverse',
    template: 'rectangle',
    width: 8,
    height: 5,
    area: 40,
    answer: 5,
  },
  rectangle_perimeter_reverse: {
    kind: 'rectangle_perimeter_reverse',
    template: 'rectangle',
    width: 9,
    height: 4,
    perimeter: 26,
    answer: 4,
  },
  square_area_reverse: {
    kind: 'square_area_reverse',
    template: 'rectangle',
    side: 7,
    area: 49,
    answer: 7,
  },
  square_perimeter_reverse: {
    kind: 'square_perimeter_reverse',
    template: 'rectangle',
    side: 8,
    perimeter: 32,
    answer: 8,
  },
  l_shape_area: {
    kind: 'l_shape_area',
    template: 'coordinate_points',
    points: L_SHAPE_POINTS,
    outline: L_SHAPE_POINTS,
    answer: L_SHAPE_AREA,
  },
  l_shape_perimeter: {
    kind: 'l_shape_perimeter',
    template: 'coordinate_points',
    points: L_SHAPE_POINTS,
    outline: L_SHAPE_POINTS,
    answer: L_SHAPE_PERIMETER,
  },
  trapezoid_area: {
    kind: 'trapezoid_area',
    template: 'coordinate_points',
    points: TRAPEZOID_POINTS,
    outline: TRAPEZOID_POINTS.slice(0, 4),
    topBase: 4,
    bottomBase: 8,
    height: 3,
    answer: TRAPEZOID_AREA,
  },
  parallelogram_area: {
    kind: 'parallelogram_area',
    template: 'parallelogram',
    base: 8,
    side: 5,
    angle: 30,
    height: 2.5,
    answer: 20,
  },
  parallelogram_perimeter: {
    kind: 'parallelogram_perimeter',
    template: 'parallelogram',
    base: 8,
    side: 5,
    angle: 30,
    height: 2.5,
    answer: 26,
  },
  triangle_area: {
    kind: 'triangle_area',
    template: 'triangle',
    points: TRIANGLE_POINTS,
    outline: TRIANGLE_POINTS,
    sides: [6, 8, 10],
    answer: TRIANGLE_AREA,
  },
  triangle_perimeter: {
    kind: 'triangle_perimeter',
    template: 'triangle',
    points: TRIANGLE_POINTS,
    outline: TRIANGLE_POINTS,
    sides: [6, 8, 10],
    answer: TRIANGLE_PERIMETER,
  },
  circle_area: {
    kind: 'circle_area',
    template: 'circle',
    radius: 5,
    answer: 25 * Math.PI,
  },
  circle_circumference: {
    kind: 'circle_circumference',
    template: 'circle',
    radius: 6,
    answer: 12 * Math.PI,
  },
  circle_area_reverse: {
    kind: 'circle_area_reverse',
    template: 'circle',
    radius: 5,
    area: 25 * Math.PI,
    answer: 5,
  },
  circle_circumference_reverse: {
    kind: 'circle_circumference_reverse',
    template: 'circle',
    radius: 6,
    circumference: 12 * Math.PI,
    answer: 6,
  },
  circle_annulus_area: {
    kind: 'circle_annulus_area',
    template: 'circle_annulus',
    outerRadius: 6,
    innerRadius: 3,
    answer: 27 * Math.PI,
  },
  sector_area: {
    kind: 'sector_area',
    template: 'circle_sector',
    radius: 6,
    angle: 120,
    answer: 12 * Math.PI,
  },
};

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function normalizeDifficulty(difficulty) {
  const key = String(difficulty ?? '').toLowerCase();
  if (key.includes('hard') || key.includes('挑战') || key.includes('困难')) return 'Hard';
  if (key.includes('medium') || key.includes('中') || key.includes('进阶')) return 'Medium';
  if (key.includes('easy') || key.includes('基础') || key.includes('简单')) return 'Easy';
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
  const title = String(conceptTitle ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  return `${curriculum ?? 'general'}|${grade}|${difficulty}|${title}`;
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
    // ignore storage failures
  }
}

function randomIndex(max) {
  if (max <= 0) return 0;
  try {
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.getRandomValues) {
      const values = new Uint32Array(1);
      cryptoApi.getRandomValues(values);
      return values[0] % max;
    }
  } catch {
    // fall back below
  }
  return Math.floor(Math.random() * max);
}

function rotateKinds(pool, count, recentKinds) {
  const uniquePool = Array.from(new Set(pool.filter(Boolean)));
  const targetCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (uniquePool.length === 0 || targetCount === 0) return [];

  const recent = recentKinds.find((kind) => uniquePool.includes(kind));
  const startIndex = recent ? (uniquePool.indexOf(recent) + 1) % uniquePool.length : randomIndex(uniquePool.length);
  const ordered = [...uniquePool.slice(startIndex), ...uniquePool.slice(0, startIndex)];

  const selected = [];
  while (selected.length < targetCount) {
    selected.push(...ordered);
  }
  return selected.slice(0, targetCount);
}

function formatTrimmedNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function formatLength(value, unit = 'cm') {
  return `${formatTrimmedNumber(value)} ${unit}`;
}

function formatArea(value) {
  return `${formatTrimmedNumber(value)} cm²`;
}

function formatPiMultiple(value, suffix) {
  const multiple = Math.round((value / Math.PI) * 100) / 100;
  const base = Number.isInteger(multiple) ? String(multiple) : formatTrimmedNumber(multiple);
  const prefix = base === '1' ? '' : base;
  return `${prefix}π${suffix}`;
}

function normalizePoint(point) {
  return { x: Number(point.x), y: Number(point.y), label: point.label };
}

function normalizeOutline(points) {
  return Array.isArray(points) ? points.map(normalizePoint) : [];
}

function isAreaPerimeterConcept(conceptId = '', conceptTitle = '', conceptDesc = '') {
  const text = `${conceptId} ${conceptTitle} ${conceptDesc}`.toLowerCase();
  return (
    text.includes('area-perimeter') ||
    text.includes('area & perimeter') ||
    text.includes('面积与周长') ||
    text.includes('面积和周长')
  );
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
        ? `在长方形 ABCD 中，面积是 ${formatArea(item.area)}，且 AB = ${item.width} cm。求 BC 的长度。`
        : `In rectangle ABCD, the area is ${formatArea(item.area)} and AB = ${item.width} cm. Find BC.`;
    case 'rectangle_perimeter_reverse':
      return zh
        ? `在长方形 ABCD 中，周长是 ${formatLength(item.perimeter)}，且 AB = ${item.width} cm。求 BC 的长度。`
        : `In rectangle ABCD, the perimeter is ${formatLength(item.perimeter)} and AB = ${item.width} cm. Find BC.`;
    case 'square_area_reverse':
      return zh
        ? `在正方形 ABCD 中，面积是 ${formatArea(item.area)}。求边长。`
        : `In square ABCD, the area is ${formatArea(item.area)}. Find the side length.`;
    case 'square_perimeter_reverse':
      return zh
        ? `在正方形 ABCD 中，周长是 ${formatLength(item.perimeter)}。求边长。`
        : `In square ABCD, the perimeter is ${formatLength(item.perimeter)}. Find the side length.`;
    case 'l_shape_area':
      return zh
        ? '如图，L 形图形由长方形挖去一个小长方形得到。求阴影部分的面积。'
        : 'In the figure, an L-shaped region is formed by removing a smaller rectangle from a larger one. Find the shaded area.';
    case 'l_shape_perimeter':
      return zh
        ? '如图，L 形图形由长方形挖去一个小长方形得到。求这个图形的周长。'
        : 'In the figure, an L-shaped region is formed by removing a smaller rectangle from a larger one. Find the perimeter of the shape.';
    case 'trapezoid_area':
      return zh
        ? `如图，梯形的上底为 ${item.topBase} cm，下底为 ${item.bottomBase} cm，高为 ${item.height} cm。求梯形的面积。`
        : `In the figure, the trapezoid has top base ${item.topBase} cm, bottom base ${item.bottomBase} cm, and height ${item.height} cm. Find the area.`;
    case 'parallelogram_area':
      return zh
        ? `如图，平行四边形的底为 ${item.base} cm，高为 ${item.height} cm。求平行四边形的面积。`
        : `In the figure, the parallelogram has base ${item.base} cm and height ${item.height} cm. Find the area.`;
    case 'parallelogram_perimeter':
      return zh
        ? `如图，平行四边形的底为 ${item.base} cm，边长为 ${item.side} cm。求平行四边形的周长。`
        : `In the figure, the parallelogram has base ${item.base} cm and side length ${item.side} cm. Find the perimeter.`;
    case 'triangle_area':
      return zh
        ? `在直角三角形 ABC 中，AB = ${item.legA} cm，BC = ${item.legB} cm，AC = ${item.hypotenuse} cm。求三角形的面积。`
        : `In right triangle ABC, AB = ${item.legA} cm, BC = ${item.legB} cm, and AC = ${item.hypotenuse} cm. Find the area.`;
    case 'triangle_perimeter':
      return zh
        ? `在直角三角形 ABC 中，AB = ${item.legA} cm，BC = ${item.legB} cm，AC = ${item.hypotenuse} cm。求三角形的周长。`
        : `In right triangle ABC, AB = ${item.legA} cm, BC = ${item.legB} cm, and AC = ${item.hypotenuse} cm. Find the perimeter.`;
    case 'circle_area':
      return zh
        ? `在圆 O 中，半径 OA = ${item.radius} cm。求圆的面积。`
        : `In circle O, radius OA = ${item.radius} cm. Find the area of the circle.`;
    case 'circle_circumference':
      return zh
        ? `在圆 O 中，半径 OA = ${item.radius} cm。求圆的周长。`
        : `In circle O, radius OA = ${item.radius} cm. Find the circumference of the circle.`;
    case 'circle_area_reverse':
      return zh
        ? `在圆 O 中，圆的面积是 ${formatPiMultiple(item.area, ' cm²')}。求半径 OA。`
        : `In circle O, the area is ${formatPiMultiple(item.area, ' cm²')}. Find the radius OA.`;
    case 'circle_circumference_reverse':
      return zh
        ? `在圆 O 中，圆的周长是 ${formatPiMultiple(item.circumference, ' cm')}。求半径 OA。`
        : `In circle O, the circumference is ${formatPiMultiple(item.circumference, ' cm')}. Find the radius OA.`;
    case 'circle_annulus_area':
      return zh
        ? `如图，圆环的外半径为 ${item.outerRadius} cm，内半径为 ${item.innerRadius} cm。求阴影部分面积。`
        : `In the figure, the outer radius of the annulus is ${item.outerRadius} cm and the inner radius is ${item.innerRadius} cm. Find the shaded area.`;
    case 'sector_area':
      return zh
        ? `如图，扇形的半径为 ${item.radius} cm，圆心角为 ${item.angle}°。求扇形面积。`
        : `In the figure, the sector has radius ${item.radius} cm and central angle ${item.angle}°. Find the sector area.`;
    default:
      return '';
  }
}

function buildRectangleSpec(item) {
  const isSquare = item.kind.startsWith('square');
  const width = isSquare ? item.side : item.width;
  const height = isSquare ? item.side : item.height;
  const spec = {
    template: 'rectangle',
    width,
    height,
    labels: ['A', 'B', 'C', 'D'],
    label_width: formatLength(width),
    label_height: formatLength(height),
  };

  switch (item.kind) {
    case 'rectangle_area':
      return { ...spec, label_area: '?' };
    case 'rectangle_perimeter':
      return { ...spec, label_perimeter: '?' };
    case 'square_area':
      return { ...spec, label_area: '?' };
    case 'square_perimeter':
      return { ...spec, label_perimeter: '?' };
    case 'rectangle_area_reverse':
      return { ...spec, label_area: formatArea(item.area), label_height: '?' };
    case 'rectangle_perimeter_reverse':
      return { ...spec, label_perimeter: formatLength(item.perimeter), label_height: '?' };
    case 'square_area_reverse':
      return { ...spec, width: item.side, height: item.side, label_width: '?', label_height: '?', label_area: formatArea(item.area) };
    case 'square_perimeter_reverse':
      return { ...spec, width: item.side, height: item.side, label_width: '?', label_height: '?', label_perimeter: formatLength(item.perimeter) };
    default:
      return spec;
  }
}

function buildCoordinateSpec(item) {
  const basePoints = clonePoints(item.points ?? []);
  const outline = normalizeOutline(item.outline ?? item.points ?? []);
  const spec = {
    template: 'coordinate_points',
    axes: false,
    points: basePoints,
    segments: [],
  };

  if (item.kind === 'l_shape_area' || item.kind === 'l_shape_perimeter') {
    return {
      ...spec,
      segments: [
        ['A', 'B'],
        ['B', 'C'],
        ['C', 'D'],
        ['D', 'E'],
        ['E', 'F'],
        ['F', 'A'],
      ].map(([from, to]) => ({ from, to, label: edgeLabel(outline, from, to) })),
      label_area: item.kind === 'l_shape_area' ? '?' : undefined,
      label_perimeter: item.kind === 'l_shape_perimeter' ? '?' : undefined,
    };
  }

  if (item.kind === 'trapezoid_area') {
    return {
      ...spec,
      topBase: item.topBase,
      bottomBase: item.bottomBase,
      height: item.height,
      segments: [
        { from: 'A', to: 'B', label: formatLength(item.bottomBase) },
        { from: 'B', to: 'C', label: '' },
        { from: 'C', to: 'D', label: formatLength(item.topBase) },
        { from: 'D', to: 'A', label: '' },
        { from: 'D', to: 'H', dash: true, label: formatLength(item.height) },
      ],
      angleMarks: [
        { vertex: 'H', from: 'D', to: 'B', right: true, r: 9 },
      ],
      label_area: '?',
    };
  }

  return spec;
}

function edgeLabel(outline, from, to) {
  const points = outline.length > 0 ? outline : [];
  const current = points.find((point) => point.label === from);
  const next = points.find((point) => point.label === to);
  if (!current || !next) return '';
  return formatLength(Math.hypot(next.x - current.x, next.y - current.y));
}

function buildParallelogramSpec(item) {
  const base = item.base;
  const side = item.side;
  const height = item.height;
  const spec = {
    template: 'parallelogram',
    base,
    side,
    angle: item.angle,
    labels: ['A', 'B', 'C', 'D'],
    label_base: formatLength(base),
    label_side: formatLength(side),
    label_height: formatLength(height),
  };

  if (item.kind === 'parallelogram_area') {
    return { ...spec, label_area: '?' };
  }
  return { ...spec, label_perimeter: '?' };
}

function buildTriangleSpec(item) {
  const baseSpec = {
    template: 'triangle',
    points: clonePoints(item.points),
    right_angle: 'B',
    labels: {
      A: 'A',
      B: 'B',
      C: 'C',
      AB: formatLength(item.legA),
      BC: formatLength(item.legB),
      CA: formatLength(item.hypotenuse),
    },
  };

  return item.kind === 'triangle_area'
    ? { ...baseSpec, label_area: '?' }
    : { ...baseSpec, label_perimeter: '?' };
}

function buildCircleSpec(item) {
  const baseSpec = {
    template: 'circle',
    radius: item.radius,
    label_O: 'O',
    label_A: 'A',
    label_radius: formatLength(item.radius),
  };

  switch (item.kind) {
    case 'circle_area':
      return { ...baseSpec, label_area: '?' };
    case 'circle_circumference':
      return { ...baseSpec, label_circumference: '?' };
    case 'circle_area_reverse':
      return { ...baseSpec, label_radius: '?', label_area: formatPiMultiple(item.area, ' cm²') };
    case 'circle_circumference_reverse':
      return { ...baseSpec, label_radius: '?', label_circumference: formatPiMultiple(item.circumference, ' cm') };
    default:
      return baseSpec;
  }
}

function buildCircleAnnulusSpec(item) {
  return {
    template: 'circle_annulus',
    outer_radius: item.outerRadius,
    inner_radius: item.innerRadius,
    label_O: 'O',
    label_A: 'A',
    label_B: 'B',
    label_outer_radius: formatLength(item.outerRadius),
    label_inner_radius: formatLength(item.innerRadius),
    label_area: '?',
  };
}

function buildSectorSpec(item) {
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
}

function buildDiagramSpec(item) {
  switch (item.kind) {
    case 'rectangle_area':
    case 'rectangle_perimeter':
    case 'square_area':
    case 'square_perimeter':
    case 'rectangle_area_reverse':
    case 'rectangle_perimeter_reverse':
    case 'square_area_reverse':
    case 'square_perimeter_reverse':
      return buildRectangleSpec(item);
    case 'l_shape_area':
    case 'l_shape_perimeter':
    case 'trapezoid_area':
      return buildCoordinateSpec(item);
    case 'parallelogram_area':
    case 'parallelogram_perimeter':
      return buildParallelogramSpec(item);
    case 'triangle_area':
    case 'triangle_perimeter':
      return buildTriangleSpec(item);
    case 'circle_area':
    case 'circle_circumference':
    case 'circle_area_reverse':
    case 'circle_circumference_reverse':
      return buildCircleSpec(item);
    case 'circle_annulus_area':
      return buildCircleAnnulusSpec(item);
    case 'sector_area':
      return buildSectorSpec(item);
    default:
      return {};
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
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height)) issues.push('rectangle dimensions must be positive');
      if (issues.length === 0 && item.answer !== item.width * item.height) issues.push('rectangle area answer mismatch');
      break;
    case 'rectangle_perimeter':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height)) issues.push('rectangle dimensions must be positive');
      if (issues.length === 0 && item.answer !== 2 * (item.width + item.height)) issues.push('rectangle perimeter answer mismatch');
      break;
    case 'square_area':
      if (!isFinitePositiveNumber(item.side)) issues.push('square side must be positive');
      if (issues.length === 0 && item.answer !== item.side * item.side) issues.push('square area answer mismatch');
      break;
    case 'square_perimeter':
      if (!isFinitePositiveNumber(item.side)) issues.push('square side must be positive');
      if (issues.length === 0 && item.answer !== 4 * item.side) issues.push('square perimeter answer mismatch');
      break;
    case 'rectangle_area_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.area)) issues.push('rectangle reverse area data is invalid');
      if (issues.length === 0 && item.answer !== item.height) issues.push('rectangle reverse area answer mismatch');
      break;
    case 'rectangle_perimeter_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.perimeter)) issues.push('rectangle reverse perimeter data is invalid');
      if (issues.length === 0 && item.answer !== item.height) issues.push('rectangle reverse perimeter answer mismatch');
      break;
    case 'square_area_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.area)) issues.push('square reverse area data is invalid');
      if (issues.length === 0 && item.answer !== item.side) issues.push('square reverse area answer mismatch');
      break;
    case 'square_perimeter_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.perimeter)) issues.push('square reverse perimeter data is invalid');
      if (issues.length === 0 && item.answer !== item.side) issues.push('square reverse perimeter answer mismatch');
      break;
    case 'l_shape_area':
      if (polygonArea(item.outline ?? item.points) !== item.answer) issues.push('L-shape area answer mismatch');
      break;
    case 'l_shape_perimeter':
      if (Math.round(polygonPerimeter(item.outline ?? item.points) * 100) / 100 !== Math.round(item.answer * 100) / 100) issues.push('L-shape perimeter answer mismatch');
      break;
    case 'trapezoid_area':
      if (polygonArea(item.outline ?? []) !== item.answer) issues.push('trapezoid area answer mismatch');
      break;
    case 'parallelogram_area':
      if (item.answer !== item.base * item.height) issues.push('parallelogram area answer mismatch');
      break;
    case 'parallelogram_perimeter':
      if (item.answer !== 2 * (item.base + item.side)) issues.push('parallelogram perimeter answer mismatch');
      break;
    case 'triangle_area':
      if (polygonArea(item.outline ?? item.points) !== item.answer) issues.push('triangle area answer mismatch');
      break;
    case 'triangle_perimeter':
      if (Math.round(polygonPerimeter(item.outline ?? item.points) * 100) / 100 !== Math.round(item.answer * 100) / 100) issues.push('triangle perimeter answer mismatch');
      break;
    case 'circle_area':
      if (item.answer !== Math.PI * item.radius * item.radius) issues.push('circle area answer mismatch');
      break;
    case 'circle_circumference':
      if (item.answer !== 2 * Math.PI * item.radius) issues.push('circle circumference answer mismatch');
      break;
    case 'circle_area_reverse':
      if (item.answer !== item.radius || item.area !== Math.PI * item.radius * item.radius) issues.push('circle reverse area answer mismatch');
      break;
    case 'circle_circumference_reverse':
      if (item.answer !== item.radius || item.circumference !== 2 * Math.PI * item.radius) issues.push('circle reverse circumference answer mismatch');
      break;
    case 'circle_annulus_area':
      if (item.answer !== Math.PI * (item.outerRadius * item.outerRadius - item.innerRadius * item.innerRadius)) issues.push('annulus area answer mismatch');
      break;
    case 'sector_area':
      if (item.answer !== (item.angle / 360) * Math.PI * item.radius * item.radius) issues.push('sector area answer mismatch');
      break;
    default:
      issues.push(`unsupported kind: ${String(item.kind)}`);
  }

  return issues;
}

function validateRenderedAreaPerimeterExerciseItem(item, rendered) {
  const issues = validateAreaPerimeterExerciseItem(item);
  const renderedContract = AREA_PERIMETER_RENDER_CONTRACTS[item.kind];
  issues.push(...validateRenderContract(rendered, renderedContract, item.kind));

  const expectedSpec = JSON.stringify(buildDiagramSpec(item));
  if (!rendered.includes(expectedSpec)) {
    issues.push(`${item.kind} rendered diagram does not match the expected spec`);
  }

  return issues;
}

function renderAreaPerimeterExerciseItem(item, index, lang) {
  const question = buildQuestionText(item, lang);
  const diagram = JSON.stringify(buildDiagramSpec(item));
  return `${index + 1}. ${question}\n\n\`\`\`math-diagram\n${diagram}\n\`\`\``;
}

function buildAreaPerimeterExerciseItems(count, { lang = 'zh', difficulty = 'Easy', grade = '8', curriculum = null } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (safeCount === 0) return [];

  const families = getDifficultyFamilies(difficulty);
  const historyKey = makeHistoryKey('area-perimeter', grade, normalizeDifficulty(difficulty), curriculum);
  const selectedKinds = rotateKinds(families, safeCount, readRecentKinds(historyKey));
  if (selectedKinds.length > 0) {
    writeRecentKinds(historyKey, selectedKinds);
  }

  return selectedKinds.map((kind) => ({
    ...AREA_PERIMETER_VARIANT_LIBRARY[kind],
    lang,
    difficulty: normalizeDifficulty(difficulty),
    grade,
    curriculum,
  }));
}

function validateAreaPerimeterExerciseItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return ['items must be a non-empty array'];
  }

  const issues = [];
  items.forEach((item, index) => {
    const itemIssues = validateAreaPerimeterExerciseItem(item);
    itemIssues.forEach((issue) => issues.push(`item ${index + 1}: ${issue}`));
  });
  return issues;
}

function buildAreaPerimeterExerciseBatch({ count, lang = 'zh', difficulty = 'Easy', grade = '8', curriculum = null } = {}) {
  const items = buildAreaPerimeterExerciseItems(count, { lang, difficulty, grade, curriculum });
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
