const FACTORISATION_CONCEPT_IDS = new Set(['factorisation']);
const HISTORY_KEY = 'math7-9:factorisation-qbank-history:v1';
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

function formatQuestion(index, question) {
  return `${index + 1}. ${question}`;
}

function buildQuestion(kind, seed, occurrence, lang, difficulty) {
  const bump = occurrence * 2;
  const a = 2 + (seed % 5) + bump;
  const b = 3 + ((seed + 1) % 5) + bump;
  const c = 4 + ((seed + 2) % 5) + bump;
  const d = 5 + ((seed + 3) % 4) + bump;
  const x = 1 + (seed % 4) + occurrence;

  switch (kind) {
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
    case 'difference_of_squares': {
      const p = a + 1;
      const q = b;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${p * p}x² - ${q * q}，先判断是否是平方差，再写出因式分解并检验。`, `Given ${p * p}x² - ${q * q}, determine whether it is a difference of squares, factorise it, and check by expansion.`),
          answer: `(${p}x-${q})(${p}x+${q})`,
        };
      }
      return {
        question: t(lang, `分解因式：${p * p}x² - ${q * q}。`, `Factorise: ${p * p}x² - ${q * q}.`),
        answer: `(${p}x-${q})(${p}x+${q})`,
      };
    }
    case 'simple_quadratic': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 x=${x}，比较 ${a}x²+${b}x+${c} 和 ${a}(x+1)(x+${c - b}) 的展开结果是否相同。`, `Given x=${x}, compare ${a}x²+${b}x+${c} with the expansion of ${a}(x+1)(x+${c - b}).`),
          answer: `(${a}x+${b})(${x}+${c / a || c})`,
        };
      }
      return {
        question: t(lang, `分解因式：${a}x² + ${b}x + ${c}。`, `Factorise ${a}x² + ${b}x + ${c}.`),
        answer: `(${a}x+${b})(x+${c / a})`,
      };
    }
    case 'reverse_expand': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `一个式子展开后得到 ${a}x² + ${b}x + ${a * c}，请反求原式，并用展开验证。`, `An expression expands to ${a}x² + ${b}x + ${a * c}. Recover the original form and verify by expansion.`),
          answer: `(${a}x+${c})(x+${b / a})`,
        };
      }
      return {
        question: t(lang, `把 ${a}x² + ${b}x + ${a * c} 写成两个一次式相乘的形式。`, `Write ${a}x² + ${b}x + ${a * c} as a product of two linear factors.`),
        answer: `(${a}x+${c})(x+${b / a})`,
      };
    }
    case 'group_terms': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${a}x+${b}y+${c}x+${d}y，先分组再提取公因式。`, `Given ${a}x+${b}y+${c}x+${d}y, group the terms first and then factorise.`),
          answer: `${a + c}x + ${b + d}y`,
        };
      }
      return {
        question: t(lang, `化简并分组：${a}x+${b}y+${c}x+${d}y。`, `Simplify and group: ${a}x+${b}y+${c}x+${d}y.`),
        answer: `${a + c}x + ${b + d}y`,
      };
    }
    case 'choose_method': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `比较 ${a}x²-${b * b} 和 ${a}(x-${b})(x+${b}) 的因式分解方法，说明为什么更合适。`, `Compare the factorisation of ${a}x²-${b * b} with ${a}(x-${b})(x+${b}) and explain why it is appropriate.`),
          answer: `(${a}x-${b})(${a}x+${b})`,
        };
      }
      return {
        question: t(lang, `判断 ${a}x²-${b * b} 应该用什么因式分解方法。`, `Choose the best factorisation method for ${a}x²-${b * b}.`),
        answer: '平方差',
      };
    }
    case 'complete_factorisation': {
      const k = 2 + (seed % 4);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${k}x² + ${k * b}x = ${k}x(____)，请补全并检验。`, `Given ${k}x² + ${k * b}x = ${k}x(____), complete the factorisation and check it.`),
          answer: `${k}x(x+${b})`,
        };
      }
      return {
        question: t(lang, `补全因式分解：${k}x² + ${k * b}x = ${k}x(____)。`, `Complete the factorisation: ${k}x² + ${k * b}x = ${k}x(____).`),
        answer: `x+${b}`,
      };
    }
    case 'factor_and_solve': {
      const root = a + b;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `反求方程：若 ${a}x²-${a * root}x=0，先分解再求解并核对。`, `Solve and check: if ${a}x²-${a * root}x=0, factorise first and then solve.`),
          answer: `x=0 或 x=${root}`,
        };
      }
      return {
        question: t(lang, `解方程：${a}x²-${a * root}x=0。`, `Solve ${a}x²-${a * root}x=0.`),
        answer: `x=0 或 x=${root}`,
      };
    }
    case 'area_model': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知一个面积模型的长为 x+${a}，宽为 x+${b}，请展开、反求并比较系数。`, `Given an area model with side lengths x+${a} and x+${b}, expand it, then recover the coefficients.`),
          answer: `x² + ${a + b}x + ${a * b}`,
        };
      }
      return {
        question: t(lang, `把 (x+${a})(x+${b}) 看成面积模型，写出展开式。`, `Use an area model for (x+${a})(x+${b}) and write the expansion.`),
        answer: `x² + ${a + b}x + ${a * b}`,
      };
    }
    case 'identify_common_factor': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `比较 ${a}x+${a * b} 与 ${a}(x+${b})，再说明公因式为何是 ${a}。`, `Compare ${a}x+${a * b} with ${a}(x+${b}) and explain why ${a} is the common factor.`),
          answer: String(a),
        };
      }
      return {
        question: t(lang, `找出 ${a}x+${a * b} 的公因式。`, `Find the common factor of ${a}x+${a * b}.`),
        answer: String(a),
      };
    }
    case 'compare_factor_forms': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${a}(x+${b}) 与 ${a}x+${a * b}，反向展开后比较是否恒等。`, `Given ${a}(x+${b}) and ${a}x+${a * b}, expand and compare whether they are identical.`),
          answer: '相同',
        };
      }
      return {
        question: t(lang, `比较 ${a}(x+${b}) 和 ${a}x+${a * b}。`, `Compare ${a}(x+${b}) and ${a}x+${a * b}.`),
        answer: '相同',
      };
    }
    case 'quadratic_reverse': {
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `一个二次式展开后为 ${a}x² + ${b}x + ${a * c}，请反求因式并检验。`, `A quadratic expands to ${a}x² + ${b}x + ${a * c}. Recover the factors and verify.`),
          answer: `(${a}x+${c})(x+${b / a})`,
        };
      }
      return {
        question: t(lang, `把 ${a}x² + ${b}x + ${a * c} 写成因式分解形式。`, `Write ${a}x² + ${b}x + ${a * c} in factorised form.`),
        answer: `(${a}x+${c})(x+${b / a})`,
      };
    }
    default:
      return { question: '', answer: '' };
  }
}

function buildItems(count, { conceptId, lang = 'zh', difficulty = 'Easy', grade = '8', curriculum = null } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (safeCount === 0) return [];
  if (!FACTORISATION_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase())) return [];

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const historyKey = `${curriculum ?? 'general'}|${grade ?? '8'}|${normalizedDifficulty}|${String(conceptId ?? '').trim().toLowerCase()}`;
  const families = [
    'factor_common',
    'difference_of_squares',
    'simple_quadratic',
    'reverse_expand',
    'group_terms',
    'choose_method',
    'complete_factorisation',
    'factor_and_solve',
    'area_model',
    'identify_common_factor',
    'compare_factor_forms',
    'quadratic_reverse',
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

function isFactorisationQuestionBankConcept(conceptId = '') {
  return FACTORISATION_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase());
}

export {
  FACTORISATION_CONCEPT_IDS,
  buildBatch,
  buildItems,
  isFactorisationQuestionBankConcept,
};
