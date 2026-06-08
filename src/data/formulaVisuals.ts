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
      { id:'square-diff', name:{zh:'完全平方差',en:'Perfect Square (Difference)'}, latex:'(a-b)^2 = a^2 - 2ab + b^2', description:{zh:'两数之差的平方展开',en:'Expansion of the square of a difference'}, explanation:{zh:'将边长为a的大正方形，减去两个a×b的矩形，再加回多减的b²小正方形，最终剩下边长为(a-b)的蓝色正方形。',en:'Start with a large square of side a, subtract two a×b rectangles, add back the over-subtracted b² square. The remaining blue square has side (a-b).'}, componentKey:'SquareDiff', relatedConceptId:'factorisation', difficulty:2 },
      { id:'square-sum', name:{zh:'完全平方和',en:'Perfect Square (Sum)'}, latex:'(a+b)^2 = a^2 + 2ab + b^2', description:{zh:'两数之和的平方展开',en:'Expansion of the square of a sum'}, explanation:{zh:'边长为(a+b)的大正方形分割成四部分：左上角a²、右下角b²、两个面积为ab的矩形。',en:'A square with side (a+b) splits into a top-left a² square, bottom-right b² square, and two ab rectangles.'}, componentKey:'SquareSum', relatedConceptId:'factorisation', difficulty:2 },
      { id:'diff-squares', name:{zh:'平方差公式',en:'Difference of Squares'}, latex:'a^2 - b^2 = (a+b)(a-b)', description:{zh:'两个平方数之差的因式分解',en:'Factorisation of the difference of two squares'}, explanation:{zh:'大正方形a²减去小正方形b²，剩余的L形区域可以重新拼成长为(a+b)、宽为(a-b)的矩形。',en:'Remove the b² square from a² — the L-shaped remainder rearranges into a rectangle of length (a+b) and width (a-b).'}, componentKey:'DiffSquares', relatedConceptId:'factorisation', difficulty:2 },
      { id:'square-sum-three', name:{zh:'三项完全平方',en:'Three-term Perfect Square'}, latex:'(a+b+c)^2 = a^2+b^2+c^2+2ab+2bc+2ac', description:{zh:'三个数之和的平方展开为9个区域',en:'Square of a trinomial expands into 9 regions'}, explanation:{zh:'边长为(a+b+c)的大正方形被分割成9个小矩形：3个正方形(a²、b²、c²)和6个矩形(2ab、2bc、2ac)。',en:'The big square of side (a+b+c) splits into 9 regions: 3 squares and 6 rectangles.'}, componentKey:'SquareSumThree', relatedConceptId:'factorisation', difficulty:3 },
    ],
  },
  {
    id: 'functions',
    name: { zh: '函数图像', en: 'Function Graphs' },
    icon: '📈',
    formulas: [
      { id:'linear-func', name:{zh:'一次函数',en:'Linear Function'}, latex:'y = kx + b', description:{zh:'斜率与截距控制直线',en:'Slope and intercept control the line'}, explanation:{zh:'k是斜率，决定直线倾斜程度；b是纵轴截距。拖动滑块观察直线如何变化。',en:'k is slope controlling tilt; b is the y-intercept. Drag to see how the line changes.'}, componentKey:'LinearFunc', relatedConceptId:'functions-linear', difficulty:2 },
      { id:'quadratic-func', name:{zh:'二次函数',en:'Quadratic Function'}, latex:'y = ax^2 + bx + c', description:{zh:'抛物线的开口、顶点与截距',en:'Parabola opening, vertex and intercepts'}, explanation:{zh:'a决定开口方向和宽窄，b影响对称轴，c是纵轴截距。顶点坐标为(-b/2a, c-b²/4a)。',en:'a controls opening direction and width; b shifts the axis of symmetry; c is the y-intercept.'}, componentKey:'QuadraticFunc', relatedConceptId:'functions-quadratic', difficulty:3 },
      { id:'inverse-func', name:{zh:'反比例函数',en:'Inverse Proportion Function'}, latex:'y = \\frac{k}{x}', description:{zh:'双曲线与k值的关系',en:'Hyperbola and its relationship with k'}, explanation:{zh:'k>0时图像在第一、三象限；k<0时在第二、四象限。图像永远不会碰到坐标轴（渐近线）。',en:'When k>0, graph is in quadrants 1 & 3; when k<0, in quadrants 2 & 4. The graph never touches either axis (asymptotes).'}, componentKey:'InverseFunc', relatedConceptId:'functions-inverse', difficulty:3 },
    ],
  },
  {
    id: 'quadratic-advanced',
    name: { zh: '二次方程与配方', en: 'Quadratic Equations' },
    icon: '∩',
    formulas: [
      { id:'discriminant', name:{zh:'判别式 Δ',en:'Discriminant Δ'}, latex:'\\Delta = b^2 - 4ac', description:{zh:'Δ决定方程根的个数',en:'Δ determines the number of roots'}, explanation:{zh:'Δ>0：两个不同实根；Δ=0：两个相等实根；Δ<0：无实根。拖动参数观察抛物线与x轴的关系。',en:'Δ>0: two distinct roots; Δ=0: one repeated root; Δ<0: no real roots. Drag to see how the parabola relates to the x-axis.'}, componentKey:'Discriminant', relatedConceptId:'quadratic-equations', difficulty:3 },
      { id:'completing-square', name:{zh:'配方法',en:'Completing the Square'}, latex:'ax^2+bx+c = a(x-h)^2+k', description:{zh:'一般式转顶点式，直接读出顶点坐标',en:'Standard form to vertex form, revealing the vertex'}, explanation:{zh:'配方法将一般式转化为顶点式，顶点(h,k)直接读出：h=-b/2a，k=c-b²/4a。',en:'Completing the square converts to vertex form. The vertex (h,k) is read directly: h=-b/2a, k=c-b²/4a.'}, componentKey:'CompletingSquare', relatedConceptId:'functions-quadratic', difficulty:3 },
    ],
  },
  {
    id: 'geometry',
    name: { zh: '几何定理', en: 'Geometry Theorems' },
    icon: '📐',
    formulas: [
      { id:'pythagorean', name:{zh:'勾股定理',en:'Pythagorean Theorem'}, latex:'a^2 + b^2 = c^2', description:{zh:'直角三角形三边关系',en:'Relationship between sides of a right triangle'}, explanation:{zh:'直角三角形两条直角边上的正方形面积之和，等于斜边上的正方形面积。红色面积+蓝色面积=绿色面积。',en:'Sum of areas of squares on the two legs equals the area of the square on the hypotenuse. Red + Blue = Green, always.'}, componentKey:'Pythagorean', relatedConceptId:'pythagoras', difficulty:2 },
      { id:'pythagorean-triples', name:{zh:'勾股数',en:'Pythagorean Triples'}, latex:'a^2+b^2=c^2\\ (integers)', description:{zh:'常见整数勾股数组合可视化',en:'Common integer solutions visualised'}, explanation:{zh:'勾股数是满足a²+b²=c²的正整数组合，最著名是(3,4,5)。任意勾股数的整数倍也是勾股数。',en:'Pythagorean triples are integer solutions to a²+b²=c². The most famous is (3,4,5). Any multiple is also a triple.'}, componentKey:'PythagoreanTriples', relatedConceptId:'pythagoras', difficulty:2 },
      { id:'triangle-area', name:{zh:'三角形面积',en:'Triangle Area'}, latex:'S = \\frac{1}{2}\\times base\\times height', description:{zh:'底乘高除以二的几何直觉',en:'Geometric intuition for base × height ÷ 2'}, explanation:{zh:'任意三角形都是同底等高平行四边形的一半。拖动底和高，面积实时更新。',en:'Any triangle is exactly half a parallelogram with the same base and height.'}, componentKey:'TriangleArea', relatedConceptId:'area-perimeter', difficulty:1 },
      { id:'trapezoid-area', name:{zh:'梯形面积',en:'Trapezoid Area'}, latex:'S = \\frac{1}{2}(a+b)\\times h', description:{zh:'上下底之和乘高除以二',en:'(sum of parallel sides) × height ÷ 2'}, explanation:{zh:'梯形与另一个全等梯形可拼成平行四边形（底为a+b，高为h），面积是平行四边形的一半。',en:'Two identical trapezoids form a parallelogram (base a+b, height h), so one trapezoid is half.'}, componentKey:'TrapezoidArea', relatedConceptId:'area-perimeter', difficulty:1 },
      { id:'circle-area', name:{zh:'圆的面积',en:'Circle Area'}, latex:'S = \\pi r^2', description:{zh:'半径与面积的关系',en:'Relationship between radius and area'}, explanation:{zh:'圆的面积与半径的平方成正比。半径增大为原来的2倍，面积增大为原来的4倍（不是2倍！）。',en:'Circle area is proportional to r². Double the radius → quadruple the area (not double!).'}, componentKey:'CircleArea', relatedConceptId:'area-perimeter', difficulty:1 },
      { id:'sector-area', name:{zh:'扇形面积',en:'Sector Area'}, latex:'S = \\frac{\\theta}{360}\\pi r^2', description:{zh:'角度与半径共同决定扇形面积',en:'Angle and radius together determine sector area'}, explanation:{zh:'扇形面积按角度占360°的比例计算。拖动角度和半径观察扇形形状和面积的变化。',en:'Sector area is proportional to its angle out of 360°. Drag angle and radius to see changes.'}, componentKey:'SectorArea', relatedConceptId:'area-perimeter', difficulty:2 },
    ],
  },
  {
    id: 'solid',
    name: { zh: '立体图形', en: 'Solid Geometry' },
    icon: '📦',
    formulas: [
      { id:'cylinder-volume', name:{zh:'圆柱体积',en:'Cylinder Volume'}, latex:'V = \\pi r^2 h', description:{zh:'底面积乘以高',en:'Base area times height'}, explanation:{zh:'圆柱的体积=底面圆的面积×高。可以想象把很多薄薄的圆片叠起来。',en:'Cylinder volume = circular base area × height. Imagine stacking many thin circular discs.'}, componentKey:'CylinderVolume', relatedConceptId:'solid-geometry', difficulty:2 },
      { id:'cone-volume', name:{zh:'圆锥体积',en:'Cone Volume'}, latex:'V = \\frac{1}{3}\\pi r^2 h', description:{zh:'圆柱体积的三分之一',en:'One third of cylinder volume'}, explanation:{zh:'等底等高的圆锥体积恰好是圆柱的1/3。用倒水实验验证：三个圆锥恰好装满一个圆柱。',en:'A cone with same base and height as a cylinder has exactly 1/3 the volume. Fill 3 cones to fill 1 cylinder!'}, componentKey:'ConeVolume', relatedConceptId:'solid-geometry', difficulty:2 },
      { id:'sphere-volume', name:{zh:'球体积与表面积',en:'Sphere Volume & Surface'}, latex:'V = \\frac{4}{3}\\pi r^3', description:{zh:'半径立方决定体积',en:'Volume scales as r³'}, explanation:{zh:'球的体积V=4/3πr³，表面积S=4πr²。半径增大1倍，体积增大8倍，表面积增大4倍。',en:'Sphere volume V=4/3πr³, surface area S=4πr². Double r: volume ×8, surface area ×4.'}, componentKey:'SphereVolume', relatedConceptId:'solid-geometry', difficulty:2 },
      { id:'pyramid-volume', name:{zh:'棱锥体积',en:'Pyramid Volume'}, latex:'V = \\frac{1}{3}\\times S_{base}\\times h', description:{zh:'棱锥体积是棱柱的三分之一',en:'1/3 of the prism with same base and height'}, explanation:{zh:'任意棱锥的体积都是等底等高棱柱的1/3。这个1/3关系对圆锥也成立。',en:'Any pyramid has 1/3 the volume of a prism with same base and height. Same rule applies to cones.'}, componentKey:'PyramidVolume', relatedConceptId:'solid-geometry', difficulty:2 },
    ],
  },
  {
    id: 'trigonometry',
    name: { zh: '三角函数', en: 'Trigonometry' },
    icon: '📏',
    formulas: [
      { id:'trig-basic', name:{zh:'sinθ / cosθ / tanθ 定义',en:'sin / cos / tan Definitions'}, latex:'\\sin\\theta = \\frac{opp}{hyp},\\ \\cos\\theta = \\frac{adj}{hyp}', description:{zh:'直角三角形中三角函数的定义',en:'Trig ratios defined in a right triangle'}, explanation:{zh:'在直角三角形中：sin=对边/斜边，cos=邻边/斜边，tan=对边/邻边。记忆口诀：SOH-CAH-TOA。',en:'In a right triangle: sin=opp/hyp, cos=adj/hyp, tan=opp/adj. Remember: SOH-CAH-TOA.'}, componentKey:'TrigBasic', relatedConceptId:'trigonometry', difficulty:3 },
      { id:'unit-circle', name:{zh:'单位圆与三角函数',en:'Unit Circle & Trig'}, latex:'\\sin^2\\theta + \\cos^2\\theta = 1', description:{zh:'sinθ和cosθ在单位圆上的几何意义',en:'Geometric meaning of sinθ and cosθ on the unit circle'}, explanation:{zh:'单位圆半径为1，圆上任意一点坐标就是(cosθ, sinθ)。由勾股定理得sin²θ+cos²θ=1。',en:'On a unit circle (radius 1), any point is (cosθ, sinθ). By Pythagoras: sin²θ+cos²θ=1.'}, componentKey:'UnitCircle', relatedConceptId:'trigonometry', difficulty:3 },
      { id:'sine-cosine-rule', name:{zh:'正弦/余弦定理',en:'Sine & Cosine Rule'}, latex:'\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}', description:{zh:'适用于任意三角形',en:'Works for any triangle'}, explanation:{zh:'正弦定理：三角形各边与对角正弦之比相等。余弦定理是勾股定理在非直角三角形的推广。',en:'Sine rule: each side divided by the sine of its opposite angle is constant. Cosine rule generalises Pythagoras.'}, componentKey:'SineCosineRule', relatedConceptId:'trigonometry', difficulty:3 },
    ],
  },
  {
    id: 'sequences',
    name: { zh: '数列', en: 'Sequences & Series' },
    icon: '🔁',
    formulas: [
      { id:'arithmetic-seq', name:{zh:'等差数列通项',en:'Arithmetic Sequence nth Term'}, latex:'a_n = a_1 + (n-1)d', description:{zh:'首项加上公差乘以项数减一',en:'First term plus common difference times (n-1)'}, explanation:{zh:'等差数列每项比前一项多d（公差）。用柱状图直观看到线性增长。',en:'Each term is d more than the previous. The bar chart shows linear growth with constant step d.'}, componentKey:'ArithmeticSeq', relatedConceptId:'sequences', difficulty:2 },
      { id:'arithmetic-sum', name:{zh:'等差数列求和',en:'Arithmetic Series Sum'}, latex:'S_n = \\frac{n(a_1+a_n)}{2}', description:{zh:'梯形面积模型直观理解求和公式',en:'Trapezoid area model for the sum formula'}, explanation:{zh:'等差数列的和正是梯形面积公式！将柱子两两配对：第1项+第n项=…=常数，共n/2对。',en:'The sum equals (first + last) × n ÷ 2 — exactly the trapezoid area formula! Pair the bars.'}, componentKey:'ArithmeticSum', relatedConceptId:'sequences', difficulty:2 },
      { id:'geometric-seq', name:{zh:'等比数列通项',en:'Geometric Sequence nth Term'}, latex:'a_n = a_1 \\cdot r^{n-1}', description:{zh:'指数增长或衰减',en:'Exponential growth or decay'}, explanation:{zh:'等比数列每项是前一项的r倍。r>1指数增长，0<r<1衰减，r<0正负交替。',en:'Each term is r times the previous. r>1 means exponential growth, 0<r<1 means decay, r<0 alternates.'}, componentKey:'GeometricSeq', relatedConceptId:'sequences', difficulty:2 },
    ],
  },
  {
    id: 'modeling',
    name: { zh: '建模与应用', en: 'Modelling & Applications' },
    icon: '💰',
    formulas: [
      { id:'compound-interest', name:{zh:'复利公式',en:'Compound Interest'}, latex:'A = P(1+r)^n', description:{zh:'指数增长vs线性增长的直观对比',en:'Exponential vs linear growth visualised'}, explanation:{zh:'复利每期在本金+已有利息上再计息，形成指数增长。单利只在原始本金上计息，是线性增长。',en:'Compound interest earns interest on interest, creating exponential growth. Simple interest is linear.'}, componentKey:'CompoundInterest', relatedConceptId:'growth-decay', difficulty:2 },
    ],
  },
  {
    id: 'similarity-coord',
    name: { zh: '相似与坐标几何', en: 'Similarity & Coordinate Geometry' },
    icon: '📍',
    formulas: [
      { id:'similarity-ratio', name:{zh:'相似比与面积/体积比',en:'Similarity Ratio & Area/Volume'}, latex:'k : k^2 : k^3', description:{zh:'相似比k，面积比k²，体积比k³',en:'Linear ratio k, area ratio k², volume ratio k³'}, explanation:{zh:'若两图形相似比为k，面积比为k²，体积比为k³。相似比2：面积×4，体积×8。',en:'Similarity ratio k → area ratio k², volume ratio k³. For k=2: area×4, volume×8.'}, componentKey:'SimilarityRatio', relatedConceptId:'similarity', difficulty:3 },
      { id:'distance-formula', name:{zh:'两点距离公式',en:'Distance Formula'}, latex:'d = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}', description:{zh:'坐标平面上勾股定理的应用',en:'Pythagorean theorem applied to the coordinate plane'}, explanation:{zh:'两点距离公式本质就是勾股定理：Δx是水平距离，Δy是垂直距离，d是斜边。',en:'The distance formula is the Pythagorean theorem: Δx horizontal, Δy vertical, d is the hypotenuse.'}, componentKey:'DistanceFormula', relatedConceptId:'coordinate-geometry', difficulty:3 },
      { id:'midpoint-formula', name:{zh:'中点公式',en:'Midpoint Formula'}, latex:'M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)', description:{zh:'两点坐标的平均值即为中点',en:'Average of coordinates gives the midpoint'}, explanation:{zh:'中点就是两点坐标的平均值：x坐标取平均，y坐标取平均。',en:'The midpoint is the average of the x-values and average of the y-values.'}, componentKey:'MidpointFormula', relatedConceptId:'coordinate-geometry', difficulty:2 },
    ],
  },
  {
    id: 'statistics',
    name: { zh: '统计与概率', en: 'Statistics & Probability' },
    icon: '📊',
    formulas: [
      { id:'mean-median', name:{zh:'平均数与中位数',en:'Mean vs Median'}, latex:'\\bar{x} = \\frac{\\sum x_i}{n}', description:{zh:'两种集中趋势的直观对比',en:'Visual comparison of two measures of central tendency'}, explanation:{zh:'平均数是所有数据的"重心"，受极端值影响大。中位数是排序后的中间值，对极端值不敏感。',en:'The mean is the balance point, heavily affected by outliers. The median is robust to extreme values.'}, componentKey:'MeanMedian', relatedConceptId:'data-analysis', difficulty:2 },
      { id:'variance', name:{zh:'方差与标准差',en:'Variance & Standard Deviation'}, latex:'\\sigma^2 = \\frac{\\sum(x_i-\\bar{x})^2}{n}', description:{zh:'数据的离散程度可视化',en:'Visualising the spread of data'}, explanation:{zh:'方差衡量每个数据点偏离均值的程度。标准差σ=√(σ²)与原数据单位相同，更直观。',en:'Variance measures how far data points are from the mean. Standard deviation σ=√(σ²) is in the original units.'}, componentKey:'Variance', relatedConceptId:'data-analysis', difficulty:2 },
      { id:'classical-probability', name:{zh:'古典概型',en:'Classical Probability'}, latex:'P = \\frac{m}{n}', description:{zh:'有利结果数除以总结果数',en:'Favorable outcomes divided by total outcomes'}, explanation:{zh:'古典概型要求所有基本事件等可能。P=有利结果数m/总结果数n。拖动滑块改变总数和有利数。',en:'Classical probability requires equally likely outcomes. P = favorable m / total n. Drag to change values.'}, componentKey:'ClassicalProbability', relatedConceptId:'probability', difficulty:2 },
    ],
  },
];
