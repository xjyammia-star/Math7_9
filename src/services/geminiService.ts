import { Concept, Curriculum, Difficulty, Language, Grade, Message } from "../types";
import { KNOWLEDGE_GRAPH } from "../data/knowledgeGraph";

const ARK_BASE_URL =
  (import.meta as any).env?.VITE_DOUBAO_BASE_URL ||
  "https://ark.cn-beijing.volces.com/api/v3";
const ARK_API_KEY = (import.meta as any).env?.VITE_DOUBAO_API_KEY || "";
const ARK_MODEL =
  (import.meta as any).env?.VITE_DOUBAO_MODEL ||
  "doubao-seed-2-0-lite-250615";

async function safeGenerate(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonMode = false,
  maxTokens = 800
): Promise<string> {
  try {
    const body: Record<string, any> = {
      model: ARK_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.95,
    };
    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(`${ARK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ARK_API_KEY}`,
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
     * Circle problems (弦、切线、圆心、半径) → use circle_chord or circle_tangent templates. NEVER use linear_function or quadratic_function for circle geometry.
     * 圆内接四边形 (cyclic quadrilateral, inscribed polygon ABCD in circle) → ALWAYS use circle_cyclic_quadrilateral template. NEVER use coordinate_points for this.
     * 圆内接四边形 with extension line (F on extension of CD, or similar) → use circle_cyclic_quadrilateral with label_E for intersection point; add show_extension_to_E and label_E fields.
     * 直径 + points on circle (AB is diameter, C/D on arc) → use circle_diameter_points template.
     * Two chords intersecting inside circle → use circle_intersecting_chords template.
     * Tangent line at A + chord BC parallel to tangent + point D on arc + connect BD/CD
       (切线交A，弦BC平行切线，D在弧上) → use circle_chord_tangent template.
       Set label_P for external point, label_A/B for tangent/chord endpoints, label_C for arc point D.
     * Circle inscribed in / tangent to sides of a triangle (圆与三角形两边相切, 地上圆O在斜边上) → ALWAYS use coordinate_points with axes:false.
       Include a "circle" field with cx/cy/r. Place the right angle vertex at the correct corner.
       NEVER use right_triangle for problems involving a circle tangent to two sides.
     * right_triangle template: ONLY use when the problem has NO circle and just shows a plain right triangle with side labels.
     * Pure geometry (no coordinate grid in problem) → ALWAYS set axes:false. Use right_triangle / triangle / rectangle / coordinate_points with axes:false.
     * Only use axes:true when the problem explicitly mentions a coordinate system (坐标系/坐标轴/函数图象).

3. DIAGRAM FORMAT — SCENE JSON (CRITICAL):

   PHILOSOPHY: Describe the geometric scene. The frontend computes exact coordinates.
   DO NOT compute SVG coordinates yourself. DO NOT output raw SVG.
   Instead, output a Scene JSON inside a fenced math-diagram block.

   OUTPUT FORMAT:
   ${BT}math-diagram
   {"template":"scene","scene":"<scene_name>", ... scene parameters ... }
   ${BT}

   AVAILABLE SCENES — pick the one that matches the problem:

   ── SCENE 1: circle_tangent_parallel_chord ────────────────────────────────
   Use when: tangent line at A, chord BC parallel to tangent, point D on arc.
   Example problem: "PA切⊙O于A，弦BC∥PA，D在劣弧BC上，连BD、CD"
   Parameters:
     angle_B: degrees of B on circle (0=top, clockwise). Default 130.
     angle_C: degrees of C on circle. Default 230.
     angle_D: degrees of D on circle (minor arc between B and C). Default 180.
   ${BT}math-diagram
   {"template":"scene","scene":"circle_tangent_parallel_chord","angle_B":130,"angle_C":230,"angle_D":180}
   ${BT}

   ── SCENE 2: cyclic_quadrilateral ─────────────────────────────────────────
   Use when: quadrilateral ABCD inscribed in circle.
   Example: "圆内接四边形ABCD，AB是⊙O的直径"
   Parameters:
     angles: [degA, degB, degC, degD] positions on circle.
     diagonals: true/false — draw diagonals AC and BD.
     extension_E: true/false — point E on extension of AB beyond B.
     CE: true/false — draw segment CE.
   ${BT}math-diagram
   {"template":"scene","scene":"cyclic_quadrilateral","angles":[200,290,20,110],"diagonals":true}
   ${BT}

   ── SCENE 3: circle_two_chords ────────────────────────────────────────────
   Use when: two chords AB and CD intersect at point P inside circle.
   Example: "⊙O中有两条弦AB和CD相交于圆内一点P，AB⊥CD"
   Parameters:
     angleAB: angle of chord AB direction in degrees. Default 30.
     angleCD: angle of chord CD direction. Default 120 (perpendicular to AB).
     perpendicular: true if AB⊥CD (draws right angle mark).
   ${BT}math-diagram
   {"template":"scene","scene":"circle_two_chords","angleAB":30,"angleCD":120,"perpendicular":true}
   ${BT}

   ── SCENE 4: right_triangle_inscribed_circle ─────────────────────────────
   Use when: right triangle with circle O on hypotenuse tangent to two legs.
   Example: "Rt△ABC，∠C=90°，AC=12，BC=9，点O在斜边AB上，⊙O与AC、BC相切于D、E"
   Parameters:
     AC: length of vertical leg. BC: length of horizontal leg.
     show_F: true if there's a second tangent point F from vertex A.
   ${BT}math-diagram
   {"template":"scene","scene":"right_triangle_inscribed_circle","AC":12,"BC":9,"show_F":true}
   ${BT}

   ── SCENE 5: circle_diameter_points ──────────────────────────────────────
   Use when: circle with diameter AB, one or two more points on arc.
   Example: "AB是⊙O的直径，C是⊙O上一点"
   Parameters:
     angle_C: position of C on circle (degrees from top). Default -60.
     angle_D: position of D (if present). segments: which to draw.
   ${BT}math-diagram
   {"template":"scene","scene":"circle_diameter_points","angle_C":-60,"segments":["AC","BC"]}
   ${BT}

   ── SCENE 6: generic_circle ──────────────────────────────────────────────
   Use when: none of the above fit. Circle with named points at specific positions.
   Parameters:
     points: object mapping label -> angle (0=top, clockwise in degrees).
     center: label for circle center (e.g. "O").
     external_points: object mapping label -> {x, y} in SVG pixels (0-400 range).
     segments: array of 2-char strings like ["AB","BC"] — solid lines.
     dashed_segments: array of 2-char strings — dashed helper lines.
   ${BT}math-diagram
   {"template":"scene","scene":"generic_circle",
    "points":{"A":0,"B":120,"C":240},
    "center":"O",
    "segments":["AB","BC","CA"],
    "dashed_segments":["OA","OB"]}
   ${BT}

   ── SCENE 7: cyclic_quad_tangent_extension ────────────────────
   Use when: ABCD inscribed in circle, AB is diameter, CD tangent to circle at D,
   extensions of AD and BC meet at external point E.
   Example: "四边形ABCD内接于⊙O，AB是⊙O的直径，CD与⊙O相切于D，延长AD、BC交于E"
   ${BT}math-diagram
   {"template":"scene","scene":"cyclic_quad_tangent_extension","angle_C":-50,"angle_D":60}
   ${BT}

   ── SCENE 8: external_two_tangents ────────────────────
   Use when: P is an external point, PA and PB are tangents to circle at A and B,
   C is on minor arc AB, tangent at C meets PA at D and PB at E.
   Example: "PA、PB分别是⊙O的两条切线，切点为A、B，点C在劣弧AB上，过点C作⊙O的切线，分别交PA于D、交PB于E"
   ${BT}math-diagram
   // ANGLE CONVENTION: 0=top of circle, increases clockwise.
   // Minor arc AB = short arc NEAR P (top area) = angle_C around 0
   // Major arc AB = long arc AWAY from P (bottom) = angle_C around 180
   // C on 劣弧 (minor arc, near P): use angle_C:0
   // C on 优弧 (major arc, away from P): use angle_C:180
   {"template":"scene","scene":"external_two_tangents","angle_A":50,"angle_B":310,"angle_C":0}
   ${BT}

   SELECTION GUIDE:
   - Tangent + parallel chord + arc point D → scene 1
   - Quadrilateral in circle → scene 2
   - Two chords intersecting inside → scene 3
   - Right triangle + circle on hypotenuse → scene 4
   - Diameter + points on arc → scene 5
   - Everything else circle-related → scene 6

   RULES:
   - ALWAYS output a diagram for geometry problems. No exceptions.
   - Only output the JSON. No explanation text inside the code block.
   - Angle values: 0 = top of circle, increases clockwise.
   - For scene 6, spread points evenly unless problem implies specific positions.

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
     WRONG: \odot O的半径         RIGHT: $\odot O$的半径
     WRONG: AB是\odot O的直径     RIGHT: $AB$是$\odot O$的直径
     WRONG: 圆内接四边形ABCD，AB是odotO的直径  RIGHT: 圆内接四边形$ABCD$，$AB$是$\odot O$的直径
     WRONG: \triangle ABC         RIGHT: $\triangle ABC$
     WRONG: AB\parallel CD        RIGHT: $AB \parallel CD$
     WRONG: CF\perp BE            RIGHT: $CF \perp BE$
     WRONG: \angle ABD = 25\circ  RIGHT: $\angle ABD = 25^\circ$
     WRONG: \angle CDB的度数    RIGHT: $\angle CDB$的度数
     WRONG: 弦BC\parallelPA       RIGHT: $BC \parallel PA$
     WRONG: angleABD = 25circ     RIGHT: $\angle ABD = 25^\circ$
     WRONG: angleCDB的度数        RIGHT: $\angle CDB$的度数
     CRITICAL: The word "odot" must NEVER appear outside $...$. Always write $\odot O$ with dollar signs.
     CRITICAL: "angle", "parallel", "perp", "circ" must NEVER appear as plain text. Always inside $...$.
     CRITICAL: Degree symbol ° in math must be written as $25^\circ$, NEVER as "25circ" or "25\circ" outside $.

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
     SCAN for these specific bare-word errors before finalising (all must be inside $...$):
       "odot"  "angle"  "parallel"  "perp"  "circ"  "triangle"  "frac"  "sqrt"
     If ANY of those words appear outside $...$, wrap the entire surrounding expression in $...$.
     Example scan: find "angleABD" → wrong → replace with "$\angle ABD$".
     Example scan: find "parallelPA" → wrong → replace with "$\parallel PA$" or "$BC \parallel PA$".

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
    `YOUR OPENING MOVE — RUNG 1 ONLY:\n` +
    `- Start with a 1-2 sentence warm, relatable real-life hook.\n` +
    `- Then ask ONE simple question answerable from pure common sense.\n` +
    `- FORBIDDEN: formulas, calculations, "solve", "prove", "simplify".\n` +
    `- Keep the entire opening to 3-5 sentences maximum.\n` +
    `FORMAT: 1-2 sentences of hook + 1 question. That is all.`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 400);
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
7. LENGTH: 3-5 sentences + 1 question per reply.` + curriculumInstr;

  const userMsg =
    `The student is working on:\n"""\n${exercises}\n"""\n\n` +
    `Topic: ${concept.title[lang]}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n\n` +
    `Address THIS specific problem immediately. Identify the first concrete step and ask ONE question.`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 500);
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
- The problems: """${exercises}"""` + curriculumInstr;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system }
  ];
  history.forEach(m => {
    messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content });
  });

  if (history.length >= 3) {
    const reminder = lang === "zh"
      ? "（请继续用中文，专注于当前习题的引导。）"
      : "(Continue in English, stay focused on guiding through the current exercise.)";
    messages.push({ role: "user", content: reminder });
  }

  return await safeGenerate(messages, false, 500);
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

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
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
  const system = SYSTEM_PROMPT_BASE + curriculumInstr;

  const pool = getTypePool(conceptTitle);
  const pickedTypes = pool ? pickRandom(pool, Math.max(count, 3)) : null;
  const varietyInstr = pickedTypes
    ? (lang === "zh"
        ? `\n本次必须从以下题型中选取（每种最多用一次，禁止重复）：\n${pickedTypes.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`
        : `\nFor this batch, use these problem types (each at most once):\n${pickedTypes.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}`)
    : `\nVARIETY: Rotate problem types. Never use the same scenario twice in one batch.`;

  const userMsg =
    `Task: Generate ${count} mathematics exercise(s) for "${conceptTitle}".\n` +
    `Grade Level: ${grade}\n` +
    `Difficulty: ${difficulty}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n` +
    `Description: ${conceptDesc}\n` +
    varietyInstr + `\n` +
    `CRITICAL: DO NOT include solutions. ONLY output the numbered questions.\n` +
    `Timestamp: ${Date.now()}`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 2048);
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
  ], false, 2048);
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
    true
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

  if (history.length >= 3) {
    const langReminder = lang === "zh"
      ? "（请继续用中文回复，保持费曼阶梯教学法，当前阶段继续引导，不要跳级。）"
      : "(Please continue in English, maintain Feynman Ladder method, keep guiding at current rung.)";
    messages.push({ role: "user", content: langReminder });
  }

  return await safeGenerate(messages, false, 600);
}
