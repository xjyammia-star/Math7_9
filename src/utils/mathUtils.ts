/**
 * mathUtils.ts — Shared LaTeX sanitization for KaTeX rendering.
 *
 * PHILOSOPHY: Only fix things that are 100% safe to fix without any risk
 * of breaking correctly-formatted text. We do NOT attempt to fix $ pairing
 * because $ is both an opener and closer — regex cannot reliably distinguish
 * them. $ pairing is the AI's responsibility (enforced via prompt).
 *
 * Safe fixes only:
 *   1. Replace AI-invented or forbidden LaTeX command names with valid ones
 *   2. Fix double-backslash (\\cmd → \cmd) — always wrong in output
 *   3. Remove \left( \right) wrappers — KaTeX requires matching pairs
 */

export function sanitizeMath(text: string): string {

  // ── 1. Fix double-backslash commands (\\perp → \perp) ────────────────
  // This happens when AI escapes backslashes, always wrong in LaTeX output
  text = text.replace(
    /\\\\(perp|parallel|triangle|angle|sim|cong|odot|cdot|times|div|frac|sqrt|leq|geq|neq|approx|pi|pm|Rightarrow)/g,
    '\\$1'
  );

  // ── 2. Replace unsupported/invented command names ─────────────────────
  // \parallelogram is not a LaTeX command — AI invented it
  text = text.replace(/\\parallelogram/g, '平行四边形');
  // \backsim → \sim (unsupported in KaTeX)
  text = text.replace(/\\backsim/g, '\\sim');
  // \because / \therefore → plain Chinese (unsupported in KaTeX)
  text = text.replace(/\\because/g, '因为');
  text = text.replace(/\\therefore/g, '所以');
  // \implies → \Rightarrow
  text = text.replace(/\\implies/g, '\\Rightarrow');
  // \text{content} → content (strip wrapper only)
  text = text.replace(/\\text\{([^}]*)\}/g, '$1');

  // ── 3. Remove \left( \right) — KaTeX chokes without matching pairs ────
  text = text.replace(/\\left\s*\(/g, '(');
  text = text.replace(/\\right\s*\)/g, ')');
  text = text.replace(/\\left\s*\[/g, '[');
  text = text.replace(/\\right\s*\]/g, ']');

  return text;
}
