/**
 * mathUtils.ts
 * Shared LaTeX sanitization utility for KaTeX rendering.
 * Used by both LearningAgent.tsx and PracticeCenter.tsx.
 *
 * Fixes all known AI LaTeX formatting errors before rendering.
 */

export function sanitizeMath(text: string): string {

  // ── Step 0: Fix escaped dollar signs ─────────────────────────────────
  // \$ (AI sometimes writes \$ instead of $) → $
  text = text.replace(/\\\$/g, '$');

  // ── Step 1: Remove/replace unsupported commands ───────────────────────
  // \parallelogram → plain text (AI-invented command, not real LaTeX)
  text = text.replace(/\\parallelogram/g, '平行四边形');
  // \backsim → \sim
  text = text.replace(/\\backsim/g, '\\sim');
  // \text{...} — strip wrapper, keep content
  text = text.replace(/\\text\{([^}]*)\}/g, '$1');
  // \implies → \Rightarrow
  text = text.replace(/\\implies/g, '\\Rightarrow');
  // \because / \therefore → plain Chinese
  text = text.replace(/\\because/g, '因为');
  text = text.replace(/\\therefore/g, '所以');
  // \left( \right) → plain parens (KaTeX chokes without matching pairs)
  text = text.replace(/\\left\(/g, '(');
  text = text.replace(/\\right\)/g, ')');
  text = text.replace(/\\left\[/g, '[');
  text = text.replace(/\\right\]/g, ']');

  // ── Step 2: Fix double/triple-dollar at end of inline expression ──────
  // $$$ or more → $ (compress runs of 3+ dollars)
  text = text.replace(/\$\$\$+/g, '$');
  // \cmd letters$$ → $\cmd letters$
  text = text.replace(/\\(triangle|angle|sim|cong|perp|parallel|odot)\s*([A-Za-z]{0,4})\$\$/g,
    (_, cmd, letters) => `$\\${cmd}${letters ? ' ' + letters : ''}$`);
  // $expr$$ → $expr$
  text = text.replace(/(\$[^$\n]+)\$\$/g, '$1$');
  // word$$ → word$ before punctuation
  text = text.replace(/([^$\n])\$\$(\s|;|。|，|）|\))/g,
    (_, before, after) => `${before}$${after}`);

  // ── Step 3: Wrap bare LaTeX commands that are outside $...$ ──────────
  // \odot X
  text = text.replace(/(?<!\$)(?<!\\)\\odot\s*([A-Za-z])/g, '$\\odot $1$');

  // \angle ABC (1–4 letters)
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\angle\s+([A-Za-z]{1,4})/g, '$\\angle $1$');
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\angle([A-Za-z]{1,4})/g, '$\\angle $1$');
  // $\angle XYZ missing closing $
  text = text.replace(/(\$\\angle\s*[A-Za-z]{1,4})([^$\w])/g,
    (_, expr, after) => `${expr}$${after}`);

  // \triangle ABC (2–4 letters)
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\triangle\s+([A-Za-z]{2,4})/g, '$\\triangle $1$');
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\triangle([A-Za-z]{2,4})/g, '$\\triangle $1$');
  // $\triangle XYZ missing closing $
  text = text.replace(/(\$\\triangle\s*[A-Za-z]{2,4})([^$\w])/g,
    (_, expr, after) => `${expr}$${after}`);

  // \parallel
  text = text.replace(/(?<!\$)(?<!\\)\\parallel\s+([A-Za-z]{1,4})/g, '$\\parallel $1$');
  text = text.replace(/(?<!\$)(?<!\\)\\parallel(?![}\s]*[A-Za-z])/g, '$\\parallel$');

  // \perp between identifiers: "CF\perp BE" → "$CF \perp BE$"
  text = text.replace(/([A-Za-z]{1,4})\s*\\perp\s*([A-Za-z]{1,4})/g,
    (_, a, b) => `$${a} \\perp ${b}$`);
  // remaining bare \perp
  text = text.replace(/(?<!\$)(?<!\\)\\perp(?!\})/g, '$\\perp$');

  // \sim standalone
  text = text.replace(/(?<!\$)(?<!\\)\\sim(?![a-z])/g, '$\\sim$');

  // \cong standalone
  text = text.replace(/(?<!\$)(?<!\\)\\cong(?![a-z])/g, '$\\cong$');

  // \overset{\frown}{AB}
  text = text.replace(/(?<!\$)\\overset\{\\frown\}\{([A-Za-z]{2})\}/g,
    '$\\overset{\\frown}{$1}$');

  // ── Step 4: Fix plain-text math symbols written without $ ─────────────
  text = text.replace(/\bodot\s+([A-Z])/g, '$\\odot $1$');
  text = text.replace(/\bperp\b/g, '$\\perp$');
  text = text.replace(/\bparallel\s*([A-Z]{1,3})/g, '$\\parallel $1$');

  // ── Step 5: Clean up mid-line $$ that should be $ ─────────────────────
  // Only collapse inline $$expr$$ (not display math at start of line)
  text = text.replace(/(?<!^)\$\$([^$\n]{1,80})\$\$(?!\n)/gm,
    (_, inner) => `$${inner.trim()}$`);

  return text;
}
