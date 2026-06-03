const DIAGRAM_NEVER_CONCEPT_IDS = new Set([
  'arithmetic',
  'rational-numbers',
  'fractions-decimals',
  'powers-roots',
  'indices-laws',
  'surds',
  'algebra-expressions',
  'factorisation',
  'linear-equations-1',
  'simultaneous-equations',
  'inequalities',
  'quadratic-equations',
  'logical-reasoning',
  'algebraic-proof',
]);

const EXPLICIT_DRAW_CUES = [
  /(?:如图所示|如图|图中|图示|示意图|展开图|侧面展开图|正视图|俯视图|左视图|主视图|直观图|截面|剖面|坐标系|坐标轴|平面直角坐标系|函数图像|函数图象|图像)/u,
  /(?:补全|构造|描出).{0,8}(?:图|示意图|坐标系|图像|函数图像|函数图象)/u,
  /(?:as shown|in the figure|in the diagram|draw the figure|sketch the figure|graph|coordinate plane|coordinate axes)/i,
];

const GEOMETRIC_OBJECTS = [
  /(?:三角形|四边形|五边形|六边形|多边形|圆|扇形|弧|优弧|劣弧|角|线段|直线|射线|平行线|垂线|梯形|平行四边形|矩形|菱形|正方形|圆锥形|圆柱形|圆锥|圆柱|棱柱|棱锥|正方体|长方体|球|坐标点|抛物线|圆心|半径|直径|弦|切线|扇形区域|内接|外接)/u,
  /(?:线段|直线)\s*[A-Z]{1,4}\b/u,
  /(?:长|宽|高)(?:为|是|约|≈|=)?\s*(?:\d|[A-Za-z])/u,
  /点\s*[A-Za-z]/u,
  /(?:A|B|C|D|E|F|G|H)\s*\([^)]*\)/u,
  /(?:triangle|quadrilateral|pentagon|hexagon|polygon|circle|sector|arc|angle|segment|line|ray|parallel lines|perpendicular line|trapezoid|parallelogram|rectangle|rhombus|square|cylinder|cone|prism|pyramid|sphere|center|radius|diameter|chord|tangent|inscribed|cyclic|coordinates|coordinate point)/i,
];

const RELATION_CUES = [
  /(?:平行|垂直|相交|全等|相似|中点|距离|面积|周长|体积|弧长|扇形面积|角平分线|中垂线|切线|相切|斜率|截距|坐标|函数图像|函数图象|intersect|parallel|perpendicular|midpoint|distance|area|perimeter|arc length|sector area|tangent|slope|intercept|coordinate|graph)/i,
];

const STRONG_NO_DRAW_CUES = [
  /(?:证明|证|判断|是否正确|对不对|是否成立|counterexample|counterexamples|counter例)/u,
  /(?:因式分解|分解因式|配方|解方程|化简|求值|证明|推理|逻辑|反例)/u,
  /(?:整数|有理数|分数|小数|百分数|幂|根式|指数|多项式|代数式)/u,
];

function normalizeText(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

function matchesAny(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

function hasDiagramTriggerKeywords(text) {
  const source = normalizeText(text);
  if (!source) return false;
  return (
    matchesAny(EXPLICIT_DRAW_CUES, source) ||
    matchesAny(GEOMETRIC_OBJECTS, source) ||
    matchesAny(RELATION_CUES, source)
  );
}

function isWhitelistedDiagramConcept(conceptId = '', conceptTitle = '') {
  const normalizedId = String(conceptId ?? '').trim();
  if (normalizedId && DIAGRAM_NEVER_CONCEPT_IDS.has(normalizedId)) {
    return true;
  }

  const title = normalizeText(conceptTitle).toLowerCase();
  return [
    'integers & four operations',
    'rational numbers & negatives',
    'fractions, decimals & percentages',
    'powers & roots',
    'laws of indices',
    'surds & irrational numbers',
    'algebraic expressions & polynomials',
    'factorisation',
    'linear equations (one variable)',
    'simultaneous linear equations',
    'linear inequalities',
    'quadratic equations',
    'logical reasoning & counterexamples',
    'algebraic proof',
  ].some((needle) => title === needle.toLowerCase() || title.includes(needle.toLowerCase()));
}

export function isForcedDiagramConcept(conceptId = '', conceptTitle = '') {
  const normalizedId = String(conceptId ?? '').trim();
  if (normalizedId === 'circles') return true;
  if (!normalizedId && normalizeText(conceptTitle).toLowerCase().includes('circle')) return true;
  return false;
}

function buildPolicySignals(text) {
  return {
    diagramTriggers: matchesAny(EXPLICIT_DRAW_CUES, text) || matchesAny(GEOMETRIC_OBJECTS, text) || matchesAny(RELATION_CUES, text),
    noDrawHints: matchesAny(STRONG_NO_DRAW_CUES, text),
    textLength: text.length,
  };
}

function scoreDiagramConfidence(text) {
  const source = normalizeText(text);
  if (!source) return 0;

  let score = 0;
  if (matchesAny(EXPLICIT_DRAW_CUES, source)) score += 3;
  if (matchesAny(GEOMETRIC_OBJECTS, source)) score += 1;
  if (matchesAny(RELATION_CUES, source)) score += 1;
  if (/\b[A-Z]\s*\([^)]*\)/.test(source) || /\b点\s*[A-Za-z]/u.test(source)) score += 1;
  return score;
}

export function classifyDiagramNeed({ conceptId = '', conceptTitle = '', conceptDesc = '', prompt = '', requirement = '' } = {}) {
  const text = normalizeText([conceptTitle, conceptDesc, prompt, requirement].filter(Boolean).join(' '));
  if (!text) return 'must_not_draw';
  if (isForcedDiagramConcept(conceptId, conceptTitle)) return 'must_draw';
  if (isWhitelistedDiagramConcept(conceptId, conceptTitle)) return 'must_not_draw';

  const signals = buildPolicySignals(text);
  const confidence = scoreDiagramConfidence(text);
  if (signals.noDrawHints && confidence < 3) return 'must_not_draw';
  if (matchesAny(EXPLICIT_DRAW_CUES, text)) return 'must_draw';
  if (confidence >= 2) return 'must_draw';
  return 'must_not_draw';
}

function stripMathDiagramFences(text) {
  return String(text ?? '').replace(/```math-diagram[\s\S]*?```/gi, '').trim();
}

function stripInlineDiagramObjects(text) {
  return String(text ?? '')
    .replace(/\{[\s\S]*?"template"[\s\S]*?\}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isStandaloneDiagramJsonLine(line) {
  const trimmed = String(line ?? '').trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}') && trimmed.includes('"template"');
}

export function promoteStandaloneDiagramJsonBlocks(text) {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n');
  const output = [];
  let inFence = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      output.push(line);
      continue;
    }

    if (!inFence && isStandaloneDiagramJsonLine(line)) {
      try {
        JSON.parse(trimmed);
        output.push('```math-diagram');
        output.push(trimmed);
        output.push('```');
        continue;
      } catch {
        // Keep the original line if it is not valid JSON.
      }
    }

    output.push(line);
  }

  return output.join('\n');
}

export function stripDiagramArtifacts(text) {
  return stripInlineDiagramObjects(stripMathDiagramFences(String(text ?? '')));
}

export function explainDiagramPolicy(input = {}) {
  const text = normalizeText([input.conceptTitle, input.conceptDesc, input.prompt, input.requirement].filter(Boolean).join(' '));
  const policy = classifyDiagramNeed(input);
  const signals = buildPolicySignals(text);

  let reason = '';
  if (policy === 'must_not_draw') {
    reason = isWhitelistedDiagramConcept(input.conceptId, input.conceptTitle)
      ? 'This knowledge point is on the no-diagram whitelist.'
      : 'No diagram trigger keywords were detected.';
  } else {
    reason = 'A diagram trigger keyword was detected.';
  }

  return { policy, reason, signals };
}

export function shouldRequireDiagramBlock(input = {}) {
  return classifyDiagramNeed(input) === 'must_draw';
}
