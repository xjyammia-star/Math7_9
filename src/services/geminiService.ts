import { Concept, Curriculum, Difficulty, Language, Grade, Message } from "../types";
import { KNOWLEDGE_GRAPH } from "../data/knowledgeGraph";

// ─── Doubao / ARK API client ───────────────────────────────────────────────
// Environment variables (set in Vercel):
//   VITE_DOUBAO_API_KEY  – your Doubao API key
//   VITE_DOUBAO_MODEL    – model id, e.g. "doubao-seed-2-0-lite-250615"
//   VITE_DOUBAO_BASE_URL – base URL, defaults to https://ark.cn-beijing.volces.com/api/v3

const ARK_BASE_URL =
  (import.meta as any).env?.VITE_DOUBAO_BASE_URL ||
  "https://ark.cn-beijing.volces.com/api/v3";
const ARK_API_KEY = (import.meta as any).env?.VITE_DOUBAO_API_KEY || "";
const ARK_MODEL =
  (import.meta as any).env?.VITE_DOUBAO_MODEL ||
  "doubao-seed-2-0-lite-250615";

// OpenAI-compatible chat completion
async function safeGenerate(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonMode = false,
  maxTokens = 800   // default: short chat replies; pass higher for exercises
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

// ─── Curriculum emphasis helpers ──────────────────────────────────────────
const CURRICULUM_LABELS: Record<Curriculum, { zh: string; en: string }> = {
  CN: { zh: "中国课程（人教版）", en: "Chinese Curriculum (PEP)" },
  US: { zh: "美国课程（Common Core）", en: "US Curriculum (Common Core)" },
  UK: { zh: "英国课程（National Curriculum）", en: "UK Curriculum (NC)" },
  SG: { zh: "新加坡课程（MOE）", en: "Singapore Curriculum (MOE)" },
  IB: { zh: "IB课程（MYP）", en: "IB Curriculum (MYP)" },
};

const CURRICULUM_STYLE: Record<
  Curriculum,
  { zh: string; en: string }
> = {
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

// ─── System prompt ─────────────────────────────────────────────────────────
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
   - INCLUDE if: Geometry, coordinate functions, number lines, spatial reasoning.
   - OMIT if: Pure algebra, simple word problems with no spatial component.
   - MANDATORY: If you say "如图" or "as shown", you MUST include a diagram block.

3. DIAGRAM FORMAT — TEMPLATE SYSTEM (CRITICAL):
   Use ONLY the templates below. NEVER invent raw coordinates. The frontend calculates positions automatically.
   Pick the matching template and fill in numeric values and labels from the problem.

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
     • A'=fold image of A, lands on BC. By fold symmetry A'F=AF, so compute:
         AF² = AE² + EF²  (fold preserves distances, A'F=AF)
         A lies at (0,10). A'=(8, 10-BA') on BC.
         If problem says A' is at BF=3 below B, then A'=(8,7) → fold_land_x=8, fold_land_y=7
       NOTE: A' and F are DIFFERENT points unless the problem says they coincide!
         If BF=3 means F is the fold crease endpoint and A' is somewhere else on BC, use the
         geometry to find A'. For example if problem says "A' lands at midpoint of BC":
         A'=(8,5) → fold_land_x=8, fold_land_y=5
     • E is on AD. Use fold property EA=EA' to find E:
         EA = distance from E to A=(0,10).  EA'=distance from E=(0,e) to A'=(8,7).
         EA²=(10-e)²,  EA'²=64+(7-e)²  →  solve (10-e)²=64+(7-e)²  → e=3.375
         → E_side="AD", E_ratio=(10-3.375)/10=0.6625

   FULL EXAMPLE OUTPUT for the above problem:
   ${BT}math-diagram
   {"template":"rectangle_fold","width":8,"height":10,"fold_vertex":"A","E_side":"AD","E_ratio":0.6625,"F_side":"BC","F_ratio":0.3,"fold_land_x":8,"fold_land_y":7,"label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_E":"E","label_F":"F","label_Ap":"A'","label_BF":"3","label_EF":"EF"}
   ${BT}

   RULES:
   - fold_land_x/y is the IMAGE of fold_vertex (e.g. D'), NOT the same as the crease endpoint F.
   - Always compute E_ratio and F_ratio from the given side lengths.
   - E_ratio = (distance from first letter of E_side to E) / (length of that side).
   - label_E and label_F MUST use the EXACT letters from the problem text.
     e.g. if the crease is "AF", then the two crease endpoints are A (a corner, already labelled) and F (on a side).
     In that case: label_E = "" (or omit, since A is already a corner), label_F = "F".
   - label_Ap MUST use the EXACT image-point label from the problem (e.g. "D'", "E", "A'").
   - NEVER use default letters E/F if the problem uses different letters for those points.
   - If a crease endpoint coincides with a rectangle corner (like A), do NOT add a separate label for it;
     the corner dot is already shown. Just set the corresponding E_side/E_ratio to that corner position.

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

   Similar triangles (相似三角形):
   ${BT}math-diagram
   {"template":"similar_triangles","sides":[3,4,5],"ratio":2,"labels1":["A","B","C"],"labels2":["A\'","B\'","C\'"]}
   ${BT}

   RULES: Use EXACTLY one template. Fill numeric values from the problem. Labels must match the problem text.

5. VARIETY RULE (STRICT): Rotate problem types. Never generate the same type more than twice in a row.
6. NO RESOLUTIONS: When generating exercises, ONLY output the questions.
7. LATEX — KaTeX SAFE FORMAT ONLY:
   - Inline math: $x^2$   Display math: $$x = \frac{a}{b}$$
   - ALLOWED: \frac, \sqrt, ^{}, _{}, \times, \div, \pm, \leq, \geq, \neq, \approx, \sin, \cos, \tan, \pi, \Rightarrow, \cdot
   - FORBIDDEN (breaks rendering): \implies, \boxed, \left( \right), \because, \therefore, \text{} inside $, align env, cases env
   - Write "所以" / "因为" as plain Chinese text OUTSIDE dollar signs, never as LaTeX commands.
8. LANGUAGE CONSISTENCY (CRITICAL): You MUST reply in the same language as the conversation. If the student writes in Chinese, ALWAYS reply in Chinese — even if your system instructions are in English. Never switch languages mid-conversation. This rule overrides everything else.`;

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
    `You MUST open at Rung 1 of the Feynman Ladder. This means:\n` +
    `- Start with a 1-2 sentence warm, relatable real-life hook about "${specificTitle}".\n` +
    `- Then ask ONE single question so simple that ANY student encountering this topic for the first time can answer or at least attempt it.\n` +
    `- FORBIDDEN in the opening: formulas, symbol-heavy expressions, calculation requests, "solve", "prove", "simplify".\n` +
    `- FORBIDDEN: assuming the student already knows related concepts (e.g. do NOT reference square roots when introducing powers).\n` +
    `- The opening question must be answerable from pure common sense or simple observation.\n` +
    `- Keep the entire opening to 3-5 sentences maximum.\n` +
    `- GOOD EXAMPLE for Powers: "你有没有想过，如果把一张纸对折一次，厚度变成2层；再折一次变成4层。如果折10次，你猜会有多少层？"\n` +
    `- BAD EXAMPLE (FORBIDDEN): "请你分别计算(√16)²和√((-16)²)的结果。" — This is Rung 4/5, NOT an opener.\n` +
    `TONE: Warm, curious, like a friendly tutor sitting next to the student. No intimidation.\n` +
    `FORMAT: 1-2 sentences of hook + 1 question. That is all.`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 400);  // opener: just a hook + 1 question
}

export async function guideExercise(
  exercises: string,
  concept: Concept,
  lang: Language,
  curriculum: Curriculum | null = null
) {
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);

  // A completely different system prompt for exercise guidance mode
  const system = `You are a patient, Socratic math tutor helping a student work through specific problems.

EXERCISE GUIDANCE MODE — completely different from general teaching:
1. YOUR ONLY JOB: Guide the student through the SPECIFIC problems shown below. Do NOT teach the topic from scratch.
2. SOCRATIC: Never give the answer or full solution. Ask ONE targeted question that moves the student one step forward.
3. FIRST MESSAGE: 
   - Briefly acknowledge the problem(s) the student is working on (name the problem type / key condition).
   - Identify the FIRST STUMBLING BLOCK: what is the single first step a student would need to do?
   - Ask ONE question about that first step only. Keep it concrete and tied to the actual numbers/letters in the problem.
   - GOOD: "这道题矩形ABCD中AB=8，AD=10。折叠题的第一步是找出折叠前后相等的线段。你觉得折叠后，哪些线段的长度是不变的？"
   - BAD: "让我们先复习一下勾股定理的公式…" ← DO NOT do this.
4. SUBSEQUENT TURNS: Follow the student's answer. If correct, affirm and give the next micro-step question. If wrong, give a gentle hint and re-ask.
5. NEVER give a full worked solution. Maximum one algebraic step per reply.
6. USE DIAGRAMS only if the student is confused about the geometric setup (use template system).
7. LANGUAGE: Always reply in ${lang === "zh" ? "Chinese" : "English"}.
8. LENGTH: Keep each reply to 3-5 sentences + 1 question. Never write paragraphs of theory.` + curriculumInstr;

  const userMsg =
    `The student is working on the following problem(s):

` +
    `"""
${exercises}
"""

` +
    `Knowledge topic: ${concept.title[lang]}
` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}

` +
    `Start your guidance. Remember: address THIS specific problem immediately. ` +
    `Do NOT give a generic topic introduction. ` +
    `Identify the first concrete step and ask ONE question about it.`;

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
- The problems the student is working on: """${exercises}"""` + curriculumInstr;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system }
  ];
  history.forEach(m => {
    messages.push({ role: m.role === "user" ? "user" : "assistant", content: m.content });
  });

  // Language reminder every 3 turns
  if (history.length >= 3) {
    const reminder = lang === "zh"
      ? "（请继续用中文，专注于当前习题的引导，不要切换到通用教学。）"
      : "(Continue in English, stay focused on guiding through the current exercise.)";
    messages.push({ role: "user", content: reminder });
  }

  return await safeGenerate(messages, false, 500);
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

  const userMsg =
    `Task: Generate ${count} mathematics exercises for "${conceptTitle}".\n` +
    `Grade Level: ${grade}\n` +
    `Difficulty: ${difficulty}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n` +
    `Description: ${conceptDesc}\n\n` +
    `VARIETY CHECK: Rotate problem types. Never repeat same scenario twice.\n` +
    `VISUALS: For geometry problems, calculate EXACT coordinates and draw shapes with 'polygon'/'line'. Set config:{axes:false, grid:false} for pure geometry.\n` +
    `CRITICAL: DO NOT include solutions. ONLY output the numbered questions.\n` +
    `Timestamp: ${Date.now()}`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 2048);  // exercises need more space
}

export async function solveExercises(exercises: string, lang: Language) {
  return await safeGenerate([
    {
      role: "system",
      content: `You are a math solution writer. Provide a clear step-by-step solution for each exercise.

LANGUAGE: ${lang === "zh" ? "Write entirely in Chinese." : "Write entirely in English."}

MATH FORMATTING RULES (critical — the renderer is KaTeX):
- Inline math: wrap in single dollar signs: $x^2 + 1$
- Display math (its own line): wrap in double dollar signs: $$x = \\frac{-b}{2a}$$
- ALLOWED LaTeX: fractions \\frac{}{}, square roots \\sqrt{}, powers ^{}, subscripts _{}, \\times, \\div, \\pm, \\leq, \\geq, \\neq, \\approx, basic Greek letters, \\sin \\cos \\tan
- FORBIDDEN (will break rendering): \\implies, \\boxed, \\left( \\right), \\because, \\therefore, \\quad used alone, \\text{} inside math, align environment, cases environment
- For "therefore" write: 所以 (in Chinese) or "So," (in English) as plain text OUTSIDE the $ signs
- For arrows/implications write: → as plain text or $\\Rightarrow$
- Keep each math expression simple. Split complex expressions across multiple lines rather than one long formula.

STRUCTURE for each problem:
**第N题** (or **Problem N**)
Step 1: [plain text explanation] $[simple formula]$
Step 2: ...
**答案：** $[final answer]$ (or **Answer:** $[final answer]$)`,
    },
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
    `Match the query to an existing concept ID or suggest the closest module. Provide a refined title capturing the SPECIFIC topic.`;

  const text = await safeGenerate(
    [
      { role: "system", content: systemMsg },
      { role: "user", content: userMsg },
    ],
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

  // Inject language reminder after every 3 turns to prevent language drift
  if (history.length >= 3) {
    const langReminder = lang === "zh"
      ? "（请继续用中文回复，保持费曼阶梯教学法，当前阶段继续引导，不要跳级。）"
      : "(Please continue in English, maintain Feynman Ladder method, keep guiding at current rung.)";
    messages.push({ role: "user", content: langReminder });
  }

  return await safeGenerate(messages, false, 600);  // chat reply: 3-5 sentences
}
