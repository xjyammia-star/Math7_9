import { Concept, Curriculum, Difficulty, Language, Grade, Message } from "../types";
import { KNOWLEDGE_GRAPH } from "../data/knowledgeGraph";

// ─── Model configuration ──────────────────────────────────────────────────
// The model (GLM-4.7) is accessed THROUGH Volcengine Ark, NOT Zhipu directly.
// So the base URL is Ark's (same as the old Doubao setup) and the "model" value
// must be the Ark ENDPOINT ID (ep-xxxxxxxx-xxxxx) you created in the Ark
// console for GLM — not the literal string "glm-4.7".
//
// Env var priority: VITE_GLM_* first, then legacy VITE_DOUBAO_* as fallback.
const env: any = (import.meta as any).env || {};

const LLM_BASE_URL =
  env.VITE_GLM_BASE_URL ||
  env.VITE_DOUBAO_BASE_URL ||
  "https://ark.cn-beijing.volces.com/api/v3";

const LLM_API_KEY =
  env.VITE_GLM_API_KEY ||
  env.VITE_DOUBAO_API_KEY ||
  "";

// This should be your Ark endpoint ID (e.g. "ep-20250528xxxxxx-xxxxx").
const LLM_MODEL =
  env.VITE_GLM_MODEL ||
  env.VITE_DOUBAO_MODEL ||
  "";

// Deep-thinking toggle. GLM-4.7 reasons better on geometry with thinking ON,
// but third-party access via Ark may not accept the "thinking" field the same
// way Zhipu's native API does. Default OFF for maximum compatibility; flip the
// env var VITE_GLM_THINKING to "on" once you've confirmed it works.
const ENABLE_THINKING = String(env.VITE_GLM_THINKING || "").toLowerCase() === "on";

async function safeGenerate(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonMode = false,
  maxTokens = 800,
  temperature = 0.7,
  forceThinking = false
): Promise<string> {
  try {
    const wantThinking = ENABLE_THINKING || forceThinking;

    // Zhipu's path already ends in /paas/v4; Ark ends in /api/v3. Either way we
    // append /chat/completions. Guard against a trailing slash.
    const base = LLM_BASE_URL.replace(/\/+$/, "");

    // Helper: one POST attempt. withThinking controls the thinking field.
    const attempt = async (withThinking: boolean): Promise<Response> => {
      const body: Record<string, any> = {
        model: LLM_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
        top_p: 0.95,
      };
      if (jsonMode) body.response_format = { type: "json_object" };
      if (withThinking) body.thinking = { type: "enabled" };
      return fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LLM_API_KEY}`,
        },
        body: JSON.stringify(body),
      });
    };

    let res = await attempt(wantThinking);

    // DEGRADE GRACEFULLY: if the platform rejects the request specifically
    // because it doesn't accept the "thinking" field (typically a 400), retry
    // once WITHOUT thinking so the feature still works (just without deep
    // reasoning) instead of failing outright.
    if (!res.ok && wantThinking && (res.status === 400 || res.status === 404)) {
      const peek = await res.clone().text().catch(() => "");
      if (/thinking|param|unsupported|invalid|unknown|field/i.test(peek)) {
        res = await attempt(false);
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 429 || errText.includes("rate_limit") || errText.includes("quota") || errText.includes("1302") || errText.includes("1113")) {
        throw new Error("QUOTA_EXHAUSTED");
      }
      if (res.status >= 500) {
        throw new Error("AI_INTERNAL_ERROR");
      }
      throw new Error(`LLM_API_ERROR: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const msg = data.choices?.[0]?.message;
    // Some GLM responses may include a reasoning_content field; we deliberately
    // ignore it and return ONLY the final answer content.
    return (msg?.content ?? "") || "";
  } catch (error: any) {
    if (
      error.message === "QUOTA_EXHAUSTED" ||
      error.message === "AI_INTERNAL_ERROR"
    ) {
      throw error;
    }
    console.error("LLM API Error:", error);
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
2. WHEN TO INCLUDE A DIAGRAM:
   - INCLUDE exactly ONE diagram block per problem if it involves ANY of: named
     geometric shapes (triangle, rectangle, circle, parallelogram, trapezoid...),
     named points on figures (e.g. "点D在AB边上"), coordinate points or axes,
     number lines, folding/rotation/translation, or the phrase "如图"/"as shown".
   - OMIT the diagram only for pure algebra / equations / number theory /
     statistics with no geometric figure.
   - If you write "如图" or "as shown", a diagram block is MANDATORY.

3. DIAGRAM FORMAT (CRITICAL — READ CAREFULLY):
   You NEVER compute SVG coordinates and NEVER output raw SVG.
   For each problem that needs a figure, output exactly ONE single-line JSON
   object inside a fenced block, placed AFTER the problem's full text:

   ${BT}math-diagram
   {"template":"...", ...}
   ${BT}

   STEP 1 — Is the figure about a CIRCLE (⊙O, 弦, 切线, 直径, 圆周角, 内接...)?
     YES → use "template":"scene" and pick exactly ONE scene from CIRCLE SCENES.
     NO  → go to STEP 2.

   STEP 2 — Does the figure show LINES/RAYS THROUGH A COMMON POINT with angle
     relationships (相交直线、对顶角、邻补角、角平分线、射线 from one vertex)?
     Trigger words: 相交于点O / 直线AB与CD相交 / OE平分∠… / 射线 / 对顶角 /
     邻补角 / 余角 / 补角 with a vertex figure / 角的度数 around one point.
     YES → use "template":"scene","scene":"intersecting_lines_rays"
           (see its entry below — you only declare the structure, the renderer
            computes every ray/bisector direction; NEVER place rays yourself).
     NO  → pick exactly ONE template from CLASSIC TEMPLATES.

   ═══════════ CIRCLE SCENES ("template":"scene") ═══════════
   Angle convention for ALL scenes: 0 = TOP of circle, increases CLOCKWISE.

   ── circle_tangent_parallel_chord ──
   Use when: PA tangent at A, chord BC ∥ PA, point D on minor arc BC.
   "segments": list EXACTLY the segments your problem text draws (letters from
   A,B,C,D,P). PA is always drawn automatically. Default: ["AB","AC","BC","BD","CD"].
   "show_E":true marks E = the intersection of AD and BC (use it whenever your
   text says "AD交BC于点E"; include "AD" and "BC" in segments).
   ${BT}math-diagram
   {"template":"scene","scene":"circle_tangent_parallel_chord","angle_B":130,"angle_D":180,"segments":["AB","BC","BD","AD","CD"],"show_E":true}
   ${BT}

   ── cyclic_quadrilateral ──
   Use when: quadrilateral ABCD inscribed in circle (NO tangent involved).
   "圆内接四边形ABCD"。If one side/diagonal is the diameter, set "diameter".
   Optional: "diagonals":true draws AC and BD; "extension_E":true puts E on
   extension of AB beyond B; "CE":true draws CE.
   ${BT}math-diagram
   {"template":"scene","scene":"cyclic_quadrilateral","angles":[200,290,20,110],"diameter":"AB","diagonals":true}
   ${BT}

   ── circle_two_chords ──
   Use when: two chords AB and CD intersect at point P inside the circle.
   "⊙O中两弦AB、CD相交于圆内一点P". Set "perpendicular":true if AB⊥CD.
   ${BT}math-diagram
   {"template":"scene","scene":"circle_two_chords","angleAB":30,"angleCD":120,"perpendicular":true}
   ${BT}

   ── right_triangle_inscribed_circle ──
   Use when: Rt△ABC with ∠C=90°, circle O centered ON hypotenuse AB, tangent
   to legs AC and BC at D, E. "show_F":true adds second tangent point F from A.
   ${BT}math-diagram
   {"template":"scene","scene":"right_triangle_inscribed_circle","AC":12,"BC":9,"show_F":true}
   ${BT}

   ── circle_diameter_points ──
   Use when: AB is the diameter (A left, B right), plus more points on the arc.
   POSITIONING (IMPORTANT): when the problem GIVES an inscribed angle value,
   pass that EXACT value and the renderer places the point precisely:
     "angle_CAB":20 → C placed so ∠CAB = 20° (vertex A) — use when text gives ∠CAB
     "angle_CBA":35 → C placed so ∠CBA = 35° (vertex B)
     "angle_DAB":40 / "angle_DBA":30 → same for an arc point D
     "angle_EAB":25 / "angle_EBA":25 / "angle_E":180 → an extra point E
   "side_C"/"side_D": "upper" (default) | "lower"; "side_E": "lower" (default) | "upper".
   Use "lower" when the text says the point is on the lower semicircle (下半圆弧)
   or on the opposite side (异侧).
   Only when NO inscribed angle is given, use raw positions "angle_C"/"angle_D"/"angle_E"
   (degrees from top, negative = counter-clockwise).
   SPECIAL CONSTRUCTIONS (computed exactly by the renderer):
     "E_bisector_from_C":true → E placed exactly so that CE bisects ∠ACB
       (use when text says "CE平分∠ACB")
     "tangent_at":"A" → draws tangent line l touching the circle at A (or "B")
       (use when text says "直线l切⊙O于点A")
     "D_from":"BE" → D = intersection of line B→E EXTENDED with tangent l;
       draws B–E–D and labels D (use when text says "连接BE并延长，交直线l于点D").
       When "D_from" is used, D means this intersection — do NOT also give angle_D.
   List ONLY the segments the problem actually draws. Omit params for unused points.
   Example — "直线l切⊙O于A，C在上半弧，E在下半弧，CE平分∠ACB，连接BE并延长交l于D，∠CAB=35°":
   ${BT}math-diagram
   {"template":"scene","scene":"circle_diameter_points","angle_CAB":35,"E_bisector_from_C":true,"tangent_at":"A","D_from":"BE","segments":["AC","BC","CE"]}
   ${BT}
   Example — plain: "AB是直径，∠CAB=20°，∠DBA=30°，连接AC、BC、AD、BD":
   ${BT}math-diagram
   {"template":"scene","scene":"circle_diameter_points","angle_CAB":20,"angle_DBA":30,"segments":["AC","BC","AD","BD"]}
   ${BT}

   ── circle_tangent_perpendicular ──
   Use when: AB is the diameter, line l is TANGENT to the circle at C, a
   perpendicular is drawn from A to l with foot D, and AD meets the circle
   again at E. "AB是⊙O的直径，直线l切⊙O于点C，过A作AD⊥l，垂足为D，AD交⊙O于点E"
   The renderer computes l, D and E exactly — never use generic_circle for this.
   "segments": the extra segments your text connects (default ["AC","CE","BC"]).
   Add "OC" to show the radius to the tangent point (drawn dashed).
   ${BT}math-diagram
   {"template":"scene","scene":"circle_tangent_perpendicular","angle_C":100,"segments":["AC","CE","BC"]}
   ${BT}

   ── cyclic_quad_tangent_extension ──
   Use when: ABCD inscribed in circle, AB is diameter, CD is TANGENT to the
   circle at D, extensions of AD and BC meet at external point E.
   "四边形ABCD内接于⊙O，AB是直径，CD与⊙O相切于D，延长AD、BC交于E"
   ${BT}math-diagram
   {"template":"scene","scene":"cyclic_quad_tangent_extension","angle_D":55}
   ${BT}

   ── external_two_tangents ──
   Use when: external point P, tangents PA and PB touch circle at A and B,
   C on arc AB, tangent at C meets PA at D and PB at E.
   C on 劣弧 (minor arc near P): "angle_C":0. C on 优弧 (far side): "angle_C":180.
   ${BT}math-diagram
   {"template":"scene","scene":"external_two_tangents","angle_A":50,"angle_B":310,"angle_C":0}
   ${BT}

   ── generic_circle ──
   Use ONLY when no scene above fits. Named points at angles on the circle,
   "center" label, solid "segments" and dashed "dashed_segments" (2-letter strings).
   Optional "tangent_at":"C" draws the tangent line at that point, labeled "l"
   (or "tangent_label"). generic_circle CANNOT draw perpendicular feet or
   intersection points — if your problem needs them, use a dedicated scene or
   change the problem.
   ${BT}math-diagram
   {"template":"scene","scene":"generic_circle","points":{"A":0,"B":120,"C":240},"center":"O","segments":["AB","BC","CA"],"dashed_segments":["OA","OB"],"tangent_at":"C"}
   ${BT}

   ── TWO CIRCLE EXCEPTIONS that use CLASSIC templates instead of a scene ──
   弧长 / 扇形面积 (arc length / sector area):
   ${BT}math-diagram
   {"template":"circle_sector","radius":6,"angle":120}
   ${BT}
   垂径定理 (perpendicular from center bisects chord; chord length problems):
   ${BT}math-diagram
   {"template":"circle_chord","radius":5,"chord":8}
   ${BT}

   ═══════════ CLASSIC TEMPLATES (non-circle figures) ═══════════
   ── intersecting_lines_rays (非圆：相交直线 + 角平分线/射线) ──
   Use when: two (or more) straight lines cross at a point O, plus extra rays
   such as angle bisectors. Examples: "直线AB与CD相交于O，OE平分∠BOD，OF平分∠COE".
   YOU DO NOT COMPUTE ANY ANGLES. Just declare the structure; the renderer
   solves every ray direction (including bisectors) exactly.
     "lines": list each straight line as a 2-letter endpoint pair, e.g. [["A","B"],["C","D"]].
     "base_angles": OPTIONAL fixed directions in math degrees (0°=right/east,
        90°=up, 180°=left, -40°=lower-right). Only pin down what the text fixes;
        the renderer makes each line's two endpoints exactly opposite (180° apart).
     "rays": extra rays from O. Several kinds:
        • angle bisector:  {"name":"E","bisects":["B","D"]}  (OE bisects ∠BOD)
          Bisectors may reference earlier rays: {"name":"F","bisects":["C","E"]}.
        • ray inside an angle (方向由题目条件决定，但你算不准时用这个):
          {"name":"E","in_angle":["B","D"]}  places OE inside ∠BOD.
          Optionally bias it with "frac" 0–1 (fraction from the first arm):
          {"name":"E","in_angle":["B","D"],"frac":0.3}  (closer to OB).
        • fixed direction:  {"name":"P","angle":30}.
   IMPORTANT: do NOT pass any of the problem's unknown/answer angle values into
   the figure — only the structural facts (which lines, which bisects/inside which).
   The figure only needs to look qualitatively right (correct side / region);
   exact degrees are solved in the written solution, not drawn.
   Example A — "直线AB与CD相交于O，OE平分∠BOD，OF平分∠COE，求∠AOF":
   ${BT}math-diagram
   {"template":"scene","scene":"intersecting_lines_rays","lines":[["A","B"],["C","D"]],"base_angles":{"B":0,"D":-40},"rays":[{"name":"E","bisects":["B","D"]},{"name":"F","bisects":["C","E"]}],"center":"O"}
   ${BT}
   Example B — "直线AB与CD相交于O，OE在∠BOD内部，OG平分∠AOE，求∠BOG的补角":
   ${BT}math-diagram
   {"template":"scene","scene":"intersecting_lines_rays","lines":[["A","B"],["C","D"]],"base_angles":{"B":0,"D":-90},"rays":[{"name":"E","in_angle":["B","D"]},{"name":"G","bisects":["A","E"]}],"center":"O"}
   ${BT}

   Copy field names EXACTLY. Numbers MUST equal the numbers in your problem text.

   right_triangle — plain right triangle, right angle at C, legs a (horizontal BC) and b (vertical AC):
   {"template":"right_triangle","a":3,"b":4}

   triangle — general triangle by three side lengths (MUST satisfy triangle inequality):
   {"template":"triangle","sides":[5,6,7]}
   For an isosceles/general triangle WITH a cevian from a vertex to the opposite
   side (高 altitude / 中线 median / 角平分线 bisector), add a "cevian" so the
   line AND its foot point are drawn and labelled — DO NOT use coordinate_points
   for this. Vertices are A (top), B (bottom-left), C (bottom-right).
   "底边BC上的高AD"  (altitude from A onto BC, foot D):
   {"template":"triangle","sides":[7.2,7.2,8],"cevian":{"from":"A","type":"altitude","foot_label":"D"},"labels":{"A":"A","B":"B","C":"C"}}
   type can be "altitude" | "median" | "bisector". foot_label is the foot's name (e.g. "D").
   NOTE on irrational lengths: diagram numeric fields (sides, width …) accept
   ONLY decimals. If a length is e.g. 2√13, put its decimal value (≈7.2) in the
   diagram JSON, but keep the exact form $2\sqrt{13}$ in the QUESTION TEXT.
   Always write square roots in the text as $2\sqrt{13}$ (coefficient INSIDE the
   dollar signs), never as "2 √13" or "2\sqrt 13".

   rectangle:
   {"template":"rectangle","width":8,"height":5}

   rectangle_fold — rectangle ABCD (A top-left, B top-right, C bottom-right,
   D bottom-left) folded along a crease. The crease has two endpoints (called E
   and F internally) sitting on two sides; "E_side"/"F_side" ∈ "AB"/"BC"/"CD"/"AD",
   ratios 0~1 set where on that side. "fold_vertex" is the corner being folded.
   LABELS: the crease endpoints default to E/F but you MUST rename them to match
   the text via "label_E"/"label_F"; rename corners via label_A…label_D if the
   text uses different names. The folded image of fold_vertex defaults to a
   primed label (e.g. A′).
   • If the vertex folds onto an EXISTING vertex (e.g. "把A折叠到D处"), the image
     coincides with that vertex — set "hide_image":true so no spurious A′ is drawn.
   Generic crease-through-middle example:
   {"template":"rectangle_fold","width":10,"height":8,"E_side":"AB","E_ratio":0.5,"F_side":"CD","F_ratio":0.5}
   Worked example — "矩形ABCD，AB=8，BC=6，将A折叠到D，折痕交AD于F、交BC于G，求FG":
   here the crease endpoints are named F (on AD) and G (on BC), and A lands on D:
   {"template":"rectangle_fold","width":8,"height":6,"fold_vertex":"A","E_side":"AD","E_ratio":0.5,"F_side":"BC","F_ratio":0.5,"label_E":"F","label_F":"G","hide_image":true,"label_EF":"FG"}

   parallelogram — base, slant side, interior angle in degrees:
   {"template":"parallelogram","base":8,"side":5,"angle":60}

   parallelogram_general / rhombus (SCENE) — use for a rhombus OR parallelogram
   ABCD given by a SIDE LENGTH and an INTERIOR ANGLE, ESPECIALLY when the
   problem also adds midpoints of sides and connecting segments / their
   intersection. The renderer computes every coordinate EXACTLY (a rhombus
   comes out truly equilateral and the given angle is correct), so NEVER use
   coordinate_points for these. Vertices are A,B,C,D in order (A bottom-left).
     "AB": side length;  "angle_B": interior angle ∠ABC in degrees;
     "rhombus":true forces all sides equal (or use scene "rhombus").
     "BC": the slant side length (only if NOT a rhombus).
     "midpoints":[{"name":"E","side":"BC"},{"name":"F","side":"CD"}] marks midpoints.
     "segments":[["A","E"],["B","F"]] draws connecting segments (endpoints may be
        vertices or midpoints defined above).
     "intersection":{"name":"G","of":[["A","E"],["B","F"]]} marks where two of
        those segments cross.
   Example — "菱形ABCD，AB=5，∠ABC=60°，E、F分别是BC、CD中点，连AE、BF交于G，求GE":
   ${BT}math-diagram
   {"template":"scene","scene":"rhombus","AB":5,"angle_B":60,"midpoints":[{"name":"E","side":"BC"},{"name":"F","side":"CD"}],"segments":[["A","E"],["B","F"]],"intersection":{"name":"G","of":[["A","E"],["B","F"]]}}
   ${BT}

   ladder — ladder of given length leaning on a wall, foot at foot_dist from wall (foot_dist < length):
   {"template":"ladder","length":5,"foot_dist":3}
   Edge labels are OFF unless you add them. Add a label ONLY for a GIVEN length:
   "label_ladder" (the ladder), "label_wall" (height up the wall), "label_foot"
   (distance along the ground). NEVER add the label for the side being asked for.
   E.g. "梯长10、离地8、求底端距离": {"template":"ladder","length":10,"foot_dist":6,"label_ladder":"10","label_wall":"8"} — note NO label_foot.

   cylinder_unrolled — unrolled lateral surface for shortest-path problems:
   {"template":"cylinder_unrolled","circumference":12,"height":9}

   rectangular_prism_net — cuboid net with dimensions:
   {"template":"rectangular_prism_net","length":4,"width":3,"height":2}

   number_line — range [lo,hi], optional marked points and solution-set arrows:
   {"template":"number_line","range":[-5,5],"points":[{"val":-2,"label":"A"},{"val":3,"label":"B"}],"arrows":[{"from":1,"dir":"right"}]}

   coordinate_points — free points and segments. "axes":true ONLY when the
   problem explicitly mentions a coordinate system; otherwise "axes":false.
   Segments reference point labels:
   {"template":"coordinate_points","axes":true,"points":[{"x":-2,"y":3,"label":"A"},{"x":1,"y":-1,"label":"B"},{"x":4,"y":2,"label":"C"}],"segments":[["A","B"],["B","C"]]}
   ⚠️ USE coordinate_points ONLY for genuine coordinate-geometry problems that
   give explicit (x, y) values in the text. DO NOT use it to fake a plain
   geometry figure by guessing coordinates — you will get the positions wrong
   and the long JSON often gets truncated. For a triangle with cevians (高/中线/
   角平分线), feet of perpendiculars, or special points (垂心/重心/内心/外心),
   prefer the "triangle" template and describe the construction in the TEXT
   instead of plotting every point. If a figure truly cannot be drawn by any
   template without inventing coordinates, simplify the PROBLEM so it fits
   (e.g. give side lengths and ask about those) rather than emitting a fragile
   coordinate_points blob. Keep every points[] array to at most ~6 points.

   linear_function — y = kx + b on a grid:
   {"template":"linear_function","k":2,"b":-1,"xmin":-4,"xmax":4}
   ⚠️ EQUATION LABEL RULE (CRITICAL): the renderer NEVER prints the equation
   automatically. Add "label" ONLY when the problem text explicitly STATES
   the equation (e.g. 已知一次函数 y=2x−1). If the problem asks the student
   to FIND k, b, their signs, or the 解析式, you MUST NOT pass any "label"
   containing numbers — pass the line's name only (e.g. "label":"l") or omit
   it entirely. Same rule for "secondary_label" of a second line.
   Optional intercept dots are OFF by default. Enable them ONLY when those
   intersection points are named in the text: "show_intercepts":true with
   "x_intercept_label":"A" and/or "y_intercept_label":"B" — point NAMES only,
   never coordinate values (unless those exact coordinates are stated as
   GIVEN in the text).

   quadratic_function — y = ax² + bx + c on a grid (a ≠ 0):
   {"template":"quadratic_function","a":1,"b":-2,"c":-3,"xmin":-3,"xmax":5}
   ⚠️ Same EQUATION LABEL RULE as linear_function: no automatic equation is
   printed; pass "label" only if the equation is GIVEN in the text, never
   when it is what the problem asks for. Vertex dot is OFF by default —
   enable with "show_vertex":true and "vertex_label":"P" (a point NAME) only
   when the vertex is named/given in the text.

   similar_triangles — two similar triangles side by side, ratio of similarity:
   {"template":"similar_triangles","ratio":2,"sides":[3,4,5]}

   FINAL DIAGRAM RULES (apply to EVERY diagram, circles AND non-circles):
   - OUTPUT ORDER: full question text FIRST, then the diagram block LAST.
     NEVER place the diagram before or in the middle of the question text.
   - COMPLETENESS: EVERY geometric object the text mentions — every named
     point, segment, line (e.g. 直线l), tangent, perpendicular, foot of
     perpendicular (垂足), intersection point, fold line — MUST be visible in
     the figure. Before finalising, list each object in your text and confirm
     the chosen scene/template can draw it.
   - LABEL EVERY POINT: every vertex / named point in the figure MUST carry its
     letter label EXACTLY as in the text (A, B, C, D, E, F, O, C′ …). A figure
     with unlabelled corners is wrong. Most templates auto-label A/B/C/D, but if
     a template/scene takes a "labels" array or label_* fields, fill them to
     match the problem's point names (including primed names like C′ for folded
     images). Never leave a point the text names blank in the figure.
   - NO EXTRAS: NEVER draw points, lines or labels the text does not mention.
   - ANGLES MUST LOOK RIGHT: when the text gives angle values, pass them via
     the scene's angle parameters (e.g. "angle_CAB":20) so point positions in
     the figure match the given values. Never invent raw positions that
     contradict the given angles.
   - DERIVED RAYS / BISECTORS: never try to compute the direction of an angle
     bisector or other derived ray yourself. Use a scene that solves them for
     you (e.g. intersecting_lines_rays with "bisects") and pass only the
     STRUCTURE ("OE bisects ∠BOD" → {"name":"E","bisects":["B","D"]}). The
     renderer computes the exact direction so the figure is always self-consistent.
   - NO ANSWER IN FIGURE (CRITICAL, ZERO TOLERANCE): the figure must show ONLY
     the KNOWN/GIVEN quantities. NEVER label a side, angle, segment or length
     whose value is what the problem asks the student to find — NOR any
     intermediate value that the student is expected to compute on the way to
     the answer. Only put a number on the figure if that exact number is stated
     as GIVEN in the problem text.
     • Only include label_* fields in the diagram JSON for the GIVEN values.
       Leave every to-be-found length/angle UNLABELLED (omit its label field).
     • Example of the ERROR to avoid: "梯子长10，顶端离地8，求底端距离" — here 10
       and 8 are given, but the foot distance (6) is the answer. The figure must
       label the ladder 10 and the wall 8, and MUST NOT label the foot side at
       all. Do NOT pass label_foot.
     • Before finalising each diagram, re-read "求…/求证…" in the text, identify
       the asked quantity, and verify NO label in the JSON equals or reveals it.
   - IF NOTHING FITS: when no scene/template can represent ALL objects of your
     intended problem, CHANGE THE PROBLEM so it fits an available figure.
     A correct figure with a different problem is always better than a
     mismatched figure.
   - One JSON object per problem, on ONE line, valid JSON, no comments.
   - Re-read your problem text, then re-read your JSON: if any named point or
     number differs, FIX the JSON before finalising.

4. MATH CONSISTENCY (CRITICAL — verify BEFORE writing each problem):
   - Silently solve the problem yourself FIRST. Only output it if a valid,
     unique answer exists.
   - Triangle sides must satisfy the triangle inequality. For right triangles
     prefer Pythagorean triples: (3,4,5) (5,12,13) (6,8,10) (8,15,17) (7,24,25).
   - Angles must be consistent: triangle angles sum to 180°; cyclic
     quadrilateral opposite angles sum to 180°; inscribed angle = half the
     central angle on the same arc; angle in semicircle = 90°; tangent ⊥ radius.
   - Given numbers must never contradict each other; do not give redundant data.
   - Answers should come out clean: integers, simple fractions, or simple
     radicals appropriate to the grade and difficulty.
5. VARIETY RULE (STRICT):
   - The "Use when" descriptions and example JSON in the scene/template docs are
     FORMAT references ONLY. NEVER copy, translate, or lightly rephrase them as
     your generated problems. In particular, do NOT default to the tangent +
     parallel-chord configuration ("PA切⊙O于A，弦BC∥PA") unless the assigned
     problem type explicitly calls for it.
   - When the user message assigns a 题型 (problem type) to each problem, you
     MUST follow that assignment exactly — choose the scene/template that fits
     THAT type, not the first scene in the list.
   - Vary the named points, given values and asked quantity between problems.
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
     BACKSLASH RULE: In your OUTPUT, LaTeX commands use SINGLE backslash: \angle \odot \triangle \parallel \perp \circ
     NEVER write \\angle or \\odot (double backslash) in your output. Single backslash only.
     NEVER write \angle outside $...$. Always: $\angle ABC$, $\odot O$, $\triangle ABC$.
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
  ], false, 2000);
}

export async function guideExercise(
  exercises: string,
  concept: Concept,
  lang: Language,
  curriculum: Curriculum | null = null
) {
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);

  const system = `You are a patient, Socratic math tutor helping a student work through specific problems.

═══ STEP 0 (MANDATORY, SILENT): SOLVE IT YOURSELF FIRST ═══
Before saying ANYTHING to the student, work the ENTIRE problem out correctly in
your private reasoning: find the full solution path, every formula, and the final
answer. For geometry, be especially careful with:
  • similar-triangle correspondence — match vertices in the RIGHT order so that
    corresponding sides pair up correctly (e.g. if △AOE ∼ △ADC then AO↔AD,
    OE↔DC, AE↔AC). Write the proportion only AFTER you've fixed the correspondence.
  • which side is opposite which angle, hypotenuse vs legs, etc.
Keep this full solution as your private reference. NEVER reveal it wholesale.
If you are not certain a step is correct, RE-DERIVE it rather than guessing — a
wrong hint teaches the student wrong maths, which is unacceptable.

═══ THEN: GUIDE (Socratic) ═══
1. YOUR ONLY JOB: guide the student through THIS specific problem. Don't teach from scratch.
2. Never give the full answer. Ask ONE targeted question per reply.
3. FIRST MESSAGE: identify the first concrete step (based on YOUR solved path) and
   ask ONE question about it.
   GOOD: "这道题矩形ABCD中AB=8，AD=10。折叠题第一步是找出折叠前后相等的线段。你觉得折叠后哪些线段长度不变？"
   BAD: "让我们先复习一下勾股定理的公式…"
4. Every hint you give MUST be consistent with your STEP-0 solution. Do not
   improvise a relationship you haven't verified.
5. NEVER give a full worked solution. At most one algebraic step per reply.
6. LANGUAGE: always reply in ${lang === "zh" ? "Chinese" : "English"}.
7. LENGTH: 3-5 sentences + 1 question per reply.` + curriculumInstr;

  const userMsg =
    `The student is working on:\n"""\n${exercises}\n"""\n\n` +
    `Topic: ${concept.title[lang]}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n\n` +
    `First solve it fully and correctly in your head, then address THIS specific ` +
    `problem: identify the first concrete step and ask ONE question.`;

  return await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, 6000, 0.3, true);
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

═══ BEFORE EVERY REPLY (MANDATORY, SILENT) ═══
Re-derive the correct full solution of the problem in your private reasoning so
you always know the right answer and the right next step. Be rigorous with
geometry, ESPECIALLY similar-triangle correspondence (match vertices in order so
corresponding sides pair correctly; verify the proportion before using it),
hypotenuse vs legs, and which angle/side corresponds to which. If the student
points out a possible mistake, RE-CHECK by re-deriving — do not just agree or
just insist. A hint that contains wrong maths is the worst possible outcome.

RULES:
- Stay focused on the problem shown. Never drift to general theory.
- Never give the full answer. One verified micro-step hint per reply.
- Ask exactly ONE follow-up question per reply.
- Every statement you make must be consistent with the correctly re-derived
  solution. Never state a relationship you have not verified this turn.
- Keep replies to 3-6 sentences.
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

  return await safeGenerate(messages, false, 6000, 0.3, true);
}

const PROBLEM_TYPE_POOLS: Record<string, string[]> = {
  '四边形': [
    '平行四边形性质（对边、对角、对角线互相平分）',
    '平行四边形判定（给条件判断是否为平行四边形）',
    '菱形性质（边长、对角线垂直平分、面积）',
    '菱形中点连线与线段长度',
    '矩形对角线相等与求长度',
    '正方形对角线与内角',
    '梯形中位线定理',
    '等腰梯形性质与高',
    '中点四边形（顺次连接各边中点）',
    '四边形面积（分割或对角线法）',
    '平行四边形中的角度计算',
    '矩形折叠求折痕或线段',
  ],
  'quadrilateral': [
    'Parallelogram properties (sides, angles, diagonals bisect)',
    'Parallelogram criteria (decide if a figure is one)',
    'Rhombus properties (side, diagonals, area)',
    'Rhombus midpoint segments',
    'Rectangle diagonals equal, find length',
    'Square diagonals and angles',
    'Trapezoid midsegment theorem',
    'Isosceles trapezoid properties and height',
    'Midpoint quadrilateral (join midpoints of sides)',
    'Quadrilateral area (split or diagonal method)',
    'Angle calculation in a parallelogram',
    'Rectangle folding (find crease or segment)',
  ],
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
  // Aliases: concept titles that should map to a pool even when they don't
  // literally contain the pool key. e.g. "平行四边形"/"菱形" → 四边形 pool.
  const ALIASES: Record<string, string> = {
    '平行四边形': '四边形', '菱形': '四边形', '矩形': '四边形',
    '正方形': '四边形', '梯形': '四边形', '四边形': '四边形',
    'parallelogram': 'quadrilateral', 'rhombus': 'quadrilateral',
    'rectangle': 'quadrilateral', 'square': 'quadrilateral',
    'trapezoid': 'quadrilateral', 'trapezium': 'quadrilateral',
    '勾股定理': '勾股', '相似三角形': '相似', '一次函数': '函数',
  };
  for (const [alias, poolKey] of Object.entries(ALIASES)) {
    if (title.includes(alias.toLowerCase()) && PROBLEM_TYPE_POOLS[poolKey]) {
      return PROBLEM_TYPE_POOLS[poolKey];
    }
  }
  for (const [key, pool] of Object.entries(PROBLEM_TYPE_POOLS)) {
    if (title.includes(key.toLowerCase())) return pool;
  }
  return null;
}

// Set to false if you want faster (but less reliable) single-pass generation.
const ENABLE_REVIEW_PASS = true;

export async function generateExercises(
  conceptTitle: string,
  conceptDesc: string,
  grade: Grade,
  difficulty: Difficulty,
  count: number,
  lang: Language,
  curriculum: Curriculum | null = null,
  _conceptId: string | null = null
) {
  const curriculumInstr = buildCurriculumInstruction(curriculum, lang);
  const system = SYSTEM_PROMPT_BASE + curriculumInstr;

  const pool = getTypePool(conceptTitle);
  const pickedTypes = pool ? pickRandom(pool, Math.max(count, 3)) : null;
  const varietyInstr = pickedTypes
    ? (lang === "zh"
        ? `\n题型分配（强制执行，每道题必须严格采用为它指定的题型）：\n${Array.from({ length: count }, (_, i) => `  第${i + 1}题题型：${pickedTypes[i % pickedTypes.length]}`).join('\n')}\n注意：系统提示中的场景示例题（如"PA切⊙O于A，弦BC∥PA"）仅用于说明JSON格式，严禁照搬或改写为生成的题目。`
        : `\nPROBLEM TYPE ASSIGNMENT (mandatory — each problem MUST use its assigned type):\n${Array.from({ length: count }, (_, i) => `  Problem ${i + 1}: ${pickedTypes[i % pickedTypes.length]}`).join('\n')}\nNote: the example problems in the scene docs are FORMAT references only. Never copy or rephrase them.`)
    : `\nVARIETY: Rotate problem types. Never use the same scenario twice in one batch. Never copy the example problems from the scene docs.`;

  const userMsg =
    `Task: Generate ${count} mathematics exercise(s) for "${conceptTitle}".\n` +
    `Grade Level: ${grade}\n` +
    `Difficulty: ${difficulty}\n` +
    `Language: ${lang === "zh" ? "Chinese" : "English"}\n` +
    `Description: ${conceptDesc}\n` +
    varietyInstr + `\n` +
    `CRITICAL: DO NOT include solutions. ONLY output the numbered questions.\n` +
    `CRITICAL: Each geometry problem ends with its own \`\`\`math-diagram block AFTER all its text.\n` +
    `Timestamp: ${Date.now()}`;

  // Scale token budget with problem count. Generous headroom so that long
  // diagram JSON (e.g. coordinate_points with many points) is never truncated
  // mid-object, and so GLM's hidden reasoning tokens (when thinking is on) fit.
  const genTokens = Math.min(3500 + count * 1400, 16000);

  const draft = await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: userMsg },
  ], false, genTokens, 0.55);

  if (!ENABLE_REVIEW_PASS) return draft;

  // ── Second pass: proofread & repair (logic, LaTeX, diagram-text match) ──
  try {
    const reviewed = await reviewExercises(draft, system, lang, genTokens);
    return reviewed;
  } catch {
    return draft; // review is best-effort; never block on it
  }
}

/**
 * Second AI pass: the model re-reads its own draft with low temperature and a
 * strict checklist, then outputs a corrected version. This catches most of the
 * logic errors, broken LaTeX and text-diagram mismatches that a single
 * generation pass produces.
 */
async function reviewExercises(
  draft: string,
  system: string,
  lang: Language,
  maxTokens: number
): Promise<string> {
  const reviewMsg =
    `Below is a DRAFT set of exercises. You are now the strict proofreader.\n` +
    `Check and FIX every issue, then output ONLY the corrected exercises ` +
    `(same numbering, same number of problems, same language: ${lang === "zh" ? "Chinese" : "English"}, ` +
    `no commentary, no solutions):\n\n` +
    `CHECKLIST:\n` +
    `1. MATH LOGIC: solve each problem yourself. If unsolvable, contradictory, ` +
    `or the answer is ugly when it should be clean, minimally change a number to fix it.\n` +
    `2. LATEX: every math symbol inside $...$ with single backslashes ` +
    `($\\angle ABC$, $\\odot O$, $\\triangle ABC$, $AB \\parallel CD$, $30^\\circ$); ` +
    `no bare words like angle/odot/parallel/circ; the total count of $ must be even.\n` +
    `3. DIAGRAMS: every \`\`\`math-diagram block must (a) come AFTER its problem's full text, ` +
    `(b) contain ONE valid single-line JSON object in the formats defined above, ` +
    `(c) match the text EXACTLY — same scene/template type, same point names, same numbers, ` +
    `(d) show EVERY object the text mentions (tangent lines, perpendiculars, feet, intersections) ` +
    `and NOTHING the text does not mention; the asked quantity must not appear in the figure, ` +
    `(e) when the text gives angle values, the JSON must pass them through the scene's angle ` +
    `parameters (e.g. "angle_CAB":20) so the drawn positions match the given values. ` +
    `If the chosen scene cannot draw an object the text requires, either switch to a scene that can ` +
    `or minimally rewrite the problem text so figure and text match perfectly. ` +
    `Fix the JSON if it mismatches. If a geometry problem with named points has NO diagram block, add a correct one.\n` +
    `4. NO ANSWER LEAK IN FIGURE (CRITICAL): for each problem, identify what "求…/求证…" ` +
    `asks for. Inspect the diagram JSON: if ANY label_* / numeric annotation equals or ` +
    `reveals that asked quantity OR a key intermediate value the student must compute, ` +
    `DELETE that label field from the JSON. The figure may only annotate values stated ` +
    `as GIVEN in the text. Example: "梯子长10、离地8、求底端距离" → JSON may keep ` +
    `label_ladder/label_wall but MUST NOT contain label_foot. ` +
    `Function graphs: if the problem asks to FIND k/b/a/c, the 解析式, or their signs, ` +
    `the linear_function/quadratic_function JSON MUST NOT contain any "label" with the ` +
    `equation or numbers (a bare line name like "label":"l" is fine), and MUST NOT ` +
    `enable intercept/vertex dots with coordinate values.\n` +
    `5. Do NOT add solutions, do NOT merge or drop problems, do NOT change problem types.\n\n` +
    `DRAFT:\n"""\n${draft}\n"""`;

  const out = await safeGenerate([
    { role: "system", content: system },
    { role: "user", content: reviewMsg },
  ], false, maxTokens, 0.2);

  // Accept the review only if it looks like a complete rewrite (not truncated/empty)
  const usable = out && out.trim().length > Math.min(200, draft.trim().length * 0.5);
  return usable ? out : draft;
}

export async function solveExercises(exercises: string, lang: Language) {
  const lang_str = lang === "zh" ? "Chinese" : "English";
  const system = `You are a math solution writer. Language: ${lang_str}.

IGNORE any \`\`\`math-diagram blocks in the input — they are figure data.
NEVER reproduce or mention them in your answer. Solve based on the problem text.

CORRECTNESS FIRST: work each problem out rigorously before writing. Double-check
geometry — similar-triangle correspondence (pair vertices in order so
corresponding sides match), Pythagorean setup, which side is hypotenuse, angle
relationships. A confidently-written but WRONG solution is worse than useless.
Re-derive any step you are unsure of. The final answer must be correct.

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
  ], false, 10000, 0.3, true);
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
