import { validateRenderContract } from './exerciseRenderContracts.js';
import { stripUnknownDiagramLabels } from './diagramLabelPolicy.js';

function formatLength(value) {
  return Number.isFinite(value) ? `${value} cm` : '?';
}

function formatArea(value) {
  return Number.isFinite(value) ? `${value} cm²` : '?';
}

function formatCircleCutAreaExpression(radius, rectW, rectH) {
  return `${radius * radius}π - ${rectW * rectH} cm²`;
}

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function formatAreaDisplay(value) {
  return Number.isFinite(value) ? `${value} cm²` : '?';
}

function formatCircleCutAreaExpressionDisplay(radius, rectW, rectH) {
  return `${radius * radius}π - ${rectW * rectH} cm²`;
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

function buildArcPoints(center, radius, startAngle, endAngle, steps = 20) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const angle = startAngle + (endAngle - startAngle) * t;
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });
}

function formatPiAreaExpression(constantPart, piCoefficient) {
  return `${constantPart} + ${piCoefficient}π cm²`;
}

function formatMinusPiAreaExpression(totalSquare, quarterCirclePart) {
  return `${totalSquare} - ${quarterCirclePart}π cm²`;
}

export const COMPOSITE_AREA_PERIMETER_KINDS = [
  'adjacent_squares_diagonal_area',
  'adjacent_squares_diagonal_area_reverse',
  'adjacent_squares_diagonal_tall_area',
  'adjacent_squares_diagonal_tall_area_reverse',
  'overlap_rectangles_union_area',
  'overlap_rectangles_union_area_reverse',
  'overlap_rectangles_union_perimeter',
  'rectangle_triangle_cut_area',
  'rectangle_triangle_cut_perimeter',
  'rectangle_triangle_cut_area_reverse',
  'rectangle_frame_area',
  'rectangle_frame_perimeter',
  'rectangle_frame_area_reverse',
  'rectangle_frame_perimeter_reverse',
  'house_shape_area',
  'house_shape_perimeter',
  'house_shape_area_reverse',
  'circle_rectangle_cut_area',
  'circle_rectangle_cut_perimeter',
  'circle_rectangle_cut_area_reverse',
  'semicircle_rectangle_area',
  'semicircle_rectangle_perimeter',
  'semicircle_rectangle_area_reverse',
  'quarter_circle_corner_area',
  'quarter_circle_corner_perimeter',
  'quarter_circle_corner_area_reverse',
  'rhombus_diagonals_area',
  'rhombus_diagonals_perimeter',
  'rhombus_diagonals_area_reverse',
  'cross_shape_area',
  'cross_shape_perimeter',
  'cross_shape_area_reverse',
  'trapezoid_triangle_stack_area',
  'trapezoid_triangle_stack_perimeter',
  'trapezoid_triangle_stack_area_reverse',
  'semicircle_cut_rectangle_area',
  'semicircle_cut_rectangle_perimeter',
  'semicircle_cut_rectangle_area_reverse',
  'octagon_corner_cut_area',
  'octagon_corner_cut_perimeter',
  'octagon_corner_cut_area_reverse',
];

export function buildCompositeAreaPerimeterVariantExtras() {
  const variants = {};

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `s${factor}`;
    const smallSide = 3 * factor;
    const largeSide = 6 * factor;
    const area = 15 * factor * factor;
    const scene = { zh: '拼接正方形', en: 'adjacent squares' };

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
    const smallSide = 4 * factor;
    const largeSide = 12 * factor;
    const area = 60 * factor * factor;
    const scene = { zh: '拼接正方形', en: 'adjacent squares' };

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
    const baseWidth = 8 * factor;
    const baseHeight = 4 * factor;
    const towerWidth = 5 * factor;
    const towerHeight = 7 * factor;
    const overlapWidth = 3 * factor;
    const overlapHeight = baseHeight;
    const area = baseWidth * baseHeight + towerWidth * towerHeight - overlapWidth * overlapHeight;
    const perimeter = 2 * (baseWidth - overlapWidth + towerWidth + towerHeight);
    const scene = { zh: '重叠长方形', en: 'overlapping rectangles' };

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

    variants[`overlap_rectangles_union_perimeter:${id}`] = {
      key: `overlap_rectangles_union_perimeter:${id}`,
      kind: 'overlap_rectangles_union_perimeter',
      variantId: id,
      template: 'composite_overlay',
      baseWidth,
      baseHeight,
      towerWidth,
      towerHeight,
      overlapWidth,
      overlapHeight,
      answer: perimeter,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `t${factor}`;
    const width = 10 * factor;
    const height = 6 * factor;
    const cutW = 4 * factor;
    const cutH = 3 * factor;
    const area = width * height - (cutW * cutH) / 2;
    const perimeter = width + height + (width - cutW) + (height - cutH) + Math.sqrt(cutW * cutW + cutH * cutH);
    const scene = { zh: '切角长方形', en: 'cut-corner rectangle' };

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
    const outerWidth = 10 * factor;
    const outerHeight = 7 * factor;
    const innerWidth = 4 * factor;
    const innerHeight = 3 * factor;
    const area = outerWidth * outerHeight - innerWidth * innerHeight;
    const perimeter = 2 * (outerWidth + outerHeight) + 2 * (innerWidth + innerHeight);
    const scene = { zh: '长方形相框', en: 'rectangular frame' };

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
    variants[`rectangle_frame_perimeter_reverse:${id}`] = {
      key: `rectangle_frame_perimeter_reverse:${id}`,
      kind: 'rectangle_frame_perimeter_reverse',
      variantId: id,
      template: 'composite_overlay',
      outerWidth,
      outerHeight,
      innerWidth,
      innerHeight,
      perimeter,
      answer: innerWidth,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `h${factor}`;
    const width = 6 * factor;
    const wallHeight = 5 * factor;
    const roofRise = 4 * factor;
    const area = width * wallHeight + (width * roofRise) / 2;
    const perimeter = 26 * factor;
    const scene = { zh: '小房子图形', en: 'house shape' };

    variants[`house_shape_area:${id}`] = {
      key: `house_shape_area:${id}`,
      kind: 'house_shape_area',
      variantId: id,
      template: 'composite_overlay',
      width,
      wallHeight,
      roofRise,
      answer: area,
      scene,
    };
    variants[`house_shape_perimeter:${id}`] = {
      key: `house_shape_perimeter:${id}`,
      kind: 'house_shape_perimeter',
      variantId: id,
      template: 'composite_overlay',
      width,
      wallHeight,
      roofRise,
      answer: perimeter,
      scene,
    };
    variants[`house_shape_area_reverse:${id}`] = {
      key: `house_shape_area_reverse:${id}`,
      kind: 'house_shape_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      width,
      wallHeight,
      roofRise,
      area,
      answer: roofRise,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `c${factor}`;
    const radius = 5 * factor;
    const rectW = 2 * factor;
    const rectH = 3 * factor;
    const area = Math.PI * radius * radius - rectW * rectH;
    const perimeter = 2 * Math.PI * radius + 2 * (rectW + rectH);
    const scene = { zh: '圆形挖空', en: 'circle cut-out' };

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

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `sr${factor}`;
    const radius = 2 * factor;
    const rectHeight = 3 * factor;
    const area = 2 * radius * rectHeight + 0.5 * Math.PI * radius * radius;
    const perimeter = 2 * rectHeight + 2 * radius + Math.PI * radius;
    const scene = { zh: '半圆长方形组合', en: 'semicircle rectangle composite' };

    variants[`semicircle_rectangle_area:${id}`] = {
      key: `semicircle_rectangle_area:${id}`,
      kind: 'semicircle_rectangle_area',
      variantId: id,
      template: 'composite_overlay',
      radius,
      rectHeight,
      answer: area,
      scene,
    };
    variants[`semicircle_rectangle_perimeter:${id}`] = {
      key: `semicircle_rectangle_perimeter:${id}`,
      kind: 'semicircle_rectangle_perimeter',
      variantId: id,
      template: 'composite_overlay',
      radius,
      rectHeight,
      answer: perimeter,
      scene,
    };
    variants[`semicircle_rectangle_area_reverse:${id}`] = {
      key: `semicircle_rectangle_area_reverse:${id}`,
      kind: 'semicircle_rectangle_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      radius,
      rectHeight,
      area,
      answer: rectHeight,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `qc${factor}`;
    const side = 2 * factor;
    const area = side * side - (Math.PI * side * side) / 4;
    const perimeter = 2 * side + (Math.PI * side) / 2;
    const scene = { zh: '四分之一圆切角', en: 'quarter circle corner cut' };

    variants[`quarter_circle_corner_area:${id}`] = {
      key: `quarter_circle_corner_area:${id}`,
      kind: 'quarter_circle_corner_area',
      variantId: id,
      template: 'composite_overlay',
      side,
      answer: area,
      scene,
    };
    variants[`quarter_circle_corner_perimeter:${id}`] = {
      key: `quarter_circle_corner_perimeter:${id}`,
      kind: 'quarter_circle_corner_perimeter',
      variantId: id,
      template: 'composite_overlay',
      side,
      answer: perimeter,
      scene,
    };
    variants[`quarter_circle_corner_area_reverse:${id}`] = {
      key: `quarter_circle_corner_area_reverse:${id}`,
      kind: 'quarter_circle_corner_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      side,
      area,
      answer: side,
      scene,
    };
  });

  [
    [12, 8],
    [16, 12],
    [20, 12],
    [24, 10],
    [24, 14],
    [28, 16],
    [30, 16],
    [32, 18],
    [36, 24],
    [40, 18],
    [48, 14],
  ].forEach(([diagonalH, diagonalV], index) => {
    const id = `rh${index + 1}`;
    const halfH = diagonalH / 2;
    const halfV = diagonalV / 2;
    const side = Math.hypot(halfH, halfV);
    const area = (diagonalH * diagonalV) / 2;
    const perimeter = 4 * side;
    const scene = { zh: '菱形对角线分割', en: 'rhombus diagonals' };

    variants[`rhombus_diagonals_area:${id}`] = {
      key: `rhombus_diagonals_area:${id}`,
      kind: 'rhombus_diagonals_area',
      variantId: id,
      template: 'composite_overlay',
      diagonalH,
      diagonalV,
      answer: area,
      scene,
    };
    variants[`rhombus_diagonals_perimeter:${id}`] = {
      key: `rhombus_diagonals_perimeter:${id}`,
      kind: 'rhombus_diagonals_perimeter',
      variantId: id,
      template: 'composite_overlay',
      diagonalH,
      diagonalV,
      answer: perimeter,
      scene,
    };
    variants[`rhombus_diagonals_area_reverse:${id}`] = {
      key: `rhombus_diagonals_area_reverse:${id}`,
      kind: 'rhombus_diagonals_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      diagonalH,
      diagonalV,
      area,
      answer: diagonalV,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `cr${factor}`;
    const armSpan = 6 * factor;
    const armThickness = 2 * factor;
    const area = 2 * armSpan * armThickness - armThickness * armThickness;
    const perimeter = 4 * armSpan;
    const scene = { zh: '十字形组合', en: 'cross shape' };

    variants[`cross_shape_area:${id}`] = {
      key: `cross_shape_area:${id}`,
      kind: 'cross_shape_area',
      variantId: id,
      template: 'composite_overlay',
      armSpan,
      armThickness,
      answer: area,
      scene,
    };
    variants[`cross_shape_perimeter:${id}`] = {
      key: `cross_shape_perimeter:${id}`,
      kind: 'cross_shape_perimeter',
      variantId: id,
      template: 'composite_overlay',
      armSpan,
      armThickness,
      answer: perimeter,
      scene,
    };
    variants[`cross_shape_area_reverse:${id}`] = {
      key: `cross_shape_area_reverse:${id}`,
      kind: 'cross_shape_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      armSpan,
      armThickness,
      area,
      answer: armThickness,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `tt${factor}`;
    const bottomBase = 8 * factor;
    const topBase = 4 * factor;
    const trapHeight = 3 * factor;
    const roofRise = 2 * factor;
    const area = ((bottomBase + topBase) * trapHeight) / 2 + (topBase * roofRise) / 2;
    const trapSlant = Math.hypot((bottomBase - topBase) / 2, trapHeight);
    const roofSlant = Math.hypot(topBase / 2, roofRise);
    const perimeter = bottomBase + 2 * trapSlant + 2 * roofSlant;
    const scene = { zh: '梯形叠三角组合', en: 'trapezoid triangle stack' };

    variants[`trapezoid_triangle_stack_area:${id}`] = {
      key: `trapezoid_triangle_stack_area:${id}`,
      kind: 'trapezoid_triangle_stack_area',
      variantId: id,
      template: 'composite_overlay',
      bottomBase,
      topBase,
      trapHeight,
      roofRise,
      answer: area,
      scene,
    };
    variants[`trapezoid_triangle_stack_perimeter:${id}`] = {
      key: `trapezoid_triangle_stack_perimeter:${id}`,
      kind: 'trapezoid_triangle_stack_perimeter',
      variantId: id,
      template: 'composite_overlay',
      bottomBase,
      topBase,
      trapHeight,
      roofRise,
      answer: perimeter,
      scene,
    };
    variants[`trapezoid_triangle_stack_area_reverse:${id}`] = {
      key: `trapezoid_triangle_stack_area_reverse:${id}`,
      kind: 'trapezoid_triangle_stack_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      bottomBase,
      topBase,
      trapHeight,
      roofRise,
      area,
      answer: roofRise,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `sc${factor}`;
    const width = 8 * factor;
    const rectHeight = 5 * factor;
    const notchRadius = 2 * factor;
    const area = width * rectHeight - 0.5 * Math.PI * notchRadius * notchRadius;
    const perimeter = 2 * rectHeight + 2 * width - 2 * notchRadius + Math.PI * notchRadius;
    const scene = { zh: '长方形挖半圆', en: 'rectangle with semicircle notch' };

    variants[`semicircle_cut_rectangle_area:${id}`] = {
      key: `semicircle_cut_rectangle_area:${id}`,
      kind: 'semicircle_cut_rectangle_area',
      variantId: id,
      template: 'composite_overlay',
      width,
      rectHeight,
      notchRadius,
      answer: area,
      scene,
    };
    variants[`semicircle_cut_rectangle_perimeter:${id}`] = {
      key: `semicircle_cut_rectangle_perimeter:${id}`,
      kind: 'semicircle_cut_rectangle_perimeter',
      variantId: id,
      template: 'composite_overlay',
      width,
      rectHeight,
      notchRadius,
      answer: perimeter,
      scene,
    };
    variants[`semicircle_cut_rectangle_area_reverse:${id}`] = {
      key: `semicircle_cut_rectangle_area_reverse:${id}`,
      kind: 'semicircle_cut_rectangle_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      width,
      rectHeight,
      notchRadius,
      area,
      answer: rectHeight,
      scene,
    };
  });

  Array.from({ length: 11 }, (_, index) => 2 + index).forEach((factor) => {
    const id = `oc${factor}`;
    const side = 6 * factor;
    const cut = factor;
    const area = side * side - 2 * cut * cut;
    const perimeter = 4 * (side - 2 * cut) + 4 * cut * Math.SQRT2;
    const scene = { zh: '切角八边形', en: 'corner cut octagon' };

    variants[`octagon_corner_cut_area:${id}`] = {
      key: `octagon_corner_cut_area:${id}`,
      kind: 'octagon_corner_cut_area',
      variantId: id,
      template: 'composite_overlay',
      side,
      cut,
      answer: area,
      scene,
    };
    variants[`octagon_corner_cut_perimeter:${id}`] = {
      key: `octagon_corner_cut_perimeter:${id}`,
      kind: 'octagon_corner_cut_perimeter',
      variantId: id,
      template: 'composite_overlay',
      side,
      cut,
      answer: perimeter,
      scene,
    };
    variants[`octagon_corner_cut_area_reverse:${id}`] = {
      key: `octagon_corner_cut_area_reverse:${id}`,
      kind: 'octagon_corner_cut_area_reverse',
      variantId: id,
      template: 'composite_overlay',
      side,
      cut,
      area,
      answer: cut,
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
        ? `如图，两个正方形并排放置，右边正方形边长是左边的 2 倍。阴影部分面积是 ${formatAreaDisplay(item.area)}。求左边正方形的边长。`
        : `As shown, two squares sit side by side and the right square has side length twice the left. The shaded area is ${formatAreaDisplay(item.area)}. Find the left square's side length.`;
    case 'adjacent_squares_diagonal_tall_area':
      return zh
        ? `如图，左边正方形边长 ${item.small_side} cm，右边正方形边长 ${item.large_side} cm，右边边长是左边的 3 倍，连接左下角与右上角。求阴影部分的面积。`
        : `As shown, the left square has side ${item.small_side} cm and the right square has side ${item.large_side} cm, which is three times the left. A diagonal joins the bottom-left corner to the top-right corner. Find the shaded area.`;
    case 'adjacent_squares_diagonal_tall_area_reverse':
      return zh
        ? `如图，两个正方形并排放置，右边正方形边长是左边的 3 倍。阴影部分面积是 ${formatAreaDisplay(item.area)}。求左边正方形的边长。`
        : `As shown, two squares sit side by side and the right square has side length three times the left. The shaded area is ${formatAreaDisplay(item.area)}. Find the left square's side length.`;
    case 'overlap_rectangles_union_area':
      return zh
        ? `如图，两个长方形部分重叠组成阴影图形。横放长方形长 ${item.baseWidth} cm、宽 ${item.baseHeight} cm，竖放长方形宽 ${item.towerWidth} cm、高 ${item.towerHeight} cm，重叠部分的宽是 ${item.overlapWidth} cm。求阴影部分的面积。`
        : `As shown, two rectangles overlap to form the shaded figure. The horizontal rectangle is ${item.baseWidth} cm by ${item.baseHeight} cm, the vertical rectangle is ${item.towerWidth} cm by ${item.towerHeight} cm, and the overlap width is ${item.overlapWidth} cm. Find the shaded area.`;
    case 'overlap_rectangles_union_area_reverse':
      return zh
        ? `如图，两个长方形部分重叠组成阴影图形。横放长方形长 ${item.baseWidth} cm、宽 ${item.baseHeight} cm，竖放长方形宽 ${item.towerWidth} cm、高 ${item.towerHeight} cm，阴影部分面积是 ${formatAreaDisplay(item.area)}。求重叠部分的宽。`
        : `As shown, two rectangles overlap to form the shaded figure. The horizontal rectangle is ${item.baseWidth} cm by ${item.baseHeight} cm, the vertical rectangle is ${item.towerWidth} cm by ${item.towerHeight} cm, and the shaded area is ${formatAreaDisplay(item.area)}. Find the overlap width.`;
    case 'overlap_rectangles_union_perimeter':
      return zh
        ? `如图，两个长方形部分重叠组成阴影图形。横放长方形长 ${item.baseWidth} cm、宽 ${item.baseHeight} cm，竖放长方形宽 ${item.towerWidth} cm、高 ${item.towerHeight} cm，重叠部分的宽是 ${item.overlapWidth} cm。求阴影图形的周长。`
        : `As shown, two rectangles overlap to form the shaded figure. The horizontal rectangle is ${item.baseWidth} cm by ${item.baseHeight} cm, the vertical rectangle is ${item.towerWidth} cm by ${item.towerHeight} cm, and the overlap width is ${item.overlapWidth} cm. Find the perimeter of the shaded figure.`;
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
        ? `如图，一个长方形右上角切去一个直角三角形，阴影部分面积是 ${formatAreaDisplay(item.area)}。求被切去三角形的较短直角边。`
        : `As shown, a right triangle is cut from the upper-right corner of a rectangle. The shaded area is ${formatAreaDisplay(item.area)}. Find the shorter leg of the cut triangle.`;
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
        ? `如图，一个长方形相框由大长方形中挖去一个小长方形得到。外框长 ${item.outerWidth} cm、宽 ${item.outerHeight} cm，内孔宽 ${item.innerHeight} cm，阴影部分面积是 ${formatAreaDisplay(item.area)}。求内孔的长。`
        : `As shown, a rectangular frame is formed by cutting a smaller rectangle from a larger one. The outer rectangle is ${item.outerWidth} cm by ${item.outerHeight} cm, the inner height is ${item.innerHeight} cm, and the shaded area is ${formatAreaDisplay(item.area)}. Find the inner width.`;
    case 'rectangle_frame_perimeter_reverse':
      return zh
        ? `如图，一个长方形相框由大长方形中挖去一个小长方形得到。外框长 ${item.outerWidth} cm、宽 ${item.outerHeight} cm，内孔宽 ${item.innerHeight} cm，阴影部分周长是 ${formatLength(item.perimeter)}。求内孔的长。`
        : `As shown, a rectangular frame is formed by cutting a smaller rectangle from a larger one. The outer rectangle is ${item.outerWidth} cm by ${item.outerHeight} cm, the inner height is ${item.innerHeight} cm, and the frame perimeter is ${formatLength(item.perimeter)}. Find the inner width.`;
    case 'house_shape_area':
      return zh
        ? `如图，一个“小房子”图形由一个长方形和上方一个等腰三角形组成。底边长 ${item.width} cm，墙高 ${item.wallHeight} cm，屋顶高 ${item.roofRise} cm。求这个图形的面积。`
        : `As shown, a house-shaped figure is made of a rectangle topped by an isosceles triangle. The base is ${item.width} cm, the wall height is ${item.wallHeight} cm, and the roof rise is ${item.roofRise} cm. Find the area.`;
    case 'house_shape_perimeter':
      return zh
        ? `如图，一个“小房子”图形由一个长方形和上方一个等腰三角形组成。底边长 ${item.width} cm，墙高 ${item.wallHeight} cm，屋顶高 ${item.roofRise} cm。求这个图形的周长。`
        : `As shown, a house-shaped figure is made of a rectangle topped by an isosceles triangle. The base is ${item.width} cm, the wall height is ${item.wallHeight} cm, and the roof rise is ${item.roofRise} cm. Find the perimeter.`;
    case 'house_shape_area_reverse':
      return zh
        ? `如图，一个“小房子”图形由一个长方形和上方一个等腰三角形组成。底边长 ${item.width} cm，墙高 ${item.wallHeight} cm，图形面积是 ${formatAreaDisplay(item.area)}。求屋顶的高。`
        : `As shown, a house-shaped figure is made of a rectangle topped by an isosceles triangle. The base is ${item.width} cm, the wall height is ${item.wallHeight} cm, and the area is ${formatAreaDisplay(item.area)}. Find the roof rise.`;
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
        ? `如图，一个圆形中挖去一个长方形空洞，阴影部分面积是 ${formatCircleCutAreaExpressionDisplay(item.radius, item.rectW, item.rectH)}。求长方形的宽。`
        : `As shown, a rectangle is cut out of a circle. The shaded area is ${formatCircleCutAreaExpressionDisplay(item.radius, item.rectW, item.rectH)}. Find the rectangle's width.`;
    case 'semicircle_rectangle_area':
      return zh
        ? `如图，一个图形由一个长方形和上方的半圆组成。已知半圆半径 ${item.radius} cm，长方形高 ${item.rectHeight} cm。求这个图形的面积。`
        : `As shown, a shape is made from a rectangle and a semicircle on top. The semicircle radius is ${item.radius} cm and the rectangle height is ${item.rectHeight} cm. Find the area.`;
    case 'semicircle_rectangle_perimeter':
      return zh
        ? `如图，一个图形由一个长方形和上方的半圆组成。已知半圆半径 ${item.radius} cm，长方形高 ${item.rectHeight} cm。求这个图形的周长。`
        : `As shown, a shape is made from a rectangle and a semicircle on top. The semicircle radius is ${item.radius} cm and the rectangle height is ${item.rectHeight} cm. Find the perimeter.`;
    case 'semicircle_rectangle_area_reverse':
      return zh
        ? `如图，一个图形由一个长方形和上方的半圆组成。已知半圆半径 ${item.radius} cm，整个图形的面积是 ${formatPiAreaExpression(2 * item.radius * item.rectHeight, Math.round(item.radius * item.radius / 2))}。求长方形的高。`
        : `As shown, a shape is made from a rectangle and a semicircle on top. The semicircle radius is ${item.radius} cm and the total area is ${formatPiAreaExpression(2 * item.radius * item.rectHeight, Math.round(item.radius * item.radius / 2))}. Find the rectangle height.`;
    case 'quarter_circle_corner_area':
      return zh
        ? `如图，一个边长为 ${item.side} cm 的正方形中挖去了一个四分之一圆。求阴影部分的面积。`
        : `As shown, a quarter circle is cut from a square of side ${item.side} cm. Find the shaded area.`;
    case 'quarter_circle_corner_perimeter':
      return zh
        ? `如图，一个边长为 ${item.side} cm 的正方形中挖去了一个四分之一圆。求阴影部分的周长。`
        : `As shown, a quarter circle is cut from a square of side ${item.side} cm. Find the perimeter of the shaded region.`;
    case 'quarter_circle_corner_area_reverse':
      return zh
        ? `如图，一个正方形中挖去了一个四分之一圆，阴影部分面积是 ${formatMinusPiAreaExpression(item.side * item.side, Math.round(item.side * item.side / 4))}。求正方形的边长。`
        : `As shown, a quarter circle is cut from a square and the shaded area is ${formatMinusPiAreaExpression(item.side * item.side, Math.round(item.side * item.side / 4))}. Find the side length of the square.`;
    case 'rhombus_diagonals_area':
      return zh
        ? `如图，一个菱形的两条对角线分别长 ${item.diagonalH} cm 和 ${item.diagonalV} cm。求这个菱形的面积。`
        : `As shown, a rhombus has diagonals ${item.diagonalH} cm and ${item.diagonalV} cm. Find its area.`;
    case 'rhombus_diagonals_perimeter':
      return zh
        ? `如图，一个菱形的两条对角线分别长 ${item.diagonalH} cm 和 ${item.diagonalV} cm。求这个菱形的周长。`
        : `As shown, a rhombus has diagonals ${item.diagonalH} cm and ${item.diagonalV} cm. Find its perimeter.`;
    case 'rhombus_diagonals_area_reverse':
      return zh
        ? `如图，一个菱形的一条对角线长 ${item.diagonalH} cm，面积是 ${formatAreaDisplay(item.area)}。求另一条对角线的长。`
        : `As shown, a rhombus has one diagonal of ${item.diagonalH} cm and area ${formatAreaDisplay(item.area)}. Find the other diagonal.`;
    case 'cross_shape_area':
      return zh
        ? `如图，一个十字形由两条等宽长方形交叉组成。已知整体长 ${item.armSpan} cm，横竖条宽都为 ${item.armThickness} cm。求这个图形的面积。`
        : `As shown, a cross shape is formed by two equal-width rectangles crossing. The overall span is ${item.armSpan} cm and the bar thickness is ${item.armThickness} cm. Find the area.`;
    case 'cross_shape_perimeter':
      return zh
        ? `如图，一个十字形由两条等宽长方形交叉组成。已知整体长 ${item.armSpan} cm，横竖条宽都为 ${item.armThickness} cm。求这个图形的周长。`
        : `As shown, a cross shape is formed by two equal-width rectangles crossing. The overall span is ${item.armSpan} cm and the bar thickness is ${item.armThickness} cm. Find the perimeter.`;
    case 'cross_shape_area_reverse':
      return zh
        ? `如图，一个十字形由两条等宽长方形交叉组成。已知整体长 ${item.armSpan} cm，面积是 ${formatAreaDisplay(item.area)}。求横竖条的宽。`
        : `As shown, a cross shape is formed by two equal-width rectangles crossing. The overall span is ${item.armSpan} cm and the area is ${formatAreaDisplay(item.area)}. Find the bar thickness.`;
    case 'trapezoid_triangle_stack_area':
      return zh
        ? `如图，一个图形由下方梯形和上方三角形组成。已知下底 ${item.bottomBase} cm，上底 ${item.topBase} cm，梯形高 ${item.trapHeight} cm，屋顶高 ${item.roofRise} cm。求这个图形的面积。`
        : `As shown, a figure is made from a trapezoid with a triangle on top. The lower base is ${item.bottomBase} cm, the upper base is ${item.topBase} cm, the trapezoid height is ${item.trapHeight} cm, and the roof rise is ${item.roofRise} cm. Find the area.`;
    case 'trapezoid_triangle_stack_perimeter':
      return zh
        ? `如图，一个图形由下方梯形和上方三角形组成。已知下底 ${item.bottomBase} cm，上底 ${item.topBase} cm，梯形高 ${item.trapHeight} cm，屋顶高 ${item.roofRise} cm。求这个图形的周长。`
        : `As shown, a figure is made from a trapezoid with a triangle on top. The lower base is ${item.bottomBase} cm, the upper base is ${item.topBase} cm, the trapezoid height is ${item.trapHeight} cm, and the roof rise is ${item.roofRise} cm. Find the perimeter.`;
    case 'trapezoid_triangle_stack_area_reverse':
      return zh
        ? `如图，一个图形由下方梯形和上方三角形组成。已知下底 ${item.bottomBase} cm，上底 ${item.topBase} cm，梯形高 ${item.trapHeight} cm，面积是 ${formatAreaDisplay(item.area)}。求屋顶高。`
        : `As shown, a figure is made from a trapezoid with a triangle on top. The lower base is ${item.bottomBase} cm, the upper base is ${item.topBase} cm, the trapezoid height is ${item.trapHeight} cm, and the total area is ${formatAreaDisplay(item.area)}. Find the roof rise.`;
    case 'semicircle_cut_rectangle_area':
      return zh
        ? `如图，一个长方形的上边中间挖去了一个半圆。已知长方形长 ${item.width} cm，高 ${item.rectHeight} cm，半圆半径 ${item.notchRadius} cm。求剩余图形的面积。`
        : `As shown, a semicircle is cut from the top edge of a rectangle. The rectangle is ${item.width} cm by ${item.rectHeight} cm and the semicircle radius is ${item.notchRadius} cm. Find the remaining area.`;
    case 'semicircle_cut_rectangle_perimeter':
      return zh
        ? `如图，一个长方形的上边中间挖去了一个半圆。已知长方形长 ${item.width} cm，高 ${item.rectHeight} cm，半圆半径 ${item.notchRadius} cm。求剩余图形的周长。`
        : `As shown, a semicircle is cut from the top edge of a rectangle. The rectangle is ${item.width} cm by ${item.rectHeight} cm and the semicircle radius is ${item.notchRadius} cm. Find the remaining perimeter.`;
    case 'semicircle_cut_rectangle_area_reverse':
      return zh
        ? `如图，一个长方形的上边中间挖去了一个半圆。已知长方形长 ${item.width} cm，半圆半径 ${item.notchRadius} cm，剩余图形面积是 ${item.width * item.rectHeight} - ${Math.round(item.notchRadius * item.notchRadius / 2)}π cm²。求长方形的高。`
        : `As shown, a semicircle is cut from the top edge of a rectangle. The rectangle width is ${item.width} cm, the semicircle radius is ${item.notchRadius} cm, and the remaining area is ${item.width * item.rectHeight} - ${Math.round(item.notchRadius * item.notchRadius / 2)}π cm². Find the rectangle height.`;
    case 'octagon_corner_cut_area':
      return zh
        ? `如图，一个正方形四个角各切去一个等腰直角三角形，得到一个八边形。已知原正方形边长 ${item.side} cm，每个切角直角边长 ${item.cut} cm。求八边形的面积。`
        : `As shown, equal right triangles are cut from the four corners of a square to form an octagon. The square side is ${item.side} cm and each cut leg is ${item.cut} cm. Find the octagon area.`;
    case 'octagon_corner_cut_perimeter':
      return zh
        ? `如图，一个正方形四个角各切去一个等腰直角三角形，得到一个八边形。已知原正方形边长 ${item.side} cm，每个切角直角边长 ${item.cut} cm。求八边形的周长。`
        : `As shown, equal right triangles are cut from the four corners of a square to form an octagon. The square side is ${item.side} cm and each cut leg is ${item.cut} cm. Find the octagon perimeter.`;
    case 'octagon_corner_cut_area_reverse':
      return zh
        ? `如图，一个正方形四个角各切去一个等腰直角三角形，得到一个八边形。已知原正方形边长 ${item.side} cm，八边形面积是 ${formatAreaDisplay(item.area)}。求每个切角直角边长。`
        : `As shown, equal right triangles are cut from the four corners of a square to form an octagon. The square side is ${item.side} cm and the octagon area is ${formatAreaDisplay(item.area)}. Find the cut leg length.`;
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
      { kind: 'text', x: (A.x + G.x) / 2, y: (A.y + G.y) / 2, text: item.kind.endsWith('reverse') ? formatAreaDisplay(item.area) : '', color: '#f59e0b' },
    ],
  };
}

function buildOverlapRectanglesUnionSpec(item) {
  const towerLeft = item.baseWidth - item.overlapWidth;
  const towerRight = towerLeft + item.towerWidth;

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: towerRight, yMin: 0, yMax: item.towerHeight },
    layers: [
      { kind: 'poly', pts: buildRect(0, 0, item.baseWidth, item.baseHeight), fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'poly', pts: buildRect(towerLeft, 0, item.towerWidth, item.towerHeight), fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: item.baseWidth, y: 0 }, label: formatLength(item.baseWidth), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: 0, y: item.baseHeight }, label: formatLength(item.baseHeight), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: towerLeft, y: item.towerHeight }, b: { x: towerRight, y: item.towerHeight }, label: formatLength(item.towerWidth), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: towerRight, y: 0 }, b: { x: towerRight, y: item.towerHeight }, label: formatLength(item.towerHeight), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: towerLeft, y: item.baseHeight }, b: { x: item.baseWidth, y: item.baseHeight }, label: item.kind === 'overlap_rectangles_union_area_reverse' ? '?' : formatLength(item.overlapWidth), color: '#f59e0b' },
      { kind: 'text', x: towerRight / 2, y: item.towerHeight / 2, text: item.kind === 'overlap_rectangles_union_area_reverse' ? formatAreaDisplay(item.area) : '', color: '#f59e0b' },
    ],
  };
}

function buildRectangleTriangleCutSpec(item) {
  const notchA = { x: item.width, y: item.height - item.cutH };
  const notchB = { x: item.width - item.cutW, y: item.height };
  const outline = [
    { x: 0, y: 0 },
    { x: item.width, y: 0 },
    notchA,
    notchB,
    { x: 0, y: item.height },
  ];

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: item.width, yMin: 0, yMax: item.height },
    layers: [
      { kind: 'poly', pts: outline, fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: item.width, y: 0 }, label: formatLength(item.width), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: 0, y: item.height }, label: formatLength(item.height), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: item.width, y: 0 }, b: notchA, label: formatLength(item.cutH), color: '#f59e0b' },
      { kind: 'segLabel', a: notchA, b: notchB, label: item.kind.endsWith('reverse') ? '?' : formatLength(item.cutW), color: '#f59e0b' },
      { kind: 'text', x: item.width / 2, y: item.height / 2, text: item.kind === 'rectangle_triangle_cut_area_reverse' ? formatAreaDisplay(item.area) : '', color: '#f59e0b' },
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
      { kind: 'segLabel', a: { x: innerLeft, y: innerBottom }, b: { x: innerLeft + item.innerWidth, y: innerBottom }, label: (item.kind === 'rectangle_frame_area_reverse' || item.kind === 'rectangle_frame_perimeter_reverse') ? '?' : formatLength(item.innerWidth), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: innerLeft + item.innerWidth, y: innerBottom }, b: { x: innerLeft + item.innerWidth, y: innerBottom + item.innerHeight }, label: formatLength(item.innerHeight), color: '#f59e0b' },
      { kind: 'text', x: item.outerWidth / 2, y: item.outerHeight / 2, text: item.kind === 'rectangle_frame_area_reverse' ? formatAreaDisplay(item.area) : item.kind === 'rectangle_frame_perimeter_reverse' ? formatLength(item.perimeter) : '', color: '#f59e0b' },
    ],
  };
}

function buildHouseShapeSpec(item) {
  const half = item.width / 2;
  const leftRoof = { x: 0, y: item.wallHeight };
  const apex = { x: half, y: item.wallHeight + item.roofRise };
  const rightRoof = { x: item.width, y: item.wallHeight };
  const roofMid = { x: half, y: item.wallHeight };
  const outline = [
    { x: 0, y: 0 },
    { x: item.width, y: 0 },
    rightRoof,
    apex,
    leftRoof,
  ];

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: item.width, yMin: 0, yMax: item.wallHeight + item.roofRise },
    layers: [
      { kind: 'poly', pts: outline, fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: item.width, y: 0 }, label: formatLength(item.width), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: leftRoof, label: formatLength(item.wallHeight), color: '#f59e0b' },
      { kind: 'seg', a: roofMid, b: apex, stroke: '#94a3b8', sw: 1.8, dash: '5,4' },
      { kind: 'segLabel', a: roofMid, b: apex, label: item.kind === 'house_shape_area_reverse' ? '?' : formatLength(item.roofRise), color: '#f59e0b' },
      { kind: 'text', x: item.width / 2, y: item.wallHeight / 2, text: item.kind === 'house_shape_area_reverse' ? formatAreaDisplay(item.area) : '', color: '#f59e0b' },
    ],
  };
}

function buildCircleRectangleCutSpec(item) {
  const rect = [
    { x: -item.rectW / 2, y: -item.rectH / 2 },
    { x: item.rectW / 2, y: -item.rectH / 2 },
    { x: item.rectW / 2, y: item.rectH / 2 },
    { x: -item.rectW / 2, y: item.rectH / 2 },
  ];

  return {
    template: 'composite_overlay',
    bounds: { xMin: -item.radius, xMax: item.radius, yMin: -item.radius, yMax: item.radius },
    layers: [
      { kind: 'circle', c: { x: 0, y: 0 }, r: item.radius, fill: 'rgba(248,250,252,0.03)', stroke: '#94a3b8', sw: 2.2 },
      { kind: 'poly', pts: rect, fill: '#020617', stroke: '#94a3b8', sw: 2 },
      { kind: 'dot', p: { x: 0, y: 0 }, label: 'O', offset: { x: 8, y: 12 }, color: '#f8fafc' },
      { kind: 'dot', p: { x: item.radius, y: 0 }, label: 'A', offset: { x: 8, y: -10 }, color: '#f8fafc' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: item.radius, y: 0 }, label: formatLength(item.radius), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: -item.rectW / 2, y: -item.rectH / 2 }, b: { x: item.rectW / 2, y: -item.rectH / 2 }, label: item.kind.endsWith('reverse') ? '?' : formatLength(item.rectW), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: item.rectW / 2, y: -item.rectH / 2 }, b: { x: item.rectW / 2, y: item.rectH / 2 }, label: formatLength(item.rectH), color: '#f59e0b' },
      ...(item.kind.endsWith('reverse')
        ? [{ kind: 'text', x: 0, y: 0, text: formatCircleCutAreaExpressionDisplay(item.radius, item.rectW, item.rectH), color: '#f59e0b' }]
        : []),
    ],
  };
}

function buildSemicircleRectangleSpec(item) {
  const width = item.radius * 2;
  const center = { x: item.radius, y: item.rectHeight };
  const arcPoints = buildArcPoints(center, item.radius, 0, Math.PI, 24);
  const outline = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: item.rectHeight },
    ...arcPoints,
    { x: 0, y: item.rectHeight },
  ];
  const text = item.kind === 'semicircle_rectangle_area_reverse'
    ? formatPiAreaExpression(2 * item.radius * item.rectHeight, Math.round(item.radius * item.radius / 2))
    : '';

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: width, yMin: 0, yMax: item.rectHeight + item.radius },
    layers: [
      { kind: 'poly', pts: outline, fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'arc', c: center, r: item.radius, startAngle: 0, endAngle: Math.PI, stroke: '#94a3b8', sw: 2.2 },
      { kind: 'seg', a: center, b: { x: width, y: item.rectHeight }, stroke: '#94a3b8', sw: 1.8, dash: '5,4' },
      { kind: 'dot', p: center, label: 'O', offset: { x: 8, y: 12 }, color: '#f8fafc' },
      { kind: 'segLabel', a: center, b: { x: width, y: item.rectHeight }, label: formatLength(item.radius), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: 0, y: item.rectHeight }, label: item.kind === 'semicircle_rectangle_area_reverse' ? '' : formatLength(item.rectHeight), color: '#f59e0b' },
      { kind: 'text', x: item.radius, y: item.rectHeight / 2, text, color: '#f59e0b' },
    ],
  };
}

function buildQuarterCircleCornerSpec(item) {
  const arcPoints = buildArcPoints({ x: 0, y: 0 }, item.side, 0, Math.PI / 2, 24);
  const outline = [
    { x: 0, y: item.side },
    { x: item.side, y: item.side },
    { x: item.side, y: 0 },
    ...arcPoints,
  ];
  const text = item.kind === 'quarter_circle_corner_area_reverse'
    ? formatMinusPiAreaExpression(item.side * item.side, Math.round(item.side * item.side / 4))
    : '';

  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: item.side, yMin: 0, yMax: item.side },
    layers: [
      { kind: 'poly', pts: outline, fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'arc', c: { x: 0, y: 0 }, r: item.side, startAngle: 0, endAngle: Math.PI / 2, stroke: '#f59e0b', sw: 2.2 },
      { kind: 'segLabel', a: { x: 0, y: item.side }, b: { x: item.side, y: item.side }, label: item.kind === 'quarter_circle_corner_area_reverse' ? '' : formatLength(item.side), color: '#f59e0b' },
      { kind: 'text', x: item.side * 0.66, y: item.side * 0.62, text, color: '#f59e0b' },
    ],
  };
}

function buildRhombusDiagonalsSpec(item) {
  const left = { x: -item.diagonalH / 2, y: 0 };
  const top = { x: 0, y: item.diagonalV / 2 };
  const right = { x: item.diagonalH / 2, y: 0 };
  const bottom = { x: 0, y: -item.diagonalV / 2 };
  const text = item.kind === 'rhombus_diagonals_area_reverse' ? formatAreaDisplay(item.area) : '';

  return {
    template: 'composite_overlay',
    bounds: { xMin: -item.diagonalH / 2, xMax: item.diagonalH / 2, yMin: -item.diagonalV / 2, yMax: item.diagonalV / 2 },
    layers: [
      { kind: 'poly', pts: [left, top, right, bottom], fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'seg', a: left, b: right, stroke: '#94a3b8', sw: 1.8, dash: '5,4' },
      { kind: 'seg', a: top, b: bottom, stroke: '#94a3b8', sw: 1.8, dash: '5,4' },
      { kind: 'segLabel', a: left, b: right, label: formatLength(item.diagonalH), color: '#f59e0b' },
      { kind: 'segLabel', a: top, b: bottom, label: item.kind === 'rhombus_diagonals_area_reverse' ? '' : formatLength(item.diagonalV), color: '#f59e0b' },
      { kind: 'text', x: 0, y: 0, text, color: '#f59e0b' },
    ],
  };
}

function buildCrossShapeSpec(item) {
  const halfSpan = item.armSpan / 2;
  const halfThickness = item.armThickness / 2;
  const points = [
    { x: -halfThickness, y: halfSpan },
    { x: halfThickness, y: halfSpan },
    { x: halfThickness, y: halfThickness },
    { x: halfSpan, y: halfThickness },
    { x: halfSpan, y: -halfThickness },
    { x: halfThickness, y: -halfThickness },
    { x: halfThickness, y: -halfSpan },
    { x: -halfThickness, y: -halfSpan },
    { x: -halfThickness, y: -halfThickness },
    { x: -halfSpan, y: -halfThickness },
    { x: -halfSpan, y: halfThickness },
    { x: -halfThickness, y: halfThickness },
  ];
  const text = item.kind === 'cross_shape_area_reverse' ? formatAreaDisplay(item.area) : '';

  return {
    template: 'composite_overlay',
    bounds: { xMin: -halfSpan, xMax: halfSpan, yMin: -halfSpan, yMax: halfSpan },
    layers: [
      { kind: 'poly', pts: points, fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: { x: -halfSpan, y: -halfThickness }, b: { x: halfSpan, y: -halfThickness }, label: formatLength(item.armSpan), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: halfThickness, y: -halfThickness }, b: { x: halfThickness, y: halfThickness }, label: item.kind === 'cross_shape_area_reverse' ? '' : formatLength(item.armThickness), color: '#f59e0b' },
      { kind: 'text', x: 0, y: 0, text, color: '#f59e0b' },
    ],
  };
}

function buildTrapezoidTriangleStackSpec(item) {
  const offset = (item.bottomBase - item.topBase) / 2;
  const leftBottom = { x: 0, y: 0 };
  const rightBottom = { x: item.bottomBase, y: 0 };
  const rightTop = { x: item.bottomBase - offset, y: item.trapHeight };
  const apex = { x: item.bottomBase / 2, y: item.trapHeight + item.roofRise };
  const leftTop = { x: offset, y: item.trapHeight };
  const roofMid = { x: item.bottomBase / 2, y: item.trapHeight };
  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: item.bottomBase, yMin: 0, yMax: item.trapHeight + item.roofRise },
    layers: [
      { kind: 'poly', pts: [leftBottom, rightBottom, rightTop, apex, leftTop], fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: leftBottom, b: rightBottom, label: formatLength(item.bottomBase), color: '#f59e0b' },
      { kind: 'segLabel', a: leftTop, b: rightTop, label: formatLength(item.topBase), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: leftTop, label: formatLength(item.trapHeight), color: '#f59e0b' },
      { kind: 'seg', a: roofMid, b: apex, stroke: '#94a3b8', sw: 1.8, dash: '5,4' },
      { kind: 'segLabel', a: roofMid, b: apex, label: item.kind === 'trapezoid_triangle_stack_area_reverse' ? '' : formatLength(item.roofRise), color: '#f59e0b' },
      { kind: 'text', x: item.bottomBase / 2, y: item.trapHeight / 2, text: item.kind === 'trapezoid_triangle_stack_area_reverse' ? formatAreaDisplay(item.area) : '', color: '#f59e0b' },
    ],
  };
}

function buildSemicircleCutRectangleSpec(item) {
  const notchCenter = { x: item.width / 2, y: item.rectHeight };
  const arcPoints = buildArcPoints(notchCenter, item.notchRadius, Math.PI, 0, 24);
  const leftTop = notchCenter.x - item.notchRadius;
  const rightTop = notchCenter.x + item.notchRadius;
  const outline = [
    { x: 0, y: 0 },
    { x: item.width, y: 0 },
    { x: item.width, y: item.rectHeight },
    { x: rightTop, y: item.rectHeight },
    ...arcPoints,
    { x: leftTop, y: item.rectHeight },
    { x: 0, y: item.rectHeight },
  ];
  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: item.width, yMin: 0, yMax: item.rectHeight },
    layers: [
      { kind: 'poly', pts: outline, fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'arc', c: notchCenter, r: item.notchRadius, startAngle: Math.PI, endAngle: 0, stroke: '#94a3b8', sw: 2.2 },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: item.width, y: 0 }, label: formatLength(item.width), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: 0, y: item.rectHeight }, label: item.kind === 'semicircle_cut_rectangle_area_reverse' ? '' : formatLength(item.rectHeight), color: '#f59e0b' },
      { kind: 'seg', a: notchCenter, b: { x: rightTop, y: item.rectHeight }, stroke: '#94a3b8', sw: 1.8, dash: '5,4' },
      { kind: 'segLabel', a: notchCenter, b: { x: rightTop, y: item.rectHeight }, label: formatLength(item.notchRadius), color: '#f59e0b' },
      { kind: 'text', x: item.width / 2, y: item.rectHeight / 2, text: item.kind === 'semicircle_cut_rectangle_area_reverse' ? `${item.width * item.rectHeight} - ${Math.round(item.notchRadius * item.notchRadius / 2)}π cm²` : '', color: '#f59e0b' },
    ],
  };
}

function buildOctagonCornerCutSpec(item) {
  const s = item.side;
  const c = item.cut;
  const pts = [
    { x: c, y: 0 },
    { x: s - c, y: 0 },
    { x: s, y: c },
    { x: s, y: s - c },
    { x: s - c, y: s },
    { x: c, y: s },
    { x: 0, y: s - c },
    { x: 0, y: c },
  ];
  return {
    template: 'composite_overlay',
    bounds: { xMin: 0, xMax: s, yMin: 0, yMax: s },
    layers: [
      { kind: 'poly', pts, fill: 'rgba(245,158,11,0.18)', stroke: '#94a3b8', sw: 2 },
      { kind: 'segLabel', a: { x: c, y: 0 }, b: { x: s - c, y: 0 }, label: formatLength(s - 2 * c), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: s - c, y: 0 }, b: { x: s, y: c }, label: item.kind === 'octagon_corner_cut_area_reverse' ? '' : formatLength(c * Math.SQRT2), color: '#f59e0b' },
      { kind: 'text', x: s / 2, y: s / 2, text: item.kind === 'octagon_corner_cut_area_reverse' ? formatAreaDisplay(item.area) : '', color: '#f59e0b' },
      { kind: 'seg', a: { x: 0, y: 0 }, b: { x: c, y: 0 }, stroke: '#94a3b8', sw: 1.5, dash: '5,4' },
      { kind: 'seg', a: { x: 0, y: 0 }, b: { x: 0, y: c }, stroke: '#94a3b8', sw: 1.5, dash: '5,4' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: c, y: 0 }, label: item.kind === 'octagon_corner_cut_area_reverse' ? '' : formatLength(c), color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: 0 }, b: { x: 0, y: c }, label: '', color: '#f59e0b' },
      { kind: 'segLabel', a: { x: 0, y: s }, b: { x: s, y: s }, label: formatLength(s), color: '#f59e0b' },
    ],
  };
}

export function buildCompositeAreaPerimeterDiagramSpec(item) {
  let spec = {};
  switch (item.kind) {
    case 'adjacent_squares_diagonal_area':
    case 'adjacent_squares_diagonal_area_reverse':
    case 'adjacent_squares_diagonal_tall_area':
    case 'adjacent_squares_diagonal_tall_area_reverse':
      spec = buildAdjacentSquaresCompositeSpec(item);
      break;
    case 'overlap_rectangles_union_area':
    case 'overlap_rectangles_union_area_reverse':
    case 'overlap_rectangles_union_perimeter':
      spec = buildOverlapRectanglesUnionSpec(item);
      break;
    case 'rectangle_triangle_cut_area':
    case 'rectangle_triangle_cut_perimeter':
    case 'rectangle_triangle_cut_area_reverse':
      spec = buildRectangleTriangleCutSpec(item);
      break;
    case 'rectangle_frame_area':
    case 'rectangle_frame_perimeter':
    case 'rectangle_frame_area_reverse':
    case 'rectangle_frame_perimeter_reverse':
      spec = buildRectangleFrameSpec(item);
      break;
    case 'house_shape_area':
    case 'house_shape_perimeter':
    case 'house_shape_area_reverse':
      spec = buildHouseShapeSpec(item);
      break;
    case 'circle_rectangle_cut_area':
    case 'circle_rectangle_cut_perimeter':
    case 'circle_rectangle_cut_area_reverse':
      spec = buildCircleRectangleCutSpec(item);
      break;
    case 'semicircle_rectangle_area':
    case 'semicircle_rectangle_perimeter':
    case 'semicircle_rectangle_area_reverse':
      spec = buildSemicircleRectangleSpec(item);
      break;
    case 'quarter_circle_corner_area':
    case 'quarter_circle_corner_perimeter':
    case 'quarter_circle_corner_area_reverse':
      spec = buildQuarterCircleCornerSpec(item);
      break;
    case 'rhombus_diagonals_area':
    case 'rhombus_diagonals_perimeter':
    case 'rhombus_diagonals_area_reverse':
      spec = buildRhombusDiagonalsSpec(item);
      break;
    case 'cross_shape_area':
    case 'cross_shape_perimeter':
    case 'cross_shape_area_reverse':
      spec = buildCrossShapeSpec(item);
      break;
    case 'trapezoid_triangle_stack_area':
    case 'trapezoid_triangle_stack_perimeter':
    case 'trapezoid_triangle_stack_area_reverse':
      spec = buildTrapezoidTriangleStackSpec(item);
      break;
    case 'semicircle_cut_rectangle_area':
    case 'semicircle_cut_rectangle_perimeter':
    case 'semicircle_cut_rectangle_area_reverse':
      spec = buildSemicircleCutRectangleSpec(item);
      break;
    case 'octagon_corner_cut_area':
    case 'octagon_corner_cut_perimeter':
    case 'octagon_corner_cut_area_reverse':
      spec = buildOctagonCornerCutSpec(item);
      break;
    default:
      spec = {};
  }

  return stripUnknownDiagramLabels(spec);
}

export function buildCompositeAreaPerimeterRenderContract(item) {
  const genericComposite = ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"segLabel"'];

  switch (item.kind) {
    case 'adjacent_squares_diagonal_area':
    case 'adjacent_squares_diagonal_tall_area':
    case 'overlap_rectangles_union_area':
    case 'overlap_rectangles_union_perimeter':
    case 'rectangle_triangle_cut_area':
    case 'rectangle_triangle_cut_perimeter':
    case 'rectangle_frame_area':
    case 'rectangle_frame_perimeter':
    case 'house_shape_area':
    case 'house_shape_perimeter':
      return {
        questionIncludes: ['如图'],
        diagramIncludes: [...genericComposite, '"text":"?"'],
      };
    case 'adjacent_squares_diagonal_area_reverse':
    case 'adjacent_squares_diagonal_tall_area_reverse':
    case 'overlap_rectangles_union_area_reverse':
    case 'rectangle_triangle_cut_area_reverse':
    case 'rectangle_frame_area_reverse':
    case 'rectangle_frame_perimeter_reverse':
    case 'house_shape_area_reverse':
      return {
        questionIncludes: ['如图'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"poly"', '"kind":"segLabel"', '"text":"'],
      };
    case 'circle_rectangle_cut_area':
    case 'circle_rectangle_cut_perimeter':
      return {
        questionIncludes: ['圆形'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"circle"', '"kind":"poly"', '"kind":"segLabel"'],
      };
    case 'circle_rectangle_cut_area_reverse':
      return {
        questionIncludes: ['圆形'],
        diagramIncludes: ['"template":"composite_overlay"', '"kind":"circle"', '"kind":"poly"', '"kind":"segLabel"', `"text":"${formatCircleCutAreaExpressionDisplay(item.radius, item.rectW, item.rectH)}"`],
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
    case 'overlap_rectangles_union_perimeter':
      if (!isFinitePositiveNumber(item.baseWidth) || !isFinitePositiveNumber(item.towerWidth) || !isFinitePositiveNumber(item.towerHeight) || !isFinitePositiveNumber(item.overlapWidth)) issues.push('overlap rectangles perimeter data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * (item.baseWidth - item.overlapWidth + item.towerWidth + item.towerHeight))) issues.push('overlap rectangles perimeter mismatch');
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
    case 'rectangle_frame_perimeter_reverse':
      if (!isFinitePositiveNumber(item.outerWidth) || !isFinitePositiveNumber(item.outerHeight) || !isFinitePositiveNumber(item.innerWidth) || !isFinitePositiveNumber(item.innerHeight) || !isFinitePositiveNumber(item.perimeter)) issues.push('rectangle frame perimeter reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.perimeter, 2 * (item.outerWidth + item.outerHeight) + 2 * (item.innerWidth + item.innerHeight))) issues.push('rectangle frame perimeter reverse mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.innerWidth)) issues.push('rectangle frame perimeter reverse answer mismatch');
      break;
    case 'house_shape_area':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.wallHeight) || !isFinitePositiveNumber(item.roofRise)) issues.push('house shape data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.width * item.wallHeight + (item.width * item.roofRise) / 2)) issues.push('house shape area mismatch');
      break;
    case 'house_shape_perimeter':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.wallHeight) || !isFinitePositiveNumber(item.roofRise)) issues.push('house shape perimeter data is invalid');
      if (issues.length === 0) {
        const slant = Math.sqrt((item.width / 2) ** 2 + item.roofRise ** 2);
        if (!approxEqual(item.answer, item.width + 2 * item.wallHeight + 2 * slant)) issues.push('house shape perimeter mismatch');
      }
      break;
    case 'house_shape_area_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.wallHeight) || !isFinitePositiveNumber(item.roofRise) || !isFinitePositiveNumber(item.area)) issues.push('house shape reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, item.width * item.wallHeight + (item.width * item.roofRise) / 2)) issues.push('house shape reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.roofRise)) issues.push('house shape reverse answer mismatch');
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
    case 'semicircle_rectangle_area':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.rectHeight)) issues.push('semicircle rectangle data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * item.radius * item.rectHeight + 0.5 * Math.PI * item.radius * item.radius)) issues.push('semicircle rectangle area mismatch');
      break;
    case 'semicircle_rectangle_perimeter':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.rectHeight)) issues.push('semicircle rectangle perimeter data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * item.rectHeight + 2 * item.radius + Math.PI * item.radius)) issues.push('semicircle rectangle perimeter mismatch');
      break;
    case 'semicircle_rectangle_area_reverse':
      if (!isFinitePositiveNumber(item.radius) || !isFinitePositiveNumber(item.rectHeight) || !isFinitePositiveNumber(item.area)) issues.push('semicircle rectangle reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, 2 * item.radius * item.rectHeight + 0.5 * Math.PI * item.radius * item.radius)) issues.push('semicircle rectangle reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.rectHeight)) issues.push('semicircle rectangle reverse answer mismatch');
      break;
    case 'quarter_circle_corner_area':
      if (!isFinitePositiveNumber(item.side)) issues.push('quarter circle corner data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.side * item.side - (Math.PI * item.side * item.side) / 4)) issues.push('quarter circle corner area mismatch');
      break;
    case 'quarter_circle_corner_perimeter':
      if (!isFinitePositiveNumber(item.side)) issues.push('quarter circle corner perimeter data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * item.side + (Math.PI * item.side) / 2)) issues.push('quarter circle corner perimeter mismatch');
      break;
    case 'quarter_circle_corner_area_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.area)) issues.push('quarter circle corner reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, item.side * item.side - (Math.PI * item.side * item.side) / 4)) issues.push('quarter circle corner reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.side)) issues.push('quarter circle corner reverse answer mismatch');
      break;
    case 'rhombus_diagonals_area':
      if (!isFinitePositiveNumber(item.diagonalH) || !isFinitePositiveNumber(item.diagonalV)) issues.push('rhombus diagonals data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, (item.diagonalH * item.diagonalV) / 2)) issues.push('rhombus diagonals area mismatch');
      break;
    case 'rhombus_diagonals_perimeter':
      if (!isFinitePositiveNumber(item.diagonalH) || !isFinitePositiveNumber(item.diagonalV)) issues.push('rhombus diagonals perimeter data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 4 * Math.hypot(item.diagonalH / 2, item.diagonalV / 2))) issues.push('rhombus diagonals perimeter mismatch');
      break;
    case 'rhombus_diagonals_area_reverse':
      if (!isFinitePositiveNumber(item.diagonalH) || !isFinitePositiveNumber(item.diagonalV) || !isFinitePositiveNumber(item.area)) issues.push('rhombus diagonals reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, (item.diagonalH * item.diagonalV) / 2)) issues.push('rhombus diagonals reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.diagonalV)) issues.push('rhombus diagonals reverse answer mismatch');
      break;
    case 'cross_shape_area':
      if (!isFinitePositiveNumber(item.armSpan) || !isFinitePositiveNumber(item.armThickness) || item.armThickness >= item.armSpan) issues.push('cross shape data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * item.armSpan * item.armThickness - item.armThickness * item.armThickness)) issues.push('cross shape area mismatch');
      break;
    case 'cross_shape_perimeter':
      if (!isFinitePositiveNumber(item.armSpan) || !isFinitePositiveNumber(item.armThickness) || item.armThickness >= item.armSpan) issues.push('cross shape perimeter data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 4 * item.armSpan)) issues.push('cross shape perimeter mismatch');
      break;
    case 'cross_shape_area_reverse':
      if (!isFinitePositiveNumber(item.armSpan) || !isFinitePositiveNumber(item.armThickness) || !isFinitePositiveNumber(item.area) || item.armThickness >= item.armSpan) issues.push('cross shape reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, 2 * item.armSpan * item.armThickness - item.armThickness * item.armThickness)) issues.push('cross shape reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.armThickness)) issues.push('cross shape reverse answer mismatch');
      break;
    case 'trapezoid_triangle_stack_area':
      if (!isFinitePositiveNumber(item.bottomBase) || !isFinitePositiveNumber(item.topBase) || !isFinitePositiveNumber(item.trapHeight) || !isFinitePositiveNumber(item.roofRise) || item.bottomBase <= item.topBase) issues.push('trapezoid triangle stack data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, ((item.bottomBase + item.topBase) * item.trapHeight) / 2 + (item.topBase * item.roofRise) / 2)) issues.push('trapezoid triangle stack area mismatch');
      break;
    case 'trapezoid_triangle_stack_perimeter':
      if (!isFinitePositiveNumber(item.bottomBase) || !isFinitePositiveNumber(item.topBase) || !isFinitePositiveNumber(item.trapHeight) || !isFinitePositiveNumber(item.roofRise) || item.bottomBase <= item.topBase) issues.push('trapezoid triangle stack perimeter data is invalid');
      if (issues.length === 0) {
        const trapSlant = Math.hypot((item.bottomBase - item.topBase) / 2, item.trapHeight);
        const roofSlant = Math.hypot(item.topBase / 2, item.roofRise);
        if (!approxEqual(item.answer, item.bottomBase + 2 * trapSlant + 2 * roofSlant)) issues.push('trapezoid triangle stack perimeter mismatch');
      }
      break;
    case 'trapezoid_triangle_stack_area_reverse':
      if (!isFinitePositiveNumber(item.bottomBase) || !isFinitePositiveNumber(item.topBase) || !isFinitePositiveNumber(item.trapHeight) || !isFinitePositiveNumber(item.roofRise) || !isFinitePositiveNumber(item.area) || item.bottomBase <= item.topBase) issues.push('trapezoid triangle stack reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, ((item.bottomBase + item.topBase) * item.trapHeight) / 2 + (item.topBase * item.roofRise) / 2)) issues.push('trapezoid triangle stack reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.roofRise)) issues.push('trapezoid triangle stack reverse answer mismatch');
      break;
    case 'semicircle_cut_rectangle_area':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.rectHeight) || !isFinitePositiveNumber(item.notchRadius) || item.width <= item.notchRadius * 2) issues.push('semicircle cut rectangle data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.width * item.rectHeight - 0.5 * Math.PI * item.notchRadius * item.notchRadius)) issues.push('semicircle cut rectangle area mismatch');
      break;
    case 'semicircle_cut_rectangle_perimeter':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.rectHeight) || !isFinitePositiveNumber(item.notchRadius) || item.width <= item.notchRadius * 2) issues.push('semicircle cut rectangle perimeter data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 2 * item.rectHeight + 2 * item.width - 2 * item.notchRadius + Math.PI * item.notchRadius)) issues.push('semicircle cut rectangle perimeter mismatch');
      break;
    case 'semicircle_cut_rectangle_area_reverse':
      if (!isFinitePositiveNumber(item.width) || !isFinitePositiveNumber(item.rectHeight) || !isFinitePositiveNumber(item.notchRadius) || !isFinitePositiveNumber(item.area) || item.width <= item.notchRadius * 2) issues.push('semicircle cut rectangle reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, item.width * item.rectHeight - 0.5 * Math.PI * item.notchRadius * item.notchRadius)) issues.push('semicircle cut rectangle reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.rectHeight)) issues.push('semicircle cut rectangle reverse answer mismatch');
      break;
    case 'octagon_corner_cut_area':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.cut) || item.side <= item.cut * 2) issues.push('octagon corner cut data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, item.side * item.side - 2 * item.cut * item.cut)) issues.push('octagon corner cut area mismatch');
      break;
    case 'octagon_corner_cut_perimeter':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.cut) || item.side <= item.cut * 2) issues.push('octagon corner cut perimeter data is invalid');
      if (issues.length === 0 && !approxEqual(item.answer, 4 * (item.side - 2 * item.cut) + 4 * item.cut * Math.SQRT2)) issues.push('octagon corner cut perimeter mismatch');
      break;
    case 'octagon_corner_cut_area_reverse':
      if (!isFinitePositiveNumber(item.side) || !isFinitePositiveNumber(item.cut) || !isFinitePositiveNumber(item.area) || item.side <= item.cut * 2) issues.push('octagon corner cut reverse data is invalid');
      if (issues.length === 0 && !approxEqual(item.area, item.side * item.side - 2 * item.cut * item.cut)) issues.push('octagon corner cut reverse area mismatch');
      if (issues.length === 0 && !approxEqual(item.answer, item.cut)) issues.push('octagon corner cut reverse answer mismatch');
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
