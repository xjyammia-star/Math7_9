const ALGEBRA_EXPRESSIONS_CONCEPT_IDS = new Set(['algebra-expressions']);
const HISTORY_KEY = 'math7-9:algebra-expressions-qbank-history:v1';
const HISTORY_LIMIT = 120;

const MEMORY_HISTORY = {};

function getStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    return null;
  }
  return null;
}

function readHistoryMap() {
  const storage = getStorage();
  if (!storage) return MEMORY_HISTORY;
  try {
    const raw = storage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeHistoryMap(next) {
  const storage = getStorage();
  if (!storage) {
    Object.assign(MEMORY_HISTORY, next);
    return;
  }
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function readRecentKinds(historyKey) {
  const history = readHistoryMap();
  return Array.isArray(history[historyKey]) ? history[historyKey] : [];
}

function writeRecentKinds(historyKey, kinds) {
  if (!Array.isArray(kinds) || kinds.length === 0) return;
  const history = readHistoryMap();
  const previous = Array.isArray(history[historyKey]) ? history[historyKey] : [];
  history[historyKey] = [...previous, ...kinds].slice(-HISTORY_LIMIT);
  writeHistoryMap(history);
}

function t(lang, zh, en) {
  return String(lang ?? 'zh').toLowerCase().startsWith('zh') ? zh : en;
}

function normalizeDifficulty(difficulty) {
  const text = String(difficulty ?? 'Easy').toLowerCase();
  if (text.includes('hard')) return 'Hard';
  if (text.includes('medium')) return 'Medium';
  return 'Easy';
}

function absInt(seed, offset, spread) {
  return offset + (Math.abs(seed) % spread);
}

function decimalText(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(6))).replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
}

function formatQuestion(index, question) {
  return `${index + 1}. ${question}`;
}

function buildQuestion(kind, seed, occurrence, lang, difficulty) {
  const bump = occurrence * 2;
  const a = 2 + (seed % 5) + bump;
  const b = 3 + ((seed + 1) % 5) + bump;
  const c = 4 + ((seed + 2) % 5) + bump;
  const d = 5 + ((seed + 3) % 4) + bump;

  switch (kind) {
    case 'collect_like_terms': {
      const x = 2 + (seed % 4) + occurrence;
      const y = 3 + ((seed + 1) % 4) + occurrence;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${x}a + ${y}b - 2a + b - ${x + y}，化简并比较当 a=2、b=1 时的值。`, `Given ${x}a + ${y}b - 2a + b - ${x + y}, simplify it and compare the value when a=2 and b=1.`),
          answer: `${x - 2}a + ${y + 1}b - ${x + y}`,
        };
      }
      return {
        question: t(lang, `化简：${x}a + ${y}b - 2a + b。`, `Simplify: ${x}a + ${y}b - 2a + b.`),
        answer: `${x - 2}a + ${y + 1}b`,
      };
    }
    case 'expand_brackets': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 x=2，比较展开前后：${a}(x+${b})，再代入求值。`, `Given x=2, expand ${a}(x+${b}) and then evaluate it.`),
          answer: `${a}x + ${a * b}`,
        };
      }
      return {
        question: t(lang, `展开：${a}(x+${b})。`, `Expand: ${a}(x+${b}).`),
        answer: `${a}x + ${a * b}`,
      };
    }
    case 'expand_two_brackets': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 (x+${a})(x+${b})，若 x=1，求展开式的值，再反求常数项。`, `Given (x+${a})(x+${b}), evaluate the expanded form at x=1 and then identify the constant term.`),
          answer: `x² + ${(a + b)}x + ${a * b}`,
        };
      }
      return {
        question: t(lang, `展开： (x+${a})(x+${b})。`, `Expand: (x+${a})(x+${b}).`),
        answer: `x² + ${(a + b)}x + ${a * b}`,
      };
    }
    case 'substitute_value': {
      const x = 2 + (seed % 5);
      const y = 3 + ((seed + 1) % 5);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 x=${x}、y=${y}，先计算 ${a}x - ${b}y + ${c}，再比较结果是否大于 ${d}。`, `Given x=${x} and y=${y}, calculate ${a}x - ${b}y + ${c} and compare it with ${d}.`),
          answer: String(a * x - b * y + c),
        };
      }
      return {
        question: t(lang, `已知 x=${x}、y=${y}，求 ${a}x - ${b}y + ${c}。`, `Given x=${x} and y=${y}, evaluate ${a}x - ${b}y + ${c}.`),
        answer: String(a * x - b * y + c),
      };
    }
    case 'translate_words': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `把“一个数的 ${a} 倍减去 ${b}，再加上 ${c}”翻译成代数式，并把这个数记为 x 后求值。`, `Translate "a number multiplied by ${a}, minus ${b}, then plus ${c}" into an algebraic expression and evaluate it when the number is x.`),
          answer: `${a}x - ${b} + ${c}`,
        };
      }
      return {
        question: t(lang, `把“一个数的 ${a} 倍减去 ${b}”翻译成代数式。`, `Translate "a number multiplied by ${a} minus ${b}" into an algebraic expression.`),
        answer: `${a}x - ${b}`,
      };
    }
    case 'compare_expressions': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 x=${a}，比较 ${b}(x+1) 和 ${b}x+${b}，再说明它们是否恒等。`, `Given x=${a}, compare ${b}(x+1) and ${b}x+${b}, then explain whether they are identical.`),
          answer: '相等',
        };
      }
      return {
        question: t(lang, `比较 ${b}(x+1) 和 ${b}x+${b}。`, `Compare ${b}(x+1) and ${b}x+${b}.`),
        answer: '相等',
      };
    }
    case 'simplify_then_evaluate': {
      const x = 1 + (seed % 4);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `先化简 ${a}x + ${b}x - ${c}，再代入 x=${x} 求值。`, `First simplify ${a}x + ${b}x - ${c}, then evaluate it at x=${x}.`),
          answer: String((a + b) * x - c),
        };
      }
      return {
        question: t(lang, `先化简 ${a}x + ${b}x - ${c}。`, `Simplify ${a}x + ${b}x - ${c}.`),
        answer: `${a + b}x - ${c}`,
      };
    }
    case 'equivalent_expression': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${a}(x+${b}) 与 ${a}x+${a * b}，比较它们在任意 x 下是否相同。`, `Given ${a}(x+${b}) and ${a}x+${a * b}, compare whether they are identical for all x.`),
          answer: '相同',
        };
      }
      return {
        question: t(lang, `判断 ${a}(x+${b}) 和 ${a}x+${a * b} 是否相同。`, `Determine whether ${a}(x+${b}) and ${a}x+${a * b} are equivalent.`),
        answer: '相同',
      };
    }
    case 'factor_common': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${a}x + ${a * b}，先提取公因式，再反向展开检查。`, `Given ${a}x + ${a * b}, factor out the common factor and then expand back to check.`),
          answer: `${a}(x+${b})`,
        };
      }
      return {
        question: t(lang, `提取公因式：${a}x + ${a * b}。`, `Factorise ${a}x + ${a * b}.`),
        answer: `${a}(x+${b})`,
      };
    }
    case 'reverse_build_expression': {
      const value = a * b + c;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `一个表达式在 x=${a} 时的值是 ${value}，且它可写成 ${b}(x+${c - b})。请反求这个表达式。`, `An expression has value ${value} when x=${a}, and it can be written as ${b}(x+${c - b}). Recover the expression.`),
          answer: `${b}x + ${b * (c - b)}`,
        };
      }
      return {
        question: t(lang, `若一个表达式可写成 ${b}(x+${c - b})，写出展开式。`, `If an expression can be written as ${b}(x+${c - b}), write the expanded form.`),
        answer: `${b}x + ${b * (c - b)}`,
      };
    }
    case 'two_step_expression_problem': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `一个数先加 ${a}，再乘 ${b}，结果是 ${c * b}。反求这个数，并比较检验。`, `A number is first increased by ${a} and then multiplied by ${b} to get ${c * b}. Find the number and verify it.`),
          answer: String(c - a),
        };
      }
      return {
        question: t(lang, `一个数先加 ${a}，再乘 ${b}，结果是 ${c * b}。求原来的数。`, `A number is first increased by ${a} and then multiplied by ${b} to get ${c * b}. Find the original number.`),
        answer: String(c - a),
      };
    }
    case 'parameter_expression_compare': {
      const x = 1 + (seed % 4);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 x=${x}，比较 ${a}x+${b} 与 ${b}x+${a}，并判断何时相等。`, `Given x=${x}, compare ${a}x+${b} and ${b}x+${a}, and determine when they are equal.`),
          answer: String(a * x + b),
        };
      }
      return {
        question: t(lang, `已知 x=${x}，求 ${a}x+${b}。`, `Given x=${x}, evaluate ${a}x+${b}.`),
        answer: String(a * x + b),
      };
    }
    default:
      return { question: '', answer: '' };
  }
}

function buildItems(count, { conceptId, lang = 'zh', difficulty = 'Easy', grade = '8', curriculum = null } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (safeCount === 0) return [];
  if (!ALGEBRA_EXPRESSIONS_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase())) return [];

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const historyKey = `${curriculum ?? 'general'}|${grade ?? '8'}|${normalizedDifficulty}|${String(conceptId ?? '').trim().toLowerCase()}`;
  const families = [
    'collect_like_terms',
    'expand_brackets',
    'expand_two_brackets',
    'substitute_value',
    'translate_words',
    'compare_expressions',
    'simplify_then_evaluate',
    'equivalent_expression',
    'factor_common',
    'reverse_build_expression',
    'two_step_expression_problem',
    'parameter_expression_compare',
  ];
  const recentKinds = readRecentKinds(historyKey);
  const startIndex = recentKinds.length > 0 ? (families.indexOf(recentKinds[recentKinds.length - 1]) + 1) % families.length : 0;
  const items = [];

  for (let i = 0; i < safeCount; i += 1) {
    const kind = families[(startIndex + i) % families.length];
    const seed = i + recentKinds.length;
    const occurrence = Math.floor(i / families.length);
    const { question, answer } = buildQuestion(kind, seed, occurrence, lang, normalizedDifficulty);
    items.push({
      conceptId,
      kind,
      question,
      answer,
      lang,
      difficulty: normalizedDifficulty,
      grade,
      curriculum,
    });
  }

  writeRecentKinds(historyKey, items.map((item) => item.kind));
  return items;
}

function buildBatch(options = {}) {
  const items = buildItems(options.count ?? 0, options);
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.map((item, index) => formatQuestion(index, item.question)).join('\n\n');
}

function isAlgebraExpressionsQuestionBankConcept(conceptId = '') {
  return ALGEBRA_EXPRESSIONS_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase());
}

export {
  ALGEBRA_EXPRESSIONS_CONCEPT_IDS,
  buildBatch,
  buildItems,
  isAlgebraExpressionsQuestionBankConcept,
};
