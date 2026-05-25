/**
 * mathUtils.ts - Shared sanitization for AI-generated math text.
 *
 * Safe fixes only:
 *   1. Replace AI-invented or forbidden LaTeX command names with valid ones
 *   2. Fix double-backslash commands (\\cmd -> \cmd)
 *   3. Remove \left( \right) wrappers
 *   4. Normalize common Unicode math symbols inside math regions
 *   5. Clean up math commands that leak into plain text
 */

const LEAKED_MATH_COMMANDS = [
  ['odot', '⊙', '\\odot '],
  ['triangle', '△', '\\triangle '],
  ['angle', '∠', '\\angle '],
  ['perp', '⊥', '\\perp '],
  ['parallel', '∥', '\\parallel '],
  ['cdot', '·', '\\cdot '],
  ['times', '×', '\\times '],
  ['div', '÷', '\\div '],
  ['leq', '≤', '\\leq '],
  ['geq', '≥', '\\geq '],
  ['neq', '≠', '\\neq '],
  ['approx', '≈', '\\approx '],
  ['sim', '∼', '\\sim '],
  ['pi', 'π', '\\pi '],
  ['Rightarrow', '⇒', '\\Rightarrow '],
] as const;

function replaceLeakedCommands(
  text: string,
  replacementFor: (unicode: string, latex: string) => string
): string {
  for (const [command, unicode, latex] of LEAKED_MATH_COMMANDS) {
    const escaped = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startOrNonLetter = new RegExp(`(^|[^A-Za-z])(?:\\\\)?${escaped}(?=[A-Z0-9(])`, 'g');
    const afterUpperOrDigit = new RegExp(`([A-Z0-9)])(?:\\\\)?${escaped}(?=[A-Z0-9(])`, 'g');
    const replacement = replacementFor(unicode, latex);

    text = text.replace(startOrNonLetter, `$1${replacement}`);
    text = text.replace(afterUpperOrDigit, `$1${replacement}`);
  }

  return text;
}

function sanitizeMathFragment(text: string): string {
  text = replaceLeakedCommands(text, (_unicode, latex) => latex);

  text = text.replace(/×/g, '\\times');
  text = text.replace(/÷/g, '\\div');
  text = text.replace(/≤/g, '\\leq');
  text = text.replace(/≥/g, '\\geq');
  text = text.replace(/≠/g, '\\neq');
  text = text.replace(/≈/g, '\\approx');
  text = text.replace(/∼/g, '\\sim');
  text = text.replace(/∠/g, '\\angle');
  text = text.replace(/⊙/g, '\\odot');
  text = text.replace(/⊥/g, '\\perp');
  text = text.replace(/∥/g, '\\parallel');
  text = text.replace(/△/g, '\\triangle');
  text = text.replace(/·/g, '\\cdot');
  text = text.replace(/−/g, '-');
  text = text.replace(/π/g, '\\pi');

  // Fix double-backslash commands (\\perp -> \perp).
  text = text.replace(
    /\\\\(perp|parallel|triangle|angle|sim|cong|odot|cdot|times|div|frac|sqrt|leq|geq|neq|approx|pi|pm|Rightarrow)/g,
    '\\$1'
  );

  // Replace unsupported/invented command names.
  text = text.replace(/\\parallelogram/g, '平行四边形');
  text = text.replace(/\\backsim/g, '\\sim');
  text = text.replace(/\\because/g, '因为');
  text = text.replace(/\\therefore/g, '所以');
  text = text.replace(/\\implies/g, '\\Rightarrow');
  text = text.replace(/\\text\{([^}]*)\}/g, '$1');

  // Remove \left( \right) wrappers.
  text = text.replace(/\\left\s*\(/g, '(');
  text = text.replace(/\\right\s*\)/g, ')');
  text = text.replace(/\\left\s*\[/g, '[');
  text = text.replace(/\\right\s*\]/g, ']');

  return text;
}

function sanitizeProseFragment(text: string): string {
  // These are the common math command leaks we have seen in prose.
  // We only normalize them when they are glued to a symbol-like token so
  // ordinary English words such as "angle" do not get rewritten.
  text = text.replace(/°(?:\\)?circ\b/g, '°');
  text = text.replace(/([0-9])(?:\\)?circ\b/g, '$1°');

  return replaceLeakedCommands(text, (unicode) => unicode);
}

function containsCjk(text: string): boolean {
  return /[\u3400-\u9FFF]/.test(text);
}

export function sanitizeMath(text: string): string {
  if (!text) return '';

  // Safe, whole-string normalization that should not change meaning.
  const normalized = text
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\uFFFD/g, '')
    .replace(/\u00A0/g, ' ');

  // Only sanitize LaTeX-like regions so ordinary prose stays untouched.
  let out = '';
  let i = 0;

  while (i < normalized.length) {
    const ch = normalized[i];

    if (ch !== '$') {
      const nextDollar = normalized.indexOf('$', i);
      const proseEnd = nextDollar === -1 ? normalized.length : nextDollar;
      out += sanitizeProseFragment(normalized.slice(i, proseEnd));
      i = proseEnd;
      continue;
    }

    const isDisplay = normalized[i + 1] === '$';
    const delimiter = isDisplay ? '$$' : '$';
    const start = i + delimiter.length;
    const end = normalized.indexOf(delimiter, start);

    if (end === -1) {
      out += sanitizeProseFragment(normalized.slice(i));
      break;
    }

    const mathBody = normalized.slice(start, end);
    if (containsCjk(mathBody)) {
      out += sanitizeProseFragment(mathBody);
      i = end + delimiter.length;
      continue;
    }

    out += delimiter + sanitizeMathFragment(mathBody) + delimiter;
    i = end + delimiter.length;
  }

  return out;
}
