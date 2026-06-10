// src/utils/mathUtils.ts

/**
 * Sanitizes LaTeX math expressions for safe rendering with KaTeX/rehype-katex.
 * Also auto-wraps bare LaTeX commands outside math delimiters.
 */
export function sanitizeMath(content: string): string {
  if (!content) return '';

  let result = content;

  // Fix escaped brackets used as math delimiters
  result = result.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  result = result.replace(/\\\(/g, '$').replace(/\\\)/g, '$');

  // Remove zero-width spaces
  result = result.replace(/\u200b/g, '');

  // Step 1: Fix AI bare-keyword errors (odotO -> $\odot O$, angleABC -> $\angle ABC$, etc.)
  result = fixBareKeywords(result);

  // Step 2: Auto-wrap bare LaTeX commands not yet in $...$
  result = autoWrapBareLaTeX(result);

  // Normalize display math blocks (remove extra spaces inside $$...$$)
  result = result.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_, math) => `$$${math.trim()}$$`);

  // Normalize inline math (remove extra spaces inside $...$)
  result = result.replace(/\$([^$\n]+?)\$/g, (_, math) => `$${math.trim()}$`);

  return result;
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

  // Pattern: match sequences that look like LaTeX math expressions
  // Covers: \cmd, \cmd{...}, expressions with ^, _, fractions, etc.
  // We look for runs that start with \ or contain ^ _ and have no spaces between tokens
  
  // Specific patterns to auto-wrap:
  const patterns = [
    // \odot, \angle, \triangle, \parallel, \perp, \sim, \cong etc. followed by optional letter
    /\\(?:odot|angle|triangle|parallel|perp|sim|cong|because|therefore|cdots|ldots|infty|pi|alpha|beta|gamma|theta|lambda|mu|sigma|omega)\s*[A-Za-z]?/g,
    // \frac{...}{...}
    /\\frac\{[^{}]*\}\{[^{}]*\}/g,
    // \sqrt{...}
    /\\sqrt\{[^{}]*\}/g,
    // Expressions like ∠EAD = 25° or ∠C = 40° — angle with unicode symbol
    /[∠△⊙]\s*[A-Za-z]+(?:\s*=\s*[\d°]+)?/g,
  ];

  let result = segment;
  for (const pattern of patterns) {
    result = result.replace(pattern, (match) => {
      // Don't double-wrap
      return `$${match.trim()}$`;
    });
  }

  return result;
}

/**
 * Fixes AI-generated "bare English keyword" errors where the model wrote
 * e.g. odotO instead of $\odot O$, or angleABC instead of $\angle ABC$,
 * or ABperpCD instead of $AB \perp CD$, or sqrt10 instead of $\sqrt{10}$.
 */
function fixBareKeywords(text: string): string {
  // Protect existing math regions and code blocks from being double-processed
  const protectedRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
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
  // RtriangleABC / Rt triangleABC -> $Rt\triangle ABC$
  s = s.replace(/Rt\s*triangle\s*([A-Za-z]{2,4})/g,
    (_: string, pts: string) => `$Rt\\triangle ${pts}$`
  );
  // triangleABC / triangle ABC -> $\triangle ABC$
  s = s.replace(/triangle\s*([A-Za-z]{2,4})/g,
    (_: string, pts: string) => `$\\triangle ${pts}$`
  );

  // ── odot ──────────────────────────────────────────────────────────────────
  // odotO / odot O (no \b since may follow Chinese characters)
  s = s.replace(/odot\s*([A-Za-z])/g, (_: string, p: string) => `$\\odot ${p}$`);

  // ── angle with degree value (must run BEFORE bare-angle) ──────────────────
  // angleCDE = 56°irc / anglePAD = 62°irc / angleACB = 90° / angleACB = 90circ
  s = s.replace(/angle([A-Za-z]{1,4})\s*=\s*(\d+)\s*(°irc|°\s*irc|circ|°)/g,
    (_: string, pts: string, deg: string) => `$\\angle ${pts} = ${deg}^\\circ$`
  );

  // ── bare angle (no degree value) ──────────────────────────────────────────
  // angleABC / angle ABC / angleE
  s = s.replace(/angle([A-Za-z]{1,4})(?!\s*=)/g,
    (_: string, pts: string) => `$\\angle ${pts}$`
  );

  // ── perp ──────────────────────────────────────────────────────────────────
  s = s.replace(/([A-Za-z]{1,3})\s*perp\s*([A-Za-z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\perp ${b}$`
  );

  // ── parallel ──────────────────────────────────────────────────────────────
  s = s.replace(/([A-Za-z]{1,3})\s*parallel\s*([A-Za-z]{1,3})/g,
    (_: string, a: string, b: string) => `$${a} \\parallel ${b}$`
  );
  s = s.replace(/parallel\s*([A-Za-z]{1,3})/g,
    (_: string, b: string) => `$\\parallel ${b}$`
  );

  // ── sqrt ──────────────────────────────────────────────────────────────────
  s = s.replace(/sqrt\s*\(?([0-9.]+)\)?/g,
    (_: string, n: string) => `$\\sqrt{${n}}$`
  );

  // ── degree variants ───────────────────────────────────────────────────────
  s = s.replace(/(\d+)\s*circ\b/g, (_: string, n: string) => `$${n}^\\circ$`);
  s = s.replace(/(\d+)°irc\b/g, (_: string, n: string) => `$${n}^\\circ$`);
  s = s.replace(/(\d+)°(?![^$]*?\})/g, (_: string, n: string) => `$${n}^\\circ$`);

  return s;
}

