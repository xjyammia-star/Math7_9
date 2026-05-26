const EXPLICIT_DRAW_CUES = [
  /(?:如图|图中|图示|示意图|展开图|侧面展开图|正视图|俯视图|左视图|主视图|直观图|草图|截面|剖面|坐标系|坐标轴|平面直角坐标系|函数图像|函数图象|图像)/u,
  /(?:画出|作出|补全|构造|描出).{0,8}(?:图|示意图|坐标系|图像|函数图像|函数图象)/u,
];

const GEOMETRIC_OBJECTS = [
  /(?:三角形|四边形|五边形|六边形|多边形|圆|扇形|弧|角|线段|直线|射线|平行线|垂线|梯形|平行四边形|矩形|菱形|正方形|圆锥|圆柱|棱柱|棱锥|正方体|长方体|球|坐标点|抛物线|直线|圆心|半径|直径|弦|切线|扇形区域)/u,
];

const RELATION_CUES = [
  /(?:平行|垂直|相等|全等|相似|对称|内切|外切|相切|相交|夹角|圆心角|弧长|弦长|周长|面积|体积|母线|高|底面|侧面|棱长|截面|投影|坐标|横坐标|纵坐标|边长|角度|边相等|角相等)/u,
];

const STRONG_NO_DRAW_CUES = [
  /(?:判断正误|判断下列|下列(?:说法|命题|各项).{0,12}(?:正误|对错|真假|是否正确)|选择(?:下列)?(?:正确|错误)|判断.*(?:正误|对错|真假|是否正确))/u,
  /(?:求值|计算|化简|解方程|因式分解|直接求|直接写出|求出|填空|填出)/u,
  /(?:不需要画图|无需画图|不用画图|不画图|纯文字|概念题|定义题)/u,
];

function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function matchesAny(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

function countMatches(patterns, text) {
  return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
}

function isGeometryLike(text) {
  return matchesAny(GEOMETRIC_OBJECTS, text) || matchesAny(RELATION_CUES, text);
}

function isCoordinateLike(text) {
  return /(?:坐标系|坐标轴|平面直角坐标系|横坐标|纵坐标|坐标点|坐标|函数图像|函数图象|图像|图表)/u.test(text);
}

function isSpatialLike(text) {
  return /(?:立体|空间|展开图|侧面|截面|剖面|俯视图|正视图|左视图|右视图|三视图)/u.test(text);
}

function isJudgmentStyle(text) {
  return /(?:判断|判断题|正误|对错|真假|是否正确)/u.test(text);
}

function scoreDiagramNeed(text) {
  const drawCueCount = countMatches(EXPLICIT_DRAW_CUES, text);
  const objectCount = countMatches(GEOMETRIC_OBJECTS, text);
  const relationCount = countMatches(RELATION_CUES, text);
  const noDrawCount = countMatches(STRONG_NO_DRAW_CUES, text);
  const coordinateLike = isCoordinateLike(text);
  const spatialLike = isSpatialLike(text);
  const geometryLike = isGeometryLike(text);
  const judgmentStyle = isJudgmentStyle(text);

  const drawScore =
    drawCueCount * 4 +
    objectCount +
    relationCount +
    (coordinateLike ? 2 : 0) +
    (spatialLike ? 2 : 0) +
    (geometryLike && judgmentStyle ? 1 : 0);

  const noDrawScore =
    noDrawCount * 3 +
    (judgmentStyle && !geometryLike && !coordinateLike && !spatialLike ? 1 : 0);

  return {
    coordinateLike,
    drawCueCount,
    drawScore,
    geometryLike,
    judgmentStyle,
    noDrawScore,
    objectCount,
    relationCount,
    spatialLike,
  };
}

export function classifyDiagramNeed({ conceptTitle = "", conceptDesc = "", prompt = "", requirement = "" } = {}) {
  const text = normalizeText([conceptTitle, conceptDesc, prompt, requirement].filter(Boolean).join(" "));
  if (!text) return "maybe_draw";

  const {
    coordinateLike,
    drawCueCount,
    drawScore,
    geometryLike,
    noDrawScore,
    spatialLike,
  } = scoreDiagramNeed(text);

  if (drawCueCount > 0 && (geometryLike || coordinateLike || spatialLike)) {
    return "must_draw";
  }

  if (noDrawScore >= 3 && drawScore === 0) {
    return "must_not_draw";
  }

  if (drawScore >= 5) {
    return "prefer_draw";
  }

  if (drawScore >= 2) {
    return "prefer_draw";
  }

  if (noDrawScore >= 2 && drawScore < 2) {
    return "must_not_draw";
  }

  if (geometryLike || coordinateLike || spatialLike) {
    return "maybe_draw";
  }

  return "maybe_draw";
}

function stripMathDiagramFences(text) {
  return text.replace(/```math-diagram[\s\S]*?```/gi, "").trim();
}

function stripInlineDiagramObjects(text) {
  return text
    .replace(/\{[\s\S]*?"template"[\s\S]*?\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function stripDiagramArtifacts(text) {
  return stripInlineDiagramObjects(stripMathDiagramFences(String(text ?? "")));
}

export function explainDiagramPolicy(input = {}) {
  const text = normalizeText([input.conceptTitle, input.conceptDesc, input.prompt, input.requirement].filter(Boolean).join(" "));
  const policy = classifyDiagramNeed(input);
  const signals = scoreDiagramNeed(text);

  let reason = "";
  if (policy === "must_not_draw") {
    reason = "题目主要是纯文字或纯计算，不需要通过图形来完成。";
  } else if (policy === "must_draw") {
    reason = "题干含有明确图示线索，图是理解题意的重要部分。";
  } else if (policy === "prefer_draw") {
    reason = "题目涉及标准几何/坐标对象，图能更清楚地表达关系且可以安全绘制。";
  } else {
    reason = "题目可能可以画图，但当前信息不足以把图作为稳定默认项。";
  }

  return { policy, reason, signals };
}
