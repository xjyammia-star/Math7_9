# Circle Scene Cutover Design

> Scope: `circles` only

## Goal

Stop treating legacy `circle_*` templates as the normal generation path for circle problems. Make `circle_scene` the only accepted primary diagram payload for the `circles` knowledge point, then let Python render from validated scene JSON.

This cutover exists because the current hybrid approach still allows legacy circle templates to dominate real output. When that happens, scene-level understanding is bypassed and old template semantics can override the prompt, which is exactly how errors like the misplaced `h` keep surviving.

## Problem

The current circle pipeline is half-migrated:

- AI is instructed to produce `circle_scene`
- Python can render `circle_scene`
- a validator exists for `circle_scene`
- but legacy `circle_*` payloads are still treated as acceptable fallback output

That fallback behavior causes two structural problems:

1. If the model fails to emit a valid `circle_scene`, the system can still surface a legacy circle template instead of forcing a corrected scene.
2. Once a legacy template is allowed through, old template semantics can distort the prompt. For example, a center-to-chord distance can be misread as water-depth labeling and still appear "valid enough" to render.

The result is that the system still behaves like a template-first renderer even though the intended architecture is scene-first.

## Decision

For `circles`, `circle_scene` becomes the only valid primary diagram format.

Legacy `circle_*` templates will no longer be accepted as successful output for normal circle generation. If a circle response contains a legacy template instead of `circle_scene`, that response is treated as invalid and repaired or regenerated.

Legacy circle templates may remain in code temporarily for compatibility and renderer support, but they are no longer a valid success state in the circle generation loop.

## Design Goals

1. Make `circle_scene` mandatory for `circles`.
2. Remove legacy circle templates as a normal generation success path.
3. Retry or repair invalid scene output instead of silently falling back.
4. Keep Python rendering deterministic and scene-driven.
5. Preserve strict label rules:
   - no numeric values not present in the prompt
   - no target answer values on the figure
6. Keep the migration local to `circles` without affecting non-circle concepts.

## Non-Goals

1. Do not migrate non-circle geometry in this cutover.
2. Do not remove legacy renderer code from the repository immediately.
3. Do not redesign the overall app architecture beyond the circle path.

## Primary Behavior Change

### Before

- Circle output can be accepted if it is a valid `circle_scene`
- or if it is a legacy `circle_*` payload that slips through fallback checks

### After

- Circle output is accepted only if it contains a valid `circle_scene`
- legacy `circle_*` payloads for `circles` are treated as invalid primary output
- invalid circle output triggers repair/regeneration, not template fallback success

## Pipeline

### Stage 1: Generate scene

For `circles`, the model must output:

```json
{
  "template": "circle_scene",
  "scene": { ... }
}
```

The prompt must explicitly state:

- legacy `circle_*` templates are not allowed as the primary response
- output must be a single `math-diagram` block with `circle_scene`
- the scene must explicitly name points, relations, givens, targets, and display flags

### Stage 2: Validate scene

Validation must reject:

- missing `circle_scene`
- malformed scene schema
- inconsistent arc-side declarations
- missing named points from the prompt
- missing required intersections or tangencies
- derived numeric leakage into display labels
- target values shown on the figure

### Stage 3: Repair/regenerate scene

If the model returns:

- no diagram
- malformed JSON
- a legacy `circle_*` template
- an invalid `circle_scene`

then the repair loop must request a corrected `circle_scene`, not accept the legacy result.

### Stage 4: Render scene in Python

Python renders only the validated scene payload as the main path.

Legacy rendering code may remain available inside the renderer module during migration, but it is no longer considered an acceptable generation endpoint for `circles`.

## Handling Legacy Circle Templates

Legacy circle templates must be reclassified:

- allowed internally as compatibility code
- not allowed as a successful final answer for `circles`

This means:

1. `detectCircleSceneIssues()` should no longer treat legacy circle templates as acceptable success for circle responses.
2. Circle-specific output validation should treat legacy templates as invalid scene output.
3. Repair prompts should explicitly say that legacy circle templates are not acceptable in this flow.

## Prompting Policy

The circle generation prompt should:

1. require `circle_scene`
2. forbid legacy `circle_*` templates in final output
3. require explicit geometric relations
4. require the model to preserve prompt wording such as:
   - major/minor arc
   - center-to-chord distance
   - tangent point
   - intersection point
5. forbid leaking unknown target values into labels

The circle repair prompt should:

1. explain why the previous output failed
2. explicitly say that legacy templates are not allowed
3. request a corrected `circle_scene` only

## Data and Validation Rules

The validator should enforce:

- `conceptId === "circles"`
- `template === "circle_scene"`
- explicit point roles
- explicit named relations
- explicit givens and targets
- no unsupported display labels

If a legacy template is encountered in a circle response, validation should surface a scene error rather than silently allowing fallback success.

## Error Handling

When a circle response is invalid:

1. record the specific reason
2. run the repair prompt
3. validate again
4. if still invalid after bounded retries, surface a controlled failure rather than render guessed geometry

This is intentionally stricter than the current behavior. The aim is to stop wrong circle diagrams from being treated as acceptable just because they are renderable.

## Testing Strategy

### New regression expectations

1. A circle response using legacy `circle_chord` is invalid for `circles`.
2. A circle response using legacy `circle_tangent` is invalid for `circles`.
3. A valid `circle_scene` remains accepted.
4. Repair logic requests `circle_scene` after receiving a legacy template.

### Existing semantic regressions to preserve

1. center-to-chord distance must not be rendered as water depth
2. arc side must match major/minor prompt wording
3. named points and required lines must appear

## Rollout Plan

1. Tighten scene validation so legacy circle templates are no longer treated as success.
2. Tighten output issue detection for `circles`.
3. Tighten circle generation and repair prompts to require `circle_scene` only.
4. Update tests to encode the new contract.
5. Verify with lint, targeted tests, and build.

## Success Criteria

The cutover is successful when:

1. normal `circles` generation no longer succeeds with legacy `circle_*` output
2. invalid circle output triggers repair instead of fallback acceptance
3. valid `circle_scene` still renders through Python
4. known bad cases like the misplaced center-to-chord `h` are blocked upstream

## Risks

1. Short-term failure rate may rise because invalid circle outputs are rejected more often.
2. Some circle prompts may need stronger repair instructions before the new path stabilizes.

These are acceptable tradeoffs because they replace silent wrong diagrams with explicit correction pressure.
