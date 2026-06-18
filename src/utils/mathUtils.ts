// src/utils/mathUtils.ts

/**
 * Sanitizes LaTeX math expressions for safe rendering with KaTeX/rehype-katex.
 * Also auto-wraps bare LaTeX commands outside math delimiters.
 *
 * v2 changes:
 *  - ALL fenced code blocks (``` ... ```) are extracted FIRST and restored LAST,
 *    so diagram JSON can never be mangled by any fixing step.
 *  - "angle" keyword fix now requires an uppercase point name (or digit) and a
 *    word boundary on the left, so English words like "rectangle" / "angles"
 *    are never corrupted.
 *  - Added fixes for: cong / sim, frac, sqrt{...}, N^circ outside math,
 *    unicode math symbols inside $...$ (∠ △ ⊙ ∥ ⊥ ° ≌ ∽ ≤ ≥ ≠ × ÷ π),
 *    and merging of split relations like "$AB$∥$CD$" -> "$AB \parallel CD$".
 */
export function sanitizeMath(content: string): string {
  if (!content) return '';

  // ── Step 0: extract ALL fenced code blocks so nothing below can touch them ──
  const fences: string[] = [];
  let result = content.replace(/```[\s\S]*?```/g, (m) => {
    fences.push(m);
    return `\x01F${fences.length - 1}\x01`;
  });

  // Fix escaped brackets used as math delimiters
  result = result.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  result = result.replace(/\\\(/g, '$').replace(/\\\)/g, '$');

  // Remove zero-width spaces
  result = result.replace(/\u200b/g, '');

  // Step 1a: Fix commands with backslash but missing $ (\angle -> $\angle$)
  result = fixBareBackslashCommands(result);

  // Step 1b: Fix AI bare-keyword errors outside $...$ (odotO -> $\odot O$, etc.)
  result = fixBareKeywords(result);

  // Step 2: Fix bare keywords / unicode INSIDE $...$  ($angle APB$, $△ABC$ ...)
  result = fixInsideMath(result);

  // Step 3: Auto-wrap bare LaTeX commands not yet in $...$
  result = autoWrapBareLaTeX(result);

  // Step 4: Merge relations split across two math regions: "$AB$ ∥ $CD$" -> "$AB \parallel CD$"
  result = mergeSplitRelations(result);

  // Normalize display math blocks (remove extra spaces inside $$...$$)
  result = result.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_, math) => `$$${math.trim()}$$`);

  // Normalize inline math (remove extra spaces inside $...$)
  result = result.replace(/\$([^$\n]+?)\$/g, (_, math) => `$${math.trim()}$`);

  // ── Final step: restore fenced code blocks untouched ──
  result = result.replace(/\x01F(\d+)\x01/g, (_, i) => fences[Number(i)] ?? '');

  return result;
}

/**
 * Merges relations that were split across two adjacent math regions,
 * e.g. "$AB$∥$CD$" or "$\triangle ABC$ cong $\triangle DEF$".
 * The pattern "...$ <op> $..." removes the inner pair of $ and inserts
 * the proper LaTeX command, producing a single balanced math region.
 */
function mergeSplitRelations(text: string): string {
  const MERGE: Record<string, string> = {
    '∥': '\\parallel', '⊥': '\\perp', '≌': '\\cong', '∽': '\\sim',
    'parallel': '\\parallel', 'perp': '\\perp', 'cong': '\\cong', 'sim': '\\sim',
    '=': '=', '≠': '\\neq', '>': '>', '<': '<', '≥': '\\geq', '≤': '\\leq',
  };
  return text.replace(
    /\$\s*(∥|⊥|≌|∽|≠|≥|≤|=|>|<|parallel|perp|cong|sim)\s*\$/g,
    (_m: string, op: string) => ` ${MERGE[op] ?? op} `
  );
}

/**
 * Finds bare LaTeX commands/expressions outside math delimiters and wraps them in $...$
 */
function autoWrapBareLaTeX(text: string): string {
  // Split by existing math regions to avoid double-processing
  // Regions: $$...$$ or $...$
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    // Process the text before this math region
    parts.push(wrapBareLaTeXInSegment(text.slice(lastIndex, match.index)));
    // Keep the math region as-is
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  // Process the remaining text
  parts.push(wrapBareLaTeXInSegment(text.slice(lastIndex)));

  return parts.join('');
}

/**
 * In a plain-text segment (outside existing $ delimiters),
 * find and wrap LaTeX expressions.
 */
function wrapBareLaTeXInSegment(segment: string): string {
  if (!segment) return segment;

  const patterns = [
    // \odot, \angle, \triangle, \parallel, \perp, \sim, \cong etc. followed by optional letters
    /\\(?:odot|angle|triangle|parallel|perp|sim|cong|because|therefore|cdots|ldots|infty|pi|alpha|beta|gamma|theta|lambda|mu|sigma|omega)\s*[A-Za-z]{0,4}/g,
    // \frac{...}{...}
    /\\frac\{[^{}]*\}\{[^{}]*\}/g,
    // \sqrt{...}
    /\\sqrt\{[^{}]*\}/g,
    // Expressions like ∠EAD = 25° or ∠C = 40° — angle with unicode symbol
    /[∠△⊙]\s*[A-Za-z0-9]+(?:\s*=\s*[\d.]+\s*°?)?/g,
  ];

  let result = segment;
  for (const pattern of patterns) {
    result = result.replace(pattern, (match) => `$${match.trim()}$`);
  }

  return result;
}

/**
 * Fixes AI-generated "bare English keyword" errors where the model wrote
 * e.g. odotO instead of $\odot O$, or angleABC instead of $\angle ABC$,
 * or ABperpCD instead of $AB \perp CD$, or sqrt10 instead of $\sqrt{10}$.
 */
function fixBareKeywords(text: string): string {
  // Protect existing math regions from being double-processed
  // (code fences were already extracted in sanitizeMath step 0)
  const protectedRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts: string[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = protectedRegex.exec(text)) !== null) {
    parts.push(fixKeywordsInSegment(text.slice(lastIndex, m.index)));
    parts.push(m[0]);
    lastIndex = m.index + m[0].length;
  }
  parts.push(fixKeywordsInSegment(text.slice(lastIndex)));
  return parts.join('');
}

function fixKeywordsInSegment(seg: string): string {
  if (!seg) return seg;
  let s = seg;

  // ── triangle / Rt triangle (MUST run BEFORE angle regex!) ───────────────
  // "triangle" contains "angle" at position 3, so triangle must be replaced first
  // RtriangleABC / Rt TriangleABC -> $Rt\triangle ABC$
  s = s.replace(/Rt\s*[Tt]?riangle\s*([A-Za-z]{2,4})/g,
    (_: string, pts: string) => `$Rt\\triangle ${pts}$`
  );
  // Rt△ABC -> $Rt\triangle ABC$
  s = s.replace(/Rt\s*[△]\s*([A-Za-z]{2,4})/g,
    (_: string, pts: string) => `$Rt\\triangle ${pts}$`
  );
  // △rianglePDE (AI omitted 't') or △PDE -> $\triangle PDE$
  s = s.replace(/[△]\s*(?:riangle\s*)?([A-Za-z]{2,4})/g,
    (_: string, pts: string) => `$\\triangle ${pts}$`
  );
  // triangleABC / TriangleABC -> $\triangle ABC$
  // (requires point letters immediately after, so "equilateral triangle" in
  //  prose is untouched)
  s = s.replace(/(?<![A-Za-z\\$])[Tt]riangle\s*([A-Z][A-Za-z]{1,3})/g,
    (_: string, pts: string) => `$\\triangle ${pts}$`
  );
  // riangleABC (AI dropped the 't' entirely, no △ prefix) -> $\triangle ABC$
  s = s.replace(/(?<![A-Za-z$\\])riangle\s*([A-Za-z]{2,4})/g,
    (_: string, pts: string) => `$\\triangle ${pts}$`
  );

  // ── odot ──────────────────────────────────────────────────────────────────
  // odotO / odot O (no \b on right since may be followed by Chinese)
  s = s.replace(/(?<![A-Za-z\\$])odot\s*([A-Za-z])/g, (_: string, p: string) => `$\\odot ${p}$`);

  // ── angle with degree value (must run BEFORE bare-angle) ──────────────────
  // angleCDE = 56°irc / anglePAD = 62°irc / angleACB = 90° / angleACB = 90circ / angle1 = 30°
  // Requires UPPERCASE point name or a digit, plus a left word boundary, so
  // "rectangle", "angles", "Bangle" etc. can never be corrupted.
  s = s.replace(/(?<![A-Za-z\\$])angle\s*([A-Z][A-Za-z]{0,3}|\d)\s*=\s*(\d+(?:\.\d+)?)\s*(°irc|°\s*irc|circ|°)/g,
    (_: string, pts: string, deg: string) => `$\\angle ${pts} = ${deg}^\\circ$`
  );

  // ── bare angle (no degree value) ──────────────────────────────────────────
  // angleABC / angle ABC / angleE / angle1
  s = s.replace(/(?<![A-Za-z\\$])angle\s*([A-Z][A-Za-z]{0,3}|\d)(?!\s*=)/g,
    (_: string, pts: string) => `$\\angle ${pts}$`
  );

  // ── perp ──────────────────────────────────────────────────────────────────
  s = s.replace(/([A-Za-z]{1,3})\s*perp\s*([A-Za-z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\perp ${b}$`
  );
  // unicode ⊥ between two plain segment names: AB⊥CD
  s = s.replace(/([A-Z]{1,3})\s*⊥\s*([A-Z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\perp ${b}$`
  );

  // ── parallel ──────────────────────────────────────────────────────────────
  s = s.replace(/([A-Za-z]{1,3})\s*parallel\s*([A-Za-z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\parallel ${b}$`
  );
  s = s.replace(/(?<![A-Za-z\\$])parallel\s*([A-Za-z]{1,3})/g,
    (_: string, b: string) => `$\\parallel ${b}$`
  );
  // unicode ∥ between two plain segment names: AB∥CD
  s = s.replace(/([A-Z]{1,3})\s*∥\s*([A-Z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\parallel ${b}$`
  );

  // ── cong (≌) and sim (∽) between point groups ────────────────────────────
  // Note: triangles were already converted above, so this catches leftovers
  // like "ABC cong DEF". The merge step handles "$...$ cong $...$".
  s = s.replace(/([A-Z]{2,4})\s*cong\s*([A-Z]{2,4})/g,
    (_: string, a: string, b: string) => `$${a} \\cong ${b}$`
  );
  s = s.replace(/([A-Z]{2,4})\s*sim\s*([A-Z]{2,4})/g,
    (_: string, a: string, b: string) => `$${a} \\sim ${b}$`
  );

  // ── frac ──────────────────────────────────────────────────────────────────
  // frac{a}{b} without backslash, outside $
  s = s.replace(/(?<![A-Za-z\\$])frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,
    (_: string, a: string, b: string) => `$\\frac{${a}}{${b}}$`
  );

  // ── sqrt ──────────────────────────────────────────────────────────────────
  // Bare "sqrt" (no backslash), with an optional leading coefficient. Wrap the
  // whole expression in one $ so "2sqrt13" → $2\sqrt{13}$ (not "2 √13").
  s = s.replace(/(?<![A-Za-z\\$])(\d+(?:\.\d+)?)?\s*sqrt\s*\{([^{}]+)\}/g,
    (_: string, coef: string | undefined, n: string) => `$${coef ?? ''}\\sqrt{${n}}$`
  );
  s = s.replace(/(?<![A-Za-z\\$])(\d+(?:\.\d+)?)?\s*sqrt\s*\(?(\d+(?:\.\d+)?)\)?/g,
    (_: string, coef: string | undefined, n: string) => `$${coef ?? ''}\\sqrt{${n}}$`
  );
  // ── unicode √ (with optional coefficient): 2√13 → $2\sqrt{13}$ ──
  s = s.replace(/(\d+(?:\.\d+)?)?\s*√\s*\{?(\d+(?:\.\d+)?|[A-Za-z])\}?/g,
    (_: string, coef: string | undefined, n: string) => `$${coef ?? ''}\\sqrt{${n}}$`
  );

  // ── degree variants ───────────────────────────────────────────────────────
  // 45^circ / 45^{circ} WITHOUT backslash, outside math (run before plain "Ncirc").
  // NOTE: must NOT match an already-correct "25^\circ" produced by earlier rules.
  s = s.replace(/(\d+(?:\.\d+)?)\s*\^\s*\{?circ\}?/g,
    (_: string, n: string) => `$${n}^\\circ$`);
  s = s.replace(/(\d+(?:\.\d+)?)\s*circ\b/g, (_: string, n: string) => `$${n}^\\circ$`);
  s = s.replace(/(\d+(?:\.\d+)?)°irc\b/g, (_: string, n: string) => `$${n}^\\circ$`);
  s = s.replace(/(\d+(?:\.\d+)?)°/g, (_: string, n: string) => `$${n}^\\circ$`);

  return s;
}


/**
 * Fixes bare LaTeX keywords AND unicode math symbols INSIDE existing $...$
 * delimiters. AI sometimes writes $angle APB$, $△ABC$ or $25°$, which KaTeX
 * cannot render. This fixes them without double-wrapping.
 */
function fixInsideMath(text: string): string {
  return text.replace(/\$([^$\n]+?)\$/g, (_: string, inner: string) => {
    let s = inner;

    // ── unicode -> LaTeX (KaTeX cannot render most of these in math mode) ──
    s = s.replace(/∠\s*/g, '\\angle ');
    s = s.replace(/△\s*/g, '\\triangle ');
    s = s.replace(/⊙\s*/g, '\\odot ');
    s = s.replace(/∥/g, ' \\parallel ');
    s = s.replace(/⊥/g, ' \\perp ');
    s = s.replace(/≌/g, ' \\cong ');
    s = s.replace(/∽/g, ' \\sim ');
    s = s.replace(/≥/g, ' \\geq ');
    s = s.replace(/≤/g, ' \\leq ');
    s = s.replace(/≠/g, ' \\neq ');
    s = s.replace(/×/g, ' \\times ');
    s = s.replace(/÷/g, ' \\div ');
    s = s.replace(/π/g, '\\pi ');
    s = s.replace(/°/g, '^\\circ ');
    // unicode √13 / √{13} inside math → \sqrt{13}
    s = s.replace(/√\s*\{([^{}]+)\}/g, '\\sqrt{$1}');
    s = s.replace(/√\s*(\d+(?:\.\d+)?|[A-Za-z])/g, '\\sqrt{$1}');

    // ── bare keywords (not preceded by backslash or letter) ──
    // Rt triangle inside math: Rt triangleABC / RtriangleABC
    s = s.replace(/Rt\s*[Tt]?riangle\b/g, 'Rt\\triangle');
    s = s.replace(/(?<![A-Za-z\\])triangle\b/g, '\\triangle');
    s = s.replace(/(?<!\\)odot\b/g, '\\odot');
    s = s.replace(/(?<![A-Za-z\\])angle\b/g, '\\angle');
    s = s.replace(/(?<![A-Za-z\\])parallel\b/g, '\\parallel');
    s = s.replace(/(?<![A-Za-z\\])perp\b/g, '\\perp');
    s = s.replace(/(?<![A-Za-z\\])cong\b/g, '\\cong');
    s = s.replace(/(?<![A-Za-z\\])sim\b/g, '\\sim');
    s = s.replace(/(?<![A-Za-z\\])sqrt\s*\{/g, '\\sqrt{');
    s = s.replace(/(?<![A-Za-z\\])sqrt\s*(\d+(?:\.\d+)?)/g, '\\sqrt{$1}');
    s = s.replace(/(?<![A-Za-z\\])frac\s*\{/g, '\\frac{');
    s = s.replace(/(?<![A-Za-z\\])times\b/g, '\\times');
    s = s.replace(/(?<![A-Za-z\\])cdot\b/g, '\\cdot');
    s = s.replace(/(?<![A-Za-z\\])leq\b/g, '\\leq');
    s = s.replace(/(?<![A-Za-z\\])geq\b/g, '\\geq');
    s = s.replace(/(?<![A-Za-z\\])neq\b/g, '\\neq');
    s = s.replace(/(?<![A-Za-z\\])pi\b/g, '\\pi');

    // Fix circ variants: ^circ ^{circ} bare circ -> ^\circ
    s = s.replace(/\^\s*\\?\{?circ\}?/g, '^\\circ');
    s = s.replace(/(?<!\^)(?<!\\)\bcirc\b/g, '^\\circ');

    // Double backslash inside math -> single (\\angle -> \angle)
    s = s.replace(/\\\\(angle|odot|triangle|parallel|perp|cong|sim|frac|sqrt|circ|times|cdot|pi|leq|geq|neq)/g, '\\$1');

    // Collapse accidental double spaces created above
    s = s.replace(/\s{2,}/g, ' ');

    return `$${s.trim()}$`;
  });
}

/**
 * Fixes LaTeX commands that have backslash but are missing $ delimiters.
 * AI sometimes writes \angle PAB = 45^\circ (with backslash but no $).
 * This step runs BEFORE fixBareKeywords to handle this case.
 */
function fixBareBackslashCommands(text: string): string {
  const protected_: string[] = [];
  let idx = 0;
  // Protect existing $...$ and $$...$$ blocks
  let safe = text.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g, (m) => {
    protected_.push(m);
    return `\x00${idx++}\x00`;
  });

  // \angle XYZ = N^\circ  ->  $\angle XYZ = N^\circ$
  safe = safe.replace(/\\angle\s*([A-Za-z]{1,4}|\d)\s*=\s*(\d+(?:\.\d+)?)\s*\^?\s*\\?circ/g,
    (_: string, pts: string, deg: string) => `$\\angle ${pts} = ${deg}^\\circ$`);
  // \angle XYZ = N°  ->  $\angle XYZ = N^\circ$
  safe = safe.replace(/\\angle\s*([A-Za-z]{1,4}|\d)\s*=\s*(\d+(?:\.\d+)?)\s*°/g,
    (_: string, pts: string, deg: string) => `$\\angle ${pts} = ${deg}^\\circ$`);
  // bare \angle XYZ
  safe = safe.replace(/\\angle\s*([A-Za-z]{1,4}|\d)(?!\s*=)/g,
    (_: string, pts: string) => `$\\angle ${pts}$`);
  // \odot X
  safe = safe.replace(/\\odot\s*([A-Za-z])/g,
    (_: string, p: string) => `$\\odot ${p}$`);
  // XY\parallel ZW
  safe = safe.replace(/([A-Za-z]{1,3})\s*\\parallel\s*([A-Za-z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\parallel ${b}$`);
  // standalone \parallel X
  safe = safe.replace(/\\parallel\s*([A-Za-z]{1,3})/g,
    (_: string, b: string) => `$\\parallel ${b}$`);
  // XY\perp ZW
  safe = safe.replace(/([A-Za-z]{1,3})\s*\\perp\s*([A-Za-z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\perp ${b}$`);
  // \triangle XYZ
  safe = safe.replace(/\\triangle\s*([A-Za-z]{2,4})/g,
    (_: string, pts: string) => `$\\triangle ${pts}$`);
  // bare 45^\circ (backslash present, $ missing)
  safe = safe.replace(/(\d+(?:\.\d+)?)\s*\^\s*\\circ/g,
    (_: string, n: string) => `$${n}^\\circ$`);
  // \sqrt with an optional leading coefficient — wrap the WHOLE thing in one $.
  // Handles: 2\sqrt{13}  \sqrt{13}  2\sqrt13  \sqrt13
  // (coefficient stays inside the math so it renders as 2√13, not "2 √13")
  safe = safe.replace(/(\d+(?:\.\d+)?)?\s*\\sqrt\s*(?:\{([^{}]+)\}|(\d+(?:\.\d+)?))/g,
    (_: string, coef: string | undefined, braced: string | undefined, bare: string | undefined) => {
      const inner = braced ?? bare ?? '';
      return `$${coef ?? ''}\\sqrt{${inner}}$`;
    });
  // \frac{...}{...}
  safe = safe.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,
    (_: string, a: string, b: string) => `$\\frac{${a}}{${b}}$`);

  // Restore protected blocks
  protected_.forEach((p, i) => { safe = safe.replace(`\x00${i}\x00`, p); });
  return safe;
}
