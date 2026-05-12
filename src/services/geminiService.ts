import { GoogleGenAI } from "@google/genai";
import { Concept, Difficulty, Language, Grade, Message } from "../types";
import { KNOWLEDGE_GRAPH } from "../data/knowledgeGraph";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MODEL_NAME = "gemini-3-flash-preview";

async function safeGenerate(contents: any, systemInstruction?: string, config?: any) {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.95,
      },
      ...config
    });
    
    return response.text || "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorString = JSON.stringify(error);
    if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED") || error?.status === 429) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    if (errorString.includes("500") || error?.status === 500) {
      throw new Error("AI_INTERNAL_ERROR");
    }
    throw error;
  }
}

const BT = "```";

const SYSTEM_PROMPT_BASE = `You are a world-class middle-school mathematics tutor specializing in the Feynman Technique.

STRICT PRINCIPLES:
1. Socratic Method: Never give answers. Always ask questions that lead to student discovery.
2. Selective Visualization (CRITICAL): Do NOT include a diagram for every problem.
   - INCLUDE if: Geometry (angles, triangles, areas), coordinate functions (slopes, shifts), number lines, or spatial reasoning.
   - OMIT if: Pure algebra or simple word problems.
   - MANDATORY: If you use phrases like "as shown in the figure" or "如图", you MUST include a "math-diagram" block.
   - GEOMETRIC REASONING: Before outputting the JSON, mentally calculate all coordinates (x, y) based on the problem's constraints (e.g., if AB=6, BC=10, then A=(0,6), B=(0,0), C=(10,0), D=(10,6)).
   - SHAPE COMPLETENESS: DO NOT just output points. You MUST draw the full skeleton using 'polygon' or 'line'.
   - CONFIG: Always set "config": {"axes": false, "grid": false} for non-coordinate geometry.

4. VISUAL HIERARCHY: 
   - Use 'polygon' for main shapes (triangles, rectangles).
   - Use 'line' for folding lines or auxiliary lines (dashed).
   - "importance": "primary" -> Thick gold lines.
   - "importance": "helper" -> Thin dashed grey lines.

4. SCENARIO VISUALIZATION (PYTHAGOREAN):
   - Shortest Path (Cylinder/Spider): DRAW THE UNROLLED LATERAL SURFACE (侧面展开图) as a rectangle. Width = circumference (or half), Height = cylinder height. The path is the DIAGONAL of this rectangle.
   - Folding: Draw the rectangle ABCD, the fold line EF, and the vertex's image point (e.g., D').
   - Real-world: Draw a right triangle formed by the ladder/tree/shadow.
   - VARIETY: Randomly choose between these scenarios. DO NOT repeat the same specific scenario type more than twice in a block of exercises.
3. DIAGRAM JSON FORMATS (MANDATORY STRUCTURE):
   
   - TYPE 1: Coordinate Geometry (Perfect for Slope/Functions)
   ${BT}math-diagram
   {
     "config": {"axes": true, "grid": true},
     "window": {"xmin": -5, "xmax": 5, "ymin": -5, "ymax": 5},
     "elements": [
       {"type": "line", "x1": -2, "y1": -2, "x2": 3, "y2": 3, "label": "y=x", "importance": "primary"},
       {"type": "point", "x": 1, "y": 1, "label": "P"}
     ]
   }
   ${BT}

   - TYPE 2: Pure Geometry (e.g. Triangles, Rectangles - HIDE AXES)
   ${BT}math-diagram
   {
     "config": {"axes": false, "grid": false},
     "window": {"xmin": -2, "xmax": 12, "ymin": -2, "ymax": 14},
     "elements": [
       {"type": "polygon", "points": [[0,0], [10,0], [10,12], [0,12]], "importance": "primary", "opacity": 0.1},
       {"type": "line", "x1": 0, "y1": 0, "x2": 10, "y2": 12, "label": "Path", "importance": "primary"},
       {"type": "point", "x": 0, "y": 12, "label": "A"},
       {"type": "point", "x": 0, "y": 0, "label": "B"},
       {"type": "point", "x": 10, "y": 0, "label": "C"},
       {"type": "point", "x": 10, "y": 12, "label": "D"}
     ]
   }
   ${BT}

   - TYPE 2: Geometry Description
   ${BT}math-diagram
   {
     "type": "geometry_desc",
     "shapes": [
       {"kind": "triangle", "label": "ABC", "right_angle": true, "leg1": 6, "leg2": 8}
     ]
   }
   ${BT}

   - TYPE 3: Number Line
   ${BT}math-diagram
   {
     "type": "numberline",
     "range": [-10, 10],
     "elements": [
       {"type": "point", "value": 5, "label": "x=5"}
     ]
   }
   ${BT}

4. VARIETY RULE (STRICT): 
   - For a specific topic, you MUST rotate problem types. Never generate the same type of problem more than twice in a row.
   - For "Pythagorean Theorem" (勾股定理): Rotate between:
     - Folded Geometry (折叠/矩形翻折)
     - Shortest Path (圆柱上蚂蚁爬行/路径最短)
     - Real-world Height/Distance (梯子靠墙/大树折断)
     - Geometric area proofs (勾股树/赵爽弦图)
   - If the user provides a "Special Requirement" or "Type Requirement", PRIORITIZE it for all problems in that set.
5. NO RESOLUTIONS: When generating exercises, ONLY output the questions.
6. LATEX: Use $...$ for ALL math symbols and equations.`;

export async function startFeynmanSession(problemText: string, concept: Concept, lang: Language) {
  const specificTitle = concept.specificFocus ? concept.specificFocus[lang] : concept.title[lang];
  const isGenericTopic = !concept.specificFocus || problemText === specificTitle || problemText.length < 10;

  const prompt = [
    { role: 'user', parts: [{ text: 
      "Target Topic for this session: \"" + specificTitle + "\"\n" +
      "Broader Module Context: " + concept.title[lang] + " (" + concept.module + ")\n" +
      "Student Input: \"" + problemText + "\"\n" +
      "Language: " + (lang === 'zh' ? 'Chinese' : 'English') + "\n\n" +
      "STRATEGY:\n" +
      "1. START WITH THE SPECIFIC: You must immediately start the conversation regarding \"" + specificTitle + "\". Do not start with a generic overview of \"" + concept.title[lang] + "\".\n" +
      "   - BAD: 'Hello, let's learn about Functions and Change. First, what is a variable? Now let's talk about slope.'\n" +
      "   - GOOD: 'Hello! I see you want to explore \"" + specificTitle + "\". To get us started, have you ever noticed how the steepness of a hill can be described by a number?'\n" +
      "2. SOCRATIC METHOD: Do not provide direct definitions. Instead, use a simple metaphor or ask a targeted question that triggers thinking about the core essence of " + specificTitle + ". Use \"math-diagram\" ONLY if the concept is inherently visual (Geometry, Slope, Functions).\n" +
      "3. PROGRESSIVE DRILL-DOWN: If and ONLY IF the student shows confusion about variables, dependency, or coordinates (the foundations), then briefly pivot to clarify those function concepts, then IMMEDIATELY return to " + specificTitle + ".\n" +
      "4. TONE: Warm, intelligent, professional middle school math tutor.\n" +
      "5. FORMAT: Keep responses concise. One short insight followed by ONE question." }] }
  ];

  return await safeGenerate(prompt, SYSTEM_PROMPT_BASE);
}

export async function generateExercises(conceptTitle: string, conceptDesc: string, grade: Grade, difficulty: Difficulty, count: number, lang: Language) {
  const prompt = [
    { role: 'user', parts: [{ text: 
      "Task: Generate " + count + " mathematics exercises for " + conceptTitle +
      ".\nGrade Level: " + grade +
      "\nDifficulty: " + difficulty +
      "\nLanguage: " + (lang === 'zh' ? 'Chinese' : 'English') +
      "\nVARIETY CHECK: You MUST rotate problem types. Never generate the same scenario twice in a row. " +
      "For 'Pythagorean Theorem' (勾股定理), YOU ARE A 'MATH COURSEWARE ENGINEER' (数学课件工程师). FOLLOW THESE STEPS FOR DIAGRAMS:\n" +
      "1. GEOMETRIC MODELING: Mentally calculate EXACT coordinates (x, y) based on lengths. E.g., for a 3-4-5 triangle, use (0,0), (4,0), (0,3).\n" +
      "2. LADDER PROBLEMS (梯子滑动): Define Wall at x=0, Ground at y=0. Ladder state 1: (0,8) to (6,0). Ladder state 2: (0,7) to (sqrt(100-49),0). DRAW BOTH using 'line' or 'polygon'. Use importance:'primary' for final state and 'helper' for initial state.\n" +
      "3. SHAPES OVER POINTS: DO NOT just output points. You MUST draw shapes using 'polygon' (for full triangles/rectangles) or 'line' (for single segments).\n" +
      "4. GRID VS GEOMETRY: \n" +
      "   - For coordinate/grid problems: set config:{axes:true, grid:true}.\n" +
      "   - For standard geometry (e.g., folding, ladders): set config:{axes:false, grid:false} to behave like a blank drawing board.\n" +
      "5. LABELS: Every point A, B, C... mentioned in text MUST be a 'point' with a 'label' in JSON.\n" +
      "6. VARIETY: Rotate between ladder, folding, shortest path, and proofs." +
      "\nCRITICAL: DO NOT include solutions or '解析'. ONLY output the numbered questions.\n" +
      "VISUALS (MANDATORY): \n" +
      "1. MODELING: Treat the diagram like a Python Matplotlib plot. Calculate EXACT coordinates (x, y) for all points before generating JSON.\n" +
      "2. SHAPES: Draw the main geometry (Rectangles, Triangles) using 'polygon' with its 'points' array. Do NOT just output loose 'point' elements.\n" +
      "3. CONFIG: For geometry problems, you MUST set 'config': {'axes': false, 'grid': false} to provide a clean canvas.\n" +
      "4. LABELS: Every point mentioned in the text MUST have a corresponding 'point' element with a 'label' attribute in the JSON.\n" +
      "5. EXAMPLE (Ladder against wall): Back Wall (0,10) to (0,0), Ground (0,0) to (8,0), Ladder (0,6) to (8,0). Draw as polygon or multiple lines.\n" +
      "Request Timestamp: " + Date.now() }] }
  ];

  return await safeGenerate(prompt, SYSTEM_PROMPT_BASE);
}

export async function solveExercises(exercises: string, lang: Language) {
  const prompt = [
    { role: 'user', parts: [{ text: 
      "Solve these exercises in " + (lang === 'zh' ? 'Chinese' : 'English') + ":\n" +
      exercises }] }
  ];

  return await safeGenerate(prompt, "Provide final answer + brief explanation for each.");
}

export async function identifyTopic(query: string, lang: Language) {
  const curriculumSummary = KNOWLEDGE_GRAPH.map(m => ({
    module: m.id,
    concepts: m.concepts.map(c => ({ id: c.id, title: c.title }))
  }));

  const prompt = [
    { role: 'user', parts: [{ text: 
      "Analyze User Query: \"" + query + "\"\n" +
      "Curriculum Context: " + JSON.stringify(curriculumSummary) + "\n" +
      "Language: " + (lang === 'zh' ? 'Chinese' : 'English') + "\n" +
      "Task: Identify the mathematical concept.\n" +
      "1. If it matches an existing concept ID EXACTLY or as a major sub-topic, use that ID.\n" +
      "2. ALWAYS provide a 'refinedTitle' that captures the SPECIFIC topic the user asked for (e.g. if they ask for 'slope' and you match 'functions', the refinedTitle should be 'Slope').\n" +
      "3. Provide a tailored description for that specific topic." }] }
  ];

  const text = await safeGenerate(prompt, 
    "JSON format: { \"existingId\": \"string|null\", \"matchedModule\": \"string\", \"refinedTitle\": { \"zh\": \"...\", \"en\": \"...\" }, \"description\": { \"zh\": \"...\", \"en\": \"...\" }, \"level\": number (1-5) }",
    { responseMimeType: "application/json" }
  );
  
  try {
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

export async function chatStep(history: Message[], lang: Language) {
  const contents = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  return await safeGenerate(contents, SYSTEM_PROMPT_BASE);
}
