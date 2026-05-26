const RAW_LATEX_PATTERNS = [
  /\\frac\{[^{}]+\}\{[^{}]+\}/,
  /\\sqrt\{[^{}]+\}/,
  /\\(?:pi|times|div|leq|geq|neq|approx|sin|cos|tan|angle|triangle|perp|parallel|odot|cdot|Rightarrow)\b/,
];

function countUnescapedDollarSigns(text) {
  const matches = String(text ?? '').match(/(^|[^\\])\$/g);
  return matches ? matches.length : 0;
}

function containsRawLatexOutsideMath(text) {
  const source = String(text ?? '');
  let inMath = false;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '$' && source[i - 1] !== '\\') {
      inMath = !inMath;
      continue;
    }

    if (!inMath) {
      for (const pattern of RAW_LATEX_PATTERNS) {
        const prefix = source.slice(i);
        const match = prefix.match(pattern);
        if (match && match.index === 0) return true;
      }
    }
  }

  return false;
}

function isSuspiciousMathBody(body) {
  const trimmed = String(body ?? '').trim();
  if (!trimmed) return false;

  if (/\\(?:frac|sqrt|pi|times|div|leq|geq|neq|approx|sin|cos|tan|angle|triangle|perp|parallel|odot|cdot|Rightarrow)\b/.test(trimmed)) {
    return false;
  }

  if (/[=^_*/<>]/.test(trimmed)) return false;
  if (/\d+\s*\/\s*\d+/.test(trimmed)) return false;

  const words = trimmed.match(/[A-Za-z]{2,}/g) || [];
  const wordCount = words.length;
  const tokenCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (wordCount >= 2) return true;
  if (tokenCount >= 4 && /[A-Za-z]/.test(trimmed)) return true;

  return false;
}

export function normalizeTutorPlainText(text) {
  return String(text ?? '')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\(pi|times|div|leq|geq|neq|approx|sin|cos|tan|angle|triangle|perp|parallel|odot|cdot|Rightarrow)\b/g, (_m, cmd) => {
      const map = {
        pi: 'π',
        times: '×',
        div: '÷',
        leq: '≤',
        geq: '≥',
        neq: '≠',
        approx: '≈',
        sin: 'sin',
        cos: 'cos',
        tan: 'tan',
        angle: '∠',
        triangle: '△',
        perp: '⊥',
        parallel: '∥',
        odot: '⊙',
        cdot: '·',
        Rightarrow: '⇒',
      };
      return map[cmd] ?? cmd;
    })
    .replace(/\\left\s*\(/g, '(')
    .replace(/\\right\s*\)/g, ')')
    .replace(/\\left\s*\[/g, '[')
    .replace(/\\right\s*\]/g, ']')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\$/g, '');
}

export function shouldRenderTutorContentWithMath(text) {
  const source = String(text ?? '');
  if (countUnescapedDollarSigns(source) % 2 !== 0) return false;
  if (containsRawLatexOutsideMath(source)) return false;

  const inlineMathBodies = source.match(/\$([^$\n]+)\$/g) || [];
  if (inlineMathBodies.some((match) => isSuspiciousMathBody(match.slice(1, -1)))) {
    return false;
  }

  return inlineMathBodies.length > 0;
}
