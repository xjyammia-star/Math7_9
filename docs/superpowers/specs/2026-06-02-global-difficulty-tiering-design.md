# Global Difficulty Tiering Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a global exercise-generation rule for every knowledge point in the app so that `Easy`, `Medium`, and `Hard` each have at least 30 exercises, tier boundaries are visibly different, and anything that is currently too easy for `Hard` can be demoted into `Medium` or removed.

**Architecture:** Keep concept-specific template modules as the source of truth for question families and diagram specs, but add a shared tiering contract that every knowledge point must satisfy. Each concept will declare its tier blueprint, family registry, render contract, and minimum pool size. The generator will select from those families using randomized history-aware sampling rather than fixed-order rotation. Validation will reject generated exercises that do not meet the tier contract.

**Tech Stack:** Existing TypeScript/React/Vite app, Node-based tests, shared render-contract validation, template-driven SVG diagram rendering in `MathDiagram.tsx`, and the existing exercise generator flow in `PracticeCenter.tsx` / `geminiService.ts`.

---

## Problem Statement

The current exercise system has improved substantially for some concepts, but it is still inconsistent across the app:

- Some concepts have a strong template-driven flow.
- Some tiers still feel too close to each other.
- Some challenge pools are too small and cycle through the same items in predictable order.
- Some exercises labeled `Hard` are actually only medium-level problems.

The goal is to replace that ad hoc situation with a global policy that is applied to every knowledge point.

## Design Goals

1. Every knowledge point must support three tiers: `Easy`, `Medium`, and `Hard`.
2. Every tier must be able to generate at least 30 exercises per knowledge point.
3. `Hard` must be materially harder than the current challenge pools, not just a relabel of existing medium tasks.
4. If a question family is too easy to justify `Hard`, it must be moved down to `Medium`.
5. Tier boundaries must be visible in both the question text and the diagram spec.
6. Exercise generation must remain programmatic and deterministic in structure, with randomness only in family/variant selection.
7. Validation must fail fast when a generated exercise violates its tier contract.

## Non-Goals

- Do not replace the existing renderer with AI-drawn diagrams.
- Do not build a huge static question bank for every concept.
- Do not add new math topics.
- Do not redesign unrelated UI beyond what is needed for tier selection and display.

## Global Tier Policy

### Tier meaning

The app will standardize tiers across all concepts as follows:

- `Easy`
  - direct recognition
  - one-step substitution
  - clear diagram, minimal hidden information
- `Medium`
  - one additional step beyond direct substitution
  - inverse reasoning, simple rearrangement, or small interpretation step
  - one key quantity may be hidden
- `Hard`
  - multi-step reasoning within the same knowledge point
  - composite figures, hidden conditions, inverse problems, proof/judgment tasks, or surd/exact-form answers where appropriate
  - should feel obviously more demanding than the current medium-level pool

### Promotion and demotion rule

- If a `Hard` family is essentially a direct solve with one visible value missing, it should be demoted to `Medium`.
- If a `Hard` family is only a different scene with the same reasoning as `Easy`, it should be demoted or removed.
- `Hard` should only retain families that require a second layer of reasoning or a distinctly more complex visual interpretation.

This rule applies to every knowledge point, not only area/perimeter or Pythagoras.

## Pool Size Rule

Each knowledge point must provide:

- at least 30 unique exercises for `Easy`
- at least 30 unique exercises for `Medium`
- at least 30 unique exercises for `Hard`

To count as unique, an exercise must differ by more than just raw numeric values. A unique exercise should have a different:

- question family, or
- diagram family, or
- hidden-information pattern, or
- required reasoning step

Numeric variation is allowed, but it cannot be the only source of variety.

## Architecture

### 1. Shared tier contract

A shared tier contract module will define:

- canonical tier names
- localized labels
- minimum pool sizes
- allowed reasoning patterns per tier
- validation helpers for tier/family compatibility

### 2. Concept-level blueprint

Each knowledge point will expose a blueprint with:

- tier family whitelist
- family metadata
- question templates
- diagram spec builders
- render contract fragments
- minimum/maximum variant rules

### 3. History-aware randomized selection

The generator will:

- randomize family order rather than rotate in fixed sequence
- avoid repeating the same family too often
- preserve enough entropy that successive runs do not feel like a loop

### 4. Render validation

Every generated exercise must still be validated against:

- required question text fragments
- required diagram fragments
- required hidden labels
- required visible labels
- prohibited fragments, where needed

If validation fails, the exercise batch must be rejected before rendering to the user.

## Difficulty Blueprint Examples

These are examples of the intended tier shape, not a final exhaustive list for every concept.

### Area & Perimeter

`Easy`
- rectangle direct area / perimeter
- square direct area / perimeter

`Medium`
- reverse rectangle / square inference
- one-step missing-side recovery

`Hard`
- composite shapes
- trapezoid / parallelogram reverse reasoning
- annulus / sector reverse reasoning
- hidden-edge or hidden-height tasks
- multi-step decomposition before computation

### Pythagoras

`Easy`
- direct hypotenuse
- rectangle diagonal
- square diagonal
- ladder height

`Medium`
- one-leg recovery
- coordinate distance
- square side from diagonal

`Hard`
- hidden-information geometry
- auxiliary-angle constructions
- surface shortest path on nets
- reflection/fold problems
- proof/judgment tasks
- surd-form results

The key rule is that any Pythagoras `Hard` item that is really just a medium-level direct solve should be moved down.

## Families vs Variants

The generation system will distinguish between:

- **family**: the structural type of problem
- **variant**: a numeric or presentation instance within that family

This is important because the app should not count 30 numeric swaps of the same family as a good pool.

Example:

- `trapezoid_area_reverse` = family
- `topBase = 4, bottomBase = 8, height = 3` = one variant
- a second trapezoid with different dimensions but same reasoning = another variant

The concept blueprint must make it explicit which dimensions may vary and which structural properties must remain fixed.

## Migration Strategy

The rollout should happen in layers:

1. Define the shared tier contract.
2. Move the existing concept blueprints onto that contract.
3. Expand the easiest-to-standardize knowledge points first.
4. Demote weak `Hard` families into `Medium`.
5. Keep expanding until each tier reaches the 30-exercise minimum.

Recommended migration order:

1. Area & Perimeter
2. Pythagoras
3. Geometry concepts that already have diagram support
4. Remaining topics after the shared contract is proven stable

## Error Handling

- If a concept cannot satisfy the requested tier minimum, generation should fail clearly rather than silently returning a weaker batch.
- If a family is incompatible with its declared tier, validation should reject it before render.
- If a rendered diagram is missing a required visible or hidden label, the batch must fail.
- If a batch appears to be cycling the same items in fixed order, the selection policy must be adjusted rather than accepted.

## Testing Strategy

### Contract tests

Add tests that verify, for each concept:

- each tier produces at least 30 exercises
- each tier contains the expected family types
- `Hard` does not contain families that are clearly medium-level
- the same concept does not keep producing the same ordered cycle

### Render tests

For every family that has a diagram:

- required visible labels are present
- required hidden labels are hidden
- rendered diagram spec matches the intended family
- prohibited fragments do not appear

### Regression tests

Keep the area/perimeter and Pythagoras tests as the first enforcement examples, then extend the same pattern to the next concepts.

## Success Criteria

This design is successful when:

- every supported knowledge point can generate 30 `Easy`, 30 `Medium`, and 30 `Hard` exercises
- `Hard` feels noticeably harder than the current challenge pools
- challenge questions are no longer predictable fixed-order loops
- anything too easy for `Hard` has been demoted or removed
- tests fail when a tier contract is violated

