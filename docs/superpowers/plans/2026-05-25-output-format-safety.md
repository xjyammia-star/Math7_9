# Output Format Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep AI-generated math content readable and diagram-safe by validating generated output and retrying once when the model leaks raw math commands or omits required diagram blocks.

**Architecture:** Add a small post-generation validator inside `src/services/geminiService.ts` that inspects the raw model output for math-command leaks, broken formatting, and geometry prompts that should include a diagram block. When validation fails, send the model a narrowly scoped repair prompt that preserves the original meaning and only fixes formatting. Keep the front-end rendering path unchanged so the fix stays isolated to generation time.

**Tech Stack:** TypeScript, Vite, React, KaTeX, existing Ark/Doubao chat completion API.

---

### Task 1: Add generation output validation helpers

**Files:**
- Modify: `src/services/geminiService.ts`

- [ ] **Step 1: Define a failing smoke case in a temporary Node script**

```ts
const leaked = '如图,点P是odotO外一点,若angleAPB = 56°circ,求angleAOB。';
const expected = '如图,点P是⊙O外一点,若∠APB = 56°,求∠AOB。';
```

- [ ] **Step 2: Run the smoke case against the current helper logic and confirm it does not yet repair the string**

Run: `node temp-smoke.mjs`
Expected: the string still contains at least one raw leaked command or the script reports that no repair pass exists yet.

- [ ] **Step 3: Implement validation helpers**

```ts
const LEAKED_COMMAND_PATTERNS = [
  /(?:^|[^A-Za-z])(?:\\)?odot(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?triangle(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?angle(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?perp(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?parallel(?=[A-Z0-9(])/,
  /(?:^|[^A-Za-z])(?:\\)?circ\b/,
];

function needsDiagramRepair(text: string): boolean {
  return /circle|tangent|chord|triangle|parallel|如图|点[A-Z]/i.test(text) &&
    !text.includes('```math-diagram') &&
    !text.includes('"template"');
}
```

- [ ] **Step 4: Run the smoke case again**

Run: `node temp-smoke.mjs`
Expected: helper-level detection flags the example as needing repair.

- [ ] **Step 5: Commit the helper-only change**

```bash
git add src/services/geminiService.ts
git commit -m "Add AI output validation helpers"
```

### Task 2: Add a single repair retry for generated exercises

**Files:**
- Modify: `src/services/geminiService.ts`

- [ ] **Step 1: Wire `generateExercises()` through a repair pass**

```ts
const raw = await safeGenerate([...], false, 2048);
const repaired = await maybeRepairGeneratedExercises(raw, { conceptTitle, conceptDesc, lang, count, difficulty, grade });
return repaired;
```

- [ ] **Step 2: Add a narrowly scoped repair prompt**

```ts
const repairSystem = `You are repairing an AI-generated math exercise list.
Preserve the meaning, difficulty, and number of questions.
Only fix formatting: wrap math properly in $...$, replace leaked commands like odot/angle/perp/circ, and add the required math-diagram block when the problem clearly needs one.
Do not add solutions. Output only the corrected exercises.`;
```

- [ ] **Step 3: Implement diagram repair fallback**

```ts
if (needsDiagramRepair(raw) && !raw.includes('```math-diagram')) {
  // Ask the model to rewrite once with the diagram block preserved.
}
```

- [ ] **Step 4: Verify with a local sample that previously leaked commands now return repaired prose**

Run: `node temp-smoke.mjs`
Expected: the repaired output contains `⊙`, `∠`, and `°` instead of leaked commands.

- [ ] **Step 5: Commit the generation retry**

```bash
git add src/services/geminiService.ts
git commit -m "Repair malformed exercise output once"
```

### Task 3: Verify the deployed output path still renders normally

**Files:**
- Modify: `src/services/geminiService.ts`

- [ ] **Step 1: Inspect the output bundle path indirectly by building a sample response**

```ts
const sample = await generateExercises(...);
console.log(sample);
```

- [ ] **Step 2: Confirm the sample still produces plain numbered exercises when no repair is needed**

Expected: no extra wrappers, no accidental diagram injection, and no change to already-correct text.

- [ ] **Step 3: Commit the final change set**

```bash
git add src/services/geminiService.ts
git commit -m "Harden AI exercise output formatting"
```

