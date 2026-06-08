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
   {"template":"circle_chord","radius":5,"chord_half":4,"label_O":"O","label_A":"A","label_B":"B","label_C":"C","label_radius":"5","label_oc":"3","label_chord_half":"4"}
   ${BT}

   Circle with tangent from external point (圆外切线):
   ${BT}math-diagram
   {"template":"circle_tangent","radius":5,"op_dist":13,"label_O":"O","label_P":"P","label_A":"A","label_B":"B","label_radius":"5","label_pa":"12","label_op":"13"}
   ${BT}

   Tangent at A + chord BC parallel to tangent PA + point D on arc (切线 PA切⊙O于A，弦BC∥PA，D在劣弧BC上):
   THIS IS THE CORRECT TEMPLATE for: "PA切⊙O于A，弦BC∥PA，连接AB、AC，D在劣弧BC上，连接BD、CD"
   Use circle_chord_tangent: A=tangent point on circle, P=external point, B=other end of chord AB,
   C=arc point (label it with the actual name from the problem, e.g. "C" or "D").
   For chord BC parallel to tangent: the chord is AB in the template; the arc point C/D maps to label_C.
   ${BT}math-diagram
   {"template":"circle_chord_tangent","radius":5,"angle":25,"label_O":"O","label_P":"P","label_A":"A","label_B":"B","label_C":"C"}
   ${BT}
   NOTE: label_C here represents the arc point D from the problem if the problem uses D. Just set label_C to "D".

   Cyclic quadrilateral inscribed in circle (圆内接四边形 ABCD):
   Use this whenever the problem has a quadrilateral ABCD inscribed in a circle, regardless of whether diagonals or extension lines are involved.
   labels array = [A, B, C, D] in order. angles array = positions on circle in degrees (optional, frontend picks good defaults).
   ${BT}math-diagram
   {"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"],"label_O":"O"}
   ${BT}

   Cyclic quadrilateral with diagonal intersection E and extension point F on CD extended (圆内接四边形，对角线交点E，F在CD延长线上):
   THIS IS THE CORRECT TEMPLATE for problems like: "圆内接四边形ABCD，AB是直径，AC平分∠DAB，BD与AC交于点E，F在CD延长线上，BF=BE".
   Use circle_cyclic_quadrilateral with label_E for the diagonal intersection, show_extension_to_E:true, label_E for F-like external point.
   ${BT}math-diagram
   {"template":"circle_cyclic_quadrilateral","radius":5,"labels":["A","B","C","D"],"label_O":"O","label_E":"E","show_extension_to_E":true,"label_A":"A","label_B":"B","label_C":"C","label_D":"D"}
   ${BT}

   Circle with diameter AB and points C/D on arc (直径AB，弧上有点C、D):
   ${BT}math-diagram
   {"template":"circle_diameter_points","radius":5,"label_O":"O","label_A":"A","label_B":"B","label_C":"C","label_D":"D","label_ab":"10"}
   ${BT}

   Right triangle with inscribed circle tangent to two legs (直角三角形内切圆/在斜边上的圆O与两直角边相切):
   THIS IS THE CORRECT TEMPLATE for problems like:
   "在Rt△ABC中，∠C=90°，AC=12，BC=9，点O在斜边AB上，以O为圆心作圆，该圆分别与AC、BC相切于D、E，过A作圆O的切线，切点为F"
   KEY RULES for this diagram type:
   - 直角在C: place C at origin (0,0), A at (0,AC), B at (BC,0). RIGHT ANGLE IS AT C, NOT B.
   - Circle center O is on hypotenuse AB. Compute O coordinates: radius r = (AC+BC-AB)/2 for inscribed circle; for O on AB use r = AC*BC/AB.
   - Tangent points D (on AC) and E (on BC) are at distance r from O perpendicular to each leg.
   - Point F is the second tangent point from external vertex A to circle O.
   - Show the circle using the "circle" field. Draw segments AB, AC, BC, OD, OE, AF.
   EXAMPLE (AC=12, BC=9, AB=15, r=3, O is at (3,4) from C):
   ```math-diagram
   {"template":"coordinate_points","axes":false,"points":[
     {"x":0,"y":0,"label":"C"},
     {"x":0,"y":12,"label":"A"},
     {"x":9,"y":0,"label":"B"},
     {"x":0,"y":3,"label":"D"},
     {"x":3,"y":0,"label":"E"},
     {"x":2.4,"y":3.2,"label":"O"},
     {"x":1.44,"y":6.08,"label":"F"}
   ],"segments":[["A","B"],["A","C"],["B","C"],["A","F"],["O","D"],["O","E"]],
   "circle":{"cx":2.4,"cy":3.2,"r":3},
   "angleMarks":[{"vertex":"C","from":"A","to":"B","right":true}]}
   ```
   COORDINATE CALCULATION GUIDE for Rt△ABC with ∠C=90°, AC=b, BC=a, AB=c:
     C=(0,0), A=(0,b), B=(a,0)
     r = a*b/c  (radius when O is foot of altitude, or use (a+b-c)/2 for incircle)
     O on AB at distance AO from A: AO = b - r  (since AD=AF=b-r, tangent lengths from A)
     O coordinates: parameterize AB as A + t*(B-A), t = AO/c
       Ox = 0 + t*a = a*(b-r)/c
       Oy = b + t*(-b) = b - b*t = b*r/c  (simplified)
     D on AC: D=(0, r)  (tangent point, distance r from C along AC)
     E on BC: E=(r, 0)  (tangent point, distance r from C along BC)
     F on circle (second tangent from A): AF = b - r, F is on the circle toward A

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
