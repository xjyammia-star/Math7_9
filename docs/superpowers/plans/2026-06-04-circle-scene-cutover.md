# Circle Scene Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `circle_scene` the only accepted primary diagram format for the `circles` knowledge point and stop legacy `circle_*` templates from succeeding as normal circle output.

**Architecture:** Keep the existing circle Python renderer and scene schema, but change the circle generation pipeline so that output validation, repair, and prompt policy all treat `circle_scene` as mandatory. Legacy circle templates remain only as compatibility code in the renderer, not as acceptable final generation results.

**Tech Stack:** TypeScript, React, Vite, Python renderer, Node-based regression tests, existing `geminiService.ts` circle pipeline.

---

## File Map

**Modify**
- `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/src/utils/circleSceneSchema.js`
  - Reclassify legacy `circle_*` payloads as invalid for circle generation.
- `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/src/services/geminiService.ts`
  - Enforce scene-only circle output, tighten repair prompts, and stop treating legacy circle payloads as valid final answers.
- `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/circleSceneSchema.test.mjs`
  - Add regression coverage proving legacy circle templates are invalid for `circles`.
- `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/circleOutputIssues.test.mts`
  - Extend targeted output-issue checks for scene-only enforcement.

**Verify Only**
- `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/pythonCircleRenderer.test.mjs`
- `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/diagramConsistency.test.mjs`

---

### Task 1: Make legacy circle templates invalid in scene validation

**Files:**
- Modify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/circleSceneSchema.test.mjs`
- Modify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/src/utils/circleSceneSchema.js`

- [ ] **Step 1: Write the failing test**

```js
assert.deepEqual(
  detectCircleSceneIssues('```math-diagram\n{"template":"circle_chord","radius":13,"label_O":"O","label_A":"A","label_B":"B"}\n```'),
  ['circle_scene_invalid'],
);

assert.deepEqual(
  detectCircleSceneIssues('```math-diagram\n{"template":"circle_tangent","radius":5,"label_O":"O","label_A":"A","label_B":"B","label_P":"P"}\n```'),
  ['circle_scene_invalid'],
);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node tests/circleSceneSchema.test.mjs
```

Expected: FAIL because legacy `circle_*` currently returns `[]`.

- [ ] **Step 3: Write minimal implementation**

Update `detectCircleSceneIssues()` so legacy circle templates are no longer treated as acceptable success:

```js
function detectCircleSceneIssues(text) {
  const extracted = extractCircleScene(text);
  if (!extracted) {
    return ['circle_scene_invalid'];
  }

  const validation = validateCircleScene(extracted.scene);
  return validation.ok ? [] : ['circle_scene_invalid'];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
node tests/circleSceneSchema.test.mjs
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add -- src/utils/circleSceneSchema.js tests/circleSceneSchema.test.mjs
git commit -m "refactor: require circle scene for circle validation"
```

### Task 2: Enforce scene-only success in circle output validation

**Files:**
- Modify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/src/services/geminiService.ts`
- Modify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/circleOutputIssues.test.mts`

- [ ] **Step 1: Write the failing test**

Add a regression proving a legacy circle payload is invalid for `circles` even if it looks renderable:

```ts
const legacyCircleText = [
  '```math-diagram',
  JSON.stringify({
    template: 'circle_chord',
    radius: 20,
    label_O: 'O',
    label_A: 'A',
    label_B: 'B',
    label_C: 'C',
    label_chord: '24 cm',
  }),
  '```',
].join('\n');

assert.deepEqual(
  detectOutputIssues(
    legacyCircleText,
    'circles',
    '如图，圆 O 中有弦 AB，点 C 是弦 AB 的中点，连接 OC。',
    'must_draw',
    'circles',
  ).sort(),
  ['circle_scene_invalid'],
);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npx.cmd tsx tests/circleOutputIssues.test.mts
```

Expected: FAIL because current logic still allows legacy circle payloads into the circle branch.

- [ ] **Step 3: Write minimal implementation**

Tighten `detectOutputIssues()` so the `circles` branch does not treat legacy templates as valid final output:

```ts
if (String(conceptId ?? '').trim() === 'circles') {
  issues.push(...detectCircleSceneIssues(text));
  if (hasUnfencedDiagramJson(text)) {
    issues.push("diagram_json_unfenced");
  }
  if (needsQuestionAnswerLeakRepair({ conceptTitle, conceptDesc, generatedText: text, diagramPolicy })) {
    issues.push("question_answer_leak");
  }
  return [...new Set(issues)];
}
```

Keep semantic regressions for legacy payloads covered elsewhere only as compatibility diagnostics, not as acceptance logic.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
npx.cmd tsx tests/circleOutputIssues.test.mts
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add -- src/services/geminiService.ts tests/circleOutputIssues.test.mts
git commit -m "refactor: enforce scene-only circle output"
```

### Task 3: Tighten circle generation and repair prompts

**Files:**
- Modify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/src/services/geminiService.ts`

- [ ] **Step 1: Write the failing test**

Use an assertion over prompt text or issue-repair path that proves the circle prompt still mentions legacy circle templates as acceptable. The test can inspect the generated repair note content or a helper string if one already exists.

```ts
assert.match(circlePrompt, /only allowed diagram payload is \{"template":"circle_scene"/);
assert.doesNotMatch(circlePrompt, /use circle_chord|use circle_tangent|legacy circle template/i);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npx.cmd tsx tests/circleOutputIssues.test.mts
```

Expected: FAIL if the prompt still leaves room for legacy template guidance in the main circle path.

- [ ] **Step 3: Write minimal implementation**

In the circle generation and repair prompt sections:

```ts
`- For circles, output exactly one math-diagram block whose JSON uses {"template":"circle_scene","scene":{...}}.\n` +
`- Legacy circle_* templates are not allowed in the final answer for circles.\n` +
`- If the previous answer used circle_chord, circle_tangent, circle_sector, or any other legacy circle template, replace it with a valid circle_scene.\n`
```

Also remove circle-path wording that suggests legacy templates are acceptable primary output for `circles`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
npx.cmd tsx tests/circleOutputIssues.test.mts
```

Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add -- src/services/geminiService.ts tests/circleOutputIssues.test.mts
git commit -m "chore: tighten circle scene prompt policy"
```

### Task 4: Final regression verification

**Files:**
- Verify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/circleSceneSchema.test.mjs`
- Verify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/circleOutputIssues.test.mts`
- Verify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/diagramConsistency.test.mjs`
- Verify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/tests/pythonCircleRenderer.test.mjs`
- Verify: `D:/0-AI项目/AI项目（已完成or制作中）/Math7_9/src/services/geminiService.ts`

- [ ] **Step 1: Run targeted regression tests**

```powershell
node tests/circleSceneSchema.test.mjs
node tests/diagramConsistency.test.mjs
node tests/pythonCircleRenderer.test.mjs
npx.cmd tsx tests/circleOutputIssues.test.mts
```

Expected: all PASS

- [ ] **Step 2: Run type check**

```powershell
npm.cmd run lint
```

Expected: PASS

- [ ] **Step 3: Run production build**

```powershell
npm.cmd run build
```

Expected: PASS

- [ ] **Step 4: Commit final cutover**

```powershell
git add -- src/services/geminiService.ts src/utils/circleSceneSchema.js tests/circleSceneSchema.test.mjs tests/circleOutputIssues.test.mts tests/diagramConsistency.test.mjs
git commit -m "refactor: cut circles over to scene-first output"
```

## Spec Coverage Check

- Scene-only primary path: covered by Tasks 1 and 2.
- Repair/regeneration instead of fallback acceptance: covered by Tasks 2 and 3.
- Prompt tightening: covered by Task 3.
- Regression coverage for old wrong circle behavior: covered by Tasks 1, 2, and 4.

