# Circle Scene Schema Trial Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current circle-template selection approach with a two-stage pipeline for `circles`: first have the AI extract a structured circle scene JSON from the prompt, then have Python render the figure from that scene. Add a third-stage validator that checks the scene before rendering and rejects inconsistent arc-side, tangency, or point-mapping output.

**Architecture:** Keep the existing app flow in `geminiService.ts` and `PracticeCenter.tsx`, but change the circle-specific generation path so the model outputs a single canonical `circle_scene` JSON object instead of choosing from many small templates. A new validator layer will confirm that the scene is internally consistent and matches the prompt. The Python renderer will consume only the validated scene JSON and draw the figure deterministically. Existing circle templates remain as fallback compatibility, not the main path.

**Tech Stack:** Existing TypeScript/React/Vite app, `MathDiagram.tsx`, local Python renderer in `server/circle_diagram_renderer.py`, Node-based tests, and the existing AI generation flow.

---

## Problem Statement

The current circle flow relies on many specialized templates such as `circle_tangent`, `circle_chord_tangent`, `circle_diameter_tangent_chord`, `circle_tangent_chord_dual_points`, and others. In practice, this has two recurring problems:

- The AI sometimes selects the wrong template even when the conceptual understanding is partially correct.
- When the AI misunderstands the prompt, the wrong template makes the error look more official instead of correcting it.

The result is that template coverage has become brittle. The real problem is not the renderer alone; it is the lack of a stable intermediate representation for circle problems. This trial introduces a scene schema that captures the AI’s understanding first, then lets Python render and the validator reject bad scenes.

## Design Goals

1. Keep the trial scoped to the `circles` knowledge point only.
2. Reduce reliance on many fine-grained circle templates during generation.
3. Require the AI to extract a structured scene before rendering.
4. Make `优弧 / 劣弧`, tangency, and intersection roles explicit in the schema.
5. Ensure the renderer only uses validated scene JSON.
6. Add programmatic checks that fail when the scene is inconsistent, incomplete, or leaks answer values into the diagram.
7. Preserve the existing app flow and keep a fallback path for legacy circle templates.

## Non-Goals

- Do not redesign the entire app around the new schema.
- Do not migrate non-circle concepts in this trial.
- Do not remove all existing circle templates immediately.
- Do not change unrelated question-bank logic for algebra, Pythagoras, or area/perimeter.

## Proposed Approach

### Stage 1: Structure extraction

For `circles`, the AI should output a single `circle_scene` JSON payload with these parts:

- `points`
- `objects`
- `relations`
- `givens`
- `targets`
- `display`

The model should not pick a rendering template directly. Instead it should declare the geometric scene in machine-readable form.

### Stage 2: Validation

A validator checks the scene before rendering:

- arc-side consistency
- point-role consistency
- tangency consistency
- intersection consistency
- missing-line / missing-point consistency
- answer leakage into diagram fields

If validation fails, the scene is repaired or regenerated before rendering.

### Stage 3: Python rendering

The Python renderer consumes the scene JSON and renders the figure deterministically. It should not infer missing geometry unless the schema explicitly allows derived helper geometry.

## Scene Schema

The schema should be strict enough to be machine-checked, but simple enough for the model to produce reliably.

### Core fields

- `conceptId`: always `circles`
- `figureType`: usually `circle`
- `center`: e.g. `O`
- `points`: list of named points with roles
- `relations`: list of explicit geometric relations
- `givens`: list of known numeric values
- `targets`: list of asked-for values
- `display`: labels, visibility flags, and which helper lines to show

### Example shape

```json
{
  "conceptId": "circles",
  "figureType": "circle",
  "center": "O",
  "points": [
    { "name": "P", "role": "external_point" },
    { "name": "A", "role": "tangent_point" },
    { "name": "B", "role": "tangent_point" },
    { "name": "C", "role": "arc_point", "arcSide": "minor" },
    { "name": "D", "role": "intersection_point" },
    { "name": "E", "role": "intersection_point" },
    { "name": "F", "role": "foot_point" }
  ],
  "relations": [
    { "type": "tangent", "line": "PA", "touches": "A" },
    { "type": "tangent", "line": "PB", "touches": "B" },
    { "type": "arc_membership", "point": "C", "arc": "AB", "arcSide": "minor" },
    { "type": "tangent_at_point", "point": "C" },
    { "type": "intersection", "point": "D", "of": ["tangent_at_C", "PA"] },
    { "type": "intersection", "point": "E", "of": ["tangent_at_C", "PB"] },
    { "type": "collinear", "points": ["O", "C", "F"] },
    { "type": "intersection", "point": "F", "of": ["OC", "AB"] }
  ],
  "givens": [
    { "name": "PA", "value": 6 },
    { "name": "angle_APB", "value": 60 }
  ],
  "targets": [
    { "name": "perimeter_triangle_CDE" }
  ],
  "display": {
    "showCircle": true,
    "showTangentAtC": true,
    "showOC": true,
    "hideDerivedNumericLabels": true
  }
}
```

This is not the final universal schema for all geometry. It is the minimum viable scene format for the circle trial.

## Prompting Policy

Instead of asking the model to choose a template, the prompt should:

- give a compact glossary for `优弧 / 劣弧`, tangents, chords, and intersections
- require the model to extract the scene in JSON
- require a self-check step before final output
- forbid adding unknown numeric labels to the scene

The prompt should emphasize:

- `优弧 = major arc`
- `劣弧 = minor arc`
- tangent points, arc points, and intersection points must be named explicitly
- unknowns must remain hidden
- output must be valid JSON only

## Validation Policy

Validation should reject a scene when any of the following occurs:

- `arcSide` contradicts the prompt
- a point named in the prompt is missing from `points`
- a required intersection is not present
- a tangent relation is declared without the matching tangent point
- a given value appears in the diagram when it should not
- a target value is leaked into a numeric label
- the scene describes geometry that cannot be rendered consistently

The validator should support a repair loop:

1. AI emits scene JSON.
2. Validator checks it.
3. If invalid, AI repairs the JSON with explicit failure reasons.
4. If still invalid, fall back to a conservative error instead of guessing.

## Rendering Policy

The Python renderer should:

- consume only validated JSON
- render all explicitly declared points and relations
- draw helper lines only when requested or required by the scene
- never infer a missing arc side
- never place a numeric label for an unknown target
- keep the figure geometrically consistent even when derived helper points are needed

The renderer may still accept legacy template payloads during the trial, but those paths should be treated as fallback compatibility only.

## Migration Plan

### Trial scope

The first trial will cover only `circles`.

### Compatibility

The existing circle templates remain available as a fallback if the new scene pipeline fails, but they should no longer be the primary path.

### Rollout order

1. Add the glossary and scene prompt.
2. Add the `circle_scene` validator.
3. Add Python rendering for the scene JSON.
4. Add regression tests for the known bad cases.
5. Keep the old templates only as compatibility fallbacks.

## Testing Strategy

### Scene tests

- valid `circle_scene` JSON parses successfully
- invalid `arcSide` is rejected
- missing point roles are rejected
- tangent / intersection relations are validated
- unknown labels are not emitted into the scene

### Renderer tests

- the Python renderer can draw the validated scene
- no question marks appear where a numeric value should not be shown
- required lines are present
- arc-side helpers stay consistent with the schema

### Regression tests

The first regression set should include:

- `C` on the minor arc AB
- `C` on the major arc AB
- two tangents with a third tangent at `C`
- diameter + tangent + chord scenes
- scenes that previously leaked answer values into the diagram

## Success Criteria

This trial is successful when:

- the AI outputs structured circle scenes more reliably than it picks templates
- the validator catches wrong arc-side and point-role mappings
- Python renders the scene without guessing the geometry
- legacy circle templates become rare fallbacks instead of the main path
- the known bad circle cases stop reappearing in regression tests

## Recommended Next Step

If this trial succeeds, the same pattern can be extended to other geometry concepts that currently depend on brittle template selection.
