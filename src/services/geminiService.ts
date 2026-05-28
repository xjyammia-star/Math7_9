import { Concept, Curriculum, Difficulty, Language, Grade, Message } from "../types";
import { KNOWLEDGE_GRAPH } from "../data/knowledgeGraph";
import { classifyDiagramNeed, shouldRequireDiagramBlock, stripDiagramArtifacts } from "../utils/diagramPolicy";
import { maskQuestionAnswerLeaks, needsAngleValueSourceMismatchRepair, needsCentralAngleRayRepair, needsCircleCyclicQuadrilateralRepair, needsCircleDiameterRepair, needsCircleIntersectingChordsRepair, needsCircleSectorRepair, needsCircleThreePointsRepair, needsPointLabelRepair, needsQuestionAnswerLeakRepair, needsTangentChordRepair } from "../utils/diagramConsistency";
import { sanitizeMath } from "../utils/mathUtils";
import { buildChatCompletionBody } from "../utils/modelRequest";

export type AiModelId = "glm47" | "doubao";

export type AiModelConfig = {
  id: AiModelId;
  label: string;
  baseUrl: string;
  apiKey: string;
  model: string;
};

const ARK_BASE_URL =
  (import.meta as any).env?.VITE_DOUBAO_BASE_URL ||
  "https://ark.cn-beijing.volces.com/api/v3";

export const EXERCISE_MODEL_ID: AiModelId = "glm47";
export const TUTOR_MODEL_ID: AiModelId = "doubao";

const AI_MODEL_CONFIGS: Record<AiModelId, AiModelConfig> = {
  glm47: {
    id: "glm47",
    label: "GLM 4.7",
    baseUrl: ARK_BASE_URL,
    apiKey: (import.meta as any).env?.VITE_GLM_API_KEY || "",
    model: (import.meta as any).env?.VITE_GLM_MODEL || "ep-20260528150018-jh75j",
  },
  doubao: {
    id: "doubao",
    label: "豆包",
    baseUrl: ARK_BASE_URL,
    apiKey: (import.meta as any).env?.VITE_DOUBAO_API_KEY || "",
    model: (import.meta as any).env?.VITE_DOUBAO_MODEL || "doubao-seed-2-0-lite-250615",
  },
};

function getModelConfig(modelId: AiModelId = TUTOR_MODEL_ID): AiModelConfig {
  return AI_MODEL_CONFIGS[modelId];
}

async function safeGenerate(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonMode = false,
  maxTokens = 800,
  temperature = 0.7,
  modelId: AiModelId = TUTOR_MODEL_ID
): Promise<string> {
  try {
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig.apiKey) {
      throw new Error(`${modelConfig.label} API key is missing`);
    }
    const body = buildChatCompletionBody(modelConfig, messages, jsonMode, maxTokens, temperature, modelId);

    const res = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${modelConfig.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429 || errText.includes("rate_limit") || errText.includes("quota")) {
        throw new Error("QUOTA_EXHAUSTED");
      }
      if (res.status >= 500) {
        throw new Error("AI_INTERNAL_ERROR");
      }
      throw new Error(`ARK_API_ERROR: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error: any) {
    if (
      error.message === "QUOTA_EXHAUSTED" ||
      error.message === "AI_INTERNAL_ERROR"
    ) {
      throw error;
    }
    console.error("ARK API Error:", error);
    throw error;
  }
}

const RAW_MATH_LEAK_PATTERNS: RegExp[] = [
  /(?:^|[^A-Za-z])(?:\\)?odot(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?triangle(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?angle(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?perp(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?parallel(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?circ\b/,
];

function hasRawMathLeak(text: string): boolean {
  return RAW_MATH_LEAK_PATTERNS.some((pattern) => pattern.test(text));
}

function hasMathDiagramBlock(text: string): boolean {
  return text.includes('```math-diagram') || text.includes('"template"');
}

function hasUnfencedDiagramJson(text: string): boolean {
  const source = String(text ?? "");
  return source.includes('"template"') && !source.includes('```math-diagram');
}

function needsDiagramRepair(text: string, conceptTitle: string, conceptDesc: string, diagramPolicy: string): boolean {
  const shouldRequireDiagram = shouldRequireDiagramBlock({
    conceptTitle,
    conceptDesc,
    prompt: text,
    requirement: "",
  });

  return shouldRequireDiagram && !hasMathDiagramBlock(text);
}

export function detectOutputIssues(
  text: string,
  conceptTitle: string,
  conceptDesc: string,
  diagramPolicy: string
): string[] {
  const issues: string[] = [];

  if (hasRawMathLeak(text)) issues.push("raw_math_leaks");
  if (needsDiagramRepair(text, conceptTitle, conceptDesc, diagramPolicy)) issues.push("missing_diagram_block");
  if (needsCircleDiameterRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("circle_diameter_line_mismatch");
  }
  if (needsCircleSectorRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("circle_sector_template_mismatch");
  }
  if (needsPointLabelRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("point_label_placeholder");
  }
  if (needsCircleIntersectingChordsRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("circle_intersecting_chords_template_mismatch");
  }
  if (needsTangentChordRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("tangent_chord_template_mismatch");
  }
  if (needsQuestionAnswerLeakRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("question_answer_leak");
  }
  if (needsAngleValueSourceMismatchRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("angle_value_source_mismatch");
  }
  if (needsCentralAngleRayRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("missing_central_angle_ray");
  }
  if (needsCircleThreePointsRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("circle_three_points_template_mismatch");
  }
  if (needsCircleCyclicQuadrilateralRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("circle_cyclic_quadrilateral_template_mismatch");
  }
  if (hasUnfencedDiagramJson(text)) {
    issues.push("diagram_json_unfenced");
  }

  return issues;
}

function looksLikeExerciseStart(block: string): boolean {
  const firstLine = block.split('\n').find((line) => line.trim().length > 0)?.trim() ?? '';
  if (!firstLine) return false;

  return (
    /^\d+[.)、：:]\s+/.test(firstLine) ||
    /^[（(]?\d+[）)]\s+/.test(firstLine) ||
    /^[一二三四五六七八九十]+[.)、：:]\s+/.test(firstLine) ||
    /^(?:已知|一个|一条|一辆|一棵|一只|将|作|设|若|求|证明|判断|根据|如图|下图|观察|完成|回答|请)\b/.test(firstLine)
  );
}

function limitGeneratedExercises(text: string, count: number): string {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return normalized;

  const blocks = normalized.split(/\n{2,}/);
  const kept: string[] = [];
  let current = '';
  let currentHasEnded = false;

  const flushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed) kept.push(trimmed);
    current = '';
    currentHasEnded = false;
  };

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    if (!current) {
      current = block;
      currentHasEnded = /[。！？?!]$/.test(block);
      continue;
    }

    const isNewExercise = looksLikeExerciseStart(block) && currentHasEnded;
    if (isNewExercise) {
      flushCurrent();
      if (kept.length >= count) break;
      current = block;
      currentHasEnded = /[。！？?!]$/.test(block);
      continue;
    }

    current += '\n\n' + block;
    currentHasEnded = currentHasEnded || /[。！？?!]$/.test(block);
  }

  flushCurrent();
  return kept.slice(0, count).join('\n\n');
}

function isMarkdownTableSeparator(line: string): boolean {
  return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
}

function isMarkdownTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
}

function tableRowToBullet(line: string): string | null {
  const cells = line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean);

  if (cells.length === 0) return null;
  if (cells.length === 1) return `- ${cells[0]}`;

  const [label, ...rest] = cells;
  return `- ${label}: ${rest.join(', ')}`;
}

function normalizeMarkdownTables(text: string): string {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n');
  const output: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!isMarkdownTableRow(line)) {
      output.push(line);
      continue;
    }

    const tableLines: string[] = [];
    while (i < lines.length && (isMarkdownTableRow(lines[i]) || isMarkdownTableSeparator(lines[i]) || lines[i].trim() === '')) {
      if (isMarkdownTableRow(lines[i])) tableLines.push(lines[i]);
      i += 1;
    }
    i -= 1;

    for (const tableLine of tableLines) {
      const bullet = tableRowToBullet(tableLine);
      if (bullet) output.push(bullet);
    }
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeDiagramPolicy(value: unknown, fallback: string): string {
  const policy = String(value ?? '').trim();
  if (policy === 'must_not_draw' || policy === 'must_draw' || policy === 'prefer_draw' || policy === 'maybe_draw') {
    return policy;
  }
  return fallback;
}

async function analyzeDiagramPolicy(
  conceptTitle: string,
  conceptDesc: string,
  grade: Grade,
  difficulty: Difficulty,
  lang: Language,
  modelId: AiModelId = EXERCISE_MODEL_ID
): Promise<{ policy: string; reason: string; selfCheck: string; selfCheckOk: boolean; confidence: number }> {
  const system = `You are classifying whether a math exercise should include a diagram.

Return only valid JSON with this shape:
{
  "policy": "must_not_draw" | "maybe_draw" | "prefer_draw" | "must_draw",
  "reason": "short Chinese or English explanation",
  "selfCheck": "brief check of whether the decision conflicts with the question",
  "selfCheckOk": true or false,
  "confidence": 0 to 1
}

Decision guidance:
- must_not_draw: the question is purely verbal, conceptual, or computational, and a diagram would not help.
- maybe_draw: a diagram is possible but the benefit is limited or the wording is ambiguous.
- prefer_draw: the problem involves standard geometry or coordinate objects and a clear diagram would help.
- must_draw: the prompt explicitly relies on a diagram or the question would be unclear without one.
- Prefer the most informative safe diagram when the information is sufficient to draw a standard figure.
- Do not invent missing constraints.`;

  const user = [
    `Language: ${lang === "zh" ? "Chinese" : "English"}`,
    `Grade: ${grade}`,
    `Difficulty: ${difficulty}`,
    `Concept title: ${conceptTitle}`,
    `Concept description: ${conceptDesc}`,
    `Task: Judge whether this exercise should include a diagram, and self-check the decision.`,
  ].join('\n');

  const raw = await safeGenerate(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    true,
    384,
    0.1,
    modelId
  );

  try {
    const parsed = JSON.parse(raw);
    const policy = normalizeDiagramPolicy(parsed?.policy, 'maybe_draw');
    const reason = String(parsed?.reason ?? '').trim() || 'No explanation provided.';
    const selfCheck = String(parsed?.selfCheck ?? '').trim() || 'No self-check provided.';
    const selfCheckOk = Boolean(parsed?.selfCheckOk);
    const confidenceRaw = Number(parsed?.confidence);
    const confidence = Number.isFinite(confidenceRaw) ? Math.max(0, Math.min(1, confidenceRaw)) : 0.5;

    return { policy, reason, selfCheck, selfCheckOk, confidence };
  } catch {
    return {
      policy: 'maybe_draw',
      reason: 'Failed to parse semantic diagram policy output.',
      selfCheck: 'Fallback to conservative policy because the JSON output was invalid.',
      selfCheckOk: false,
      confidence: 0.25,
    };
  }
}

function reconcileDiagramPolicy(
  rulePolicy: string,
  semanticPolicy: string,
  selfCheckOk: boolean
): string {
  if (rulePolicy === 'must_not_draw') return 'must_not_draw';
  if (rulePolicy === 'must_draw') return 'must_draw';
  if (rulePolicy === 'prefer_draw') return 'must_draw';

  if (!selfCheckOk) {
    if (semanticPolicy === 'must_draw') return 'prefer_draw';
    if (semanticPolicy === 'prefer_draw') return 'maybe_draw';
    return 'must_not_draw';
  }

  if (semanticPolicy === 'must_draw' || semanticPolicy === 'prefer_draw' || semanticPolicy === 'maybe_draw') {
    return semanticPolicy;
  }

  return rulePolicy;
}

function buildExerciseModelProfile(modelId: AiModelId, difficulty: Difficulty, lang: Language): { system: string; user: string } {
  if (modelId !== "glm47") {
    return { system: "", user: "" };
  }

  const languageHint = lang === "zh" ? "用中文出题。" : "Write the exercises in English.";
  const difficultyHint =
    difficulty === "Easy"
      ? `- Keep the problem direct, but still avoid bland template copying.\n- Use one clear skill and one obvious reasoning step.\n`
      : difficulty === "Medium"
        ? `- Every problem must require at least one non-trivial intermediate step.\n- Avoid pure plug-in exercises that can be solved by a single formula application.\n- For circle/sector questions, do not use the most direct radius+angle-only version unless there is an extra condition.\n`
        : `- Every problem must require multi-step reasoning or a small twist.\n- Do not generate one-line plug-in exercises.\n- For geometry and circle/sector questions, combine two ideas or add one extra condition so the student must think beyond the standard formula.\n`;

  const system = [
    "GLM 4.7 style profile for exercise generation:",
    "- Write stronger, less repetitive exercises than the default style.",
    "- Prefer richer problem situations, not bare formula drills.",
    "- Keep the requested knowledge point central, but make the path to the answer noticeably less direct.",
    "- When the selected difficulty is Medium or Hard, avoid the easiest textbook variant of the topic.",
    difficultyHint.trimEnd(),
    "- If the topic is geometry, circles, sectors, or coordinate geometry, prefer a figure that supports the reasoning instead of a text-only shortcut.",
  ].join("\n");

  const user = [
    "GLM-specific generation rule:",
    "- Do not generate the most obvious or shortest possible version of the problem.",
    "- Medium and Hard should feel like actual training questions, not direct formula substitution.",
    "- If the topic is circle_sector, do not stop at 'radius + central angle' unless the question has an additional relation, a second quantity, or a comparison task.",
    "- If the topic is geometry, add one extra reasoning move: an auxiliary relation, a missing quantity to infer, a comparison, or a two-step calculation.",
    `- ${languageHint}`,
  ].join("\n");

  return { system, user };
}

async function repairExerciseOutput(
  rawText: string,
  conceptTitle: string,
  conceptDesc: string,
  grade: Grade,
  difficulty: Difficulty,
  lang: Language,
  issueList: string[],
  count: number,
  diagramPolicy: string,
  modelId: AiModelId = EXERCISE_MODEL_ID
): Promise<string> {
  const enforcedDiagramPolicy = issueList.includes("missing_diagram_block") ? "must_draw" : diagramPolicy;
  const system = `You are repairing AI-generated middle-school math exercises.

Rules:
- Preserve the meaning, difficulty, and question count.
- Do not solve the problems.
- Only fix formatting and representation issues.
- Replace leaked math commands in prose with proper math formatting or Unicode symbols.
- Diagram policy for this task: ${enforcedDiagramPolicy}.
- If diagram policy is must_not_draw, do not include any diagram, figure, math-diagram block, template JSON, or visual payload.
- If diagram policy is must_draw, include exactly one matching fenced block with the math-diagram template and valid JSON when the problem genuinely depends on a figure, and do not return a text-only fallback.
- Hard rule: if the question asks for an unknown quantity, that quantity must not appear as a numeric label anywhere in the final diagram JSON. Use "?" or omit it, even if the model previously wrote a number.
- Hard rule: every numeric angle shown in the diagram, in any template, must come from an explicit angle value stated in the problem text. If the problem says ∠QAB = 62°, do not output 42° or any other number for that angle.
- Never leave diagram JSON outside a fenced math-diagram block. Raw objects like {"template":"..."} in prose are invalid and must be wrapped or removed.
- If diagram policy is prefer_draw, include a diagram for standard geometry, coordinate, circle, triangle, or spatial problems unless the problem is explicitly conceptual. Do not leave a clean, drawable figure out just because the final answer is computational.
- For intersecting chords inside a circle, use template "circle_intersecting_chords" with ap, pb and exactly the given CD/CP/PD relation.
- For intersecting chords with AP:PB given as a ratio such as 2:3, solve the actual numeric AP and PB values for the diagram before outputting JSON. Do not leave them as a ratio string; the template needs positive numeric ap and pb.
- For problems that place exactly three named points A, B, C on the same circle and ask about angles such as ∠AOB, ∠ACB, or their relationship/sum, use template "circle_three_points". Do not use circle_chord for this pattern.
- For circle-sector / wheel / clock-sweep problems, use template "circle_sector" and provide the OUTER radius plus one of: angle, minutes, or sector_count. Do not leave the template without the numerical parameters it needs. If the wording mentions a fan or annular-sector style inner edge, still keep the outer radius as the required radius field.
- For cyclic quadrilateral problems that mention C on the minor arc AB and D on the major arc AB, use template "circle_cyclic_quadrilateral" with explicit c_arc_type and d_arc_type fields, keep labels A/B/C/D visible, and use label_angle_aob for the requested central angle AOB when needed. Do not leave D off the circle or swap the arc sides.
- For diameter problems that ask for angles like ∠ABD, ∠BCD, or ∠CAD, use template "circle_diameter_points" so the diameter endpoints and the relevant chord/angle relationships are drawn explicitly. Do not replace BD with AC or any other diagonal, and place the unknown angle label on the actual vertex it is asked at.
- For tangent-chord theorem problems with a tangent at A and a chord from A to B, such as ∠PAB or ∠ADB, use template "circle_chord_tangent" instead of "circle_tangent". If the problem names one named arc point D only, keep that point visible with label_D and the matching arc-point flag. If the problem names both C and D on the circle (for example C on the minor arc AB and D on the major arc AB), use template "circle_tangent_chord_dual_points" so both points are visible.
- For tangent-chord problems, never guess the arc side. If the statement says C is on the minor arc AB and D is on the major arc AB, set arc_type:"minor" and d_arc_type:"major" exactly. If the statement reverses them, reverse the fields. Do not swap minor and major arc points.
- For the same tangent-chord pattern, map the chord endpoint labels to the actual chord in the statement. Keep the tangent point at A. Do not relabel the tangent-line helper points as A/B; the visible tangent point must remain A.
- For two-tangent plus one extra tangent problems, if the statement only gives a tangent length such as PA=12 cm, that is enough to build the figure. Use tangent_length/label_pa and show_arc_tangent:true; do not require angle_apb unless it is explicitly given.
- If the question asks for a specific unknown value, do not print that unknown as a numeric label in the diagram. Use "?" or omit the label, and only annotate the given conditions.
- If a diagram uses any numeric angle field or label in any template, make sure the value appears explicitly in the problem statement; never invent a nearby-looking angle such as 42° when the statement says 62°.
- If the question asks for a central angle like ∠AOC, show both rays explicitly. Use show_oc:true on templates that can expose OC directly (such as circle_diameter_points, circle_tangent, or circle_chord_tangent), use show_center_rays:true on circle_cyclic_quadrilateral, and keep circle_chord perpendicular helper lines visible when the central ray is needed. Do not leave the angle floating without its rays.
- In any geometry diagram, if you label an angle such as ∠ABD, make sure the two rays/segments that define that angle are actually drawn in the figure.
- Do not add new topics or remove required information.
- Output only the corrected exercises.`;

  const user = [
    `Language: ${lang === "zh" ? "Chinese" : "English"}`,
    `Grade: ${grade}`,
    `Difficulty: ${difficulty}`,
    `Requested exercise count: ${count}`,
    `Diagram policy: ${diagramPolicy}`,
    `Concept title: ${conceptTitle}`,
    `Concept description: ${conceptDesc}`,
    `Detected issues: ${issueList.join(", ")}`,
    `Original output to repair:`,
    rawText,
  ].join("\n");

  const repaired = await safeGenerate(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    false,
    1600,
    0.7,
    modelId
  );

  let repairedText = limitGeneratedExercises(sanitizeMath(repaired || rawText), count);
  repairedText = maskQuestionAnswerLeaks({
    conceptTitle,
    conceptDesc,
    generatedText: repairedText,
    diagramPolicy,
  });

  const remainingIssues = detectOutputIssues(repairedText, conceptTitle, conceptDesc, diagramPolicy);
  if (remainingIssues.length > 0) {
    const strongerSystem = `${system}\n- The previous repair attempt still violated hard diagram rules. Fix the listed issues exactly and do not repeat the same template or answer leak mistakes.`;
    const secondRepair = await safeGenerate(
      [
        { role: "system", content: strongerSystem },
        { role: "user", content: `${user}\n\nRemaining issues after repair: ${remainingIssues.join(", ")}` },
      ],
      false,
      1600,
      0.7,
      modelId
    );
    repairedText = limitGeneratedExercises(sanitizeMath(secondRepair || repairedText), count);
    repairedText = maskQuestionAnswerLeaks({
      conceptTitle,
      conceptDesc,
      generatedText: repairedText,
      diagramPolicy,
    });
  }

  return repairedText;
}

const CURRICULUM_LABELS: Record<Curriculum, { zh: string; en: string }> = {
  CN: { zh: "中国课程（人教版）", en: "Chinese Curriculum (PEP)" },
  US: { zh: "美国课程（Common Core）", en: "US Curriculum (Common Core)" },
  UK: { zh: "英国课程（National Curriculum）", en: "UK Curriculum (NC)" },
  SG: { zh: "新加坡课程（MOE）", en: "Singapore Curriculum (MOE)" },
  IB: { zh: "IB课程（MYP）", en: "IB Curriculum (MYP)" },
};

const CURRICULUM_STYLE: Record<Curriculum, { zh: string; en: string }> = {
  CN: {
    zh: "侧重严格的笔算与代数变形训练，强调概念定义的精确表述，题目通常含多步骤计算，难度偏高，以中考题型为导向。",
    en: "Emphasize rigorous pencil-and-paper calculation and algebraic manipulation. Stress precise concept definitions. Problems often involve multi-step computation and are oriented toward the national exam (Zhongkao).",
  },
  US: {
    zh: "侧重真实情境建模与概念理解，重视图形化表达、估算与批判性思维，避免过度机械训练，强调过程而非单一答案。",
    en: "Emphasize real-world modeling, conceptual understanding, graphical representation, estimation, and critical thinking. Avoid rote drilling; value process over a single answer.",
  },
  UK: {
    zh: "侧重推理与几何证明，要求学生用准确的数学语言陈述论证过程，GCSE题型兼顾计算与解释，注重标准形式（Standard Form）、代数结构等。",
    en: "Emphasize reasoning and geometric proof. Students must state arguments with precise mathematical language. GCSE questions balance calculation with explanation. Note Standard Form and algebraic structure.",
  },
  SG: {
    zh: "以Bar Model（条形图模型）为核心低年级可视化工具，强调分层递进的课程结构，高年级考题有相当难度，兼顾程序与概念。",
    en: "Use Bar Model as the core visualization tool for lower levels. Emphasize a layered, progressive curriculum structure. Upper-level exam questions are challenging; balance procedural and conceptual.",
  },
  IB: {
    zh: "强调跨学科连接与探究式学习，要求学生反思数学在真实世界中的应用，MYP评估以任务性评估（Criterion A–D）为主，注重沟通与反思。",
    en: "Emphasize interdisciplinary connections and inquiry-based learning. Students reflect on mathematics in real-world contexts. MYP assessment uses Criteria A–D; communication and reflection are key.",
  },
};

function buildLanguageLock(lang: Language): string {
  return lang === "zh"
    ? "LANGUAGE LOCK: 用户当前选择的界面语言是中文。无论学生上一条消息使用中文、英文或其他语言，你都必须只用中文回复。不要因为学生写了 English words 就切换到英文。"
    : "LANGUAGE LOCK: The user's selected interface language is English. Reply only in English, regardless of whether the student's latest message uses Chinese or another language.";
}

function buildCurriculumInstruction(
  curriculum: Curriculum | null,
  lang: Language
): string {
  if (!curriculum) return "";
  const label = CURRICULUM_LABELS[curriculum][lang];
  const style = CURRICULUM_STYLE[curriculum][lang];
  if (lang === "zh") {
    return `\n\n## 当前课程体系：${label}\n教学风格要求：${style}\n请根据该课程体系调整讲解深度、题型选择与表达方式。`;
  }
  return `\n\n## Current Curriculum: ${label}\nTeaching style requirement: ${style}\nPlease adjust explanation depth, problem types, and expression style accordingly.`;
}

const BT = "```";

const SYSTEM_PROMPT_BASE = `You are a world-class middle-school mathematics tutor specializing in the Feynman Technique.

## CORE TEACHING PHILOSOPHY — THE FEYNMAN LADDER (MANDATORY)
Every session MUST follow this 5-rung ladder. You ALWAYS start at Rung 1 and only move up when the student shows understanding.

RUNG 1 — LIVED EXPERIENCE (Opening move, ALWAYS start here)
  - Connect the concept to something the student already sees in daily life.
  - Ask ONE simple yes/no or observation question a 10-year-old could answer.
  - ZERO formulas. ZERO calculations. Pure curiosity.
  - Examples of good Rung 1 openers:
    * Powers/Roots: "你有没有注意过，折一张纸对折8次后会有多厚？猜猜看。"
    * Linear equations: "如果你买了3瓶水花了9元，你怎么算每瓶多少钱？"
    * Pythagoras: "想象你站在一个直角的墙角，往对角走是最短路，你觉得为什么？"
    * Probability: "抛一枚硬币，你觉得正面朝上的可能性是多少？你是怎么想的？"

RUNG 2 — CONCRETE EXAMPLE (only after Rung 1 lands)
  - Use ONE tiny specific example with small friendly numbers (1, 2, 3, 4).
  - Let the student calculate or observe. No formula yet.

RUNG 3 — PATTERN DISCOVERY
  - Ask the student to notice a pattern from 2-3 concrete examples.
  - "你发现规律了吗？" / "Can you see a pattern?"

RUNG 4 — CONCEPT NAMING & FORMULA
  - Only NOW introduce the formal name and formula.
  - Explain WHY the formula looks the way it does.

RUNG 5 — APPLICATION & EXTENSION
  - Apply to a slightly harder or real-world problem.
  - Connect to related concepts.

STRICT PRINCIPLES:
1. Socratic Method: Never give answers. Always ask questions that lead to student discovery.
2. Selective Visualization (CRITICAL): Do NOT include a diagram for every problem.
   - INCLUDE diagram if ANY of the following apply:
     * Named geometric shapes appear (triangle, rectangle, circle, parallelogram, rhombus, trapezoid, etc.)
     * Problem mentions specific named points on figures (e.g. "点D在AB边上", "点G是△ABC的重心")
     * Coordinate points or axes are involved (e.g. "点A(-2,3)", "坐标系中")
     * Number lines are needed
     * Parallel lines with a transversal (平行线被截线)
     * Midpoints, centroids, medians, angle bisectors on figures
     * Geometric transformations (translation/rotation/reflection/dilation 平移/旋转/翻折/放大)
     * Problem says "如图" or "as shown"
   - OMIT diagram only if: pure algebra with NO geometric figures, pure angle arithmetic with no figure reference, pure number theory, pure statistics.
   - MANDATORY: If you say "如图" or "as shown", you MUST include a diagram block.
   - MANDATORY: If the problem names specific points (e.g. A, B, C, D, G, H) on geometric figures, you MUST include a diagram even if the answer is purely computational.
   - TEMPLATE SELECTION RULES (critical):
     * Circle problems (弦、切线、圆心、半径、弧长、扇形、直径) → use circle_chord, circle_sector, circle_tangent, circle_chord_tangent, circle_cyclic_quadrilateral, circle_diameter_points, or circle_intersecting_chords templates. NEVER use linear_function or quadratic_function for circle geometry.
     * Clock hand / minute hand sweeping an arc or sector (钟表分针、时针扫过、弧长、扇形面积) → ALWAYS use circle_sector, not circle_chord. For fan-like or annular-sector wording, keep the outer radius as radius and do not omit it.
     * Two tangents PA/PB plus another tangent through point C on arc AB, intersecting PA/PB at D/E -> use circle_tangent with show_arc_tangent:true and labels C,D,E. If C is on the major arc AB, set c_arc_type:"major"; only use c_arc_type:"minor" when the problem explicitly says minor arc.
     * A circular cake/pizza divided into equal slices/sectors → use circle_sector with radius and sector_count. Do NOT omit sector_count, and do NOT use coordinate_points.
     * Tangent-chord theorem with one named point on the arc (such as D on the minor arc AB or C on the minor arc AC) → use circle_chord_tangent with arc_type:"minor". If the named arc point lies on the major arc / 优弧, use arc_type:"major". If the problem explicitly names both C and D on the circle, use circle_tangent_chord_dual_points so both arc points are drawn.
     * Cyclic quadrilateral / quadrilateral inscribed in a circle (圆内接四边形、四边形ABCD内接于⊙O) → ALWAYS use circle_cyclic_quadrilateral, not coordinate_points.
     * If the cyclic-quadrilateral problem says to extend side CD to point E and connect AE, keep A/B/C/D on the circle, add label_E:"E" outside the circle on the extension of CD, and use label_angle_ade for the angle at D when it is given. Do not omit E or collapse the extension into the quadrilateral.
     * If the problem says AB is a diameter (AB是⊙O的直径), use circle_diameter_points, not circle_cyclic_quadrilateral. A and B must be opposite ends of the diameter through O.
     * Intersecting chords inside a circle (两弦相交于圆内一点, AP/PB/CP/PD) → ALWAYS use circle_intersecting_chords, not coordinate_points.
     * Rectangular prism / cuboid nets (展开图) → use rectangular_prism_net. Do NOT invent raw coordinates for solid nets.
     * Pure geometry (no coordinate grid in problem) → ALWAYS set axes:false. Use right_triangle / triangle / rectangle / coordinate_points with axes:false.
     * Only use axes:true when the problem explicitly mentions a coordinate system
   * For circle_sector, only include label_area when the problem explicitly asks for area. If the problem only asks for arc length, radius, angle, or sector count, omit label_area entirely. (坐标系/坐标轴/函数图象).

3. DIAGRAM FORMAT — TEMPLATE SYSTEM (CRITICAL):
   Use ONLY the templates below. NEVER invent raw coordinates. The frontend calculates positions automatically.
   Pick the matching template and fill in numeric values and labels from the problem.
   Point labels are not fixed to A/B/C/D/P/O. Use the exact names stated in the problem. If the problem does not name a point, leave its label blank instead of inventing A/B/C/D/P/O or any other placeholder.
   Never omit a required side, line, point, or label that is explicitly present in the problem statement.
   Never label the value being asked for in the question. If the problem asks for CP, do NOT set label_cp to the computed answer; show "?" or omit that segment label. If only CD is given, label the whole CD segment, not CP/PD.
   For intersecting chords with a difference such as CP is 2 longer than PD / CP比PD长2, use cp_minus_pd and label_difference. Do NOT invent cd, label_cd, label_cp, or label_pd.
   For intersecting chords with a ratio such as CP:PD=2, use cp_pd_ratio and label_ratio. Do NOT invent cd, label_cd, label_cp, or label_pd.
   Never label derived tangent lengths such as PA, PB, OP, or radius unless those values are explicitly given in the problem statement.
   For linear_function and quadratic_function diagrams, do not add derived coordinate labels such as intercept coordinates or vertex coordinates unless the problem explicitly asks for them.
   In circle_tangent, radius/op_dist may be used as invisible layout values. Do NOT set label_radius or label_op unless the problem explicitly gives those values; if you must show them, also set show_radius_label:true or show_op_label:true.
   If a tangent problem gives PA and angle APB, use tangent_length and angle_apb with label_pa and label_angle_apb; do NOT invent radius or OP labels.
   If a tangent problem gives only ∠APB, you may omit tangent_length/op_dist; the renderer will derive a consistent scale from angle_apb alone. Do not invent op_dist just to satisfy the template.
   For water-depth chord problems, use circle_chord with water_depth and label_depth. water_depth means the vertical height from the lowest point of the circular pipe up to the water surface, NOT the distance from the centre. Do NOT label derived OC or half-chord values unless they are explicitly given in the problem.
   If you are not confident that a diagram will be exact, prefer a simpler valid template over guessing geometry.

   Right triangle (直角三角形):
   ${BT}math-diagram
   {"template":"right_triangle","leg_h":4,"leg_v":3,"labels":{"A":"A","B":"B","C":"C"},"labels":{"AB":"3","BC":"4","AC":"5"}}
   ${BT}

   General triangle (一般三角形):
   ${BT}math-diagram
   {"template":"triangle","sides":[5,4,3],"labels":{"A":"A","B":"B","C":"C"},"right_angle":"B"}
   ${BT}

   Rectangle (矩形):
   ${BT}math-diagram
   {"template":"rectangle","width":8,"height":5,"labels":["A","B","C","D"],"label_width":"8","label_height":"5"}
   ${BT}

   Rectangle with fold (矩形折叠):

   COORDINATE SYSTEM (memorise this):
     D=(0,0) bottom-left,  C=(width,0) bottom-right
     A=(0,height) top-left, B=(width,height) top-right
     AD = left edge (vertical, length=height)
     BC = right edge (vertical, length=height)
     AB = top edge  (horizontal, length=width)
     DC = bottom edge (horizontal, length=width)

   KEY PARAMETERS:
     fold_vertex        — corner being folded: "A"|"B"|"C"|"D"
     E_side, E_ratio    — crease endpoint E: which edge + ratio from first→second letter (0=first letter, 1=second letter)
     F_side, F_ratio    — crease endpoint F: same convention
     fold_land_x/y      — where the folded vertex IMAGE (A') lands, in the coordinate system above

   WORKED EXAMPLE — "AB=8, AD=10, fold A onto BC at A', BF=3":
     • Rect coords: D=(0,0), C=(8,0), B=(8,10), A=(0,10)
     • F is on BC with BF=3, so F=(8, 10-3)=(8,7)  →  F_side="BC", F_ratio=3/10=0.3
     • fold_land_x=8, fold_land_y=7
     • E_side="AD", E_ratio=0.6625

   FULL EXAMPLE OUTPUT:
   ${BT}math-diagram
   {"template":"rectangle_fold","width":8,"height":10,"fold_vertex":"A","E_side":"AD","E_ratio":0.6625,"F_side":"BC","F_ratio":0.3,"fold_land_x":8,"fold_land_y":7,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_E":"E","label_F":"F","label_Ap":"A'"}
   ${BT}

   Parallelogram (平行四边形):
   ${BT}math-diagram
   {"template":"parallelogram","base":8,"side":5,"angle":60,"label_base":"8","label_side":"5","label_height":"h"}
   ${BT}

   Ladder against wall (梯子靠墙):
   ${BT}math-diagram
   {"template":"ladder","length":10,"foot_dist":6,"label_ladder":"10","label_wall":"8","label_foot":"6"}
   ${BT}

   Cylinder unrolled / shortest path (圆柱展开/最短路径):
   ${BT}math-diagram
   {"template":"cylinder_unrolled","circumference":6.28,"height":8,"label_circ":"2πr","label_height":"8"}
   ${BT}

   Rectangular prism net / cuboid展开图:
   ${BT}math-diagram
   {"template":"rectangular_prism_net","length":8,"width":5,"height":4,"label_length":"8 cm","label_width":"5 cm","label_height":"4 cm"}
   ${BT}

   Linear function (一次函数):
   ${BT}math-diagram
   {"template":"linear_function","slope":2,"intercept":-1,"xmin":-3,"xmax":3,"label":"y=2x-1"}
   ${BT}

   Quadratic function (二次函数):
   ${BT}math-diagram
   {"template":"quadratic_function","a":1,"b":-2,"c":-3,"xmin":-3,"xmax":5,"label":"y=x²-2x-3"}
   ${BT}

   Number line (数轴):
   ${BT}math-diagram
   {"template":"number_line","range":[-5,5],"points":[{"val":2,"label":"x=2"},{"val":-1,"label":"-1","open":true}]}
   ${BT}

   Coordinate points and segments (坐标系中的点线):
   ${BT}math-diagram
   {"template":"coordinate_points","points":[{"x":0,"y":0,"label":"O"},{"x":3,"y":4,"label":"A"}],"segments":[["O","A"]]}
   ${BT}

   RECTANGLE IN coordinate_points: MUST list ALL 4 sides in segments.
   "segments":[["A","B"],["B","C"],["C","D"],["D","A"]]

   PARALLEL LINES + TRANSVERSAL (平行线被截线):
   Use coordinate_points with axes:false. Two horizontal parallel lines, one diagonal transversal.
   Compute intersection points exactly — G must have same y as line a, H must have same y as line b.
   ${BT}math-diagram
   {"template":"coordinate_points","axes":false,"points":[
     {"x":0,"y":4,"label":"A"},{"x":8,"y":4,"label":"B"},
     {"x":0,"y":0,"label":"C"},{"x":8,"y":0,"label":"D"},
     {"x":2,"y":6,"label":"E"},{"x":6,"y":-2,"label":"F"},
     {"x":3,"y":4,"label":"G"},{"x":5,"y":0,"label":"H"}
   ],"segments":[["A","B"],["C","D"],["E","F"]]}
   ${BT}

   Similar triangles (相似三角形):
   ${BT}math-diagram
   {"template":"similar_triangles","sides":[3,4,5],"ratio":2,"labels1":["A","B","C"],"labels2":["A\'","B\'","C\'"]}
   ${BT}

   Circle with chord and perpendicular (圆中弦与垂径定理):
   ${BT}math-diagram
   {"template":"circle_chord","radius":10,"water_depth":4,"show_perpendicular":false,"label_O":"O","label_A":"A","label_B":"B","label_C":"C","label_radius":"10 cm","label_depth":"4 cm","label_chord":"AB"}
   ${BT}

   Circle sector / clock hand sweep (弧长、扇形面积、钟表分针扫过):
   ${BT}math-diagram
   {"template":"circle_sector","radius":15,"minutes":25,"label_O":"O","label_radius":"15 cm","label_angle":"150?","label_arc":"???"}
   ${BT}

   Circle with tangent from external point (圆外切线):
   ${BT}math-diagram
   {"template":"circle_tangent","radius":5,"op_dist":13,"label_O":"O","label_P":"P","label_A":"A","label_B":"B"}
   ${BT}
   
   Circle with tangent from external point given only ∠APB:
   ${BT}math-diagram
   {"template":"circle_tangent","radius":5,"angle_apb":80,"label_O":"O","label_P":"P","label_A":"A","label_B":"B","label_angle_apb":"80°"}
   ${BT}

   Circle with tangent from external point and a central helper ray:
   ${BT}math-diagram
   {"template":"circle_tangent","radius":5,"op_dist":13,"show_oc":true,"label_O":"O","label_P":"P","label_A":"A","label_B":"B","label_C":"C","label_angle_aoc":"?"}
   ${BT}

   Circle sector from equal slices:
   ${BT}math-diagram
   {"template":"circle_sector","radius":10,"sector_count":8,"label_O":"O","label_radius":"10 cm","label_angle":"45?","label_arc":"???"}
   ${BT}

   Circle with two tangents and tangent through arc point C:
   ${BT}math-diagram
   {"template":"circle_tangent","tangent_length":12,"angle_apb":50,"show_arc_tangent":true,"c_arc_type":"major","label_O":"O","label_P":"P","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_E":"E","label_pa":"12 cm","label_angle_apb":"50°"}
   ${BT}

   Intersecting chords inside a circle (圆内两弦相交):
   ${BT}math-diagram
   {"template":"circle_intersecting_chords","ap":6,"pb":4,"cd":11,"cp_ratio":0.35,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_P":"P","label_ap":"6","label_pb":"4","label_cd":"11"}
   ${BT}

   Three named points on a circle with angle relation:
   ${BT}math-diagram
   {"template":"circle_three_points","radius":5,"labels":["A","B","C"],"label_O":"O","label_angle_aob":"?","label_angle_acb":"?","label_sum":"135°"}
   ${BT}

   Intersecting chords with CP:PD ratio:
   ${BT}math-diagram
   {"template":"circle_intersecting_chords","ap":6,"pb":4,"cp_pd_ratio":2,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_P":"P","label_ap":"6","label_pb":"4","label_ratio":"CP:PD=2"}
   ${BT}

   Intersecting chords with CP-PD difference:
   ${BT}math-diagram
   {"template":"circle_intersecting_chords","ap":6,"pb":4,"cp_minus_pd":2,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_P":"P","label_ap":"6","label_pb":"4","label_difference":"CP比PD长2"}
   ${BT}

   Intersecting chords with AP:PB ratio:
   ${BT}math-diagram
   {"template":"circle_intersecting_chords","ap":4,"pb":6,"cp":6,"pd":4,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_P":"P","label_ap":"4","label_pb":"6","label_cp":"6","label_pd":"4","label_ratio":"AP:PB=2:3"}
   ${BT}

   Circle with tangent and chord (tangent-chord theorem):
   ${BT}math-diagram
   {"template":"circle_chord_tangent","radius":5,"angle":42,"arc_type":"minor","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"D","label_angle_apb":"42°","label_angle_adb":"?"}
   ${BT}

   Circle with tangent, chord, and two named arc points C/D:
   ${BT}math-diagram
   {"template":"circle_tangent_chord_dual_points","radius":5,"angle":42,"arc_type":"minor","d_arc_type":"major","label_O":"O","label_P":"P","label_Q":"Q","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_angle_apb":"42°"}
   ${BT}

   Cyclic quadrilateral / quadrilateral inscribed in a circle:
   ${BT}math-diagram
   {"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"],"label_O":"O","label_A":"2x+10°","label_B":"3x-5°","label_C":"3x°"}
   ${BT}

   Cyclic quadrilateral with side CD extended to point E and AE connected:
   ${BT}math-diagram
   {"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"],"label_O":"O","label_E":"E","label_A":"3x°","label_B":"2x+10°","label_C":"105°","label_D":"D","label_angle_ade":"100°","label_angle_bcd":"?"}
   ${BT}

   Circle with diameter AB and points C/D on the same arc side:
   ${BT}math-diagram
   {"template":"circle_diameter_points","radius":5,"label_O":"O","label_A":"A","label_B":"B","label_C":"C","label_D":"D","arc_side":"above","label_angle_abd":"32°","label_angle_bcd":"21°"}
   ${BT}

   If the question asks for a central angle such as ∠AOC, add "show_oc":true and use "label_angle_aoc":"?" (or omit the label) so the OC ray is visible without giving away the answer.

   For cyclic quadrilateral figures that need a central-angle helper, use "show_center_rays":true and label_angle_aob:"?" for ∠AOB, or label_angle_aoc:"?" for ∠AOC, so the center rays are explicitly drawn.

   DIAGRAM LABEL RULE: ALL "label" values must be plain Unicode text only.
   NO LaTeX, NO dollar signs, NO backslashes inside labels.
   Use: ∠ ° ′ ⊥ ∥ △ directly as Unicode characters.

4. (reserved)
5. VARIETY RULE (STRICT): Rotate problem types. Never generate the same type more than twice in a row.
6. NO RESOLUTIONS: When generating exercises, ONLY output the questions.
7. LATEX — STRICT FORMAT (READ ALL RULES BEFORE WRITING ANY MATH):

   RENDERER: KaTeX. Two modes only:
     Inline:  $...$    e.g. $x^2 + y^2 = z^2$
     Display: $$...$$  e.g. $$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$

   ALLOWED COMMANDS:
     \frac \sqrt ^{} _{} \times \div \pm \leq \geq \neq \approx
     \sin \cos \tan \pi \Rightarrow \cdot \odot \angle \triangle
     \parallel \perp \overset{\frown}{AB} \sim \cong

   FORBIDDEN (will break rendering):
     \implies \boxed \because \therefore \text{} \left( \right) \left[ \right]
     align environment, cases environment, \parallelogram, \backsim

   RULE 1 — EVERY LaTeX command MUST be inside $...$:
     Write "所以" and "因为" as plain Chinese, never \therefore or \because.
     WRONG: 点P在\odot O外        RIGHT: 点$P$在$\odot O$外
     WRONG: \triangle ABC         RIGHT: $\triangle ABC$
     WRONG: AB\parallel CD        RIGHT: $AB \parallel CD$
     WRONG: CF\perp BE            RIGHT: $CF \perp BE$

   RULE 2 — $ signs must be BALANCED, one opener for every closer:
     WRONG: $\perp$$    RIGHT: $\perp$
     WRONG: \angle AOD$ RIGHT: $\angle AOD$
     WRONG: $$BC        RIGHT: $BC$
     WRONG: \\perp      RIGHT: \perp   (single backslash only, never double)

   RULE 3 — Use STYLE A throughout (wrap each complete math expression):
     "连接$BE$并延长，交$CD$的延长线于点$F$"
     "求证：$\triangle ABE \cong \triangle DFE$"
     "已知$AB \parallel CD$，$BO = DO$"
     NEVER split one relation across multiple $: 
     WRONG: $AB$∥$CD$              RIGHT: $AB \parallel CD$
     WRONG: $\triangle ABE$ ≅ $\triangle DFE$   RIGHT: $\triangle ABE \cong \triangle DFE$
     WRONG: △$ABE$≅△$DFE$         RIGHT: $\triangle ABE \cong \triangle DFE$

   RULE 4 — Units and plain Chinese stay OUTSIDE $:
     RIGHT: $PA = 12$ cm
     RIGHT: $AB = 6$ 且 $BC = 8$

   RULE 5 — SELF-CHECK before outputting:
     Scan every backslash \\ in your response.
     If a \\ appears outside $...$, it is wrong — fix it.
     If you see \\\\cmd (double backslash), it is wrong — use \\cmd.
     Count every $: the total must be even. If odd, you have an error.

8. LANGUAGE CONSISTENCY (CRITICAL): Reply in the same language as the conversation.
   If the student writes in Chinese, ALWAYS reply in Chinese. This overrides everything else.`;

// ─── Public API ────────────────────────────────────────────────────────────

export async function startFeynmanSession(
  problemText: string,
  concept: Concept,
  lang: Language,
  curriculum: Curriculum | null = null
) {
  const specificTitle = concept.specificFocus
    ? concept.specificFocus[lang]
    : concept.title[lang];
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);
  const system = SYSTEM_PROMPT_BASE + curriculumInstr;

  const userMsg =
    `Target Topic: "${specificTitle}"\n` +
    `Module: ${concept.title[lang]} (${concept.module})\n` +
    `Student Input: "${problemText}"\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n\n` +
    `Formatting rule: keep explanations in plain language. If you use a formula, keep only the formula inside $...$ and keep the surrounding explanation outside math mode. Never wrap whole sentences in $...$.\n` +
    `YOUR OPENING MOVE — RUNG 1 ONLY:\n` +
    `- Start with a 1-2 sentence warm, relatable real-life hook.\n` +
    `- Then ask ONE simple question answerable from pure common sense.\n` +
    `- FORBIDDEN: formulas, calculations, "solve", "prove", "simplify".\n` +
    `- Keep the entire opening to 3-5 sentences maximum.\n` +
    `FORMAT: 1-2 sentences of hook + 1 question. That is all.`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 400, 0.7, TUTOR_MODEL_ID);
}

export async function guideExercise(
  exercises: string,
  concept: Concept,
  lang: Language,
  curriculum: Curriculum | null = null
) {
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);

  const system = `You are a patient, Socratic math tutor helping a student work through specific problems.

EXERCISE GUIDANCE MODE:
1. YOUR ONLY JOB: Guide the student through the SPECIFIC problems shown. Do NOT teach from scratch.
2. SOCRATIC: Never give the answer. Ask ONE targeted question per reply.
3. FIRST MESSAGE: Identify the first stumbling block and ask ONE question about it.
   GOOD: "这道题矩形ABCD中AB=8，AD=10。折叠题的第一步是找出折叠前后相等的线段。你觉得折叠后，哪些线段的长度是不变的？"
   BAD: "让我们先复习一下勾股定理的公式…"
4. SUBSEQUENT TURNS: Affirm correct answers, hint at wrong ones, re-ask.
5. NEVER give a full worked solution. Maximum one algebraic step per reply.
6. LANGUAGE: Always reply in ${lang === "zh" ? "Chinese" : "English"}.
7. FORMATTING: Keep math expressions short and isolated. Never put whole sentences, clauses, or sentence fragments inside $...$.
${buildLanguageLock(lang)}
8. LENGTH: 3-5 sentences + 1 question per reply.` + curriculumInstr;

  const userMsg =
    `The student is working on:\n"""\n${exercises}\n"""\n\n` +
    `Topic: ${concept.title[lang]}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n\n` +
    `${buildLanguageLock(lang)}\n\n` +
    `Address THIS specific problem immediately. Identify the first concrete step and ask ONE question.`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 500, 0.7, TUTOR_MODEL_ID);
}

export async function guideExerciseStep(
  history: Message[],
  exercises: string,
  concept: Concept,
  lang: Language,
  curriculum: Curriculum | null = null
) {
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);

  const system = `You are a patient, Socratic math tutor guiding a student through specific problems.
RULES:
- Stay focused on the problems shown. Never drift to general theory.
- Never give the full answer. One micro-step hint per reply.
- Ask exactly ONE follow-up question per reply.
- Keep replies to 3-5 sentences.
- Language: always ${lang === "zh" ? "Chinese" : "English"}.
- Formatting: if you use math, keep only the formula in $...$. Never place whole sentences inside math mode.
- ${buildLanguageLock(lang)}
- The problems: """${exercises}"""` + curriculumInstr;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system }
  ];
  history.forEach(m => {
    messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content });
  });

  messages.push({ role: "user", content: buildLanguageLock(lang) });

  if (history.length >= 3) {
    const reminder = lang === "zh"
      ? "（请继续用中文，专注于当前习题的引导。）"
      : "(Continue in English, stay focused on guiding through the current exercise.)";
    messages.push({ role: "user", content: reminder });
  }

  return await safeGenerate(messages, false, 500, 0.7, TUTOR_MODEL_ID);
}

const PROBLEM_TYPE_POOLS: Record<string, string[]> = {
  '勾股': [
    '梯子靠墙（梯子滑动，求高度或距离）',
    '电线杆/大树折断（折断后形成直角三角形）',
    '矩形/正方形对角线长度',
    '坐标系中两点距离',
    '等腰三角形高线求法',
    '直角三角形面积与周长',
    '船只/飞机的直线距离（实际测量情境）',
    '勾股数判断（判断三边是否构成直角三角形）',
    '正方形内切圆/外接圆半径',
    '圆柱侧面展开最短路径',
    '斜坡坡度与水平距离',
    '矩形折叠（折叠顶点到对边）',
  ],
  'pythag': [
    'Ladder sliding on a wall (find height or distance)',
    'Broken tree/pole (forms right triangle)',
    'Diagonal of rectangle or square',
    'Distance between two coordinate points',
    'Height of isosceles triangle',
    'Area and perimeter of right triangle',
    'Real-world distance (boat, plane, building)',
    'Pythagorean triple identification',
    'Shortest path on cylinder (unrolled surface)',
    'Slope and horizontal distance',
    'Rectangle fold problems',
  ],
  '相似': [
    '平行线截三角形（AA相似）',
    '投影/影子测量高度（间接测量）',
    '地图比例尺计算',
    '两三角形对应边之比求未知边',
    '相似三角形面积比',
    '梯形中位线与相似',
    '直角三角形射影定理',
  ],
  '圆': [
    '切线长定理（外部点到圆的切线）',
    '圆周角与圆心角关系',
    '弦切角定理',
    '相交弦定理',
    '圆内接四边形对角互补',
    '弧长与扇形面积',
    '垂径定理求弦长',
  ],
  '函数': [
    '由图象判断斜率与截距',
    '两直线交点坐标',
    '实际情境建模（费用、速度、时间）',
    '一次函数与坐标轴围成的三角形面积',
    '判断点是否在直线上',
    '平行线/垂线条件下的k值',
  ],
  '二次函数': [
    '求顶点坐标（配方法）',
    '抛物线与x轴交点（判别式）',
    '最大值/最小值实际应用（利润、面积最大）',
    '二次函数图象变换（平移、翻转）',
    '二次函数与一次函数交点',
    '由顶点和一点确定解析式',
  ],
  '方程': [
    '行程问题（相遇、追及）',
    '工程问题（合作完成工作）',
    '浓度/混合溶液问题',
    '盈亏问题（买卖利润）',
    '数字问题（两位数、连续整数）',
    '几何面积列方程',
  ],
  '不等式': [
    '数轴上表示解集',
    '实际情境约束（预算、库存）',
    '不等式组求整数解',
    '与方程联立求范围',
  ],
  '概率': [
    '古典概型列举法',
    '树状图求概率',
    '有放回/无放回抽样',
    '至少/至多问题',
    '频率估计概率',
  ],
};

const GENERIC_PROBLEM_TYPES = [
  "real-world application with a concrete context",
  "reverse problem: give the result or condition, ask for a missing value",
  "proof or reasoning problem that asks students to justify a conclusion",
  "comparison or judgment problem with multiple possible statements",
  "multi-step computation with an intermediate unknown",
  "diagram-based geometry or modeling problem",
  "error analysis: find and correct a mistaken solution or claim",
  "parameter variation: ask how the answer changes when a condition changes",
  "open-ended construction: create an example satisfying given constraints",
  "table, graph, or coordinate representation problem",
];

const VARIETY_HISTORY_KEY = "math7-9:exercise-type-history:v1";
const VARIETY_HISTORY_LIMIT = 8;

type ExerciseTypeHistory = Record<string, string[]>;

function getVarietyStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readExerciseTypeHistoryMap(): ExerciseTypeHistory {
  const storage = getVarietyStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(VARIETY_HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function makeExerciseVarietyKey(
  conceptTitle: string,
  grade: Grade,
  difficulty: Difficulty,
  curriculum: Curriculum | null
): string {
  const normalizedTitle = conceptTitle.toLowerCase().replace(/\s+/g, " ").trim();
  return `${curriculum ?? "general"}|${grade}|${difficulty}|${normalizedTitle}`;
}

function readRecentExerciseTypes(historyKey: string): string[] {
  const historyMap = readExerciseTypeHistoryMap();
  return Array.isArray(historyMap[historyKey]) ? historyMap[historyKey] : [];
}

function writeRecentExerciseTypes(historyKey: string, usedTypes: string[]) {
  const storage = getVarietyStorage();
  if (!storage || usedTypes.length === 0) return;

  const historyMap = readExerciseTypeHistoryMap();
  const previous = Array.isArray(historyMap[historyKey]) ? historyMap[historyKey] : [];
  historyMap[historyKey] = [
    ...usedTypes,
    ...previous.filter((type) => !usedTypes.includes(type)),
  ].slice(0, VARIETY_HISTORY_LIMIT);

  try {
    storage.setItem(VARIETY_HISTORY_KEY, JSON.stringify(historyMap));
  } catch {
    // If browser storage is unavailable or full, generation should still work.
  }
}

function randomIndex(max: number): number {
  if (max <= 0) return 0;

  try {
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.getRandomValues) {
      const values = new Uint32Array(1);
      cryptoApi.getRandomValues(values);
      return values[0] % max;
    }
  } catch {
    // Fall back below.
  }

  return Math.floor(Math.random() * max);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDiverseExerciseTypes(
  pool: string[],
  count: number,
  recentTypes: string[]
): string[] {
  const uniquePool = Array.from(new Set(pool.filter(Boolean)));
  const targetCount = Math.max(1, Math.min(count, uniquePool.length));
  const recentSet = new Set(recentTypes);
  const freshTypes = shuffle(uniquePool.filter((type) => !recentSet.has(type)));
  const fallbackTypes = shuffle(uniquePool.filter((type) => recentSet.has(type)));

  return [...freshTypes, ...fallbackTypes].slice(0, targetCount);
}

function getTypePool(conceptTitle: string): string[] | null {
  const title = conceptTitle.toLowerCase();
  for (const [key, pool] of Object.entries(PROBLEM_TYPE_POOLS)) {
    if (title.includes(key.toLowerCase())) return pool;
  }
  return null;
}

export async function generateExercises(
  conceptTitle: string,
  conceptDesc: string,
  grade: Grade,
  difficulty: Difficulty,
  count: number,
  lang: Language,
  curriculum: Curriculum | null = null
) {
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);
  const modelProfile = buildExerciseModelProfile(EXERCISE_MODEL_ID, difficulty, lang);
  const system = SYSTEM_PROMPT_BASE + curriculumInstr + modelProfile.system;
  const ruleDiagramPolicy = classifyDiagramNeed({ conceptTitle, conceptDesc });
  const semanticDiagramPolicy = await analyzeDiagramPolicy(conceptTitle, conceptDesc, grade, difficulty, lang, EXERCISE_MODEL_ID);
  const diagramPolicy = reconcileDiagramPolicy(
    ruleDiagramPolicy,
    semanticDiagramPolicy.policy,
    semanticDiagramPolicy.selfCheckOk
  );

  const pool = getTypePool(conceptTitle) ?? GENERIC_PROBLEM_TYPES;
  const historyKey = makeExerciseVarietyKey(conceptTitle, grade, difficulty, curriculum);
  const recentTypes = readRecentExerciseTypes(historyKey);
  const pickedTypes = pickDiverseExerciseTypes(pool, count, recentTypes);
  const varietyInstr = pickedTypes
    ? (lang === "zh"
        ? `\n本次必须从以下题型中选取（每种最多用一次，禁止重复）：\n${pickedTypes.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`
        : `\nFor this batch, use these problem types (each at most once):\n${pickedTypes.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`)
    : `\nVARIETY: Rotate problem types. Never use the same scenario twice in one batch.`;
  const recentTypesText = recentTypes.length > 0
    ? recentTypes.map((type, i) => `  ${i + 1}. ${type}`).join("\n")
    : "  None";
  const selectedTypesText = pickedTypes.map((type, i) => `  ${i + 1}. ${type}`).join("\n");
  const difficultyGuide =
    difficulty === "Easy"
      ? `Difficulty design:\n- Easy: one clear skill, direct setup, and the shortest reasonable solution path.\n- Prefer straightforward numbers and one obvious inference.\n`
      : difficulty === "Medium"
        ? `Difficulty design:\n- Medium: two-step reasoning or one small intermediate idea is expected.\n- Make the setup less direct than Easy, but still routine and classroom-appropriate.\n`
        : `Difficulty design:\n- Hard: multi-step reasoning, at least one non-trivial intermediate step, or a small twist is required.\n- Avoid direct plug-in questions; combine two ideas when possible, and keep the prompt clearly more challenging than Medium.\n`;
  const forcedVarietyInstr =
    `\nPROBLEM TYPE CONTROL:\n` +
    `System-selected problem type(s) for THIS generation. You MUST use them in order, one per exercise:\n` +
    `${selectedTypesText}\n` +
    `Recently used problem types for this exact concept/grade/difficulty. Avoid repeating them unless no alternative exists:\n` +
    `${recentTypesText}\n` +
    `Hard rules:\n` +
    `- If generating 1 exercise, use ONLY type #1 above.\n` +
    `- Do not merely change numbers from a previous problem.\n` +
    `- The scenario, known conditions, target question, and reasoning path must be noticeably different.\n` +
    `- Keep the requested knowledge point central; do not drift into unrelated topics.\n` +
    (lang === "zh" ? `- Output in Chinese.\n` : "");

  const userMsg =
    `Task: Generate ${count} mathematics exercise(s) for "${conceptTitle}".\n` +
    `Grade Level: ${grade}\n` +
    `Difficulty: ${difficulty}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n` +
    `Description: ${conceptDesc}\n` +
    difficultyGuide +
    modelProfile.user +
    `Diagram policy: ${diagramPolicy}\n` +
    (diagramPolicy === "must_not_draw"
      ? `Hard constraint: do not include any diagram, figure, math-diagram block, template JSON, or visual payload.\n`
        : diagramPolicy === "must_draw"
          ? `Hard constraint: include exactly one valid math-diagram block whenever a clean standard diagram can be drawn from the given information.\n`
          : diagramPolicy === "prefer_draw"
            ? `Preference: for standard geometry, coordinate, circle, triangle, or other visual school-math questions, include exactly one clean math-diagram block unless the problem is explicitly conceptual. Do not omit the figure just because the final answer is computational.\n`
            : `Preference: if a clean diagram would genuinely clarify the problem and the task is geometric, coordinate, or spatial, include one. Otherwise keep the output text-only.\n`) +
    `Hard constraint: output exactly ${count} exercise(s) and nothing extra.\n` +
    `Formatting rule: if any exercise needs a figure, include a matching fenced math-diagram block and keep all math commands properly wrapped in $...$.\n` +
    `Formatting rule: never use Markdown tables or pipe-separated rows in the question text. If a problem lists coordinates, vertices, or known values, rewrite them as clear sentences or bullet points so they remain readable in this renderer.\n` +
    varietyInstr + forcedVarietyInstr + `\n` +
    `CRITICAL: DO NOT include solutions. ONLY output the numbered questions.\n` +
    `Timestamp: ${Date.now()}`;

  const raw = await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 2048, 0.95, EXERCISE_MODEL_ID);

  writeRecentExerciseTypes(historyKey, pickedTypes);

  let cleaned = sanitizeMath(raw);
  cleaned = normalizeMarkdownTables(cleaned);
  if (diagramPolicy === "must_not_draw") {
    cleaned = stripDiagramArtifacts(cleaned);
  }
  cleaned = limitGeneratedExercises(cleaned, count);
  cleaned = maskQuestionAnswerLeaks({
    conceptTitle,
    conceptDesc,
    generatedText: cleaned,
    diagramPolicy,
  });
  const issues = detectOutputIssues(raw, conceptTitle, conceptDesc, diagramPolicy);

  if (issues.length > 0) {
    const repairDiagramPolicy = issues.includes("missing_diagram_block")
      ? "must_draw"
      : diagramPolicy;
    const repaired = await repairExerciseOutput(
      cleaned,
      conceptTitle,
      conceptDesc,
      grade,
      difficulty,
      lang,
      issues,
      count,
      repairDiagramPolicy,
      EXERCISE_MODEL_ID
    );
    return diagramPolicy === "must_not_draw"
      ? limitGeneratedExercises(stripDiagramArtifacts(normalizeMarkdownTables(repaired)), count)
      : repaired;
  }

  return cleaned;
}

export async function solveExercises(exercises: string, lang: Language) {
  const lang_str = lang === "zh" ? "Chinese" : "English";
  const system = `You are a math solution writer. Language: ${lang_str}.

MATH FORMAT (KaTeX only):
- Inline: $x^2$   Display: $$\\frac{a}{b}$$
- ALLOWED: \\frac, \\sqrt, ^{}, _{}, \\times, \\div, \\pm, \\leq, \\geq, \\neq, \\approx, \\sin, \\cos, \\tan, \\pi, \\Rightarrow
- FORBIDDEN: \\implies \\boxed \\left( \\right) \\because \\therefore \\text{} align cases
- "所以"/"因为" → plain text outside $...$
- EVERY $ must be balanced. Count them — total must be even.

OUTPUT FORMAT:
**第1题**

**步骤1：** 说明文字 $公式$

$$独立公式$$

**答案：** $最终答案$

---

**第2题**`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: exercises },
  ], false, 2048, 0.7, TUTOR_MODEL_ID);
}

export async function identifyTopic(query: string, lang: Language) {
  const curriculumSummary = KNOWLEDGE_GRAPH.map((m) => ({
    module: m.id,
    concepts: m.concepts.map((c) => ({ id: c.id, title: c.title })),
  }));

  const systemMsg = `Return ONLY valid JSON in this exact format (no markdown, no extra text):
{ "existingId": "string or null", "matchedModule": "string", "refinedTitle": { "zh": "...", "en": "..." }, "description": { "zh": "...", "en": "..." }, "level": <number 1-5> }`;

  const userMsg =
    `Analyze query: "${query}"\n` +
    `Curriculum: ${JSON.stringify(curriculumSummary)}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n` +
    `Match to existing concept ID or suggest closest module.`;

  const text = await safeGenerate(
    [{ role: "system", content: systemMsg }, { role: "user", content: userMsg }],
    true,
    800,
    0.2,
    TUTOR_MODEL_ID
  );

  try {
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

export async function chatStep(
  history: Message[],
  lang: Language,
  curriculum: Curriculum | null = null
) {
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);
  const system = SYSTEM_PROMPT_BASE + curriculumInstr;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [{ role: "system", content: system }];

  history.forEach((m) => {
    messages.push({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    });
  });

  messages.push({ role: "user", content: buildLanguageLock(lang) });

  if (history.length >= 3) {
    const langReminder = lang === "zh"
      ? "（请继续用中文回复，保持费曼阶梯教学法，当前阶段继续引导，不要跳级。）"
      : "(Please continue in English, maintain Feynman Ladder method, keep guiding at current rung.)";
    messages.push({ role: "user", content: langReminder });
  }

  return await safeGenerate(messages, false, 600, 0.7, TUTOR_MODEL_ID);
}

