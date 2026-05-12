import { KnowledgeModule } from '../types';

export const KNOWLEDGE_GRAPH: KnowledgeModule[] = [
  {
    id: 'algebra',
    name: { zh: '数与代数', en: 'Number and Algebra' },
    concepts: [
      {
        id: 'arithmetic',
        title: { zh: '数与运算', en: 'Numbers and Operations' },
        module: 'algebra',
        level: 1,
        description: { zh: '整数、分数、小数的运算以及百分数与比例。', en: 'Operations with integers, fractions, decimals, percentages, and ratios.' },
        skills: [{ zh: '程序流畅性', en: 'Procedural Fluency' }, { zh: '表征转换', en: 'Representation Transformation' }],
        emphasis: { CN: { zh: '计算准确性', en: 'Calculation Accuracy' }, SG: { zh: '可视化模型', en: 'Visual Modeling' } },
        relatedNodes: ['rational-numbers', 'linear-equations']
      },
      {
        id: 'rational-numbers',
        title: { zh: '有理数与负数', en: 'Rational Numbers and Negative Numbers' },
        module: 'algebra',
        level: 2,
        description: { zh: '绝对值、负数运算（温度、海拔模型）。', en: 'Absolute value, negative number operations (temperature, altitude models).' },
        skills: [{ zh: '概念理解', en: 'Conceptual Understanding' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { US: { zh: '真实情境', en: 'Real-world Context' }, UK: { zh: '语言表达', en: 'Linguistic Expression' } },
        relatedNodes: ['arithmetic']
      },
      {
        id: 'linear-equations-1',
        title: { zh: '一元一次方程', en: 'Linear Equations (One Variable)' },
        module: 'algebra',
        level: 2,
        description: { zh: '理解变量、系数，掌握移项、合并同类项等基本解法。', en: 'Understanding variables, coefficients, and basic solution steps.' },
        skills: [{ zh: '结构思维', en: 'Structural Thinking' }, { zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { SG: { zh: 'Bar Model 可视化', en: 'Bar Model Visualization' }, CN: { zh: '等式性质', en: 'Properties of Equality' } },
        relatedNodes: ['arithmetic', 'simultaneous-equations']
      },
      {
        id: 'simultaneous-equations',
        title: { zh: '二元一次方程组', en: 'Simultaneous Equations' },
        module: 'algebra',
        level: 2,
        description: { zh: '解决含有两个未知数的方程组（代入法、加减消元法）。', en: 'Solving systems of equations with two variables (substitution, elimination).' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { US: { zh: '图形交点理解', en: 'Graphical Intersection' }, UK: { zh: '代数消元步奏', en: 'Algebraic Elimination Steps' } },
        relatedNodes: ['linear-equations-1', 'functions']
      },
      {
        id: 'functions',
        title: { zh: '函数与变化', en: 'Functions and Change' },
        module: 'algebra',
        level: 2,
        description: { zh: '变化率（斜率）、截距、线性建模。', en: 'Rate of change (slope), intercepts, linear modeling.' },
        skills: [{ zh: '表征转换', en: 'Representation Transformation' }, { zh: '建模', en: 'Modeling' }],
        emphasis: { US: { zh: '截距的实际意义', en: 'Practical Meaning of Intercepts' }, UK: { zh: 'y = mx + c 结构', en: 'y = mx + c Structure' } },
        relatedNodes: ['linear-equations-1']
      },
      {
        id: 'inequalities',
        title: { zh: '不等式', en: 'Inequalities' },
        module: 'algebra',
        level: 2,
        description: { zh: '一元一次不等式的解法及其在数轴上的表示。', en: 'Solving linear inequalities and representation on number lines.' },
        skills: [{ zh: '逻辑推理', en: 'Logical Reasoning' }],
        emphasis: { CN: { zh: '不等式组', en: 'Systems of Inequalities' } },
        relatedNodes: ['linear-equations-1']
      },
      {
        id: 'indices-exponents',
        title: { zh: '幂与指数', en: 'Indices and Exponents' },
        module: 'algebra',
        level: 3,
        description: { zh: '掌握乘方运算、指数法则及科学记数法。', en: 'Mastering powers, index laws, and scientific notation.' },
        skills: [{ zh: '符号意识', en: 'Symbolic Awareness' }],
        emphasis: { UK: { zh: '标量表示', en: 'Standard Form' } },
        relatedNodes: ['arithmetic']
      }
    ]
  },
  {
    id: 'geometry',
    name: { zh: '图形与几何', en: 'Geometry' },
    concepts: [
      {
        id: 'basic-geometry',
        title: { zh: '角度与几何基础', en: 'Angles and Foundations' },
        module: 'geometry',
        level: 1,
        description: { zh: '平行线、交角性质、三角形内角和。', en: 'Parallel lines, angle properties, triangle angle sum.' },
        skills: [{ zh: '空间观念', en: 'Spatial Concepts' }],
        emphasis: { UK: { zh: '推导证明', en: 'Geometrical Reasoning' } },
        relatedNodes: ['transformations']
      },
      {
        id: 'transformations',
        title: { zh: '图形变换', en: 'Transformations' },
        module: 'geometry',
        level: 2,
        description: { zh: '平移、轴对称、旋转、位似变换。', en: 'Translation, symmetry, rotation, and enlargement.' },
        skills: [{ zh: '空间表征', en: 'Spatial Representation' }],
        emphasis: { SG: { zh: '全等与相似', en: 'Congruence and Similarity' } },
        relatedNodes: ['basic-geometry']
      },
      {
        id: 'pythagoras',
        title: { zh: '勾股定理', en: 'Pythagoras Theorem' },
        module: 'geometry',
        level: 2,
        description: { zh: '直角三角形三边关系及其逆定理。', en: 'Relationship between sides of right-angled triangles.' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '程序流畅性', en: 'Procedural Fluency' }],
        emphasis: { US: { zh: '实际应用', en: 'Real-world Application' } },
        relatedNodes: ['basic-geometry']
      },
      {
        id: 'circles',
        title: { zh: '圆的性质与度量', en: 'Circle Properties' },
        module: 'geometry',
        level: 3,
        description: { zh: '圆的周长、面积、切线性质及圆周角。', en: 'Circumference, area, tangents, and circle theorems.' },
        skills: [{ zh: '几何直观', en: 'Geometric Intuition' }],
        emphasis: { CN: { zh: '垂径定理', en: 'Perpendicular Chord Theorem' } },
        relatedNodes: ['basic-geometry']
      }
    ]
  },
  {
    id: 'statistics',
    name: { zh: '统计与概率', en: 'Statistics and Probability' },
    concepts: [
      {
        id: 'data-analysis',
        title: { zh: '数据描述与分析', en: 'Data Analysis' },
        module: 'statistics',
        level: 1,
        description: { zh: '中位数、众数、平均数及数据的离散程度。', en: 'Median, mode, mean, and spread of data.' },
        skills: [{ zh: '数据观念', en: 'Data Awareness' }],
        emphasis: { UK: { zh: '箱线图', en: 'Box Plots' } },
        relatedNodes: ['probability']
      },
      {
        id: 'probability',
        title: { zh: '概率与事件', en: 'Probability' },
        module: 'statistics',
        level: 2,
        description: { zh: '简单随机事件概率、树状图、列表法。', en: 'Simple probability, tree diagrams, and sample spaces.' },
        skills: [{ zh: '随机观念', en: 'Stochastic Awareness' }],
        emphasis: { IB: { zh: '条件概率初步', en: 'Basic Conditional Probability' } },
        relatedNodes: ['data-analysis']
      }
    ]
  },
  {
    id: 'modeling',
    name: { zh: '数学建模', en: 'Mathematical Modeling' },
    concepts: [
      {
        id: 'real-world-modeling',
        title: { zh: '真实情境建模', en: 'Real-world Modeling' },
        module: 'modeling',
        level: 3,
        description: { zh: '将多步文字题转换为数学模型。', en: 'Transforming multi-step word problems into mathematical models.' },
        skills: [{ zh: '建模', en: 'Modeling' }, { zh: '批判性思维', en: 'Critical Thinking' }],
        emphasis: { SG: { zh: 'Bar Model 为核心', en: 'Bar Model as Core' }, IB: { zh: '跨学科应用', en: 'Interdisciplinary Application' } },
        relatedNodes: ['linear-equations', 'functions']
      }
    ]
  }
];
