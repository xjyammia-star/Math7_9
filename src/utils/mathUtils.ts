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

  // Auto-wrap bare LaTeX math patterns that are outside $ delimiters
  // Match things like \odot, \angle, \triangle, \frac{}{}, \sqrt{} etc. not already in $...$
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
