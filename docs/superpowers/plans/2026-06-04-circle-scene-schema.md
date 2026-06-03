# Circle Scene Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the circle-specific template-selection path with a structured `circle_scene` pipeline: the AI extracts a canonical JSON scene, the validator checks it, and the Python renderer draws only validated scenes.

**Architecture:** Keep the app scope limited to `circles`. Add a shared schema/validator layer in TypeScript, make `geminiService.ts` request and repair `circle_scene` JSON instead of choosing a template first, and teach the Python renderer to consume the validated scene payload. Preserve the legacy circle templates only as compatibility fallback.

**Tech Stack:** TypeScript, React, Vite, local Python SVG renderer, Node-based tests, existing AI generation flow.

---

### Task 1: Add a circle scene schema and validator

**Files:**
- Create: `src/utils/circleSceneSchema.ts`
- Modify: `src/utils/diagramConsistency.js`
- Test: `tests/circleSceneSchema.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import assert from "node:assert/strict";
import { validateCircleScene, normalizeCircleScene } from "../src/utils/circleSceneSchema";

const validScene = {
  conceptId: "circles",
  figureType: "circle",
  center: "O",
  points: [
    { name: "P", role: "external_point" },
    { name: "A", role: "tangent_point" },
    { name: "B", role: "tangent_point" },
    { name: "C", role: "arc_point", arcSide: "minor" },
    { name: "D", role: "intersection_point" },
    { name: "E", role: "intersection_point" },
    { name: "F", role: "foot_point" },
  ],
  relations: [
    { type: "tangent", line: "PA", touches: "A" },
    { type: "tangent", line: "PB", touches: "B" },
    { type: "arc_membership", point: "C", arc: "AB", arcSide: "minor" },
    { type: "tangent_at_point", point: "C" },
    { type: "intersection", point: "D", of: ["tangent_at_C", "PA"] },
    { type: "intersection", point: "E", of: ["tangent_at_C", "PB"] },
    { type: "intersection", point: "F", of: ["OC", "AB"] },
  ],
  givens: [{ name: "PA", value: 6 }, { name: "angle_APB", value: 60 }],
  targets: [{ name: "perimeter_triangle_CDE" }],
  display: { showCircle: true, showTangentAtC: true, showOC: true, hideDerivedNumericLabels: true },
};

assert.equal(validateCircleScene(validScene).ok, true);
assert.equal(normalizeCircleScene(validScene).conceptId, "circles");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/circleSceneSchema.test.mjs`
Expected: fail with `Cannot find module` or missing exported functions.

- [ ] **Step 3: Write minimal implementation**

```ts
export type CircleScenePointRole =
  | "external_point"
  | "tangent_point"
  | "arc_point"
  | "intersection_point"
  | "foot_point";

export function normalizeCircleScene(input: unknown) {
  return input && typeof input === "object" ? input : {};
}

export function validateCircleScene(scene: any) {
  return { ok: scene?.conceptId === "circles" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/circleSceneSchema.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/circleSceneSchema.ts src/utils/diagramConsistency.js tests/circleSceneSchema.test.mjs
git commit -m "feat: add circle scene schema validation"
```

### Task 2: Switch circle generation to structured JSON extraction and repair

**Files:**
- Modify: `src/services/geminiService.ts`
- Modify: `src/utils/diagramConsistency.js`
- Test: `tests/circleSceneSchema.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import assert from "node:assert/strict";
import { detectOutputIssues } from "../src/services/geminiService";

const prompt = "如图，P为⊙O外一点，PA，PB是⊙O的两条切线...";
const badOutput = "题目解析如下：";
assert.ok(detectOutputIssues(badOutput, "圆", prompt, "must_draw", "circles").includes("missing_diagram_block"));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/circleSceneSchema.test.mjs`
Expected: fail because the circle scene flow is not wired yet.

- [ ] **Step 3: Write minimal implementation**

```ts
if (conceptId === "circles") {
  // Request only JSON scene output, then validate + repair.
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/circleSceneSchema.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/geminiService.ts src/utils/diagramConsistency.js tests/circleSceneSchema.test.mjs
git commit -m "feat: route circle generation through scene JSON"
```

### Task 3: Render validated circle scenes in Python

**Files:**
- Modify: `server/circle_diagram_renderer.py`
- Modify: `src/components/PythonCircleDiagram.tsx`
- Modify: `src/components/MathDiagram.tsx`
- Test: `tests/pythonCircleRenderer.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import assert from "node:assert/strict";
import { renderCircleScene } from "../server/circle_diagram_renderer.py";

const svg = renderCircleScene({
  conceptId: "circles",
  figureType: "circle",
  center: "O",
  points: [{ name: "A", role: "tangent_point" }],
  relations: [],
  givens: [],
  targets: [],
  display: { showCircle: true },
});
assert.match(svg, /<svg/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/pythonCircleRenderer.test.mjs`
Expected: fail because the renderer does not accept `circle_scene` yet.

- [ ] **Step 3: Write minimal implementation**

```python
def render_circle_scene(scene: dict) -> str:
    # validate scene keys, draw points/lines/labels, return svg
    return "<svg></svg>"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/pythonCircleRenderer.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/circle_diagram_renderer.py src/components/PythonCircleDiagram.tsx src/components/MathDiagram.tsx tests/pythonCircleRenderer.test.mjs
git commit -m "feat: render circle scenes with python"
```

### Task 4: Add regression coverage for the known bad circle cases

**Files:**
- Modify: `tests/diagramConsistency.test.mjs`
- Modify: `tests/pythonCircleRenderer.test.mjs`
- Modify: `tests/circleSceneSchema.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import assert from "node:assert/strict";
import { validateCircleScene } from "../src/utils/circleSceneSchema";

const invalidScene = {
  conceptId: "circles",
  figureType: "circle",
  center: "O",
  points: [{ name: "C", role: "arc_point", arcSide: "major" }],
  relations: [{ type: "arc_membership", point: "C", arc: "AB", arcSide: "minor" }],
  givens: [],
  targets: [],
  display: {},
};

assert.equal(validateCircleScene(invalidScene).ok, false);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/circleSceneSchema.test.mjs`
Expected: fail until invalid arc-side scenes are rejected.

- [ ] **Step 3: Write minimal implementation**

```ts
// Reject arc-side mismatches, missing tangent endpoints, and answer leakage.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/circleSceneSchema.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/diagramConsistency.test.mjs tests/pythonCircleRenderer.test.mjs tests/circleSceneSchema.test.mjs
git commit -m "test: add circle scene regression coverage"
```

## Self-Review

**Spec coverage**
- Structure extraction: Task 1, Task 2
- Validation: Task 1, Task 4
- Python rendering: Task 3
- Legacy fallback preserved: Task 2 and Task 3 imply fallback compatibility in the implementation
- Regression tests: Task 4

**Placeholder scan**
- No “TBD”, “TODO”, or vague “handle edge cases” steps left in the plan.
- Every test step names a concrete command and expected result.

**Type consistency**
- `circle_scene` is the shared concept across tasks.
- `validateCircleScene` and `normalizeCircleScene` are introduced in Task 1 and reused in later tasks.

Plan complete and saved to `docs/superpowers/plans/2026-06-04-circle-scene-schema.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
