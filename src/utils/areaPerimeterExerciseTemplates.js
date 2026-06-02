import { validateRenderContract } from './exerciseRenderContracts.js';
import {
  COMPOSITE_AREA_PERIMETER_KINDS,
  buildCompositeAreaPerimeterDiagramSpec,
  buildCompositeAreaPerimeterQuestionText,
  buildCompositeAreaPerimeterRenderContract,
  buildCompositeAreaPerimeterVariantExtras,
  validateCompositeAreaPerimeterItem,
} from './areaPerimeterCompositeFamilies.js';

const HISTORY_KEY = 'math7-9:area-perimeter-kind-history:v4';
const HISTORY_LIMIT = 180;

const AREA_PERIMETER_BLUEPRINT = {
  Easy: {
    families: [
      'rectangle_area',
      'rectangle_perimeter',
      'square_area',
      'square_perimeter',
      'triangle_area',
      'triangle_perimeter',
      'circle_area',
      'circle_circumference',
    ],
  },
  Medium: {
    families: [
      'rectangle_area_reverse',
      'rectangle_perimeter_reverse',
      'square_area_reverse',
      'square_perimeter_reverse',
      'parallelogram_area',
      'parallelogram_perimeter',
      'trapezoid_area',
      'circle_area_reverse',
      'circle_circumference_reverse',
      'circle_annulus_area',
      'sector_area',
    ],
  },
  Hard: {
    families: [
      'l_shape_area',
      'l_shape_perimeter',
      't_shape_area',
      't_shape_perimeter',
      't_shape_area_reverse',
      't_shape_perimeter_reverse',
      'adjacent_squares_diagonal_area',
      'adjacent_squares_diagonal_area_reverse',
      'adjacent_squares_diagonal_tall_area',
      'adjacent_squares_diagonal_tall_area_reverse',
      'rectangle_triangle_cut_area',
      'rectangle_triangle_cut_perimeter',
      'rectangle_triangle_cut_area_reverse',
      'circle_rectangle_cut_area',
      'circle_rectangle_cut_perimeter',
      'circle_rectangle_cut_area_reverse',
      'trapezoid_area_reverse',
      'parallelogram_area_reverse',
      'circle_annulus_area_reverse',
      'sector_area_reverse',
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
  trapezoid_area_reverse: {
    questionIncludes: ['梯形', '面积', '求上底'],
    diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_area":"18 cm²"', '"label_top_base":"?"'],
  },
  parallelogram_area: {
    questionIncludes: ['平行四边形', '面积'],
    diagramIncludes: ['"template":"parallelogram"', '"label_area":"?"', '"label_height":"2.5 cm"'],
  },
  parallelogram_perimeter: {
    questionIncludes: ['平行四边形', '周长'],
    diagramIncludes: ['"template":"parallelogram"', '"label_perimeter":"?"'],
  },
  parallelogram_area_reverse: {
    questionIncludes: ['平行四边形', '面积', '求高'],
    diagramIncludes: ['"template":"parallelogram"', '"label_area":"20 cm²"', '"label_height":"?"'],
  },
  triangle_area: {
    questionIncludes: ['直角三角形', '面积'],
    diagramIncludes: ['"template":"triangle"', '"label_area":"?"'],
  },
  triangle_perimeter: {
    questionIncludes: ['直角三角形', '周长'],
    diagramIncludes: ['"template":"triangle"', '"label_perimeter":"?"'],
  },
  circle_annulus_area: {
    questionIncludes: ['圆环', '面积'],
    diagramIncludes: ['"template":"circle_annulus"', '"label_area":"?"'],
  },
  circle_annulus_area_reverse: {
    questionIncludes: ['圆环', '面积', '求内半径'],
    diagramIncludes: ['"template":"circle_annulus"', '"label_area":"27π cm²"', '"label_inner_radius":"?"'],
  },
  sector_area: {
    questionIncludes: ['扇形', '面积'],
    diagramIncludes: ['"template":"circle_sector"', '"label_area":"?"'],
  },
  sector_area_reverse: {
    questionIncludes: ['扇形', '面积', '求半径'],
    diagramIncludes: ['"template":"circle_sector"', '"label_area":"12π cm²"', '"label_radius":"?"'],
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

const AREA_PERIMETER_SCENES = {
  rectangle: [
    { zh: '花园', en: 'garden' },
    { zh: '操场', en: 'playground' },
    { zh: '地毯', en: 'rug' },
    { zh: '海报', en: 'poster' },
    { zh: '窗户', en: 'window' },
    { zh: '菜地', en: 'vegetable patch' },
    { zh: '泳池', en: 'swimming pool' },
    { zh: '停车位', en: 'parking space' },
    { zh: '黑板', en: 'classroom board' },
  ],
  square: [
    { zh: '地砖', en: 'floor tile' },
    { zh: '草坪', en: 'lawn' },
    { zh: '棋盘', en: 'chessboard' },
    { zh: '相框', en: 'photo frame' },
    { zh: '便签纸', en: 'sticky note' },
    { zh: '小花园', en: 'small garden' },
    { zh: '屏幕', en: 'screen' },
    { zh: '桌垫', en: 'table mat' },
    { zh: '告示牌', en: 'notice board' },
  ],
  lShape: [
    { zh: '花坛', en: 'flower bed' },
    { zh: '走廊', en: 'corridor' },
    { zh: '露台', en: 'terrace' },
    { zh: '平台', en: 'platform' },
    { zh: '展台', en: 'display stand' },
  ],
  trapezoid: [
    { zh: '花坛', en: 'flower bed' },
    { zh: '看台', en: 'bleachers' },
    { zh: '屋顶', en: 'roof' },
    { zh: '遮阳棚', en: 'canopy' },
    { zh: '景观区', en: 'landscape area' },
  ],
  parallelogram: [
    { zh: '广告牌', en: 'billboard' },
    { zh: '风筝', en: 'kite' },
    { zh: '地砖铺设区', en: 'tiled area' },
    { zh: '帆布', en: 'canvas awning' },
    { zh: '窗帘', en: 'curtain' },
  ],
  triangle: [
    { zh: '支架', en: 'support frame' },
    { zh: '坡道', en: 'ramp' },
    { zh: '屋顶侧面', en: 'roof side' },
    { zh: '帐篷侧面', en: 'tent side' },
    { zh: '路标', en: 'signboard' },
  ],
  circle: [
    { zh: '花坛', en: 'flower bed' },
    { zh: '喷泉', en: 'fountain' },
    { zh: '广场', en: 'plaza' },
    { zh: '泳池', en: 'pool' },
    { zh: '车轮', en: 'wheel' },
  ],
  annulus: [
    { zh: '跑道', en: 'track' },
    { zh: '环形花坛', en: 'ring-shaped garden' },
    { zh: '靶环', en: 'target ring' },
    { zh: '环形步道', en: 'ring walkway' },
    { zh: '喷泉边', en: 'fountain border' },
  ],
  sector: [
    { zh: '花坛', en: 'flower bed' },
    { zh: '喷泉', en: 'fountain' },
    { zh: '披萨片', en: 'pizza slice' },
    { zh: '草坪', en: 'lawn' },
    { zh: '扇形舞台', en: 'fan-shaped stage' },
  ],
};

function pickScene(sceneList, index) {
  if (!Array.isArray(sceneList) || sceneList.length === 0) return null;
  return sceneList[index % sceneList.length];
}

function scalePoints(points, factor) {
  return points.map((point) => ({
    x: point.x * factor,
    y: point.y * factor,
    label: point.label,
  }));
}

function createVariantKey(kind, variantId) {
  return `${kind}:${variantId}`;
}

function createRectangleVariant(kind, variantId, width, height, extra = {}) {
  return {
    key: createVariantKey(kind, variantId),
    kind,
    variantId,
    template: 'rectangle',
    width,
    height,
    ...extra,
  };
}

function createScaledShapeVariant(kind, variantId, basePoints, factor, extra = {}) {
  const points = scalePoints(basePoints, factor);
  return {
    key: createVariantKey(kind, variantId),
    kind,
    variantId,
    points,
    outline: points,
    ...extra,
  };
}

function createTShapePoints(width, thickness, stemWidth, stemHeight) {
  const leftStemX = (width - stemWidth) / 2;
  const rightStemX = leftStemX + stemWidth;
  return [
    { x: 0, y: 0, label: 'A' },
    { x: width, y: 0, label: 'B' },
    { x: width, y: thickness, label: 'C' },
    { x: rightStemX, y: thickness, label: 'D' },
    { x: rightStemX, y: thickness + stemHeight, label: 'E' },
    { x: leftStemX, y: thickness + stemHeight, label: 'F' },
    { x: leftStemX, y: thickness, label: 'G' },
    { x: 0, y: thickness, label: 'H' },
  ];
}

function buildAreaPerimeterVariantExtras() {
  const variants = {};

  const rectanglePairs = Array.from({ length: 27 }, (_, index) => {
    const width = 4 + index;
    return [width, width + 1];
  });
  rectanglePairs.forEach(([width, height], index) => {
    const id = `${width}x${height}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.rectangle, index);
    variants[createVariantKey('rectangle_area', id)] = createRectangleVariant(
      'rectangle_area',
      id,
      width,
      height,
      { answer: width * height, scene }
    );
    variants[createVariantKey('rectangle_perimeter', id)] = createRectangleVariant(
      'rectangle_perimeter',
      id,
      width,
      height,
      { answer: 2 * (width + height), scene }
    );
    variants[createVariantKey('rectangle_area_reverse', id)] = createRectangleVariant(
      'rectangle_area_reverse',
      id,
      width,
      height,
      { area: width * height, answer: height, scene }
    );
    variants[createVariantKey('rectangle_perimeter_reverse', id)] = createRectangleVariant(
      'rectangle_perimeter_reverse',
      id,
      width,
      height,
      { perimeter: 2 * (width + height), answer: height, scene }
    );
  });

  Array.from({ length: 27 }, (_, index) => 4 + index).forEach((side, index) => {
    const id = `${side}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.square, index);
    variants[createVariantKey('square_area', id)] = {
      key: createVariantKey('square_area', id),
      kind: 'square_area',
      variantId: id,
      template: 'rectangle',
      side,
      answer: side * side,
      scene,
    };
    variants[createVariantKey('square_perimeter', id)] = {
      key: createVariantKey('square_perimeter', id),
      kind: 'square_perimeter',
      variantId: id,
      template: 'rectangle',
      side,
      answer: 4 * side,
      scene,
    };
    variants[createVariantKey('square_area_reverse', id)] = {
      key: createVariantKey('square_area_reverse', id),
      kind: 'square_area_reverse',
      variantId: id,
      template: 'rectangle',
      side,
      area: side * side,
      answer: side,
      scene,
    };
    variants[createVariantKey('square_perimeter_reverse', id)] = {
      key: createVariantKey('square_perimeter_reverse', id),
      kind: 'square_perimeter_reverse',
      variantId: id,
      template: 'rectangle',
      side,
      perimeter: 4 * side,
      answer: side,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.lShape, factor - 2);
    variants[createVariantKey('l_shape_area', id)] = createScaledShapeVariant(
      'l_shape_area',
      id,
      L_SHAPE_POINTS,
      factor,
      { answer: L_SHAPE_AREA * factor * factor, scene }
    );
    variants[createVariantKey('l_shape_perimeter', id)] = createScaledShapeVariant(
      'l_shape_perimeter',
      id,
      L_SHAPE_POINTS,
      factor,
      { answer: L_SHAPE_PERIMETER * factor, scene }
    );
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.lShape, factor - 2);
    const width = 8 * factor;
    const thickness = 2 * factor;
    const stemWidth = 4 * factor;
    const stemHeight = 5 * factor;
    const points = createTShapePoints(width, thickness, stemWidth, stemHeight);
    const area = width * thickness + stemWidth * stemHeight;
    const perimeter = 2 * (width + thickness + stemHeight);
    variants[createVariantKey('t_shape_area', id)] = {
      key: createVariantKey('t_shape_area', id),
      kind: 't_shape_area',
      variantId: id,
      template: 'coordinate_points',
      points,
      outline: points,
      topWidth: width,
      topThickness: thickness,
      stemWidth,
      stemHeight,
      answer: area,
      scene,
    };
    variants[createVariantKey('t_shape_perimeter', id)] = {
      key: createVariantKey('t_shape_perimeter', id),
      kind: 't_shape_perimeter',
      variantId: id,
      template: 'coordinate_points',
      points,
      outline: points,
      topWidth: width,
      topThickness: thickness,
      stemWidth,
      stemHeight,
      answer: perimeter,
      scene,
    };
    variants[createVariantKey('t_shape_area_reverse', id)] = {
      key: createVariantKey('t_shape_area_reverse', id),
      kind: 't_shape_area_reverse',
      variantId: id,
      template: 'coordinate_points',
      points,
      outline: points,
      topWidth: width,
      topThickness: thickness,
      stemWidth,
      stemHeight,
      area,
      answer: stemWidth,
      scene,
    };
    variants[createVariantKey('t_shape_perimeter_reverse', id)] = {
      key: createVariantKey('t_shape_perimeter_reverse', id),
      kind: 't_shape_perimeter_reverse',
      variantId: id,
      template: 'coordinate_points',
      points,
      outline: points,
      topWidth: width,
      topThickness: thickness,
      stemWidth,
      stemHeight,
      perimeter,
      answer: stemHeight,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.rectangle, factor - 2);
    const smallSide = 3 * factor;
    const largeSide = 6 * factor;
    const area = 15 * factor * factor;
    variants[createVariantKey('adjacent_squares_diagonal_area', id)] = {
      key: createVariantKey('adjacent_squares_diagonal_area', id),
      kind: 'adjacent_squares_diagonal_area',
      variantId: id,
      template: 'adjacent_squares_diagonal',
      small_side: smallSide,
      large_side: largeSide,
      answer: area,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.square, factor - 2);
    const smallSide = 3 * factor;
    const largeSide = 6 * factor;
    const area = 15 * factor * factor;
    variants[createVariantKey('adjacent_squares_diagonal_area_reverse', id)] = {
      key: createVariantKey('adjacent_squares_diagonal_area_reverse', id),
      kind: 'adjacent_squares_diagonal_area_reverse',
      variantId: id,
      template: 'adjacent_squares_diagonal',
      small_side: smallSide,
      large_side: largeSide,
      area,
      answer: smallSide,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `r${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.square, factor - 2);
    const smallSide = 4 * factor;
    const largeSide = 12 * factor;
    const area = 60 * factor * factor;
    variants[createVariantKey('adjacent_squares_diagonal_tall_area', id)] = {
      key: createVariantKey('adjacent_squares_diagonal_tall_area', id),
      kind: 'adjacent_squares_diagonal_tall_area',
      variantId: id,
      template: 'adjacent_squares_diagonal',
      small_side: smallSide,
      large_side: largeSide,
      answer: area,
      scene,
    };
    variants[createVariantKey('adjacent_squares_diagonal_tall_area_reverse', id)] = {
      key: createVariantKey('adjacent_squares_diagonal_tall_area_reverse', id),
      kind: 'adjacent_squares_diagonal_tall_area_reverse',
      variantId: id,
      template: 'adjacent_squares_diagonal',
      small_side: smallSide,
      large_side: largeSide,
      area,
      answer: smallSide,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.trapezoid, factor - 2);
    const topBase = 4 * factor;
    const bottomBase = 8 * factor;
    const height = 3 * factor;
    const area = TRAPEZOID_AREA * factor * factor;
    variants[createVariantKey('trapezoid_area', id)] = {
      key: createVariantKey('trapezoid_area', id),
      kind: 'trapezoid_area',
      variantId: id,
      template: 'coordinate_points',
      points: scalePoints(TRAPEZOID_POINTS, factor),
      outline: scalePoints(TRAPEZOID_POINTS.slice(0, 4), factor),
      topBase,
      bottomBase,
      height,
      answer: area,
      scene,
    };
    variants[createVariantKey('trapezoid_area_reverse', id)] = {
      key: createVariantKey('trapezoid_area_reverse', id),
      kind: 'trapezoid_area_reverse',
      variantId: id,
      template: 'coordinate_points',
      points: scalePoints(TRAPEZOID_POINTS, factor),
      outline: scalePoints(TRAPEZOID_POINTS.slice(0, 4), factor),
      topBase,
      bottomBase,
      height,
      area,
      answer: topBase,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.parallelogram, factor - 2);
    const base = 8 * factor;
    const side = 5 * factor;
    const height = 2.5 * factor;
    const area = 20 * factor * factor;
    variants[createVariantKey('parallelogram_area', id)] = {
      key: createVariantKey('parallelogram_area', id),
      kind: 'parallelogram_area',
      variantId: id,
      template: 'parallelogram',
      base,
      side,
      angle: 30,
      height,
      answer: area,
      scene,
    };
    variants[createVariantKey('parallelogram_perimeter', id)] = {
      key: createVariantKey('parallelogram_perimeter', id),
      kind: 'parallelogram_perimeter',
      variantId: id,
      template: 'parallelogram',
      base,
      side,
      angle: 30,
      height,
      answer: 2 * (base + side),
      scene,
    };
    variants[createVariantKey('parallelogram_area_reverse', id)] = {
      key: createVariantKey('parallelogram_area_reverse', id),
      kind: 'parallelogram_area_reverse',
      variantId: id,
      template: 'parallelogram',
      base,
      side,
      angle: 30,
      height,
      area,
      answer: height,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.triangle, factor - 2);
    const legA = 6 * factor;
    const legB = 8 * factor;
    const hypotenuse = 10 * factor;
    const points = scalePoints(TRIANGLE_POINTS, factor);
    const area = TRIANGLE_AREA * factor * factor;
    const perimeter = TRIANGLE_PERIMETER * factor;
    variants[createVariantKey('triangle_area', id)] = {
      key: createVariantKey('triangle_area', id),
      kind: 'triangle_area',
      variantId: id,
      template: 'triangle',
      points,
      outline: points,
      legA,
      legB,
      hypotenuse,
      answer: area,
      scene,
    };
    variants[createVariantKey('triangle_perimeter', id)] = {
      key: createVariantKey('triangle_perimeter', id),
      kind: 'triangle_perimeter',
      variantId: id,
      template: 'triangle',
      points,
      outline: points,
      legA,
      legB,
      hypotenuse,
      answer: perimeter,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((radius) => {
    const id = `r${radius}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.circle, radius - 2);
    variants[createVariantKey('circle_area', id)] = {
      key: createVariantKey('circle_area', id),
      kind: 'circle_area',
      variantId: id,
      template: 'circle',
      radius,
      answer: radius * radius * Math.PI,
      scene,
    };
    variants[createVariantKey('circle_circumference', id)] = {
      key: createVariantKey('circle_circumference', id),
      kind: 'circle_circumference',
      variantId: id,
      template: 'circle',
      radius,
      answer: 2 * radius * Math.PI,
      scene,
    };
    variants[createVariantKey('circle_area_reverse', id)] = {
      key: createVariantKey('circle_area_reverse', id),
      kind: 'circle_area_reverse',
      variantId: id,
      template: 'circle',
      radius,
      area: radius * radius * Math.PI,
      answer: radius,
      scene,
    };
    variants[createVariantKey('circle_circumference_reverse', id)] = {
      key: createVariantKey('circle_circumference_reverse', id),
      kind: 'circle_circumference_reverse',
      variantId: id,
      template: 'circle',
      radius,
      circumference: 2 * radius * Math.PI,
      answer: radius,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.annulus, factor - 2);
    const outerRadius = 6 * factor;
    const innerRadius = 3 * factor;
    const area = 27 * Math.PI * factor * factor;
    variants[createVariantKey('circle_annulus_area', id)] = {
      key: createVariantKey('circle_annulus_area', id),
      kind: 'circle_annulus_area',
      variantId: id,
      template: 'circle_annulus',
      outerRadius,
      innerRadius,
      answer: area,
      scene,
    };
    variants[createVariantKey('circle_annulus_area_reverse', id)] = {
      key: createVariantKey('circle_annulus_area_reverse', id),
      kind: 'circle_annulus_area_reverse',
      variantId: id,
      template: 'circle_annulus',
      outerRadius,
      innerRadius,
      area,
      answer: innerRadius,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = pickScene(AREA_PERIMETER_SCENES.sector, factor - 2);
    const radius = 6 * factor;
    const angle = 120;
    const area = 12 * Math.PI * factor * factor;
    variants[createVariantKey('sector_area', id)] = {
      key: createVariantKey('sector_area', id),
      kind: 'sector_area',
      variantId: id,
      template: 'circle_sector',
      radius,
      angle,
      answer: area,
      scene,
    };
    variants[createVariantKey('sector_area_reverse', id)] = {
      key: createVariantKey('sector_area_reverse', id),
      kind: 'sector_area_reverse',
      variantId: id,
      template: 'circle_sector',
      radius,
      angle,
      area,
      answer: radius,
      scene,
    };
  });

  return variants;
}

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
  t_shape_area: {
    kind: 't_shape_area',
    template: 'coordinate_points',
    points: createTShapePoints(16, 4, 8, 10),
    outline: createTShapePoints(16, 4, 8, 10),
    topWidth: 16,
    topThickness: 4,
    stemWidth: 8,
    stemHeight: 10,
    answer: 16 * 4 + 8 * 10,
  },
  t_shape_perimeter: {
    kind: 't_shape_perimeter',
    template: 'coordinate_points',
    points: createTShapePoints(16, 4, 8, 10),
    outline: createTShapePoints(16, 4, 8, 10),
    topWidth: 16,
    topThickness: 4,
    stemWidth: 8,
    stemHeight: 10,
    answer: 2 * (16 + 4 + 10),
  },
  t_shape_area_reverse: {
    kind: 't_shape_area_reverse',
    template: 'coordinate_points',
    points: createTShapePoints(16, 4, 8, 10),
    outline: createTShapePoints(16, 4, 8, 10),
    topWidth: 16,
    topThickness: 4,
    stemWidth: 8,
    stemHeight: 10,
    area: 16 * 4 + 8 * 10,
    answer: 8,
  },
  t_shape_perimeter_reverse: {
    kind: 't_shape_perimeter_reverse',
    template: 'coordinate_points',
    points: createTShapePoints(16, 4, 8, 10),
    outline: createTShapePoints(16, 4, 8, 10),
    topWidth: 16,
    topThickness: 4,
    stemWidth: 8,
    stemHeight: 10,
    perimeter: 2 * (16 + 4 + 10),
    answer: 10,
  },
  adjacent_squares_diagonal_area: {
    kind: 'adjacent_squares_diagonal_area',
    template: 'adjacent_squares_diagonal',
    small_side: 6,
    large_side: 12,
    answer: 60,
  },
  adjacent_squares_diagonal_area_reverse: {
    kind: 'adjacent_squares_diagonal_area_reverse',
    template: 'adjacent_squares_diagonal',
    small_side: 6,
    large_side: 12,
    area: 60,
    answer: 6,
  },
  adjacent_squares_diagonal_tall_area: {
    kind: 'adjacent_squares_diagonal_tall_area',
    template: 'adjacent_squares_diagonal',
    small_side: 4,
    large_side: 12,
    answer: 60,
  },
  adjacent_squares_diagonal_tall_area_reverse: {
    kind: 'adjacent_squares_diagonal_tall_area_reverse',
    template: 'adjacent_squares_diagonal',
    small_side: 4,
    large_side: 12,
    area: 60,
    answer: 4,
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
  trapezoid_area_reverse: {
    kind: 'trapezoid_area_reverse',
    template: 'coordinate_points',
    points: TRAPEZOID_POINTS,
    outline: TRAPEZOID_POINTS.slice(0, 4),
    topBase: 4,
    bottomBase: 8,
    height: 3,
    area: TRAPEZOID_AREA,
    answer: 4,
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
  parallelogram_area_reverse: {
    kind: 'parallelogram_area_reverse',
    template: 'parallelogram',
    base: 8,
    side: 5,
    angle: 30,
    height: 2.5,
    area: 20,
    answer: 2.5,
  },
  triangle_area: {
    kind: 'triangle_area',
    template: 'triangle',
    points: TRIANGLE_POINTS,
    outline: TRIANGLE_POINTS,
    legA: 6,
    legB: 8,
    hypotenuse: 10,
    answer: TRIANGLE_AREA,
  },
  triangle_perimeter: {
    kind: 'triangle_perimeter',
    template: 'triangle',
    points: TRIANGLE_POINTS,
    outline: TRIANGLE_POINTS,
    legA: 6,
    legB: 8,
    hypotenuse: 10,
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
  circle_annulus_area_reverse: {
    kind: 'circle_annulus_area_reverse',
    template: 'circle_annulus',
    outerRadius: 6,
    innerRadius: 3,
    area: 27 * Math.PI,
    answer: 3,
  },
  sector_area: {
    kind: 'sector_area',
    template: 'circle_sector',
    radius: 6,
    angle: 120,
    answer: 12 * Math.PI,
  },
  sector_area_reverse: {
    kind: 'sector_area_reverse',
    template: 'circle_sector',
    radius: 6,
    angle: 120,
    area: 12 * Math.PI,
    answer: 6,
  },
};

Object.assign(AREA_PERIMETER_VARIANT_LIBRARY, buildAreaPerimeterVariantExtras(), buildCompositeAreaPerimeterVariantExtras());

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function approxEqual(a, b, epsilon = 1e-9) {
  return Math.abs(a - b) <= epsilon;
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

function buildVariantPool(difficulty) {
  const families = new Set(getDifficultyFamilies(difficulty));
  return Object.entries(AREA_PERIMETER_VARIANT_LIBRARY)
    .filter(([, variant]) => families.has(variant.kind) && variant.variantId != null)
    .map(([key, variant]) => ({ key, ...variant }));
}

function getVarietyStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      return globalThis.localStorage;
    }
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

function shuffleKinds(pool) {
  const items = [...new Set(pool.filter(Boolean))];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function buildKindSelectionOrder(kinds, recentKinds) {
  const uniqueKinds = [...new Set(kinds.filter(Boolean))];
  if (uniqueKinds.length === 0) return [];

  const usageCounts = new Map();
  for (const kind of recentKinds ?? []) {
    if (!kind) continue;
    usageCounts.set(kind, (usageCounts.get(kind) ?? 0) + 1);
  }

  const buckets = new Map();
  for (const kind of uniqueKinds) {
    const count = usageCounts.get(kind) ?? 0;
    if (!buckets.has(count)) buckets.set(count, []);
    buckets.get(count).push(kind);
  }

  const ordered = [];
  [...buckets.keys()].sort((a, b) => a - b).forEach((count) => {
    ordered.push(...shuffleKinds(buckets.get(count)));
  });
  return ordered;
}

function rotateKinds(pool, count, recentKeys) {
  const uniquePool = Array.from(new Set(pool.filter(Boolean)));
  const targetCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (uniquePool.length === 0 || targetCount === 0) return [];

  const ordered = buildKindSelectionOrder(uniquePool, recentKeys);

  const selected = [];
  while (selected.length < targetCount) {
    selected.push(...ordered);
  }
  return selected.slice(0, targetCount);
}

function rotateVariantsByKind(variantPool, count, recentKinds) {
  const targetCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (!Array.isArray(variantPool) || variantPool.length === 0 || targetCount === 0) return [];

  const kindBuckets = new Map();
  for (const variant of variantPool) {
    if (!variant?.kind || !variant?.key) continue;
    if (!kindBuckets.has(variant.kind)) kindBuckets.set(variant.kind, []);
    kindBuckets.get(variant.kind).push(variant);
  }

  const orderedKinds = buildKindSelectionOrder([...kindBuckets.keys()], recentKinds);
  const kindIndices = new Map();
  const selected = [];

  while (selected.length < targetCount) {
    let progressed = false;
    for (const kind of orderedKinds) {
      if (selected.length >= targetCount) break;
      const bucket = kindBuckets.get(kind) ?? [];
      const index = kindIndices.get(kind) ?? 0;
      if (index >= bucket.length) continue;
      selected.push(bucket[index]);
      kindIndices.set(kind, index + 1);
      progressed = true;
    }
    if (!progressed) break;
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

function buildSceneQuestionText(item, lang) {
  const zh = lang === 'zh';
  const sceneZh = String(item.scene?.zh ?? '').trim();
  const sceneEn = String(item.scene?.en ?? '').trim();

  switch (item.kind) {
    case 'rectangle_area':
      return zh
        ? `在一个长方形${sceneZh || '区域'} ABCD 中，AB = ${item.width} cm，BC = ${item.height} cm。求这个${sceneZh || '图形'}的面积。`
        : `In a rectangular ${sceneEn || 'region'} ABCD, AB = ${item.width} cm and BC = ${item.height} cm. Find the area of the rectangle.`;
    case 'rectangle_perimeter':
      return zh
        ? `在一个长方形${sceneZh || '区域'} ABCD 中，AB = ${item.width} cm，BC = ${item.height} cm。求这个${sceneZh || '图形'}的周长。`
        : `In a rectangular ${sceneEn || 'region'} ABCD, AB = ${item.width} cm and BC = ${item.height} cm. Find the perimeter of the rectangle.`;
    case 'square_area':
      return zh
        ? `一块正方形${sceneZh || '区域'}的边长是 ${item.side} cm。求它的面积。`
        : `A square ${sceneEn || 'region'} has side length ${item.side} cm. Find its area.`;
    case 'square_perimeter':
      return zh
        ? `一块正方形${sceneZh || '区域'}的边长是 ${item.side} cm。求它的周长。`
        : `A square ${sceneEn || 'region'} has side length ${item.side} cm. Find its perimeter.`;
    case 'rectangle_area_reverse':
      return zh
        ? `在一个长方形${sceneZh || '区域'} ABCD 中，面积是 ${formatArea(item.area)}，AB = ${item.width} cm。求 BC。`
        : `In a rectangular ${sceneEn || 'region'} ABCD, the area is ${formatArea(item.area)} and AB = ${item.width} cm. Find BC.`;
    case 'rectangle_perimeter_reverse':
      return zh
        ? `在一个长方形${sceneZh || '区域'} ABCD 中，周长是 ${formatLength(item.perimeter)}，AB = ${item.width} cm。求 BC。`
        : `In a rectangular ${sceneEn || 'region'} ABCD, the perimeter is ${formatLength(item.perimeter)} and AB = ${item.width} cm. Find BC.`;
    case 'square_area_reverse':
      return zh
        ? `一块正方形${sceneZh || '区域'}的面积是 ${formatArea(item.area)}。求边长。`
        : `A square ${sceneEn || 'region'} has area ${formatArea(item.area)}. Find the side length.`;
    case 'square_perimeter_reverse':
      return zh
        ? `一块正方形${sceneZh || '区域'}的周长是 ${formatLength(item.perimeter)}。求边长。`
        : `A square ${sceneEn || 'region'} has perimeter ${formatLength(item.perimeter)}. Find the side length.`;
    case 'l_shape_area':
      return zh
        ? `如图，一个L形${sceneZh || '区域'}是由大矩形挖去一块小矩形得到的。求阴影部分的面积。`
        : `As shown, an L-shaped ${sceneEn || 'region'} is made by cutting a smaller rectangle out of a larger one. Find the shaded area.`;
    case 'l_shape_perimeter':
      return zh
        ? `如图，一个L形${sceneZh || '区域'}是由大矩形挖去一块小矩形得到的。求这个图形的周长。`
        : `As shown, an L-shaped ${sceneEn || 'region'} is made by cutting a smaller rectangle out of a larger one. Find the perimeter of the shape.`;
    case 't_shape_area':
      return zh
        ? `如图，一个T形${sceneZh || '区域'}由顶板和立柱组成。顶板宽 ${item.topWidth} cm，厚 ${item.topThickness} cm；立柱宽 ${item.stemWidth} cm，高 ${item.stemHeight} cm。求面积。`
        : `As shown, a T-shaped ${sceneEn || 'region'} is made of a top bar and a stem. The top bar is ${item.topWidth} cm wide, ${item.topThickness} cm thick, the stem is ${item.stemWidth} cm wide and ${item.stemHeight} cm tall. Find the area.`;
    case 't_shape_perimeter':
      return zh
        ? `如图，一个T形${sceneZh || '区域'}由顶板和立柱组成。顶板宽 ${item.topWidth} cm，厚 ${item.topThickness} cm；立柱宽 ${item.stemWidth} cm，高 ${item.stemHeight} cm。求周长。`
        : `As shown, a T-shaped ${sceneEn || 'region'} is made of a top bar and a stem. The top bar is ${item.topWidth} cm wide, ${item.topThickness} cm thick, the stem is ${item.stemWidth} cm wide and ${item.stemHeight} cm tall. Find the perimeter.`;
    case 't_shape_area_reverse':
      return zh
        ? `如图，一个T形${sceneZh || '区域'}的面积为 ${formatArea(item.area)}。顶板宽 ${item.topWidth} cm，厚 ${item.topThickness} cm，立柱高 ${item.stemHeight} cm。求立柱宽。`
        : `As shown, a T-shaped ${sceneEn || 'region'} has area ${formatArea(item.area)}. The top bar is ${item.topWidth} cm wide, ${item.topThickness} cm thick, and the stem is ${item.stemHeight} cm tall. Find the stem width.`;
    case 't_shape_perimeter_reverse':
      return zh
        ? `如图，一个T形${sceneZh || '区域'}的周长为 ${formatLength(item.perimeter)}。顶板宽 ${item.topWidth} cm，厚 ${item.topThickness} cm，立柱宽 ${item.stemWidth} cm。求立柱高。`
        : `As shown, a T-shaped ${sceneEn || 'region'} has perimeter ${formatLength(item.perimeter)}. The top bar is ${item.topWidth} cm wide, ${item.topThickness} cm thick, and the stem is ${item.stemWidth} cm wide. Find the stem height.`;
    case 'trapezoid_area':
      return zh
        ? `如图，一个梯形${sceneZh || '区域'}的上底是 ${item.topBase} cm，下底是 ${item.bottomBase} cm，高是 ${item.height} cm。求这个梯形的面积。`
        : `As shown, a trapezoid ${sceneEn || 'region'} has top base ${item.topBase} cm, bottom base ${item.bottomBase} cm, and height ${item.height} cm. Find the area.`;
    case 'trapezoid_area_reverse':
      return zh
        ? `如图，一个梯形${sceneZh || '区域'}的面积是 ${formatArea(item.area)}，下底是 ${item.bottomBase} cm，高是 ${item.height} cm。求上底。`
        : `As shown, a trapezoid ${sceneEn || 'region'} has area ${formatArea(item.area)}, bottom base ${item.bottomBase} cm, and height ${item.height} cm. Find the top base.`;
    case 'parallelogram_area':
      return zh
        ? `如图，一个平行四边形${sceneZh || '区域'}的底是 ${item.base} cm，高是 ${item.height} cm。求面积。`
        : `As shown, a parallelogram ${sceneEn || 'region'} has base ${item.base} cm and height ${item.height} cm. Find the area.`;
    case 'parallelogram_perimeter':
      return zh
        ? `如图，一个平行四边形${sceneZh || '区域'}的底是 ${item.base} cm，边长是 ${item.side} cm。求周长。`
        : `As shown, a parallelogram ${sceneEn || 'region'} has base ${item.base} cm and side length ${item.side} cm. Find the perimeter.`;
    case 'parallelogram_area_reverse':
      return zh
        ? `如图，一个平行四边形${sceneZh || '区域'}的面积是 ${formatArea(item.area)}，底是 ${item.base} cm。求高。`
        : `As shown, a parallelogram ${sceneEn || 'region'} has area ${formatArea(item.area)} and base ${item.base} cm. Find the height.`;
    case 'triangle_area':
      return zh
        ? `如图，一个直角三角形${sceneZh || '支架'} ABC 的两直角边分别是 ${item.legA} cm 和 ${item.legB} cm。求面积。`
        : `As shown, a right triangle ${sceneEn || 'frame'} ABC has legs ${item.legA} cm and ${item.legB} cm. Find the area.`;
    case 'triangle_perimeter':
      return zh
        ? `如图，一个直角三角形${sceneZh || '支架'} ABC 的两直角边分别是 ${item.legA} cm 和 ${item.legB} cm，斜边是 ${item.hypotenuse} cm。求周长。`
        : `As shown, a right triangle ${sceneEn || 'frame'} ABC has legs ${item.legA} cm and ${item.legB} cm, and hypotenuse ${item.hypotenuse} cm. Find the perimeter.`;
    case 'circle_annulus_area':
      return zh
        ? `如图，一个圆环${sceneZh || '区域'}的外半径是 ${item.outerRadius} cm，内半径是 ${item.innerRadius} cm。求阴影部分面积。`
        : `As shown, a circular annulus ${sceneEn || 'region'} has outer radius ${item.outerRadius} cm and inner radius ${item.innerRadius} cm. Find the shaded area.`;
    case 'circle_annulus_area_reverse':
      return zh
        ? `如图，一个圆环${sceneZh || '区域'}的面积是 ${formatPiMultiple(item.area, ' cm²')}，外半径是 ${item.outerRadius} cm。求内半径。`
        : `As shown, a circular annulus ${sceneEn || 'region'} has area ${formatPiMultiple(item.area, ' cm²')} and outer radius ${item.outerRadius} cm. Find the inner radius.`;
    case 'sector_area':
      return zh
        ? `如图，一个扇形${sceneZh || '区域'}的半径是 ${item.radius} cm，圆心角是 ${item.angle}°。求面积。`
        : `As shown, a sector ${sceneEn || 'region'} has radius ${item.radius} cm and central angle ${item.angle}°. Find the area.`;
    case 'sector_area_reverse':
      return zh
        ? `如图，一个扇形${sceneZh || '区域'}的面积是 ${formatPiMultiple(item.area, ' cm²')}，圆心角是 ${item.angle}°。求半径。`
        : `As shown, a sector ${sceneEn || 'region'} has area ${formatPiMultiple(item.area, ' cm²')} and central angle ${item.angle}°. Find the radius.`;
    default:
      return '';
  }
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
  const sceneQuestion = buildSceneQuestionText(item, lang);
  if (sceneQuestion) return sceneQuestion;
  if (COMPOSITE_AREA_PERIMETER_KINDS.includes(item.kind)) {
    const compositeQuestion = buildCompositeAreaPerimeterQuestionText(item, lang);
    if (compositeQuestion) return compositeQuestion;
  }
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
    case 'adjacent_squares_diagonal_area':
      return zh
        ? `如图，左边正方形边长 ${item.small_side} cm，右边正方形边长 ${item.large_side} cm，斜线从左下角连到右上角。求阴影部分面积。`
        : `As shown, the left square has side ${item.small_side} cm and the right square has side ${item.large_side} cm. A diagonal joins the bottom-left corner to the top-right corner. Find the shaded area.`;
    case 'adjacent_squares_diagonal_area_reverse':
      return zh
        ? `如图，两个正方形从左到右相邻摆放，右边正方形边长是左边的 2 倍。阴影部分面积是 ${formatArea(item.area)}，求左边正方形边长。`
        : `As shown, two squares sit side by side and the right square has side length twice the left. The shaded area is ${formatArea(item.area)}. Find the left square's side length.`;
    case 'adjacent_squares_diagonal_tall_area':
      return zh
        ? `如图，左边正方形边长 ${item.small_side} cm，右边正方形边长 ${item.large_side} cm（是左边的 3 倍），斜线从左下角连到右上角。求阴影部分面积。`
        : `As shown, the left square has side ${item.small_side} cm and the right square has side ${item.large_side} cm (three times as long). A diagonal joins the bottom-left corner to the top-right corner. Find the shaded area.`;
    case 'adjacent_squares_diagonal_tall_area_reverse':
      return zh
        ? `如图，两个正方形从左到右相邻摆放，右边正方形边长是左边的 3 倍。阴影部分面积是 ${formatArea(item.area)}，求左边正方形边长。`
        : `As shown, two squares sit side by side and the right square has side length three times the left. The shaded area is ${formatArea(item.area)}. Find the left square's side length.`;
    case 'trapezoid_area':
      return zh
        ? `如图，梯形的上底为 ${item.topBase} cm，下底为 ${item.bottomBase} cm，高为 ${item.height} cm。求梯形的面积。`
        : `In the figure, the trapezoid has top base ${item.topBase} cm, bottom base ${item.bottomBase} cm, and height ${item.height} cm. Find the area.`;
    case 'trapezoid_area_reverse':
      return zh
        ? `如图，梯形的面积是 ${formatArea(item.area)}，下底为 ${item.bottomBase} cm，高为 ${item.height} cm。求上底的长度。`
        : `In the figure, the trapezoid area is ${formatArea(item.area)}, the bottom base is ${item.bottomBase} cm, and the height is ${item.height} cm. Find the top base length.`;
    case 'parallelogram_area':
      return zh
        ? `如图，平行四边形的底为 ${item.base} cm，高为 ${item.height} cm。求平行四边形的面积。`
        : `In the figure, the parallelogram has base ${item.base} cm and height ${item.height} cm. Find the area.`;
    case 'parallelogram_perimeter':
      return zh
        ? `如图，平行四边形的底为 ${item.base} cm，边长为 ${item.side} cm。求平行四边形的周长。`
        : `In the figure, the parallelogram has base ${item.base} cm and side length ${item.side} cm. Find the perimeter.`;
    case 'parallelogram_area_reverse':
      return zh
        ? `如图，平行四边形的面积是 ${formatArea(item.area)}，底为 ${item.base} cm。求高。`
        : `In the figure, the parallelogram area is ${formatArea(item.area)} and the base is ${item.base} cm. Find the height.`;
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
    case 'circle_annulus_area_reverse':
      return zh
        ? `如图，圆环的阴影面积是 ${formatPiMultiple(item.area, ' cm²')}，外半径为 ${item.outerRadius} cm。求内半径。`
        : `In the figure, the annulus area is ${formatPiMultiple(item.area, ' cm²')} and the outer radius is ${item.outerRadius} cm. Find the inner radius.`;
    case 'sector_area':
      return zh
        ? `如图，扇形的半径为 ${item.radius} cm，圆心角为 ${item.angle}°。求扇形面积。`
        : `In the figure, the sector has radius ${item.radius} cm and central angle ${item.angle}°. Find the sector area.`;
    case 'sector_area_reverse':
      return zh
        ? `如图，扇形的面积是 ${formatPiMultiple(item.area, ' cm²')}，圆心角为 ${item.angle}°。求半径。`
        : `In the figure, the sector area is ${formatPiMultiple(item.area, ' cm²')} and the central angle is ${item.angle}°. Find the radius.`;
    default:
      return '';
  }
}

function buildAreaPerimeterRenderContract(item) {
  if (COMPOSITE_AREA_PERIMETER_KINDS.includes(item.kind)) {
    const compositeContract = buildCompositeAreaPerimeterRenderContract(item);
    if (Array.isArray(compositeContract.questionIncludes) && Array.isArray(compositeContract.diagramIncludes) && compositeContract.questionIncludes.length > 0) {
      return compositeContract;
    }
  }
  const width = formatLength(item.width);
  const height = formatLength(item.height);
  const side = formatLength(item.side);
  const area = formatArea(item.area ?? item.answer);
  const perimeter = formatLength(item.perimeter ?? item.answer);

  switch (item.kind) {
    case 'rectangle_area':
      return {
        questionIncludes: ['长方形', `AB = ${width}`, `BC = ${height}`],
        diagramIncludes: ['"template":"rectangle"', `"label_width":"${width}"`, `"label_height":"${height}"`, '"label_area":"?"'],
      };
    case 'rectangle_perimeter':
      return {
        questionIncludes: ['长方形', `AB = ${width}`, `BC = ${height}`],
        diagramIncludes: ['"template":"rectangle"', `"label_width":"${width}"`, `"label_height":"${height}"`, '"label_perimeter":"?"'],
      };
    case 'square_area':
      return {
        questionIncludes: ['正方形', `边长为 ${side}`],
        diagramIncludes: ['"template":"rectangle"', `"label_width":"${side}"`, `"label_height":"${side}"`, '"label_area":"?"'],
      };
    case 'square_perimeter':
      return {
        questionIncludes: ['正方形', `边长为 ${side}`],
        diagramIncludes: ['"template":"rectangle"', `"label_width":"${side}"`, `"label_height":"${side}"`, '"label_perimeter":"?"'],
      };
    case 'rectangle_area_reverse':
      return {
        questionIncludes: ['长方形', area, `AB = ${width}`],
        diagramIncludes: ['"template":"rectangle"', `"label_area":"${area}"`, '"label_height":"?"'],
      };
    case 'rectangle_perimeter_reverse':
      return {
        questionIncludes: ['长方形', perimeter, `AB = ${width}`],
        diagramIncludes: ['"template":"rectangle"', `"label_perimeter":"${perimeter}"`, '"label_height":"?"'],
      };
    case 'square_area_reverse':
      return {
        questionIncludes: ['正方形', area],
        diagramIncludes: ['"template":"rectangle"', `"label_area":"${area}"`, '"label_width":"?"', '"label_height":"?"'],
      };
    case 'square_perimeter_reverse':
      return {
        questionIncludes: ['正方形', perimeter],
        diagramIncludes: ['"template":"rectangle"', `"label_perimeter":"${perimeter}"`, '"label_width":"?"', '"label_height":"?"'],
      };
    case 'l_shape_area':
      return {
        questionIncludes: ['L 形', '面积'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_area":"?"'],
      };
    case 'l_shape_perimeter':
      return {
        questionIncludes: ['L 形', '周长'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_perimeter":"?"'],
      };
    case 't_shape_area':
      return {
        questionIncludes: ['T形', '面积'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_top_width":"', '"label_stem_width":"', '"label_area":"?"'],
      };
    case 't_shape_perimeter':
      return {
        questionIncludes: ['T形', '周长'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_top_width":"', '"label_stem_height":"', '"label_perimeter":"?"'],
      };
    case 't_shape_area_reverse':
      return {
        questionIncludes: ['T形', '面积', '立柱宽'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_area":"', '"label_stem_width":"?"'],
      };
    case 't_shape_perimeter_reverse':
      return {
        questionIncludes: ['T形', '周长', '立柱高'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_perimeter":"', '"label_stem_height":"?"'],
      };
    case 'adjacent_squares_diagonal_area':
      return {
        questionIncludes: ['左边正方形', '右边正方形', '阴影部分面积'],
        diagramIncludes: ['"template":"adjacent_squares_diagonal"', '"label_small_side"', '"label_large_side"', '"label_area":"?"'],
      };
    case 'adjacent_squares_diagonal_area_reverse':
      return {
        questionIncludes: ['正方形', '2 倍', '阴影部分面积'],
        diagramIncludes: ['"template":"adjacent_squares_diagonal"', '"label_small_side":"?"', '"label_large_side":"?"', `"label_area":"${formatArea(item.area)}"`],
      };
    case 'adjacent_squares_diagonal_tall_area':
      return {
        questionIncludes: ['左边正方形', '右边正方形', '3 倍', '阴影部分面积'],
        diagramIncludes: ['"template":"adjacent_squares_diagonal"', '"label_small_side"', '"label_large_side"', '"label_area":"?"'],
      };
    case 'adjacent_squares_diagonal_tall_area_reverse':
      return {
        questionIncludes: ['正方形', '3 倍', '阴影部分面积'],
        diagramIncludes: ['"template":"adjacent_squares_diagonal"', '"label_small_side":"?"', '"label_large_side":"?"', `"label_area":"${formatArea(item.area)}"`],
      };
    case 'trapezoid_area':
      return {
        questionIncludes: ['梯形', '面积'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', '"label_area":"?"'],
      };
    case 'trapezoid_area_reverse':
      return {
        questionIncludes: ['梯形', '面积', '求上底'],
        diagramIncludes: ['"template":"coordinate_points"', '"axes":false', `"label_area":"${area}"`, '"label_top_base":"?"'],
      };
    case 'parallelogram_area':
      return {
        questionIncludes: ['平行四边形', '面积'],
        diagramIncludes: ['"template":"parallelogram"', '"label_area":"?"'],
      };
    case 'parallelogram_perimeter':
      return {
        questionIncludes: ['平行四边形', '周长'],
        diagramIncludes: ['"template":"parallelogram"', '"label_perimeter":"?"'],
      };
    case 'parallelogram_area_reverse':
      return {
        questionIncludes: ['平行四边形', '面积', '求高'],
        diagramIncludes: ['"template":"parallelogram"', `"label_area":"${area}"`, '"label_height":"?"'],
      };
    case 'triangle_area':
      return {
        questionIncludes: ['直角三角形', '面积'],
        diagramIncludes: ['"template":"triangle"', '"label_area":"?"'],
      };
    case 'triangle_perimeter':
      return {
        questionIncludes: ['直角三角形', '周长'],
        diagramIncludes: ['"template":"triangle"', '"label_perimeter":"?"'],
      };
    case 'circle_annulus_area':
      return {
        questionIncludes: ['圆环', '面积'],
        diagramIncludes: ['"template":"circle_annulus"', '"label_area":"?"'],
      };
    case 'circle_annulus_area_reverse':
      return {
        questionIncludes: ['圆环', '面积', '求内半径'],
        diagramIncludes: ['"template":"circle_annulus"', `"label_area":"${formatPiMultiple(item.area, ' cm²')}"`, '"label_inner_radius":"?"'],
      };
    case 'sector_area':
      return {
        questionIncludes: ['扇形', '面积'],
        diagramIncludes: ['"template":"circle_sector"', '"label_area":"?"'],
      };
    case 'sector_area_reverse':
      return {
        questionIncludes: ['扇形', '面积', '求半径'],
        diagramIncludes: ['"template":"circle_sector"', `"label_area":"${formatPiMultiple(item.area, ' cm²')}"`, '"label_radius":"?"'],
      };
    default:
      return {};
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

  if (item.kind === 't_shape_area' || item.kind === 't_shape_perimeter' || item.kind === 't_shape_area_reverse' || item.kind === 't_shape_perimeter_reverse') {
    const segments = [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'D'],
      ['D', 'E'],
      ['E', 'F'],
      ['F', 'G'],
      ['G', 'H'],
      ['H', 'A'],
    ].map(([from, to]) => ({ from, to, label: edgeLabel(outline, from, to) }));

    if (item.kind === 't_shape_area_reverse') {
      segments[4] = { ...segments[4], label: '?' };
    }
    if (item.kind === 't_shape_perimeter_reverse') {
      segments[3] = { ...segments[3], label: '?' };
    }

    return {
      ...spec,
      topWidth: item.topWidth,
      topThickness: item.topThickness,
      stemWidth: item.kind === 't_shape_area_reverse' ? '?' : item.stemWidth,
      stemHeight: item.kind === 't_shape_perimeter_reverse' ? '?' : item.stemHeight,
      segments,
      label_top_width: formatLength(item.topWidth),
      label_top_thickness: formatLength(item.topThickness),
      label_stem_width: item.kind === 't_shape_area_reverse' ? '?' : formatLength(item.stemWidth),
      label_stem_height: item.kind === 't_shape_perimeter_reverse' ? '?' : formatLength(item.stemHeight),
      label_area: item.kind === 't_shape_area' ? '?' : item.kind === 't_shape_area_reverse' ? formatArea(item.area) : undefined,
      label_perimeter: item.kind === 't_shape_perimeter' ? '?' : item.kind === 't_shape_perimeter_reverse' ? formatLength(item.perimeter) : undefined,
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

  if (item.kind === 'trapezoid_area_reverse') {
    return {
      ...spec,
      topBase: '?',
      bottomBase: item.bottomBase,
      height: item.height,
      label_top_base: '?',
      segments: [
        { from: 'A', to: 'B', label: formatLength(item.bottomBase) },
        { from: 'B', to: 'C', label: '' },
        { from: 'C', to: 'D', label: '?' },
        { from: 'D', to: 'A', label: '' },
        { from: 'D', to: 'H', dash: true, label: formatLength(item.height) },
      ],
      angleMarks: [
        { vertex: 'H', from: 'D', to: 'B', right: true, r: 9 },
      ],
      label_area: formatArea(item.area),
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
  if (item.kind === 'parallelogram_area_reverse') {
    return { ...spec, label_height: '?', label_area: formatArea(item.area) };
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
  const isReverse = item.kind === 'circle_annulus_area_reverse';
  return {
    template: 'circle_annulus',
    outer_radius: item.outerRadius,
    inner_radius: item.innerRadius,
    label_O: 'O',
    label_A: 'A',
    label_B: 'B',
    label_outer_radius: formatLength(item.outerRadius),
    label_inner_radius: isReverse ? '?' : formatLength(item.innerRadius),
    label_area: isReverse ? formatPiMultiple(item.area, ' cm²') : '?',
  };
}

function buildSectorSpec(item) {
  const isReverse = item.kind === 'sector_area_reverse';
  return {
    template: 'circle_sector',
    radius: item.radius,
    angle: item.angle,
    label_O: 'O',
    label_A: 'A',
    label_B: 'B',
    label_radius: isReverse ? '?' : formatLength(item.radius),
    label_angle: `${item.angle}°`,
    label_area: isReverse ? formatPiMultiple(item.area, ' cm²') : '?',
  };
}

function buildDiagramSpec(item) {
  if (COMPOSITE_AREA_PERIMETER_KINDS.includes(item.kind)) {
    const compositeSpec = buildCompositeAreaPerimeterDiagramSpec(item);
    if (compositeSpec && Object.keys(compositeSpec).length > 0) return compositeSpec;
  }
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
    case 't_shape_area':
    case 't_shape_perimeter':
    case 't_shape_area_reverse':
    case 't_shape_perimeter_reverse':
      return buildCoordinateSpec(item);
    case 'adjacent_squares_diagonal_area':
      return {
        template: 'adjacent_squares_diagonal',
        small_side: item.small_side,
        large_side: item.large_side,
        label_small_side: formatLength(item.small_side),
        label_large_side: formatLength(item.large_side),
        label_area: '?',
      };
    case 'adjacent_squares_diagonal_area_reverse':
      return {
        template: 'adjacent_squares_diagonal',
        small_side: item.small_side,
        large_side: item.large_side,
        label_small_side: '?',
        label_large_side: '?',
        label_area: formatArea(item.area),
      };
    case 'adjacent_squares_diagonal_tall_area':
      return {
        template: 'adjacent_squares_diagonal',
        small_side: item.small_side,
        large_side: item.large_side,
        label_small_side: formatLength(item.small_side),
        label_large_side: formatLength(item.large_side),
        label_area: '?',
      };
    case 'adjacent_squares_diagonal_tall_area_reverse':
      return {
        template: 'adjacent_squares_diagonal',
        small_side: item.small_side,
        large_side: item.large_side,
        label_small_side: '?',
        label_large_side: '?',
        label_area: formatArea(item.area),
      };
    case 'trapezoid_area':
    case 'trapezoid_area_reverse':
      return buildCoordinateSpec(item);
    case 'parallelogram_area':
    case 'parallelogram_perimeter':
    case 'parallelogram_area_reverse':
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
    case 'circle_annulus_area_reverse':
      return buildCircleAnnulusSpec(item);
    case 'sector_area':
    case 'sector_area_reverse':
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

  const supportedKind = Object.values(AREA_PERIMETER_VARIANT_LIBRARY).some((variant) => variant?.kind === item.kind);
  if (!supportedKind) {
    issues.push(`unsupported kind: ${String(item.kind)}`);
    return issues;
  }

  if (COMPOSITE_AREA_PERIMETER_KINDS.includes(item.kind)) {
    return validateCompositeAreaPerimeterItem(item);
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
    case 't_shape_area':
      if (polygonArea(item.outline ?? item.points) !== item.answer) issues.push('T-shape area answer mismatch');
      break;
    case 't_shape_perimeter':
      if (Math.round(polygonPerimeter(item.outline ?? item.points) * 100) / 100 !== Math.round(item.answer * 100) / 100) issues.push('T-shape perimeter answer mismatch');
      break;
    case 't_shape_area_reverse':
      if (polygonArea(item.outline ?? item.points) !== item.area) issues.push('T-shape reverse area data mismatch');
      if (item.answer !== item.stemWidth) issues.push('T-shape reverse area answer mismatch');
      break;
    case 't_shape_perimeter_reverse':
      if (Math.round(polygonPerimeter(item.outline ?? item.points) * 100) / 100 !== Math.round(item.perimeter * 100) / 100) issues.push('T-shape reverse perimeter data mismatch');
      if (item.answer !== item.stemHeight) issues.push('T-shape reverse perimeter answer mismatch');
      break;
    case 'adjacent_squares_diagonal_area':
      if (!isFinitePositiveNumber(item.small_side) || !isFinitePositiveNumber(item.large_side) || item.large_side !== item.small_side * 2) issues.push('adjacent squares data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, (5 / 3) * item.small_side * item.small_side)) issues.push('adjacent squares diagonal area answer mismatch');
      break;
    case 'adjacent_squares_diagonal_area_reverse':
      if (!isFinitePositiveNumber(item.small_side) || !isFinitePositiveNumber(item.large_side) || item.large_side !== item.small_side * 2 || !isFinitePositiveNumber(item.area)) issues.push('adjacent squares reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, (5 / 3) * item.small_side * item.small_side)) issues.push('adjacent squares diagonal reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.small_side)) issues.push('adjacent squares diagonal reverse answer mismatch');
      break;
    case 'adjacent_squares_diagonal_tall_area':
      if (!isFinitePositiveNumber(item.small_side) || !isFinitePositiveNumber(item.large_side) || item.large_side !== item.small_side * 3) issues.push('adjacent squares tall data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 15 / 4 * item.small_side * item.small_side)) issues.push('adjacent squares tall area answer mismatch');
      break;
    case 'adjacent_squares_diagonal_tall_area_reverse':
      if (!isFinitePositiveNumber(item.small_side) || !isFinitePositiveNumber(item.large_side) || item.large_side !== item.small_side * 3 || !isFinitePositiveNumber(item.area)) issues.push('adjacent squares tall reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, 15 / 4 * item.small_side * item.small_side)) issues.push('adjacent squares tall reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.small_side)) issues.push('adjacent squares tall reverse answer mismatch');
      break;
    case 'trapezoid_area':
      if (polygonArea(item.outline ?? []) !== item.answer) issues.push('trapezoid area answer mismatch');
      break;
    case 'trapezoid_area_reverse':
      if (polygonArea(item.outline ?? []) !== item.area) issues.push('trapezoid reverse area data mismatch');
      if (item.answer !== item.topBase) issues.push('trapezoid reverse area answer mismatch');
      break;
    case 'parallelogram_area':
      if (item.answer !== item.base * item.height) issues.push('parallelogram area answer mismatch');
      break;
    case 'parallelogram_perimeter':
      if (item.answer !== 2 * (item.base + item.side)) issues.push('parallelogram perimeter answer mismatch');
      break;
    case 'parallelogram_area_reverse':
      if (item.area !== item.base * item.height) issues.push('parallelogram reverse area data mismatch');
      if (item.answer !== item.height) issues.push('parallelogram reverse area answer mismatch');
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
      if (!approxEqual(item.answer, Math.PI * (item.outerRadius * item.outerRadius - item.innerRadius * item.innerRadius))) issues.push('annulus area answer mismatch');
      break;
    case 'circle_annulus_area_reverse':
      if (!approxEqual(item.area, Math.PI * (item.outerRadius * item.outerRadius - item.innerRadius * item.innerRadius))) issues.push('annulus reverse area data mismatch');
      if (item.answer !== item.innerRadius) issues.push('annulus reverse area answer mismatch');
      break;
    case 'sector_area':
      if (!approxEqual(item.answer, (item.angle / 360) * Math.PI * item.radius * item.radius)) issues.push('sector area answer mismatch');
      break;
    case 'sector_area_reverse':
      if (!approxEqual(item.area, (item.angle / 360) * Math.PI * item.radius * item.radius)) issues.push('sector reverse area data mismatch');
      if (item.answer !== item.radius) issues.push('sector reverse area answer mismatch');
      break;
    default:
      issues.push(`unsupported kind: ${String(item.kind)}`);
  }

  return issues;
}

function validateRenderedAreaPerimeterExerciseItem(item, rendered) {
  const issues = validateAreaPerimeterExerciseItem(item);
  const renderedContract = buildAreaPerimeterRenderContract(item);
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

  const historyKey = makeHistoryKey('area-perimeter', grade, normalizeDifficulty(difficulty), curriculum);
  const variantPool = buildVariantPool(difficulty);
  const selectedVariants = rotateVariantsByKind(variantPool, safeCount, readRecentKinds(historyKey));
  if (selectedVariants.length > 0) {
    writeRecentKinds(historyKey, selectedVariants.map((variant) => variant.kind));
  }

  return selectedVariants.map((variant) => ({
    ...variant,
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
  renderAreaPerimeterExerciseItem,
  validateAreaPerimeterExerciseItems,
};
