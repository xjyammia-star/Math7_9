// src/data/formulaVisuals.ts

export interface FormulaItem {
  id: string;
  name: { zh: string; en: string };
  latex: string;
  description: { zh: string; en: string };
  explanation: { zh: string; en: string };
  componentKey: string;
  relatedConceptId: string;
  difficulty: 1 | 2 | 3;
}

export interface FormulaCategory {
  id: string;
  name: { zh: string; en: string };
  icon: string;
  formulas: FormulaItem[];
}

export const FORMULA_CATEGORIES: FormulaCategory[] = [
  {
    id: 'algebra-identity',
    name: { zh: '代数恒等式', en: 'Algebraic Identities' },
    icon: '🔢',
    formulas: [
      {
        id: 'square-diff',
        name: { zh: '完全平方差', en: 'Perfect Square (Difference)' },
        latex: '(a-b)^2 = a^2 - 2ab + b^2',
        description: { zh: '两数之差的平方展开', en: 'Expansion of the square of a difference' },
        explanation: {
          zh: '将边长为 a 的大正方形，减去两个 a×b 的矩形，再加回多减的 b² 小正方形，最终剩下边长为 (a-b) 的蓝色正方形。拖动滑块可以直观看到各部分面积的变化关系。',
          en: 'Start with a large square of side a, subtract two rectangles of size a×b, then add back the over-subtracted b² square. The remaining blue square has side (a-b). Drag the sliders to see how the areas relate.'
        },
        componentKey: 'SquareDiff',
        relatedConceptId: 'factorisation',
        difficulty: 2,
      },
      {
        id: 'square-sum',
        name: { zh: '完全平方和', en: 'Perfect Square (Sum)' },
        latex: '(a+b)^2 = a^2 + 2ab + b^2',
        description: { zh: '两数之和的平方展开', en: 'Expansion of the square of a sum' },
        explanation: {
          zh: '边长为 (a+b) 的大正方形，可以分割成：左上角 a² 正方形、右下角 b² 正方形、以及两个面积为 ab 的矩形。四部分面积之和恰好等于 (a+b)²。',
          en: 'A square with side (a+b) splits into: a top-left a² square, a bottom-right b² square, and two rectangles each of area ab. The four areas sum to exactly (a+b)².'
        },
        componentKey: 'SquareSum',
        relatedConceptId: 'factorisation',
        difficulty: 2,
      },
      {
        id: 'diff-squares',
        name: { zh: '平方差公式', en: 'Difference of Squares' },
        latex: 'a^2 - b^2 = (a+b)(a-b)',
        description: { zh: '两个平方数之差的因式分解', en: 'Factorisation of the difference of two squares' },
        explanation: {
          zh: '大正方形 a² 减去小正方形 b²，剩余的 L 形区域可以重新拼成一个长为 (a+b)、宽为 (a-b) 的矩形。这就是平方差公式的几何含义。',
          en: 'The L-shaped region left after removing the b² square from the a² square can be rearranged into a rectangle with length (a+b) and width (a-b). This is the geometric meaning of the difference of squares.'
        },
        componentKey: 'DiffSquares',
        relatedConceptId: 'factorisation',
        difficulty: 2,
      },
    ],
  },
  {
    id: 'functions',
    name: { zh: '函数图像', en: 'Function Graphs' },
    icon: '📈',
    formulas: [
      {
        id: 'linear-func',
        name: { zh: '一次函数', en: 'Linear Function' },
        latex: 'y = kx + b',
        description: { zh: '斜率与截距控制直线', en: 'Slope and intercept control the line' },
        explanation: {
          zh: 'k 是斜率，决定直线的倾斜程度：k>0 向右上方，k<0 向右下方，|k| 越大越陡。b 是纵轴截距，决定直线与 y 轴的交点位置。拖动滑块观察直线如何变化。',
          en: 'k is the slope controlling the tilt: k>0 rises right, k<0 falls right, larger |k| means steeper. b is the y-intercept controlling where the line crosses the y-axis.'
        },
        componentKey: 'LinearFunc',
        relatedConceptId: 'functions-linear',
        difficulty: 2,
      },
      {
        id: 'quadratic-func',
        name: { zh: '二次函数', en: 'Quadratic Function' },
        latex: 'y = ax^2 + bx + c',
        description: { zh: '抛物线的开口、顶点与截距', en: 'Parabola opening, vertex and intercepts' },
        explanation: {
          zh: 'a 决定开口方向（a>0 开口向上，a<0 向下）和宽窄（|a| 越大越窄）。b 影响对称轴位置。c 是纵轴截距。顶点坐标为 (-b/2a, c-b²/4a)。',
          en: 'a controls opening direction (a>0 opens up, a<0 opens down) and width (larger |a| = narrower). b shifts the axis of symmetry. c is the y-intercept. Vertex is at (-b/2a, c-b²/4a).'
        },
        componentKey: 'QuadraticFunc',
        relatedConceptId: 'functions-quadratic',
        difficulty: 3,
      },
      {
        id: 'inverse-func',
        name: { zh: '反比例函数', en: 'Inverse Proportion Function' },
        latex: 'y = \\frac{k}{x}',
        description: { zh: '双曲线与 k 值的关系', en: 'Hyperbola and its relationship with k' },
        explanation: {
          zh: 'k>0 时图像在第一、三象限；k<0 时在第二、四象限。|k| 越大，双曲线距原点越远。图像永远不会碰到 x 轴或 y 轴（渐近线）。',
          en: 'When k>0, the graph is in quadrants 1 and 3; when k<0, in quadrants 2 and 4. Larger |k| pushes the curve further from the origin. The graph never touches either axis (asymptotes).'
        },
        componentKey: 'InverseFunc',
        relatedConceptId: 'functions-inverse',
        difficulty: 3,
      },
    ],
  },
  {
    id: 'geometry',
    name: { zh: '几何定理', en: 'Geometry Theorems' },
    icon: '📐',
    formulas: [
      {
        id: 'pythagorean',
        name: { zh: '勾股定理', en: 'Pythagorean Theorem' },
        latex: 'a^2 + b^2 = c^2',
        description: { zh: '直角三角形三边关系', en: 'Relationship between sides of a right triangle' },
        explanation: {
          zh: '直角三角形的两条直角边 a、b 上的正方形面积之和，等于斜边 c 上的正方形面积。红色面积 + 蓝色面积 = 绿色面积，对任意直角三角形永远成立。',
          en: 'The sum of areas of squares on the two legs (a and b) equals the area of the square on the hypotenuse (c). Red + Blue = Green, always true for any right triangle.'
        },
        componentKey: 'Pythagorean',
        relatedConceptId: 'pythagoras',
        difficulty: 2,
      },
      {
        id: 'triangle-area',
        name: { zh: '三角形面积', en: 'Triangle Area' },
        latex: 'S = \\frac{1}{2} \\times base \\times height',
        description: { zh: '底乘高除以二的几何直觉', en: 'Geometric intuition for base × height ÷ 2' },
        explanation: {
          zh: '任意三角形都可以看作同底等高的平行四边形的一半。平行四边形面积 = 底 × 高，所以三角形面积 = ½ × 底 × 高。拖动顶点观察面积如何保持不变。',
          en: 'Any triangle is exactly half of a parallelogram with the same base and height. Since a parallelogram area = base × height, triangle area = ½ × base × height.'
        },
        componentKey: 'TriangleArea',
        relatedConceptId: 'area-perimeter',
        difficulty: 1,
      },
      {
        id: 'circle-area',
        name: { zh: '圆的面积', en: 'Circle Area' },
        latex: 'S = \\pi r^2',
        description: { zh: '半径与面积的关系', en: 'Relationship between radius and area' },
        explanation: {
          zh: '圆的面积与半径的平方成正比。半径增大为原来的 2 倍，面积增大为原来的 4 倍（不是 2 倍！）。这是因为面积是二维的，缩放是按 r² 计算的。',
          en: 'Circle area is proportional to the square of the radius. Double the radius → quadruple the area (not double!). This is because area is 2D and scales as r².'
        },
        componentKey: 'CircleArea',
        relatedConceptId: 'area-perimeter',
        difficulty: 1,
      },
      {
        id: 'sector-area',
        name: { zh: '扇形面积', en: 'Sector Area' },
        latex: 'S = \\frac{\\theta}{360} \\pi r^2',
        description: { zh: '角度与半径共同决定扇形面积', en: 'Angle and radius together determine sector area' },
        explanation: {
          zh: '扇形是圆的一部分，面积按角度占 360° 的比例计算。角度为 180° 时是半圆，面积是整圆的一半。拖动角度和半径滑块，观察扇形形状和面积的变化。',
          en: 'A sector is a slice of a circle, with area proportional to its angle out of 360°. At 180° it becomes a semicircle with half the full circle area.'
        },
        componentKey: 'SectorArea',
        relatedConceptId: 'area-perimeter',
        difficulty: 2,
      },
    ],
  },
  {
    id: 'solid',
    name: { zh: '立体图形', en: 'Solid Geometry' },
    icon: '📦',
    formulas: [
      {
        id: 'cylinder-volume',
        name: { zh: '圆柱体积', en: 'Cylinder Volume' },
        latex: 'V = \\pi r^2 h',
        description: { zh: '底面积乘以高', en: 'Base area times height' },
        explanation: {
          zh: '圆柱的体积 = 底面圆的面积 × 高。可以想象把很多薄薄的圆片叠起来，每片面积 πr²，叠了 h 高，总体积就是 πr²h。',
          en: 'Cylinder volume = circular base area × height. Imagine stacking many thin circular discs, each with area πr², stacked to height h, giving total volume πr²h.'
        },
        componentKey: 'CylinderVolume',
        relatedConceptId: 'solid-geometry',
        difficulty: 2,
      },
      {
        id: 'cone-volume',
        name: { zh: '圆锥体积', en: 'Cone Volume' },
        latex: 'V = \\frac{1}{3} \\pi r^2 h',
        description: { zh: '圆柱体积的三分之一', en: 'One third of cylinder volume' },
        explanation: {
          zh: '等底等高的圆锥体积恰好是圆柱的 1/3。可以用倒水实验验证：装满水的圆锥倒入圆柱，需要倒三次才能装满。这个 1/3 关系非常奇妙！',
          en: 'A cone with the same base and height as a cylinder has exactly 1/3 the volume. You can verify with water: fill the cone and pour into the cylinder — it takes exactly 3 cones to fill the cylinder!'
        },
        componentKey: 'ConeVolume',
        relatedConceptId: 'solid-geometry',
        difficulty: 2,
      },
    ],
  },
  {
    id: 'trigonometry',
    name: { zh: '三角函数', en: 'Trigonometry' },
    icon: '📏',
    formulas: [
      {
        id: 'trig-basic',
        name: { zh: 'sinθ / cosθ / tanθ 定义', en: 'sin / cos / tan Definitions' },
        latex: '\\sin\\theta = \\frac{opp}{hyp},\\ \\cos\\theta = \\frac{adj}{hyp}',
        description: { zh: '直角三角形中三角函数的定义', en: 'Trig ratios defined in a right triangle' },
        explanation: {
          zh: '在直角三角形中，对于角 θ：sin = 对边/斜边，cos = 邻边/斜边，tan = 对边/邻边。记忆口诀：SOH-CAH-TOA。拖动角度观察三条边的比值如何变化。',
          en: 'In a right triangle for angle θ: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent. Remember: SOH-CAH-TOA. Drag the angle to see how the ratios change.'
        },
        componentKey: 'TrigBasic',
        relatedConceptId: 'trigonometry',
        difficulty: 3,
      },
      {
        id: 'unit-circle',
        name: { zh: '单位圆与三角函数', en: 'Unit Circle & Trig' },
        latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
        description: { zh: 'sinθ 和 cosθ 在单位圆上的几何意义', en: 'Geometric meaning of sinθ and cosθ on the unit circle' },
        explanation: {
          zh: '单位圆半径为 1，圆上任意一点的坐标就是 (cosθ, sinθ)。由勾股定理可得 sin²θ + cos²θ = 1。这是三角函数最基本的恒等式。',
          en: 'On a unit circle (radius 1), any point on the circle has coordinates (cosθ, sinθ). By the Pythagorean theorem, sin²θ + cos²θ = 1, the most fundamental trig identity.'
        },
        componentKey: 'UnitCircle',
        relatedConceptId: 'trigonometry',
        difficulty: 3,
      },
    ],
  },
  {
    id: 'sequences',
    name: { zh: '数列', en: 'Sequences' },
    icon: '🔁',
    formulas: [
      {
        id: 'arithmetic-seq',
        name: { zh: '等差数列通项', en: 'Arithmetic Sequence nth Term' },
        latex: 'a_n = a_1 + (n-1)d',
        description: { zh: '首项加上公差乘以项数减一', en: 'First term plus common difference times (n-1)' },
        explanation: {
          zh: '等差数列每项比前一项多 d（公差）。第 n 项 = 第 1 项 + (n-1) 个公差。用柱状图可以直观看到：每根柱子比前一根高 d，整体呈线性增长。',
          en: 'In an arithmetic sequence, each term is d more than the previous (d = common difference). The nth term = first term + (n-1) × d. The bar chart shows linear growth with constant step d.'
        },
        componentKey: 'ArithmeticSeq',
        relatedConceptId: 'sequences',
        difficulty: 2,
      },
      {
        id: 'geometric-seq',
        name: { zh: '等比数列通项', en: 'Geometric Sequence nth Term' },
        latex: 'a_n = a_1 \\cdot r^{n-1}',
        description: { zh: '指数增长或衰减', en: 'Exponential growth or decay' },
        explanation: {
          zh: '等比数列每项是前一项的 r 倍（r 为公比）。r>1 指数增长，0<r<1 指数衰减，r<0 正负交替。与等差数列的线性增长不同，等比数列增长极快。',
          en: 'Each term is r times the previous term (r = common ratio). r>1 means exponential growth, 0<r<1 means decay, r<0 means alternating signs. Unlike arithmetic sequences, geometric growth is extremely rapid.'
        },
        componentKey: 'GeometricSeq',
        relatedConceptId: 'sequences',
        difficulty: 2,
      },
    ],
  },
  {
    id: 'statistics',
    name: { zh: '统计', en: 'Statistics' },
    icon: '📊',
    formulas: [
      {
        id: 'mean-median',
        name: { zh: '平均数与中位数', en: 'Mean vs Median' },
        latex: '\\bar{x} = \\frac{\\sum x_i}{n}',
        description: { zh: '两种集中趋势的直观对比', en: 'Visual comparison of two measures of central tendency' },
        explanation: {
          zh: '平均数是所有数据的"重心"，受极端值影响大。中位数是排序后的中间值，对极端值不敏感。拖动数据点，观察两者如何不同地响应。',
          en: 'The mean is the "balance point" of all data, heavily affected by outliers. The median is the middle value after sorting, robust to extreme values. Drag data points to see how they respond differently.'
        },
        componentKey: 'MeanMedian',
        relatedConceptId: 'data-analysis',
        difficulty: 2,
      },
    ],
  },
];
