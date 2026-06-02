import { validateRenderContract } from './exerciseRenderContracts.js';

function formatLength(value) {
  return Number.isFinite(value) ? `${value} cm` : '?';
}

function formatArea(value) {
  return Number.isFinite(value) ? `${value} cmยฒ` : '?';
}

function formatCircleCutAreaExpression(radius, rectW, rectH) {
  const circleTerm = `${radius * radius}ฯ€`;
  const cutTerm = rectW * rectH;
  return `${circleTerm} - ${cutTerm} cmยฒ`;
}

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function approxEqual(a, b, epsilon = 1e-9) {
  return Math.abs(a - b) <= epsilon;
}

function buildRect(left, bottom, width, height) {
  return [
    { x: left, y: bottom },
    { x: left + width, y: bottom },
    { x: left + width, y: bottom + height },
    { x: left, y: bottom + height },
  ];
}

export const COMPOSITE_AREA_PERIMETER_KINDS = [
  'adjacent_squares_diagonal_area',
  'adjacent_squares_diagonal_area_reverse',
  'adjacent_squares_diagonal_tall_area',
  'adjacent_squares_diagonal_tall_area_reverse',
  'overlap_rectangles_union_area',
  'overlap_rectangles_union_area_reverse',
  'rectangle_triangle_cut_area',
  'rectangle_triangle_cut_perimeter',
  'rectangle_triangle_cut_area_reverse',
  'rectangle_frame_area',
  'rectangle_frame_perimeter',
  'rectangle_frame_area_reverse',
  'circle_rectangle_cut_area',
  'circle_rectangle_cut_perimeter',
  'circle_rectangle_cut_area_reverse',
];

export function buildCompositeAreaPerimeterVariantExtras() {
  const variants = {};

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const scene = { zh: '拼接正方形阴影', en: 'composite square shading' };
    const smallSide = 3 * factor;
    const largeSide = 6 * factor;
    const area = 15 * factor * factor;

    variants[`adjacent_squares_diagonal_area:${id}`] = {
      key: `adjacent_squares_diagonal_area:${id}`,
      kind: 'adjacent_squares_diagonal_area',
      variantId: id,
      template: 'adjacent_squares_diagonal',
      small_side: smallSide,
      large_side: largeSide,
      answer: area,
      scene,
    };

    variants[`adjacent_squares_diagonal_area_reverse:${id}`] = {
      key: `adjacent_squares_diagonal_area_reverse:${id}`,
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
    const scene = { zh: '拼接正方形阴影', en: 'composite square shading' };
    const smallSide = 4 * factor;
    const largeSide = 12 * factor;
    const area = 60 * factor * factor;

    variants[`adjacent_squares_diagonal_tall_area:${id}`] = {
      key: `adjacent_squares_diagonal_tall_area:${id}`,
      kind: 'adjacent_squares_diagonal_tall_area',
      variantId: id,
      template: 'adjacent_squares_diagonal',
      small_side: smallSide,
      large_side: largeSide,
      answer: area,
      scene,
    };

    variants[`adjacent_squares_diagonal_tall_area_reverse:${id}`] = {
      key: `adjacent_squares_diagonal_tall_area_reverse:${id}`,
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
    const id = `o${factor}`;
    const scene = { zh: '重叠长方形', en: 'overlapping rectangles' };
    const baseWidth = 8 * factor;
    const baseHeight = 4 * factor;
    const towerWidth = 5 * factor;
    const towerHeight = 7 * factor;
    const overlapWidth = 3 * factor;
    const overlapHeight = baseHeight;
    const area = baseWidth * baseHeight + towerWidth * towerHeight - overlapWidth * overlapHeight;

    variants[`overlap_rectangles_union_area:${id}`] = {
      key: `overlap_rectangles_union_area:${id}`,
      kind: 'overlap_rectangles_union_area',
      variantId: id,
      template: 'composite_overlay',
      baseWidth,
      baseHeight,
      towerWidth,
      towerHeight,
      overlapWidth,
      overlapHeight,
      answer: area,
      scene,
    };

    variants[`overlap_rectangles_union_area_reverse:${id}`] = {
      key: `overlap_rectangles_union_area_reverse:${id}`,
      kind: 'overlap_rectangles_union_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      baseWidth,
      baseHeight,
      towerWidth,
      towerHeight,
      overlapWidth,
      overlapHeight,
      area,
      answer: overlapWidth,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `t${factor}`;
    const scene = { zh: '切角长方形', en: 'cut-corner shading' };
    const width = 10 * factor;
    const height = 6 * factor;
    const cutW = 4 * factor;
    const cutH = 3 * factor;
    const area = 54 * factor * factor;
    const perimeter = 30 * factor;

    variants[`rectangle_triangle_cut_area:${id}`] = {
      key: `rectangle_triangle_cut_area:${id}`,
      kind: 'rectangle_triangle_cut_area',
      variantId: id,
      template: 'composite_overlay',
      width,
      height,
      cutW,
      cutH,
      answer: area,
      scene,
    };
    variants[`rectangle_triangle_cut_perimeter:${id}`] = {
      key: `rectangle_triangle_cut_perimeter:${id}`,
      kind: 'rectangle_triangle_cut_perimeter',
      variantId: id,
      template: 'composite_overlay',
      width,
      height,
      cutW,
      cutH,
      answer: perimeter,
      scene,
    };
    variants[`rectangle_triangle_cut_area_reverse:${id}`] = {
      key: `rectangle_triangle_cut_area_reverse:${id}`,
      kind: 'rectangle_triangle_cut_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      width,
      height,
      cutW,
      cutH,
      area,
      answer: cutW,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `f${factor}`;
    const scene = { zh: '长方形相框', en: 'rectangular frame' };
    const outerWidth = 10 * factor;
    const outerHeight = 7 * factor;
    const innerWidth = 4 * factor;
    const innerHeight = 3 * factor;
    const area = outerWidth * outerHeight - innerWidth * innerHeight;
    const perimeter = 2 * (outerWidth + outerHeight) + 2 * (innerWidth + innerHeight);

    variants[`rectangle_frame_area:${id}`] = {
      key: `rectangle_frame_area:${id}`,
      kind: 'rectangle_frame_area',
      variantId: id,
      template: 'composite_overlay',
      outerWidth,
      outerHeight,
      innerWidth,
      innerHeight,
      answer: area,
      scene,
    };
    variants[`rectangle_frame_perimeter:${id}`] = {
      key: `rectangle_frame_perimeter:${id}`,
      kind: 'rectangle_frame_perimeter',
      variantId: id,
      template: 'composite_overlay',
      outerWidth,
      outerHeight,
      innerWidth,
      innerHeight,
      answer: perimeter,
      scene,
    };
    variants[`rectangle_frame_area_reverse:${id}`] = {
      key: `rectangle_frame_area_reverse:${id}`,
      kind: 'rectangle_frame_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      outerWidth,
      outerHeight,
      innerWidth,
      innerHeight,
      area,
      answer: innerWidth,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `c${factor}`;
    const scene = { zh: '圆形挖空', en: 'circle cut-out' };
    const radius = 5 * factor;
    const rectW = 2 * factor;
    const rectH = 3 * factor;
    const area = Math.PI * radius * radius - rectW * rectH;
    const perimeter = 2 * Math.PI * radius + 2 * (rectW + rectH);

    variants[`circle_rectangle_cut_area:${id}`] = {
      key: `circle_rectangle_cut_area:${id}`,
      kind: 'circle_rectangle_cut_area',
      variantId: id,
      template: 'composite_overlay',
      radius,
      rectW,
      rectH,
      answer: area,
      scene,
    };
    variants[`circle_rectangle_cut_perimeter:${id}`] = {
      key: `circle_rectangle_cut_perimeter:${id}`,
      kind: 'circle_rectangle_cut_perimeter',
      variantId: id,
      template: 'composite_overlay',
      radius,
      rectW,
      rectH,
      answer: perimeter,
      scene,
    };
    variants[`circle_rectangle_cut_area_reverse:${id}`] = {
      key: `circle_rectangle_cut_area_reverse:${id}`,
      kind: 'circle_rectangle_cut_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      radius,
      rectW,
      rectH,
      area,
      answer: rectW,
      scene,
    };
  });

  return variants;
}

export function buildCompositeAreaPerimeterQuestionText(item, lang) {
  const zh = lang === 'zh';

  switch (item.kind) {
    case 'adjacent_squares_diagonal_area':
      return zh
        ? `如图，左边正方形边长 ${item.small_side} cm，右边正方形边长 ${item.large_side} cm，连接左下角与右上角。求阴影部分的面积。`
        : `As shown, the left square has side ${item.small_side} cm and the right square has side ${item.large_side} cm. A diagonal joins the bottom-left corner to the top-right corner. Find the shaded area.`;
    case 'adjacent_squares_diagonal_area_reverse':
      return zh
        ? `如图，两个正方形并排放置，右边正方形边长是左边的 2 倍。阴影部分面积是 ${formatArea(item.area)}。求左边正方形的边长。`
        : `As shown, two squares sit side by side and the right square has side length twice the left. The shaded area is ${formatArea(item.area)}. Find the left square's side length.`;
    case 'adjacent_squares_diagonal_tall_area':
      return zh
        ? `如图，左边正方形边长 ${item.small_side} cm，右边正方形边长 ${item.large_side} cm，右边边长是左边的 3 倍，连接左下角与右上角。求阴影部分的面积。`
        : `As shown, the left square has side ${item.small_side} cm and the right square has side ${item.large_side} cm, which is three times the left. A diagonal joins the bottom-left corner to the top-right corner. Find the shaded area.`;
    case 'adjacent_squares_diagonal_tall_area_reverse':
      return zh
        ? `如图，两个正方形并排放置，右边正方形边长是左边的 3 倍。阴影部分面积是 ${formatArea(item.area)}。求左边正方形的边长。`
        : `As shown, two squares sit side by side and the right square has side length three times the left. The shaded area is ${formatArea(item.area)}. Find the left square's side length.`;
    case 'overlap_rectangles_union_area':
      return zh
        ? `如图，两个长方形部分重叠组成阴影图形。横放长方形长 ${item.baseWidth} cm、宽 ${item.baseHeight} cm，竖放长方形宽 ${item.towerWidth} cm、高 ${item.towerHeight} cm，重叠部分的宽是 ${item.overlapWidth} cm。求阴影部分的面积。`
        : `As shown, two rectangles overlap to form the shaded figure. The horizontal rectangle is ${item.baseWidth} cm by ${item.baseHeight} cm, the vertical rectangle is ${item.towerWidth} cm by ${item.towerHeight} cm, and the overlap width is ${item.overlapWidth} cm. Find the shaded area.`;
    case 'overlap_rectangles_union_area_reverse':
      return zh
        ? `如图，两个长方形部分重叠组成阴影图形。横放长方形长 ${item.baseWidth} cm、宽 ${item.baseHeight} cm，竖放长方形宽 ${item.towerWidth} cm、高 ${item.towerHeight} cm，阴影部分面积是 ${formatArea(item.area)}。求重叠部分的宽。`
        : `As shown, two rectangles overlap to form the shaded figure. The horizontal rectangle is ${item.baseWidth} cm by ${item.baseHeight} cm, the vertical rectangle is ${item.towerWidth} cm by ${item.towerHeight} cm, and the shaded area is ${formatArea(item.area)}. Find the overlap width.`;
    case 'rectangle_triangle_cut_area':
      return zh
        ? `如图，一个长方形右上角切去一个直角三角形。求阴影部分的面积。`
        : `As shown, a right triangle is cut from the upper-right corner of a rectangle. Find the shaded area.`;
    case 'rectangle_triangle_cut_perimeter':
      return zh
        ? `如图，一个长方形右上角切去一个直角三角形。求剩余图形的周长。`
        : `As shown, a right triangle is cut from the upper-right corner of a rectangle. Find the perimeter of the remaining shape.`;
    case 'rectangle_triangle_cut_area_reverse':
      return zh
        ? `如图，一个长方形右上角切去一个直角三角形，阴影部分面积是 ${formatArea(item.area)}。求被切去三角形的较短直角边。`
        : `As shown, a right triangle is cut from the upper-right corner of a rectangle. The shaded area is ${formatArea(item.area)}. Find the shorter leg of the cut triangle.`;
    case 'rectangle_frame_area':
      return zh
        ? `如图，一个长方形相框由大长方形中挖去一个小长方形得到。外框长 ${item.outerWidth} cm、宽 ${item.outerHeight} cm，内孔长 ${item.innerWidth} cm、宽 ${item.innerHeight} cm。求阴影部分的面积。`
        : `As shown, a rectangular frame is formed by cutting a smaller rectangle from a larger one. The outer rectangle is ${item.outerWidth} cm by ${item.outerHeight} cm, and the inner hole is ${item.innerWidth} cm by ${item.innerHeight} cm. Find the shaded area.`;
    case 'rectangle_frame_perimeter':
      return zh
        ? `如图，一个长方形相框由大长方形中挖去一个小长方形得到。外框长 ${item.outerWidth} cm、宽 ${item.outerHeight} cm，内孔长 ${item.innerWidth} cm、宽 ${item.innerHeight} cm。求阴影部分的周长。`
        : `As shown, a rectangular frame is formed by cutting a smaller rectangle from a larger one. The outer rectangle is ${item.outerWidth} cm by ${item.outerHeight} cm, and the inner hole is ${item.innerWidth} cm by ${item.innerHeight} cm. Find the perimeter of the shaded frame.`;
    case 'rectangle_frame_area_reverse':
      return zh
        ? `如图，一个长方形相框由大长方形中挖去一个小长方形得到。外框长 ${item.outerWidth} cm、宽 ${item.outerHeight} cm，内孔宽 ${item.innerHeight} cm，阴影部分面积是 ${formatArea(item.area)}。求内孔的长。`
        : `As shown, a rectangular frame is formed by cutting a smaller rectangle from a larger one. The outer rectangle is ${item.outerWidth} cm by ${item.outerHeight} cm, the inner height is ${item.innerHeight} cm, and the shaded area is ${formatArea(item.area)}. Find the inner width.`;
    case 'circle_rectangle_cut_area':
      return zh
        ? `如图，一个圆形中挖去一个长方形空洞。求剩余阴影部分的面积。`
        : `As shown, a rectangle is cut out of a circle. Find the shaded area that remains.`;
    case 'circle_rectangle_cut_perimeter':
      return zh
        ? `如图，一个圆形中挖去一个长方形空洞。求剩余图形的周长。`
        : `As shown, a rectangle is cut out of a circle. Find the perimeter of the remaining shape.`;
    case 'circle_rectangle_cut_area_reverse':
      return zh
        ? `如图，一个圆形中挖去一个长方形空洞，阴影部分面积是 ${formatCircleCutAreaExpression(item.radius, item.rectW, item.rectH)}。求长方形的宽。`
        : `As shown, a rectangle is cut out of a circle. The shaded area is ${formatCircleCutAreaExpression(item.radius, item.rectW, item.rectH)}. Find the rectangle's width.`;
    default:
      return '';
  }
}

function buildAdjacentSquaresCompositeSpec(item) {
  const small = item.small_side;
  const large = item.large_side;
  const totalW = small + large;
  const crossY = (large * small) / totalW;
  const A = { x: 0, y: 0 };
  const B = { x: small, y: 0 };
  const C = { x: small, y: small };
  const D = { x: 0, y: small };
  const E = { x: small, y: 0 };
  const F = { x: totalW, y: 0 };
  const G = { x: totalW, y: large };
  const H = { x: small, y: large };
  const P = { x: small, y: crossY };

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: totalW, yMin: 0, yMax: large },
    layers: [
      { kind: 'poly', pts: [A, B, C, D], fill: 'rgba(248,250,252,0.03)', stroke: '#94a3b8', sw: 2 },
      { kind: 'poly', pts: [E, F, G, H], fill: 'rgba(248,250,252,0.03)', stroke: '#94a3b8', sw: 2 },
      { kind: 'poly', pts: [A, B, P], fill: 'rgba(245,158,11,0.18)', stroke: 'none' },
      { kind: 'poly', pts: [P, H, G], fill: 'rgba(245,158,11,0.18)', stroke: 'none' },
      { kind: 'seg', a: A, b: G, stroke: '#f59e0b', sw: 2.6 },
      { kind: 'dot', p: A, label: 'A', offset: { x: -14, y: 12 }, color: '#f8fafc' },
      { kind: 'dot', p: C, label: 'C', offset: { x: 8, y: -4 }, color: '#f8fafc' },
      { kind: 'dot', p: H, label: 'H', offset: { x: 8, y: -4 }, color: '#f8fafc' },
      { kind: 'dot', p: G, label: 'G', offset: { x: 8, y: 12 }, color: '#f8fafc' },
      { kind: 'segLabel', a: A, b: B, label: formatLength(item.small_side), color: '#f59e0b' },
      { kind: 'segLabel', a: B, b: C, label: formatLength(item.small_side), color: '#f59e0b' },
      { kind: 'segLabel', a: E, b: F, label: formatLength(item.large_side), color: '#f59e0b' },
      { kind: 'segLabel', a: F, b: G, label: formatLength(item.large_side), color: '#f59e0b' },
      { kind: 'segLabel', a: D, b: A, label: item.kind.endsWith('reverse') ? '?' : formatLength(item.small_side), color: '#f59e0b' },
      { kind: 'segLabel', a: H, b: G, label: formatLength(item.large_side), color: '#f59e0b' },
      { kind: 'text', x: (A.x + G.x) / 2, y: (A.y + G.y) / 2, text: item.kind.endsWith('reverse') ? formatArea(item.area) : '?', color: '#f59e0b' },
    ],
  };
}

function buildOverlapRectanglesUnionSpec(item) {
  const baseLeft = 0;
  const baseBottom = 0;
  const baseRight = item.baseWidth;
  const baseTop = item.baseHeight;
  const towerLeft = item.baseWidth - item.overlapWidth;
  const towerRight = towerLeft + item.towerWidth;
  const towerTop = item.towerHeight;

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: towerRight, yMin: 0, yMax: towerTop },
    layers: [
      { kind: 'poly', pts: buildRect(baseLeft, baseBottom, item.baseWidth, item.baseHeight), fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'poly', pts: buildRect(towerLeft, 0, item.towerWidth, item.towerHeight), fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: { x: baseLeft, y: baseBottom }, b: { x: baseRight, y: baseBottom }, label: formatLength(item.baseWidth), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: baseLeft, y: baseBottom }, b: { x: baseLeft, y: baseTop }, label: formatLength(item.baseHeight), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: towerLeft, y: towerTop }, b: { x: towerRight, y: towerTop }, label: formatLength(item.towerWidth), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: towerRight, y: 0 }, b: { x: towerRight, y: towerTop }, label: formatLength(item.towerHeight), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: towerLeft, y: baseTop }, b: { x: baseRight, y: baseTop }, label: item.kind.endsWith('reverse') ? '?' : formatLength(item.overlapWidth), color: '#f59e0b' },
      { kind: 'text', x: towerRight / 2, y: towerTop / 2, text: item.kind.endsWith('reverse') ? formatArea(item.area) : '?', color: '#f59e0b' },
    ],
  };
}

function buildRectangleTriangleCutSpec(item) {
  const width = item.width;
  const height = item.height;
  const cutW = item.cutW;
  const cutH = item.cutH;
  const pts = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height - cutH },
    { x: width - cutW, y: height },
    { x: 0, y: height },
  ];
  const notchA = { x: width, y: height - cutH };
  const notchB = { x: width - cutW, y: height };

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: width, yMin: 0, yMax: height },
    layers: [
      { kind: 'poly', pts, fill: 'rgba(248,250,252,0.03)', stroke: '#94a3b8', sw: 2 },
      { kind: 'seg', a: notchA, b: notchB, stroke: '#94a3b8', sw: 2 },
      { kind: 'dot', p: { x: 0, y: 0 }, label: 'A', offset: { x: -14, y: 12 }, color: '#f8fafc' },
      { kind: 'dot', p: { x: width, y: 0 }, label: 'B', offset: { x: 8, y: 12 }, color: '#f8fafc' },
      { kind: 'dot', p: { x: width - cutW, y: height }, label: 'C', offset: { x: 8, y: -4 }, color: '#f8fafc' },
      { kind: 'dot', p: { x: 0, y: height }, label: 'D', offset: { x: -14, y: -4 }, color: '#f8fafc' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: width, y: 0 }, label: formatLength(width), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: 0, y: height }, label: formatLength(height), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: width, y: 0 }, b: notchA, label: formatLength(cutH), color: '#f59e0b' },
      { kind: 'segLabel', a: notchA, b: notchB, label: item.kind.endsWith('reverse') ? '?' : formatLength(cutW), color: '#f59e0b' },
      { kind: 'text', x: width / 2, y: height / 2, text: item.kind.includes('area') && !item.kind.includes('reverse') ? '?' : formatArea(item.area), color: '#f59e0b' },
    ],
  };
}

function buildRectangleFrameSpec(item) {
  const innerLeft = (item.outerWidth - item.innerWidth) / 2;
  const innerBottom = (item.outerHeight - item.innerHeight) / 2;

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: item.outerWidth, yMin: 0, yMax: item.outerHeight },
    layers: [
      { kind: 'poly', pts: buildRect(0, 0, item.outerWidth, item.outerHeight), fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'poly', pts: buildRect(innerLeft, innerBottom, item.innerWidth, item.innerHeight), fill: '#020617', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: item.outerWidth, y: 0 }, label: formatLength(item.outerWidth), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: 0, y: item.outerHeight }, label: formatLength(item.outerHeight), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: innerLeft, y: innerBottom }, b: { x: innerLeft + item.innerWidth, y: innerBottom }, label: item.kind === 'rectangle_frame_area_reverse' ? '?' : formatLength(item.innerWidth), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: innerLeft + item.innerWidth, y: innerBottom }, b: { x: innerLeft + item.innerWidth, y: innerBottom + item.innerHeight }, label: formatLength(item.innerHeight), color: '#f59e0b' },
      { kind: 'text', x: item.outerWidth / 2, y: item.outerHeight / 2, text: item.kind === 'rectangle_frame_area_reverse' ? formatArea(item.area) : '?', color: '#f59e0b' },
    ],
  };
}

function buildCircleRectangleCutSpec(item) {
  const radius = item.radius;
  const rectW = item.rectW;
  const rectH = item.rectH;
  const center = { x: 0, y: 0 };
  const rect = [
    { x: -rectW / 2, y: -rectH / 2 },
    { x: rectW / 2, y: -rectH / 2 },
    { x: rectW / 2, y: rectH / 2 },
    { x: -rectW / 2, y: rectH / 2 },
  ];

  return {
    template: 'composite_overlay',
    bounds: { xMin: -radius, xMax: radius, yMin: -radius, yMax: radius },
    layers: [
      { kind: 'circle', c: center, r: radius, fill: 'rgba(248,250,252,0.03)', stroke: '#94a3b8', sw: 2.2 },
      { kind: 'poly', pts: rect, fill: '#020617', stroke: '#94a3b8', sw: 2 },
      { kind: 'dot', p: center, label: 'O', offset: { x: 8, y: 12 }, color: '#f8fafc' },
      { kind: 'dot', p: { x: radius, y: 0 }, label: 'A', offset: { x: 8, y: -10 }, color: '#f8fafc' },
      { kind: 'segLabel', a: center, b: { x: radius, y: 0 }, label: formatLength(radius), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: -rectW / 2, y: -rectH / 2 }, b: { x: rectW / 2, y: -rectH / 2 }, label: item.kind.endsWith('reverse') ? '?' : formatLength(rectW), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: rectW / 2, y: -rectH / 2 }, b: { x: rectW / 2, y: rectH / 2 }, label: formatLength(rectH), color: '#f59e0b' },
      ...(item.kind.endsWith('reverse')
        ? [{ kind: 'text', x: 0, y: 0, text: formatCircleCutAreaExpression(radius, rectW, rectH), color: '#f59e0b' }]
        : []),
    ],
  };
}

export function buildCompositeAreaPerimeterDiagramSpec(item) {
  switch (item.kind) {
    case 'adjacent_squares_diagonal_area':
    case 'adjacent_squares_diagonal_area_reverse':
    case 'adjacent_squares_diagonal_tall_area':
    case 'adjacent_squares_diagonal_tall_area_reverse':
      return buildAdjacentSquaresCompositeSpec(item);
    case 'overlap_rectangles_union_area':
    case 'overlap_rectangles_union_area_reverse':
      return buildOverlapRectanglesUnionSpec(item);
    case 'rectangle_triangle_cut_area':
    case 'rectangle_triangle_cut_perimeter':
    case 'rectangle_triangle_cut_area_reverse':
      return buildRectangleTriangleCutSpec(item);
    case 'rectangle_frame_area':
    case 'rectangle_frame_perimeter':
    case 'rectangle_frame_area_reverse':
      return buildRectangleFrameSpec(item);
    case 'circle_rectangle_cut_area':
    case 'circle_rectangle_cut_perimeter':
    case 'circle_rectangle_cut_area_reverse':
      return buildCircleRectangleCutSpec(item);
    default:
      return {};
  }
}

export function buildCompositeAreaPerimeterRenderContract(item) {
  switch (item.kind) {
    case 'adjacent_squares_diagonal_area':
      return {
        questionIncludes: ['正方形', '阴影', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"seg"', '"kind":"segLabel"', '"text":"?"'],
      };
    case 'adjacent_squares_diagonal_area_reverse':
    case 'adjacent_squares_diagonal_tall_area_reverse':
      return {
        questionIncludes: ['正方形', '阴影', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"seg"', '"kind":"segLabel"', `"text":"${formatArea(item.area)}"`],
      };
    case 'adjacent_squares_diagonal_tall_area':
      return {
        questionIncludes: ['正方形', '阴影', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"seg"', '"kind":"segLabel"', '"text":"?"'],
      };
    case 'overlap_rectangles_union_area':
      return {
        questionIncludes: ['长方形', '重叠', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"segLabel"', '"text":"?"'],
      };
    case 'overlap_rectangles_union_area_reverse':
      return {
        questionIncludes: ['长方形', '重叠', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"segLabel"', `"text":"${formatArea(item.area)}"`],
      };
    case 'rectangle_triangle_cut_area':
    case 'rectangle_triangle_cut_perimeter':
      return {
        questionIncludes: ['长方形', '三角形'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"segLabel"'],
      };
    case 'rectangle_triangle_cut_area_reverse':
      return {
        questionIncludes: ['长方形', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"text":"', '"kind":"segLabel"'],
      };
    case 'rectangle_frame_area':
    case 'rectangle_frame_perimeter':
      return {
        questionIncludes: ['相框', '长方形'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"segLabel"', '"text":"?"'],
      };
    case 'rectangle_frame_area_reverse':
      return {
        questionIncludes: ['相框', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"segLabel"', `"text":"${formatArea(item.area)}"`],
      };
    case 'circle_rectangle_cut_area':
    case 'circle_rectangle_cut_perimeter':
      return {
        questionIncludes: ['圆形', '长方形'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"circle"', '"kind":"poly"', '"kind":"segLabel"'],
        diagramExcludes: ['"text":"?"'],
      };
    case 'circle_rectangle_cut_area_reverse':
      return {
        questionIncludes: ['圆形', '面积'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"circle"', '"kind":"poly"', '"kind":"segLabel"', `"text":"${formatCircleCutAreaExpression(item.radius, item.rectW, item.rectH)}"`],
      };
    default:
      return { questionIncludes: [], diagramIncludes: [] };
  }
}

export function validateCompositeAreaPerimeterItem(item) {
  const issues = [];
  if (!item || typeof item !== 'object') return ['item must be an object'];

  switch (item.kind) {
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
      if (issues.length === 0 && !approxEqual(item.answer, (15 / 4) * item.small_side * item.small_side)) issues.push('adjacent squares tall area answer mismatch');
      break;
    case 'adjacent_squares_diagonal_tall_area_reverse':
      if (!isFinitePositiveNumber(item.small_side) || !isFinitePositiveNumber(item.large_side) || item.large_side !== item.small_side * 3 || !isFinitePositiveNumber(item.area)) issues.push('adjacent squares tall reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, (15 / 4) * item.small_side * item.small_side)) issues.push('adjacent squares tall reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.small_side)) issues.push('adjacent squares tall reverse answer mismatch');
      break;
    case 'overlap_rectangles_union_area':
      if (!isFinitePositiveNumber(item.baseWidth) || !isFinitePositiveNumber(item.baseHeight) || !isFinitePositiveNumber(item.towerWidth) || !isFinitePositiveNumber(item.towerHeight) || !isFinitePositiveNumber(item.overlapWidth) || !isFinitePositiveNumber(item.overlapHeight)) issues.push('overlap rectangles data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.baseWidth * item.baseHeight + item.towerWidth * item.towerHeight - item.overlapWidth * item.overlapHeight)) issues.push('overlap rectangles union area mismatch');
      break;
    case 'overlap_rectangles_union_area_reverse':
      if (!isFinitePositiveNumber(item.baseWidth) || !isFinitePositiveNumber(item.baseHeight) || !isFinitePositiveNumber(item.towerWidth) || !isFinitePositiveNumber(item.towerHeight) || !isFinitePositiveNumber(item.overlapWidth) || !isFinitePositiveNumber(item.overlapHeight) || !isFinitePositiveNumber(item.area)) issues.push('overlap rectangles reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, item.baseWidth * item.baseHeight + item.towerWidth * item.towerHeight - item.overlapWidth * item.overlapHeight)) issues.push('overlap rectangles reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.overlapWidth)) issues.push('overlap rectangles reverse answer mismatch');
      break;
    case 'rectangle_triangle_cut_area':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.cutW) || !isFinitePositiveNumber(item.cutH)) issues.push('rectangle triangle cut data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.width * item.height - (item.cutW * item.cutH) / 2)) issues.push('rectangle triangle cut area mismatch');
      break;
    case 'rectangle_triangle_cut_perimeter':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.cutW) || !isFinitePositiveNumber(item.cutH)) issues.push('rectangle triangle cut data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.width + item.height + (item.width - item.cutW) + (item.height - item.cutH) + Math.sqrt(item.cutW * item.cutW + item.cutH * item.cutH))) issues.push('rectangle triangle cut perimeter mismatch');
      break;
    case 'rectangle_triangle_cut_area_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.height) || !isFinitePositiveNumber(item.cutW) || !isFinitePositiveNumber(item.cutH) || !isFinitePositiveNumber(item.area)) issues.push('rectangle triangle cut reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, item.width * item.height - (item.cutW * item.cutH) / 2)) issues.push('rectangle triangle cut reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.cutW)) issues.push('rectangle triangle cut reverse answer mismatch');
      break;
    case 'rectangle_frame_area':
      if (!isFinitePositiveNumber(item.outerWidth) || !isFinitePositiveNumber(item.outerHeight) || !isFinitePositiveNumber(item.innerWidth) || !isFinitePositiveNumber(item.innerHeight)) issues.push('rectangle frame data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.outerWidth * item.outerHeight - item.innerWidth * item.innerHeight)) issues.push('rectangle frame area mismatch');
      break;
    case 'rectangle_frame_perimeter':
      if (!isFinitePositiveNumber(item.outerWidth) || !isFinitePositiveNumber(item.outerHeight) || !isFinitePositiveNumber(item.innerWidth) || !isFinitePositiveNumber(item.innerHeight)) issues.push('rectangle frame data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * (item.outerWidth + item.outerHeight) + 2 * (item.innerWidth + item.innerHeight))) issues.push('rectangle frame perimeter mismatch');
      break;
    case 'rectangle_frame_area_reverse':
      if (!isFinitePositiveNumber(item.outerWidth) || !isFinitePositiveNumber(item.outerHeight) || !isFinitePositiveNumber(item.innerWidth) || !isFinitePositiveNumber(item.innerHeight) || !isFinitePositiveNumber(item.area)) issues.push('rectangle frame reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, item.outerWidth * item.outerHeight - item.innerWidth * item.innerHeight)) issues.push('rectangle frame reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.innerWidth)) issues.push('rectangle frame reverse answer mismatch');
      break;
    case 'circle_rectangle_cut_area':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.rectW) || !isFinitePositiveNumber(item.rectH)) issues.push('circle rectangle cut data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, Math.PI * item.radius * item.radius - item.rectW * item.rectH)) issues.push('circle rectangle cut area mismatch');
      break;
    case 'circle_rectangle_cut_perimeter':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.rectW) || !isFinitePositiveNumber(item.rectH)) issues.push('circle rectangle cut data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * Math.PI * item.radius + 2 * (item.rectW + item.rectH))) issues.push('circle rectangle cut perimeter mismatch');
      break;
    case 'circle_rectangle_cut_area_reverse':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.rectW) || !isFinitePositiveNumber(item.rectH) || !isFinitePositiveNumber(item.area)) issues.push('circle rectangle cut reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, Math.PI * item.radius * item.radius - item.rectW * item.rectH)) issues.push('circle rectangle cut reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.rectW)) issues.push('circle rectangle cut reverse answer mismatch');
      break;
    default:
      issues.push(`unsupported composite kind: ${String(item.kind)}`);
  }

  return issues;
}

export function validateCompositeAreaPerimeterRender(item, rendered) {
  const contract = buildCompositeAreaPerimeterRenderContract(item);
  return validateRenderContract(rendered, contract, item.kind);
}
