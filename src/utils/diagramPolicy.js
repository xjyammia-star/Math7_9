const MUST_NOT_DRAW_PATTERNS = [
  /判断[下列题说法命题语句]*的?正误/,
  /判断下列/,
  /下列.*(?:正误|对错)/,
  /(?:正误|对错|真假|是否正确)/,
  /选择.*(?:正确|错误)/,
];

const MUST_DRAW_PATTERNS = [
  /如图|图中|侧面展开图|展开图|示意图|坐标系|坐标轴|平面截面|截面|剖面/,
  /圆锥|圆柱|棱柱|棱锥|正方体|长方体|圆|三角形|平行线|垂直/,
];

function normalizeText(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

function matchesAny(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

export function classifyDiagramNeed({ conceptTitle = '', conceptDesc = '', prompt = '', requirement = '' } = {}) {
  const text = normalizeText([conceptTitle, conceptDesc, prompt, requirement].filter(Boolean).join(' '));
  if (!text) return 'maybe_draw';

  if (matchesAny(MUST_NOT_DRAW_PATTERNS, text)) return 'must_not_draw';
  if (matchesAny(MUST_DRAW_PATTERNS, text)) return 'must_draw';
  return 'maybe_draw';
}

function stripMathDiagramFences(text) {
  return text.replace(/```math-diagram[\s\S]*?```/gi, '').trim();
}

function stripInlineDiagramObjects(text) {
  return text.replace(/\{[\s\S]*?"template"[\s\S]*?\}/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

export function stripDiagramArtifacts(text) {
  return stripInlineDiagramObjects(stripMathDiagramFences(String(text ?? '')));
}
