import { KnowledgeModule } from '../types';

export const KNOWLEDGE_GRAPH: KnowledgeModule[] = [
  // ═══════════════════════════════════════════════════════════
  //  1. 数与代数 / Number and Algebra
  // ═══════════════════════════════════════════════════════════
  {
    id: 'algebra',
    name: { zh: '数与代数', en: 'Number & Algebra' },
    concepts: [
      {
        id: 'arithmetic',
        title: { zh: '整数与四则运算', en: 'Integers & Four Operations' },
        module: 'algebra',
        level: 1,
        description: { zh: '整数的加减乘除，运算顺序与括号规则。', en: 'Addition, subtraction, multiplication and division of integers; order of operations and brackets.' },
        skills: [{ zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { CN: { zh: '竖式计算规范', en: 'Column calculation norms' }, SG: { zh: '估算策略', en: 'Estimation strategies' } },
        relatedNodes: ['rational-numbers']
      },
      {
        id: 'rational-numbers',
        title: { zh: '有理数与负数', en: 'Rational Numbers & Negatives' },
        module: 'algebra',
        level: 2,
        description: { zh: '绝对值、负数运算（温度、海拔情境），有理数的数轴表示。', en: 'Absolute value, operations with negative numbers (temperature, altitude models), number line.' },
        skills: [{ zh: '概念理解', en: 'Conceptual Understanding' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { US: { zh: '真实情境', en: 'Real-world context' }, UK: { zh: '语言表达', en: 'Linguistic expression' }, CN: { zh: '数轴运算', en: 'Number line operations' } },
        relatedNodes: ['arithmetic', 'fractions-decimals']
      },
      {
        id: 'fractions-decimals',
        title: { zh: '分数、小数与百分数', en: 'Fractions, Decimals & Percentages' },
        module: 'algebra',
        level: 1,
        description: { zh: '分数化小数、百分数互化，分数四则运算，比与比例。', en: 'Converting between fractions, decimals and percentages; fraction arithmetic; ratio and proportion.' },
        skills: [{ zh: '表征转换', en: 'Representation Transformation' }, { zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { SG: { zh: 'Bar Model可视化', en: 'Bar model visualization' }, CN: { zh: '通分与约分', en: 'Common denominators and simplification' } },
        relatedNodes: ['rational-numbers', 'ratio-proportion']
      },
      {
        id: 'ratio-proportion',
        title: { zh: '比与比例', en: 'Ratio & Proportion' },
        module: 'algebra',
        level: 2,
        description: { zh: '比的化简、正反比例关系、比例应用题。', en: 'Simplifying ratios, direct and inverse proportion, proportional reasoning in context.' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '比例推理', en: 'Proportional Reasoning' }],
        emphasis: { SG: { zh: 'Bar Model分配', en: 'Bar model sharing' }, US: { zh: '单位比率', en: 'Unit rate' }, CN: { zh: '正反比例辨析', en: 'Direct vs inverse proportion' } },
        relatedNodes: ['fractions-decimals', 'linear-equations-1']
      },
      {
        id: 'powers-roots',
        title: { zh: '乘方与开方', en: 'Powers & Roots' },
        module: 'algebra',
        level: 2,
        description: { zh: '平方与立方运算，平方根与立方根，科学记数法。', en: 'Squaring, cubing, square roots, cube roots, and scientific notation.' },
        skills: [{ zh: '符号意识', en: 'Symbolic Awareness' }],
        emphasis: { UK: { zh: '标准形式（Standard Form）', en: 'Standard form' }, CN: { zh: '开方运算', en: 'Root extraction' } },
        relatedNodes: ['rational-numbers', 'indices-laws']
      },
      {
        id: 'indices-laws',
        title: { zh: '指数法则', en: 'Laws of Indices' },
        module: 'algebra',
        level: 3,
        description: { zh: '同底数幂的乘除法则、幂的幂、零指数与负指数。', en: 'Multiplication and division of powers with same base, power of a power, zero and negative exponents.' },
        skills: [{ zh: '符号意识', en: 'Symbolic Awareness' }, { zh: '结构思维', en: 'Structural Thinking' }],
        emphasis: { UK: { zh: '指数化简与证明', en: 'Index simplification and proof' }, IB: { zh: '负指数与分数指数', en: 'Negative and fractional indices' } },
        relatedNodes: ['powers-roots']
      },
      {
        id: 'surds',
        title: { zh: '无理数与根式化简', en: 'Surds & Irrational Numbers' },
        module: 'algebra',
        level: 3,
        description: { zh: '无理数的概念，根式的化简、加减与有理化。', en: 'Concept of irrational numbers; simplifying, adding, subtracting surds and rationalising denominators.' },
        skills: [{ zh: '符号意识', en: 'Symbolic Awareness' }],
        emphasis: { UK: { zh: 'GCSE核心内容', en: 'GCSE core content' }, IB: { zh: '精确值计算', en: 'Exact value calculations' } },
        relatedNodes: ['powers-roots', 'indices-laws']
      },
      {
        id: 'algebra-expressions',
        title: { zh: '代数式与整式', en: 'Algebraic Expressions & Polynomials' },
        module: 'algebra',
        level: 2,
        description: { zh: '单项式、多项式的加减乘除，合并同类项，去括号。', en: 'Monomials and polynomials; addition, subtraction, multiplication; collecting like terms; expanding brackets.' },
        skills: [{ zh: '符号意识', en: 'Symbolic Awareness' }, { zh: '结构思维', en: 'Structural Thinking' }],
        emphasis: { CN: { zh: '整式运算熟练度', en: 'Polynomial operation fluency' }, UK: { zh: '展开与化简', en: 'Expanding and simplifying' } },
        relatedNodes: ['linear-equations-1', 'factorisation']
      },
      {
        id: 'factorisation',
        title: { zh: '因式分解', en: 'Factorisation' },
        module: 'algebra',
        level: 3,
        description: { zh: '提公因式法、平方差公式、完全平方公式、十字相乘法。', en: 'Common factor, difference of squares, perfect square trinomials, and trial and error factorisation.' },
        skills: [{ zh: '结构思维', en: 'Structural Thinking' }, { zh: '逆向思维', en: 'Reverse Thinking' }],
        emphasis: { CN: { zh: '多种方法综合运用', en: 'Multi-method mastery' }, UK: { zh: '二次式因式分解', en: 'Factorising quadratics' } },
        relatedNodes: ['algebra-expressions', 'quadratic-equations']
      },
      {
        id: 'linear-equations-1',
        title: { zh: '一元一次方程', en: 'Linear Equations (One Variable)' },
        module: 'algebra',
        level: 2,
        description: { zh: '移项、合并同类项、方程的解及检验，列方程解应用题。', en: 'Transposing, collecting terms, solving and checking; setting up equations from word problems.' },
        skills: [{ zh: '结构思维', en: 'Structural Thinking' }, { zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { SG: { zh: 'Bar Model建立方程', en: 'Bar model to form equations' }, CN: { zh: '等式性质', en: 'Properties of equality' } },
        relatedNodes: ['algebra-expressions', 'simultaneous-equations', 'inequalities']
      },
      {
        id: 'simultaneous-equations',
        title: { zh: '二元一次方程组', en: 'Simultaneous Linear Equations' },
        module: 'algebra',
        level: 2,
        description: { zh: '代入法、加减消元法，图形交点理解，应用题建模。', en: 'Substitution and elimination methods; graphical intersection; modelling real-world problems.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { US: { zh: '图形交点理解', en: 'Graphical intersection' }, UK: { zh: '代数消元步骤', en: 'Algebraic elimination steps' }, CN: { zh: '代入与消元综合', en: 'Substitution and elimination combined' } },
        relatedNodes: ['linear-equations-1', 'functions-linear']
      },
      {
        id: 'inequalities',
        title: { zh: '一元一次不等式（组）', en: 'Linear Inequalities' },
        module: 'algebra',
        level: 2,
        description: { zh: '不等式的性质，解一元一次不等式，数轴表示，不等式组的解集。', en: 'Properties of inequalities, solving linear inequalities, number line representation, compound inequalities.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }],
        emphasis: { CN: { zh: '不等式组解集', en: 'Solution set of compound inequalities' }, US: { zh: '情境不等式', en: 'Contextual inequalities' } },
        relatedNodes: ['linear-equations-1']
      },
      {
        id: 'quadratic-equations',
        title: { zh: '一元二次方程', en: 'Quadratic Equations' },
        module: 'algebra',
        level: 3,
        description: { zh: '开平方法、配方法、求根公式、因式分解法，判别式，韦达定理。', en: 'Square root method, completing the square, quadratic formula, factorisation; discriminant; Vieta\'s formulas.' },
        skills: [{ zh: '程序流畅性', en: 'Procedural Fluency' }, { zh: '结构思维', en: 'Structural Thinking' }],
        emphasis: { CN: { zh: '四种方法综合', en: 'Four methods combined' }, UK: { zh: '配方法与判别式', en: 'Completing the square and discriminant' }, IB: { zh: '韦达定理应用', en: 'Vieta\'s formulas applications' } },
        relatedNodes: ['factorisation', 'functions-quadratic']
      },
      {
        id: 'functions-linear',
        title: { zh: '一次函数', en: 'Linear Functions' },
        module: 'algebra',
        level: 2,
        description: { zh: '斜率与截距的意义，y = kx + b 的图像，正反比例函数。', en: 'Slope and intercept; graph of y = kx + b; direct proportion y = kx.' },
        skills: [{ zh: '表征转换', en: 'Representation Transformation' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { US: { zh: '截距实际意义', en: 'Practical meaning of intercepts' }, UK: { zh: 'y = mx + c 结构', en: 'y = mx + c structure' }, CN: { zh: '图象与性质', en: 'Graph properties' } },
        relatedNodes: ['simultaneous-equations', 'functions-quadratic']
      },
      {
        id: 'functions-quadratic',
        title: { zh: '二次函数', en: 'Quadratic Functions' },
        module: 'algebra',
        level: 3,
        description: { zh: '抛物线的顶点、对称轴、开口方向，配方求顶点，图象变换。', en: 'Vertex, axis of symmetry, direction of opening; completing the square; graph transformations.' },
        skills: [{ zh: '表征转换', en: 'Representation Transformation' }, { zh: '空间观念', en: 'Spatial Reasoning' }],
        emphasis: { CN: { zh: '配方与图象综合', en: 'Completing the square and graph combined' }, IB: { zh: '图象变换', en: 'Graph transformations' }, US: { zh: '顶点式与截距式', en: 'Vertex form and intercept form' } },
        relatedNodes: ['quadratic-equations', 'functions-linear']
      },
      {
        id: 'functions-inverse',
        title: { zh: '反比例函数', en: 'Inverse Proportion Function' },
        module: 'algebra',
        level: 3,
        description: { zh: 'y = k/x 的图象（双曲线），各象限性质，实际情境建模。', en: 'Graph of y = k/x (hyperbola), properties in each quadrant, real-world modelling.' },
        skills: [{ zh: '表征转换', en: 'Representation Transformation' }],
        emphasis: { CN: { zh: '双曲线性质', en: 'Hyperbola properties' } },
        relatedNodes: ['functions-linear', 'ratio-proportion']
      },
      {
        id: 'sequences',
        title: { zh: '数列与规律', en: 'Sequences & Patterns' },
        module: 'algebra',
        level: 2,
        description: { zh: '等差数列、等比数列的通项公式与求和（初步），找规律问题。', en: 'Arithmetic and geometric sequences: nth term and sum (introductory); pattern-finding problems.' },
        skills: [{ zh: '规律发现', en: 'Pattern Recognition' }, { zh: '归纳推理', en: 'Inductive Reasoning' }],
        emphasis: { IB: { zh: '序列探究任务', en: 'Sequence investigation tasks' }, UK: { zh: 'nth term公式', en: 'nth term formula' }, CN: { zh: '等差等比综合', en: 'Arithmetic and geometric combined' } },
        relatedNodes: ['algebra-expressions']
      },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  2. 图形与几何 / Geometry
  // ═══════════════════════════════════════════════════════════
  {
    id: 'geometry',
    name: { zh: '图形与几何', en: 'Geometry' },
    concepts: [
      {
        id: 'basic-geometry',
        title: { zh: '点、线、角', en: 'Points, Lines & Angles' },
        module: 'geometry',
        level: 1,
        description: { zh: '点、线段、射线、直线；角的分类与度量；对顶角、补角、余角。', en: 'Points, line segments, rays, lines; types and measurement of angles; vertically opposite, supplementary, complementary.' },
        skills: [{ zh: '空间观念', en: 'Spatial Concepts' }],
        emphasis: { UK: { zh: '几何推导语言', en: 'Geometrical reasoning language' } },
        relatedNodes: ['parallel-lines', 'triangles']
      },
      {
        id: 'parallel-lines',
        title: { zh: '平行线与横截线', en: 'Parallel Lines & Transversals' },
        module: 'geometry',
        level: 2,
        description: { zh: '同位角、内错角、同旁内角，平行线的判定与性质。', en: 'Corresponding, alternate, and co-interior angles; conditions for parallel lines.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }, { zh: '空间观念', en: 'Spatial Concepts' }],
        emphasis: { UK: { zh: '角度关系证明', en: 'Proof of angle relationships' }, CN: { zh: '判定与性质互逆', en: 'Converse properties' } },
        relatedNodes: ['basic-geometry', 'triangles']
      },
      {
        id: 'triangles',
        title: { zh: '三角形', en: 'Triangles' },
        module: 'geometry',
        level: 2,
        description: { zh: '三角形内角和，外角定理，三角形分类，三角形中位线，重心、垂心、内心、外心。', en: 'Angle sum, exterior angle theorem, classification, midpoint theorem, centres of a triangle.' },
        skills: [{ zh: '几何直观', en: 'Geometric Intuition' }, { zh: '逻辑推理', en: 'Logical Reasoning' }],
        emphasis: { CN: { zh: '四心综合题', en: 'Four centres combined problems' }, UK: { zh: '证明角度关系', en: 'Proving angle relationships' } },
        relatedNodes: ['basic-geometry', 'congruence', 'pythagoras']
      },
      {
        id: 'congruence',
        title: { zh: '全等三角形', en: 'Congruent Triangles' },
        module: 'geometry',
        level: 2,
        description: { zh: 'SSS、SAS、ASA、AAS、HL五种判定条件，全等的性质与应用。', en: 'SSS, SAS, ASA, AAS, HL congruence conditions; properties and applications.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }, { zh: '证明', en: 'Proof' }],
        emphasis: { CN: { zh: '全等证明题', en: 'Congruence proof problems' }, UK: { zh: '几何证明格式', en: 'Proof format in geometry' } },
        relatedNodes: ['triangles', 'similarity']
      },
      {
        id: 'similarity',
        title: { zh: '相似三角形', en: 'Similar Triangles' },
        module: 'geometry',
        level: 3,
        description: { zh: 'AA、SAS、SSS相似判定，相似比，面积比与体积比，应用（测量高度）。', en: 'AA, SAS, SSS similarity conditions; ratio of similarity, area ratio and volume ratio; applications.' },
        skills: [{ zh: '比例推理', en: 'Proportional Reasoning' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { SG: { zh: '相似与比例综合', en: 'Similarity and proportion combined' }, CN: { zh: '相似证明', en: 'Similarity proofs' } },
        relatedNodes: ['congruence', 'pythagoras']
      },
      {
        id: 'pythagoras',
        title: { zh: '勾股定理', en: 'Pythagorean Theorem' },
        module: 'geometry',
        level: 2,
        description: { zh: '直角三角形三边关系，逆定理，勾股数，实际应用（最短路径、折叠、梯子）。', en: 'Sides of right triangle, converse, Pythagorean triples, applications (shortest path, folding, ladders).' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { US: { zh: '真实应用', en: 'Real-world application' }, CN: { zh: '综合几何证明', en: 'Combined geometry proof' } },
        relatedNodes: ['triangles', 'similarity', 'circles']
      },
      {
        id: 'quadrilaterals',
        title: { zh: '四边形', en: 'Quadrilaterals' },
        module: 'geometry',
        level: 2,
        description: { zh: '平行四边形、矩形、菱形、正方形的性质与判定，梯形中位线。', en: 'Properties and conditions of parallelograms, rectangles, rhombi, squares; mid-segment of trapezoid.' },
        skills: [{ zh: '几何直观', en: 'Geometric Intuition' }, { zh: '逻辑推理', en: 'Logical Reasoning' }],
        emphasis: { CN: { zh: '特殊四边形综合', en: 'Special quadrilaterals combined' }, UK: { zh: '证明与推导', en: 'Proof and deduction' } },
        relatedNodes: ['triangles', 'area-perimeter']
      },
      {
        id: 'area-perimeter',
        title: { zh: '面积与周长', en: 'Area & Perimeter' },
        module: 'geometry',
        level: 1,
        description: { zh: '三角形、四边形、圆的面积公式，复合图形面积，弧长与扇形面积。', en: 'Area formulas for triangles, quadrilaterals, circles; composite shapes; arc length and sector area.' },
        skills: [{ zh: '程序流畅性', en: 'Procedural Fluency' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { CN: { zh: '复合图形', en: 'Composite figures' }, US: { zh: '生活情境', en: 'Real-life contexts' } },
        relatedNodes: ['triangles', 'circles', 'quadrilaterals']
      },
      {
        id: 'circles',
        title: { zh: '圆', en: 'Circles' },
        module: 'geometry',
        level: 3,
        description: { zh: '圆的基本概念，圆周角与圆心角，切线性质，垂径定理，弦切角。', en: 'Circle concepts; inscribed and central angles; tangent properties; perpendicular chord; tangent-chord angle.' },
        skills: [{ zh: '几何直观', en: 'Geometric Intuition' }, { zh: '逻辑推理', en: 'Logical Reasoning' }],
        emphasis: { CN: { zh: '垂径定理与切线', en: 'Perpendicular chord and tangents' }, UK: { zh: '圆定理证明', en: 'Circle theorem proofs' } },
        relatedNodes: ['pythagoras', 'area-perimeter']
      },
      {
        id: 'transformations',
        title: { zh: '图形变换', en: 'Geometric Transformations' },
        module: 'geometry',
        level: 2,
        description: { zh: '平移、轴对称、旋转、位似变换的性质与图象，坐标变换。', en: 'Properties and graphs of translations, reflections, rotations, and enlargements; coordinate transformations.' },
        skills: [{ zh: '空间表征', en: 'Spatial Representation' }],
        emphasis: { SG: { zh: '全等与相似联系', en: 'Link to congruence and similarity' }, IB: { zh: '变换矩阵初步', en: 'Introductory transformation matrices' } },
        relatedNodes: ['congruence', 'similarity']
      },
      {
        id: 'solid-geometry',
        title: { zh: '立体图形', en: 'Solid Geometry' },
        module: 'geometry',
        level: 2,
        description: { zh: '棱柱、棱锥、圆柱、圆锥、球的表面积与体积公式，截面，展开图。', en: 'Surface area and volume of prisms, pyramids, cylinders, cones, spheres; cross-sections; nets.' },
        skills: [{ zh: '空间观念', en: 'Spatial Concepts' }, { zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { CN: { zh: '多棱体体积', en: 'Polyhedral volumes' }, US: { zh: '展开图与建模', en: 'Nets and modelling' } },
        relatedNodes: ['area-perimeter', 'pythagoras']
      },
      {
        id: 'coordinate-geometry',
        title: { zh: '坐标几何', en: 'Coordinate Geometry' },
        module: 'geometry',
        level: 3,
        description: { zh: '两点间距离，中点公式，直线方程，点到直线距离（初步）。', en: 'Distance between two points, midpoint formula, equation of a line, distance from point to line (introductory).' },
        skills: [{ zh: '表征转换', en: 'Representation Transformation' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { US: { zh: '代数几何结合', en: 'Algebra-geometry connection' }, IB: { zh: '向量初步', en: 'Introductory vectors' } },
        relatedNodes: ['functions-linear', 'pythagoras']
      },
      {
        id: 'trigonometry',
        title: { zh: '三角函数（初步）', en: 'Trigonometry (Introductory)' },
        module: 'geometry',
        level: 3,
        description: { zh: 'sinθ、cosθ、tanθ的定义，30°、45°、60°特殊角，仰角与俯角应用。', en: 'Definitions of sinθ, cosθ, tanθ; special angles 30°, 45°, 60°; angle of elevation and depression.' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { SG: { zh: 'SOH-CAH-TOA框架', en: 'SOH-CAH-TOA framework' }, UK: { zh: '计算器使用与精度', en: 'Calculator use and accuracy' }, IB: { zh: '单位圆初步', en: 'Introductory unit circle' } },
        relatedNodes: ['pythagoras', 'similarity']
      },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  3. 统计与概率 / Statistics & Probability
  // ═══════════════════════════════════════════════════════════
  {
    id: 'statistics',
    name: { zh: '统计与概率', en: 'Statistics & Probability' },
    concepts: [
      {
        id: 'data-collection',
        title: { zh: '数据收集与整理', en: 'Data Collection & Organisation' },
        module: 'statistics',
        level: 1,
        description: { zh: '普查与抽样，频率分布表，条形图、折线图、扇形图的绘制与解读。', en: 'Census vs sampling; frequency distribution tables; drawing and interpreting bar, line and pie charts.' },
        skills: [{ zh: '数据观念', en: 'Data Awareness' }],
        emphasis: { US: { zh: '统计问题循环', en: 'Statistical question cycle' }, IB: { zh: '数据来源评估', en: 'Evaluating data sources' } },
        relatedNodes: ['data-analysis', 'probability']
      },
      {
        id: 'data-analysis',
        title: { zh: '数据的统计量', en: 'Statistical Measures' },
        module: 'statistics',
        level: 2,
        description: { zh: '平均数、中位数、众数，极差、方差与标准差，异常值分析。', en: 'Mean, median, mode; range, variance and standard deviation; outliers.' },
        skills: [{ zh: '数据观念', en: 'Data Awareness' }, { zh: '批判性思维', en: 'Critical Thinking' }],
        emphasis: { UK: { zh: '箱线图与四分位距', en: 'Box plots and IQR' }, CN: { zh: '方差计算', en: 'Variance calculation' }, IB: { zh: '统计量选择判断', en: 'Choosing appropriate statistics' } },
        relatedNodes: ['data-collection', 'probability']
      },
      {
        id: 'data-graphs',
        title: { zh: '统计图表进阶', en: 'Advanced Statistical Graphs' },
        module: 'statistics',
        level: 2,
        description: { zh: '频率直方图，茎叶图，箱线图，散点图与相关性初步。', en: 'Frequency histograms, stem-and-leaf plots, box-and-whisker plots, scatter plots and correlation.' },
        skills: [{ zh: '数据观念', en: 'Data Awareness' }, { zh: '表征转换', en: 'Representation Transformation' }],
        emphasis: { UK: { zh: '箱线图比较', en: 'Comparing box plots' }, US: { zh: '散点图趋势', en: 'Scatter plot trends' } },
        relatedNodes: ['data-analysis']
      },
      {
        id: 'probability',
        title: { zh: '概率基础', en: 'Basic Probability' },
        module: 'statistics',
        level: 2,
        description: { zh: '随机事件，古典概型，样本空间，互斥事件，用列举法求概率。', en: 'Random events, classical probability, sample space, mutually exclusive events, listing outcomes.' },
        skills: [{ zh: '随机观念', en: 'Stochastic Awareness' }],
        emphasis: { US: { zh: '实验概率对比理论', en: 'Experimental vs theoretical probability' }, CN: { zh: '列举与计数', en: 'Enumeration and counting' } },
        relatedNodes: ['data-collection', 'probability-advanced']
      },
      {
        id: 'probability-advanced',
        title: { zh: '概率进阶', en: 'Advanced Probability' },
        module: 'statistics',
        level: 3,
        description: { zh: '树状图与列表法，条件概率初步，独立事件，二项分布初步。', en: 'Tree diagrams and tables; introductory conditional probability; independent events; binomial distribution intro.' },
        skills: [{ zh: '随机观念', en: 'Stochastic Awareness' }, { zh: '逻辑推理', en: 'Logical Reasoning' }],
        emphasis: { IB: { zh: '条件概率与独立性', en: 'Conditional probability and independence' }, UK: { zh: '树状图系统列举', en: 'Systematic tree diagrams' } },
        relatedNodes: ['probability']
      },
      {
        id: 'sampling-inference',
        title: { zh: '抽样与统计推断初步', en: 'Sampling & Statistical Inference' },
        module: 'statistics',
        level: 3,
        description: { zh: '系统抽样、分层抽样，用样本估计总体，频率与概率的关系。', en: 'Systematic and stratified sampling; using samples to estimate populations; frequency vs probability.' },
        skills: [{ zh: '数据观念', en: 'Data Awareness' }, { zh: '批判性思维', en: 'Critical Thinking' }],
        emphasis: { IB: { zh: '探究任务设计', en: 'Investigation task design' }, US: { zh: '误差与可靠性', en: 'Error and reliability' } },
        relatedNodes: ['data-analysis', 'probability-advanced']
      },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  4. 数学建模与应用 / Mathematical Modeling
  // ═══════════════════════════════════════════════════════════
  {
    id: 'modeling',
    name: { zh: '数学建模与应用', en: 'Modelling & Applications' },
    concepts: [
      {
        id: 'real-world-modeling',
        title: { zh: '多步文字题建模', en: 'Multi-step Word Problem Modelling' },
        module: 'modeling',
        level: 3,
        description: { zh: '将复杂文字题转化为方程或不等式模型，验证解的合理性。', en: 'Translating complex word problems into equations or inequalities; verifying reasonableness.' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '批判性思维', en: 'Critical Thinking' }],
        emphasis: { SG: { zh: 'Bar Model为核心', en: 'Bar model as core tool' }, IB: { zh: '跨学科应用', en: 'Interdisciplinary applications' }, CN: { zh: '应用题题型训练', en: 'Applied problem type training' } },
        relatedNodes: ['linear-equations-1', 'simultaneous-equations']
      },
      {
        id: 'growth-decay',
        title: { zh: '增长与衰减模型', en: 'Growth & Decay Models' },
        module: 'modeling',
        level: 3,
        description: { zh: '百分比增长、利息（单利与复利），指数增长与衰减的基本模型。', en: 'Percentage growth, simple and compound interest, basic exponential growth and decay models.' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '符号意识', en: 'Symbolic Awareness' }],
        emphasis: { IB: { zh: '指数函数建模', en: 'Exponential function modelling' }, US: { zh: '金融数学', en: 'Financial mathematics' }, CN: { zh: '复利公式推导', en: 'Compound interest formula derivation' } },
        relatedNodes: ['indices-laws', 'functions-linear']
      },
      {
        id: 'optimization',
        title: { zh: '最优化问题', en: 'Optimisation Problems' },
        module: 'modeling',
        level: 3,
        description: { zh: '利用函数或不等式求最大值、最小值（成本、面积、利润最优）。', en: 'Finding maximum or minimum values using functions or inequalities (cost, area, profit optimisation).' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '批判性思维', en: 'Critical Thinking' }],
        emphasis: { IB: { zh: '任务性评估', en: 'Task-based assessment' }, CN: { zh: '二次函数最值', en: 'Quadratic function extrema' } },
        relatedNodes: ['functions-quadratic', 'inequalities']
      },
      {
        id: 'geometry-modeling',
        title: { zh: '几何综合应用', en: 'Geometry in Real Contexts' },
        module: 'modeling',
        level: 3,
        description: { zh: '勾股定理最短路径，相似三角形测量，三角函数仰角俯角应用。', en: 'Shortest path with Pythagoras; measurement using similar triangles; elevation/depression angle applications.' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '几何直观', en: 'Geometric Intuition' }],
        emphasis: { US: { zh: 'STEM跨学科', en: 'STEM cross-subject' }, SG: { zh: '实测任务', en: 'Practical measurement tasks' } },
        relatedNodes: ['pythagoras', 'trigonometry', 'similarity']
      },
    ]
  },

  // ═══════════════════════════════════════════════════════════
  //  5. 数学思维与证明 / Mathematical Reasoning & Proof
  // ═══════════════════════════════════════════════════════════
  {
    id: 'reasoning',
    name: { zh: '数学思维与推理', en: 'Mathematical Reasoning' },
    concepts: [
      {
        id: 'logical-reasoning',
        title: { zh: '逻辑推理与反例', en: 'Logical Reasoning & Counterexamples' },
        module: 'reasoning',
        level: 2,
        description: { zh: '命题的真假，充分条件与必要条件，反例举法，逆命题。', en: 'Truth of propositions; sufficient and necessary conditions; counterexamples; converse statements.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }, { zh: '批判性思维', en: 'Critical Thinking' }],
        emphasis: { IB: { zh: '探究与证明', en: 'Inquiry and proof' }, UK: { zh: '数学语言规范', en: 'Mathematical language norms' } },
        relatedNodes: ['congruence', 'algebra-expressions']
      },
      {
        id: 'algebraic-proof',
        title: { zh: '代数证明', en: 'Algebraic Proof' },
        module: 'reasoning',
        level: 3,
        description: { zh: '用代数方法证明整除性、奇偶性、不等式，连续整数性质。', en: 'Proving divisibility, parity, and inequalities using algebra; properties of consecutive integers.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }, { zh: '符号意识', en: 'Symbolic Awareness' }],
        emphasis: { UK: { zh: 'GCSE证明题型', en: 'GCSE proof question types' }, IB: { zh: '形式化证明', en: 'Formal proof writing' } },
        relatedNodes: ['algebra-expressions', 'logical-reasoning']
      },
      {
        id: 'geometric-proof',
        title: { zh: '几何证明', en: 'Geometric Proof' },
        module: 'reasoning',
        level: 3,
        description: { zh: '用全等、相似、平行线等进行两栏式或段落式几何证明。', en: 'Two-column or paragraph geometric proofs using congruence, similarity, and parallel lines.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }, { zh: '证明', en: 'Proof' }],
        emphasis: { CN: { zh: '综合证明大题', en: 'Comprehensive proof problems' }, UK: { zh: '严格证明格式', en: 'Rigorous proof format' } },
        relatedNodes: ['congruence', 'similarity', 'circles']
      },
      {
        id: 'problem-solving-strategies',
        title: { zh: '解题策略与数学思想', en: 'Problem-solving Strategies' },
        module: 'reasoning',
        level: 2,
        description: { zh: '数形结合、化归与转化、分类讨论、整体思想等数学思想方法。', en: 'Number-shape integration, reduction and transformation, case analysis, holistic thinking.' },
        skills: [{ zh: '批判性思维', en: 'Critical Thinking' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { CN: { zh: '数形结合与化归', en: 'Number-shape and reduction' }, IB: { zh: '探究过程记录', en: 'Documenting investigation process' } },
        relatedNodes: ['real-world-modeling', 'geometric-proof']
      },
    ]
  },
];
