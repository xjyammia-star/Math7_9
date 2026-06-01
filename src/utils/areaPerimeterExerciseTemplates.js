import { validateRenderContract } from './exerciseRenderContracts.js';

const HISTORY_KEY = 'math7-9:area-perimeter-kind-history:v2';
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
  parallelogram_area: {
    questionIncludes: ['平行四边形', '面积'],
    diagramIncludes: ['"template":"parallelogram"', '"label_height":"?"'],
  },
  parallelogram_perimeter: {
    questionIncludes: ['平行四边形', '周长'],
    diagramIncludes: ['"template":"parallelogram"', '"label_perimeter":"?"'],
  },
  triangle_area: {
    questionIncludes: ['三角形', '面积'],
    diagramIncludes: ['"template":"triangle"', '"label_area":"?"'],
  },
  triangle_perimeter: {
    questionIncludes: ['三角形', '周长'],
    diagramIncludes: ['"template":"triangle"', '"label_perimeter":"?"'],
  },
  circle_area: {
    questionIncludes: ['圆', '面积'],
    diagramIncludes: ['"template":"circle"', '"label_area":"?"'],
  },
  circle_circumference: {
    questionIncludes: ['圆', '周长'],
    diagramIncludes: ['"template":"circle"', '"label_circumference":"?"'],
  },
  circle_area_reverse: {
    questionIncludes: ['圆', '面积', '半径'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_area":"'],
  },
  circle_circumference_reverse: {
    questionIncludes: ['圆', '周长', '半径'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_circumference":"'],
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
    questionIncludes: ['面积为', '求 BC 的长度', 'find the missing side'],
    diagramIncludes: ['"template":"rectangle"', '"label_area":"40 cm²"', '"label_height":"?"'],
  },
  rectangle_perimeter_reverse: {
    questionIncludes: ['周长为', '求 BC 的长度', 'find the missing side'],
    diagramIncludes: ['"template":"rectangle"', '"label_perimeter":"26 cm"', '"label_height":"?"'],
  },
  square_area_reverse: {
    questionIncludes: ['正方形', '面积为', '求边长'],
    diagramIncludes: ['"template":"rectangle"', '"label_area":"49 cm²"', '"label_width":"?"', '"label_height":"?"'],
  },
  square_perimeter_reverse: {
    questionIncludes: ['正方形', '周长为', '求边长'],
    diagramIncludes: ['"template":"rectangle"', '"label_perimeter":"32 cm"', '"label_width":"?"', '"label_height":"?"'],
  },
  l_shape_area: {
    questionIncludes: ['L形图形', '外接长方形', '面积'],
    diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label":"A"', '"label":"F"'],
  },
  l_shape_perimeter: {
    questionIncludes: ['L形图形', '外接长方形', '周长'],
    diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label":"A"', '"label":"F"'],
  },
  trapezoid_area: {
    questionIncludes: ['梯形 ABCD', '上底', '下底', '面积'],
    diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label":"A"', '"label":"D"'],
  },
  parallelogram_area: {
    questionIncludes: ['平行四边形', '底', '高', '面积'],
    diagramIncludes: ['"template":"parallelogram"', '"label_height":"?"'],
  },
  triangle_area: {
    questionIncludes: ['三角形', '面积'],
    diagramIncludes: ['"template":"triangle"', '"label_area":"?"'],
  },
  triangle_perimeter: {
    questionIncludes: ['三角形', '周长'],
    diagramIncludes: ['"template":"triangle"', '"label_perimeter":"?"'],
  },
  parallelogram_perimeter: {
    questionIncludes: ['ๅนณ่กๅ่พนๅฝข', 'ๅ‘จ้•ฟ', 'perimeter of the parallelogram'],
    diagramIncludes: ['"template":"parallelogram"', '"label_perimeter":"?"'],
  },
  circle_area: {
    questionIncludes: ['圆', '面积'],
    diagramIncludes: ['"template":"circle"', '"label_area":"?"'],
  },
  circle_circumference: {
    questionIncludes: ['圆', '周长'],
    diagramIncludes: ['"template":"circle"', '"label_circumference":"?"'],
  },
  circle_area_reverse: {
    questionIncludes: ['ๅ', '้ข็งฏไธบ', 'รัศมี'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_area":"'],
  },
  circle_circumference_reverse: {
    questionIncludes: ['ๅ', 'ๅ‘จ้•ฟไธบ', 'รัศมี'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_circumference":"'],
  },
  circle_area_reverse: {
    questionIncludes: ['ๅ', '้ข็งฏไธบ', 'รัศมี'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_area":"'],
  },
  circle_circumference_reverse: {
    questionIncludes: ['ๅ', 'ๅ‘จ้•ฟไธบ', 'รัศมี'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_circumference":"'],
  },
  circle_annulus_area: {
    questionIncludes: ['圆环', '外半径', '内半径', '阴影部分'],
    diagramIncludes: ['"template":"circle_annulus"', '"label_area":"?"'],
  },
  sector_area: {
    questionIncludes: ['扇形', '面积'],
    diagramIncludes: ['"template":"circle_sector"', '"label_area":"?"'],
  },
  parallelogram_area: {
    questionIncludes: ['平行四边形', '面积'],
    diagramIncludes: ['"template":"parallelogram"', '"label_height":"?"'],
  },
  parallelogram_perimeter: {
    questionIncludes: ['平行四边形', '周长'],
    diagramIncludes: ['"template":"parallelogram"', '"label_perimeter":"?"'],
  },
  triangle_area: {
    questionIncludes: ['三角形', '面积'],
    diagramIncludes: ['"template":"triangle"', '"label_area":"?"'],
  },
  triangle_perimeter: {
    questionIncludes: ['三角形', '周长'],
    diagramIncludes: ['"template":"triangle"', '"label_perimeter":"?"'],
  },
  circle_area: {
    questionIncludes: ['圆', '面积'],
    diagramIncludes: ['"template":"circle"', '"label_area":"?"'],
  },
  circle_circumference: {
    questionIncludes: ['圆', '周长'],
    diagramIncludes: ['"template":"circle"', '"label_circumference":"?"'],
  },
  circle_area_reverse: {
    questionIncludes: ['圆', '面积', '半径'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_area":"'],
  },
  circle_circumference_reverse: {
    questionIncludes: ['圆', '周长', '半径'],
    diagramIncludes: ['"template":"circle"', '"label_radius":"?"', '"label_circumference":"'],
  },};

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
    area: 40,
    answer: 5,
  },
  rectangle_perimeter_reverse: {
    kind: 'rectangle_perimeter_reverse',
    shape: 'rectangle',
    width: 9,
    height: 4,
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
  l_shape_area: {
    kind: 'l_shape_area',
    shape: 'coordinate_points',
    outerWidth: 8,
    outerHeight: 6,
    cutWidth: 4,
    cutHeight: 4,
    answer: 32,
  },
  l_shape_perimeter: {
    kind: 'l_shape_perimeter',
    shape: 'coordinate_points',
    outerWidth: 8,
    outerHeight: 6,
    cutWidth: 4,
    cutHeight: 4,
    answer: 28,
  },
  trapezoid_area: {
    kind: 'trapezoid_area',
    shape: 'coordinate_points',
    topBase: 4,
    bottomBase: 8,
    height: 4,
    answer: 24,
  },
  parallelogram_area: {
    kind: 'parallelogram_area',
    shape: 'parallelogram',
    base: 8,
    side: 6,
    angle: 60,
    height: 5.2,
    area: 40,
    answer: 40,
  },
  parallelogram_perimeter: {
    kind: 'parallelogram_perimeter',
    shape: 'parallelogram',
    base: 8,
    side: 6,
    angle: 60,
    answer: 28,
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
  circle_area_reverse: {
    kind: 'circle_area_reverse',
    shape: 'circle',
    radius: 5,
    area: 25 * Math.PI,
    answer: 5,
  },
  circle_circumference_reverse: {
    kind: 'circle_circumference_reverse',
    shape: 'circle',
    radius: 6,
    circumference: 12 * Math.PI,
    answer: 6,
  },
  circle_annulus_area: {
    kind: 'circle_annulus_area',
    shape: 'circle_annulus',
    outerRadius: 6,
    innerRadius: 3,
    answer: 27 * Math.PI,
  },
  sector_area: {
    kind: 'sector_area',
    shape: 'circle_sector',
    radius: 6,
    angle: 120,
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
  return difficulty === 'Medium' || difficulty === 'Hard' ? difficulty : 'Easy';
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
  if (uniquePool.length === 0) return [];

  const recent = recentKinds.find((kind) => uniquePool.includes(kind));
  const startIndex = recent ? (uniquePool.indexOf(recent) + 1) % uniquePool.length : randomIndex(uniquePool.length);
  const ordered = [...uniquePool.slice(startIndex), ...uniquePool.slice(0, startIndex)];
  const targetCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (targetCount === 0) return [];

  const selected = [];
  while (selected.length < targetCount) {
    selected.push(...ordered);
  }
  return selected.slice(0, targetCount);
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
        : `In rectangle ABCD, AB = ${item.width} cm and the area is ${formatArea(item.area)}. Find BC.`;
    case 'rectangle_perimeter_reverse':
      return zh
        ? `在长方形 ABCD 中，AB = ${item.width} cm，周长为 ${formatPerimeter(item.perimeter)}。求 BC 的长度。`
        : `In rectangle ABCD, AB = ${item.width} cm and the perimeter is ${formatPerimeter(item.perimeter)}. Find BC.`;
    case 'square_area_reverse':
      return zh
        ? `在正方形 ABCD 中，面积为 ${formatArea(item.area)}。求正方形的边长。`
        : `In square ABCD, the area is ${formatArea(item.area)}. Find the side length of the square.`;
    case 'square_perimeter_reverse':
      return zh
        ? `在正方形 ABCD 中，周长为 ${formatPerimeter(item.perimeter)}。求正方形的边长。`
        : `In square ABCD, the perimeter is ${formatPerimeter(item.perimeter)}. Find the side length of the square.`;
    case 'l_shape_area':
      return zh
        ? `如图，L形图形由一个 ${item.outerWidth} cm × ${item.outerHeight} cm 的外接长方形去掉右上角一个 ${item.cutWidth} cm × ${item.cutHeight} cm 的小长方形得到。求这个L形图形的面积。`
        : `The L-shape is formed by removing a ${item.cutWidth} cm by ${item.cutHeight} cm corner from a ${item.outerWidth} cm by ${item.outerHeight} cm rectangle. Find its area.`;
    case 'l_shape_perimeter':
      return zh
        ? `如图，L形图形的外接长方形长 ${item.outerWidth} cm、宽 ${item.outerHeight} cm，右上角缺口的边长分别是 ${item.cutWidth} cm 和 ${item.cutHeight} cm。求这个L形图形的周长。`
        : `The L-shape comes from a ${item.outerWidth} cm by ${item.outerHeight} cm rectangle with a ${item.cutWidth} cm by ${item.cutHeight} cm corner removed. Find its perimeter.`;
    case 'trapezoid_area':
      return zh
        ? `在梯形 ABCD 中，上底 CD = ${item.topBase} cm，下底 AB = ${item.bottomBase} cm，高为 ${item.height} cm。求梯形的面积。`
        : `In trapezoid ABCD, the top base CD is ${item.topBase} cm, the bottom base AB is ${item.bottomBase} cm, and the height is ${item.height} cm. Find the area.`;
    case 'parallelogram_area':
      return zh
        ? `在平行四边形 ABCD 中，AB = ${item.base} cm，BC = ${item.side} cm，∠ABC = ${item.angle}°。求平行四边形的面积。`
        : `In parallelogram ABCD, AB = ${item.base} cm, BC = ${item.side} cm, and ∠ABC = ${item.angle}°. Find the area of the parallelogram.`;
    case 'triangle_area':
      return zh
        ? `在三角形 ABC 中，底边 BC = ${item.legC} cm，高 ${item.legB} cm。求三角形的面积。`
        : `In triangle ABC, the base BC is ${item.legC} cm and the height is ${item.legB} cm. Find the area of the triangle.`;
    case 'triangle_perimeter':
      return zh
        ? `在三角形 ABC 中，三边分别为 ${item.sides[0]} cm、${item.sides[1]} cm、${item.sides[2]} cm。求三角形的周长。`
        : `In triangle ABC, the three sides are ${item.sides[0]} cm, ${item.sides[1]} cm, and ${item.sides[2]} cm. Find the perimeter of the triangle.`;
    case 'parallelogram_perimeter':
      return zh
        ? `在平行四边形 ABCD 中，AB = ${item.base} cm，BC = ${item.side} cm，∠ABC = ${item.angle}°。求平行四边形的周长。`
        : `In parallelogram ABCD, AB = ${item.base} cm, BC = ${item.side} cm, and ∠ABC = ${item.angle}°. Find the perimeter.`;
    case 'circle_area':
      return zh
        ? `在圆 O 中，半径 OA = ${item.radius} cm。求圆的面积。`
        : `In circle O, the radius OA is ${item.radius} cm. Find the area of the circle.`;
    case 'circle_circumference':
      return zh
        ? `在圆 O 中，半径 OA = ${item.radius} cm。求圆的周长。`
        : `In circle O, the radius OA is ${item.radius} cm. Find the circumference of the circle.`;
    case 'circle_area_reverse':
      return zh
        ? `在圆 O 中，圆的面积是 ${formatArea(item.area)}。求半径 OA。`
        : `In circle O, the area is ${formatArea(item.area)}. Find the radius OA.`;
    case 'circle_circumference_reverse':
      return zh
        ? `在圆 O 中，圆的周长是 ${formatPerimeter(item.circumference)}。求半径 OA。`
        : `In circle O, the circumference is ${formatPerimeter(item.circumference)}. Find the radius OA.`;
    case 'circle_annulus_area':
      return zh
        ? `如图，圆环的外半径是 ${item.outerRadius} cm，内半径是 ${item.innerRadius} cm。求阴影部分的面积。`
        : `In the diagram, the outer radius is ${item.outerRadius} cm and the inner radius is ${item.innerRadius} cm. Find the shaded area.`;
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
    case 'l_shape_area':
    case 'l_shape_perimeter':
      return {
        template: 'coordinate_points',
        axes: false,
        points: [
          { x: 0, y: 6, label: 'A' },
          { x: 4, y: 6, label: 'B' },
          { x: 4, y: 2, label: 'C' },
          { x: 8, y: 2, label: 'D' },
          { x: 8, y: 0, label: 'E' },
          { x: 0, y: 0, label: 'F' },
        ],
        segments: [
          { from: 'A', to: 'B', label: '4 cm' },
          { from: 'B', to: 'C', label: '4 cm' },
          { from: 'C', to: 'D', label: '4 cm' },
          { from: 'D', to: 'E', label: '2 cm' },
          { from: 'E', to: 'F', label: '8 cm' },
          { from: 'F', to: 'A', label: '6 cm' },
        ],
      };
    case 'trapezoid_area':
      return {
        template: 'coordinate_points',
        axes: false,
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 8, y: 0, label: 'B' },
          { x: 6, y: 4, label: 'C' },
          { x: 2, y: 4, label: 'D' },
          { x: 2, y: 0, label: 'H' },
        ],
        segments: [
          { from: 'A', to: 'B', label: '8 cm' },
          { from: 'B', to: 'C' },
          { from: 'C', to: 'D', label: '4 cm' },
          { from: 'D', to: 'A' },
          { from: 'D', to: 'H', label: '4 cm', dash: true },
        ],
      };
    case 'parallelogram_area':
      return {
        template: 'parallelogram',
        base: item.base,
        side: item.side,
        angle: item.angle,
        labels: ['A', 'B', 'C', 'D'],
        label_height: '?',
      };
    case 'parallelogram_perimeter':
      return {
        template: 'parallelogram',
        base: item.base,
        side: item.side,
        angle: item.angle,
        labels: ['A', 'B', 'C', 'D'],
        label_perimeter: '?',
      };
    case 'triangle_area':
      return {
        template: 'triangle',
        points: item.points,
        rightAngle: item.rightAngle,
        legB: item.legB,
        legC: item.legC,
        label_area: '?',
      };
    case 'triangle_perimeter':
      return {
        template: 'triangle',
        sides: item.sides,
        label_perimeter: '?',
      };
    case 'circle_area':
      return {
        template: 'circle',
        radius: item.radius,
        label_O: 'O',
        label_A: 'A',
        label_radius: `${item.radius} cm`,
        label_area: '?',
      };
    case 'circle_circumference':
      return {
        template: 'circle',
        radius: item.radius,
        label_O: 'O',
        label_A: 'A',
        label_radius: `${item.radius} cm`,
        label_circumference: '?',
      };
    case 'circle_area_reverse':
      return {
        template: 'circle',
        radius: item.radius,
        label_O: 'O',
        label_A: 'A',
        label_radius: '?',
        label_area: formatArea(item.area),
      };
    case 'circle_circumference_reverse':
      return {
        template: 'circle',
        radius: item.radius,
        label_O: 'O',
        label_A: 'A',
        label_radius: '?',
        label_circumference: formatPerimeter(item.circumference),
      };
    case 'circle_annulus_area':
      return {
        template: 'circle_annulus',
        outer_radius: item.outerRadius,
        inner_radius: item.innerRadius,
        label_O: 'O',
        label_A: 'A',
        label_B: 'B',
        label_outer_radius: `${item.outerRadius} cm`,
        label_inner_radius: `${item.innerRadius} cm`,
        label_area: '?',
      };
    case 'sector_area':
      return {
        template: 'circle_sector',
        radius: item.radius,
        angle: item.angle,
        label_O: 'O',
        label_A: 'A',
        label_B: 'B',
        label_radius: `${item.radius} cm`,
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
      if (!isFinitePositiveNumber(item.width)) issues.push('rectangle width must be positive');
      if (!isFinitePositiveNumber(item.height)) issues.push('rectangle height must be positive');
      if (item.kind === 'rectangle_area' && item.answer !== item.width * item.height) {
        issues.push('rectangle area answer mismatch');
      }
      if (item.kind === 'rectangle_perimeter' && item.answer !== 2 * (item.width + item.height)) {
        issues.push('rectangle perimeter answer mismatch');
      }
      break;
    case 'square_area':
    case 'square_perimeter':
      if (!isFinitePositiveNumber(item.side)) issues.push('square side must be positive');
      if (item.kind === 'square_area' && item.answer !== item.side * item.side) {
        issues.push('square area answer mismatch');
      }
      if (item.kind === 'square_perimeter' && item.answer !== 4 * item.side) {
        issues.push('square perimeter answer mismatch');
      }
      break;
    case 'rectangle_area_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.area)) {
        issues.push('rectangle reverse-area item must include width, height, and area');
      }
      if (item.answer !== item.height) issues.push('rectangle reverse-area answer mismatch');
      break;
    case 'rectangle_perimeter_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.perimeter)) {
        issues.push('rectangle reverse-perimeter item must include width, height, and perimeter');
      }
      if (item.answer !== item.height) issues.push('rectangle reverse-perimeter answer mismatch');
      break;
    case 'square_area_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.area)) {
        issues.push('square reverse-area item must include side and area');
      }
      if (item.answer !== item.side) issues.push('square reverse-area answer mismatch');
      break;
    case 'square_perimeter_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.perimeter)) {
        issues.push('square reverse-perimeter item must include side and perimeter');
      }
      if (item.answer !== item.side) issues.push('square reverse-perimeter answer mismatch');
      break;
    case 'l_shape_area':
    case 'l_shape_perimeter':
      if (![item.outerWidth, item.outerHeight, item.cutWidth, item.cutHeight].every(isFinitePositiveNumber)) {
        issues.push('L-shape item must include positive outer and cut dimensions');
      } else {
        if (item.cutWidth >= item.outerWidth || item.cutHeight >= item.outerHeight) {
          issues.push('L-shape cut size must be smaller than outer size');
        }
        const area = item.outerWidth * item.outerHeight - item.cutWidth * item.cutHeight;
        const perimeter = 2 * (item.outerWidth + item.outerHeight);
        if (item.kind === 'l_shape_area' && item.answer !== area) {
          issues.push('L-shape area answer mismatch');
        }
        if (item.kind === 'l_shape_perimeter' && item.answer !== perimeter) {
          issues.push('L-shape perimeter answer mismatch');
        }
      }
      break;
    case 'trapezoid_area':
      if (![item.topBase, item.bottomBase, item.height].every(isFinitePositiveNumber)) {
        issues.push('trapezoid item must include positive bases and height');
      } else {
        if (item.bottomBase <= item.topBase) issues.push('trapezoid bottom base should be larger than top base');
        const area = ((item.topBase + item.bottomBase) / 2) * item.height;
        if (item.answer !== area) issues.push('trapezoid area answer mismatch');
      }
      break;
    case 'parallelogram_area':
      if (![item.base, item.side, item.angle].every(isFinitePositiveNumber)) {
        issues.push('parallelogram area item must include positive base, side, and angle');
      } else {
        const area = isFinitePositiveNumber(item.area)
          ? item.area
          : item.base * item.side * Math.sin(item.angle * Math.PI / 180);
        if (item.answer !== area) {
          issues.push('parallelogram area answer mismatch');
        }
      }
      break;
    case 'parallelogram_perimeter':
      if (![item.base, item.side, item.angle].every(isFinitePositiveNumber)) {
        issues.push('parallelogram item must include positive base, side, and angle');
      } else if (item.answer !== 2 * (item.base + item.side)) {
        issues.push('parallelogram perimeter answer mismatch');
      }
      break;
    case 'triangle_area':
      if (!isFinitePositiveNumber(item.legB) || !isFinitePositiveNumber(item.legC)) {
        issues.push('triangle area item must include positive base and height');
      } else if (item.answer !== (item.legB * item.legC) / 2) {
        issues.push('triangle area answer mismatch');
      }
      break;
    case 'triangle_perimeter':
      if (!Array.isArray(item.sides) || item.sides.length !== 3 || !item.sides.every(isFinitePositiveNumber)) {
        issues.push('triangle perimeter item must include three positive sides');
      } else if (item.answer !== item.sides[0] + item.sides[1] + item.sides[2]) {
        issues.push('triangle perimeter answer mismatch');
      }
      break;
    case 'circle_area':
      if (!isFinitePositiveNumber(item.radius)) {
        issues.push('circle area item must include a positive radius');
      } else if (item.answer !== Math.PI * item.radius * item.radius) {
        issues.push('circle area answer mismatch');
      }
      break;
    case 'circle_circumference':
      if (!isFinitePositiveNumber(item.radius)) {
        issues.push('circle circumference item must include a positive radius');
      } else if (item.answer !== 2 * Math.PI * item.radius) {
        issues.push('circle circumference answer mismatch');
      }
      break;
    case 'circle_area_reverse':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.area)) {
        issues.push('circle reverse-area item must include radius and area');
      } else if (item.answer !== item.radius) {
        issues.push('circle reverse-area answer mismatch');
      }
      break;
    case 'circle_circumference_reverse':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.circumference)) {
        issues.push('circle reverse-circumference item must include radius and circumference');
      } else if (item.answer !== item.radius) {
        issues.push('circle reverse-circumference answer mismatch');
      }
      break;
    case 'circle_annulus_area':
      if (!isFinitePositiveNumber(item.outerRadius) || !isFinitePositiveNumber(item.innerRadius)) {
        issues.push('annulus item must include positive outer and inner radius');
      } else {
        if (item.outerRadius <= item.innerRadius) issues.push('annulus outer radius must be larger than inner radius');
        const area = Math.PI * (item.outerRadius ** 2 - item.innerRadius ** 2);
        if (item.answer !== area) issues.push('annulus area answer mismatch');
      }
      break;
    case 'sector_area':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.angle)) {
        issues.push('sector item must include positive radius and angle');
      } else {
        const area = (item.angle / 360) * Math.PI * item.radius * item.radius;
        if (item.answer !== area) issues.push('sector area answer mismatch');
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
  const pickedKinds = rotateKinds(families, safeCount, readRecentKinds(historyKey));
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
