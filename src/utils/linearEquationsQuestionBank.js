const LINEAR_EQUATIONS_CONCEPT_IDS = new Set(['linear-equations-1']);
const HISTORY_KEY = 'math7-9:linear-equations-qbank-history:v1';
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
    // ignore storage failures outside the browser
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

function linearTerm(coef, variable = 'x') {
  if (coef === 1) return variable;
  if (coef === -1) return `-${variable}`;
  return `${coef}${variable}`;
}

function buildQuestion(kind, seed, occurrence, lang, difficulty) {
  const a = absInt(seed, 2, 7) + occurrence;
  const b = absInt(seed * 2 + 1, 2, 8) + occurrence;
  const c = absInt(seed * 3 + 2, 3, 9) + occurrence;
  const d = absInt(seed * 5 + 3, 1, 8) + occurrence;
  const e = absInt(seed * 7 + 4, 1, 9) + occurrence;

  switch (kind) {
    case 'one_step_add': {
      const x = 6 + a;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `解方程：-${b} + x = ${x - b}，并检验答案。`, `Solve and check: -${b} + x = ${x - b}.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `解方程：x - ${b} = ${x - b}。`, `Solve: x - ${b} = ${x - b}.`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `解方程：x + ${b} = ${x + b}。`, `Solve: x + ${b} = ${x + b}.`),
        answer: String(x),
      };
    }
    case 'one_step_mul': {
      const x = b * (3 + occurrence);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `解方程：-${b}x = ${-b * x}，先化去符号再求解。`, `Solve: -${b}x = ${-b * x}, then handle the sign carefully.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `解方程：x ÷ ${b} = ${x / b}。`, `Solve: x ÷ ${b} = ${x / b}.`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `解方程：${b}x = ${b * x}。`, `Solve: ${b}x = ${b * x}.`),
        answer: String(x),
      };
    }
    case 'two_step_linear': {
      const x = 3 + d;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `解方程：${b}(x - ${c}) + ${a} = ${b * (x - c) + a}。`, `Solve: ${b}(x - ${c}) + ${a} = ${b * (x - c) + a}.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `解方程：${b}x + ${a} = ${b * x + a}。`, `Solve: ${b}x + ${a} = ${b * x + a}.`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `解方程：${b}x - ${a} = ${b * x - a}。`, `Solve: ${b}x - ${a} = ${b * x - a}.`),
        answer: String(x),
      };
    }
    case 'variable_both_sides': {
      const x = 2 + e;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `解方程：${b}(x + ${a}) + ${c} = ${d}x + ${b * (x + a) + c - d * x}。`, `Solve: ${b}(x + ${a}) + ${c} = ${d}x + ${b * (x + a) + c - d * x}.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `解方程：${b}x + ${a} = ${d}x + ${b * x + a - d * x}。`, `Solve: ${b}x + ${a} = ${d}x + ${b * x + a - d * x}.`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `解方程：${b}x + ${a} = ${d}x + ${b * x + a - d * x}。`, `Solve: ${b}x + ${a} = ${d}x + ${b * x + a - d * x}.`),
        answer: String(x),
      };
    }
    case 'brackets_distribution': {
      const x = 5 + a;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `解方程：${b}(x + ${a}) - ${c} = ${d}x + ${b * (x + a) - c - d * x}。`, `Solve: ${b}(x + ${a}) - ${c} = ${d}x + ${b * (x + a) - c - d * x}.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `解方程：${b}(x + ${a}) = ${b * (x + a)}。`, `Solve: ${b}(x + ${a}) = ${b * (x + a)}.`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `解方程：${b}(x - ${a}) = ${b * (x - a)}。`, `Solve: ${b}(x - ${a}) = ${b * (x - a)}.`),
        answer: String(x),
      };
    }
    case 'fractions_equation': {
      const denom = 2 + (seed % 4);
      const x = denom * (3 + occurrence) + a;
      const shifted = x - a;
      const rhs = decimalText(shifted / denom + b);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `解方程：(${linearTerm(1)} - ${a}) ÷ ${denom} + ${b} = ${rhs}。`, `Solve: (x - ${a}) ÷ ${denom} + ${b} = ${rhs}.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `解方程：x ÷ ${denom} + ${b} = ${decimalText(x / denom + b)}。`, `Solve: x ÷ ${denom} + ${b} = ${decimalText(x / denom + b)}.`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `解方程：x ÷ ${denom} = ${x / denom}。`, `Solve: x ÷ ${denom} = ${x / denom}.`),
        answer: String(x),
      };
    }
    case 'decimals_equation': {
      const x = 4 + b;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `解方程：${decimalText(0.75)}(x - ${a}) + ${decimalText(1.5)} = ${decimalText(0.75 * (x - a) + 1.5)}。`, `Solve: ${decimalText(0.75)}(x - ${a}) + ${decimalText(1.5)} = ${decimalText(0.75 * (x - a) + 1.5)}.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `解方程：${decimalText(1.5)}x - ${decimalText(1.2)} = ${decimalText(1.5 * x - 1.2)}。`, `Solve: ${decimalText(1.5)}x - ${decimalText(1.2)} = ${decimalText(1.5 * x - 1.2)}.`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `解方程：${decimalText(0.5)}x + ${decimalText(1.2)} = ${decimalText(0.5 * x + 1.2)}。`, `Solve: ${decimalText(0.5)}x + ${decimalText(1.2)} = ${decimalText(0.5 * x + 1.2)}.`),
        answer: String(x),
      };
    }
    case 'word_problem_setup': {
      const x = 8 + c;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `一件商品先按原价的 8 折出售，再减去 6 元，最后价格是 ${decimalText(0.8 * x - 6)} 元。原价是多少？请列方程并求解。`, `An item is sold at 80% of its original price and then reduced by 6 yuan. The final price is ${decimalText(0.8 * x - 6)} yuan. Find the original price by setting up an equation.`),
          answer: String(x),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `一本书的价格加上 5 元邮费后共 ${x + 5} 元。原价是多少？`, `A book costs ${x + 5} yuan including 5 yuan postage. What is the original price?`),
          answer: String(x),
        };
      }
      return {
        question: t(lang, `买一个文具盒花了 ${x + 3} 元，若另外有 3 元优惠，原价是多少？`, `A pencil case cost ${x + 3} yuan, but there was a 3 yuan discount. What was the original price?`),
        answer: String(x),
      };
    }
    case 'check_solution_and_correct': {
      const x = 4 + d;
      if (difficulty === 'Hard') {
        const claim = x + 1;
        return {
          question: t(lang, `判断并纠正：有人说 x = ${claim} 是方程 ${b}(x + ${a}) - ${c} = ${b * (x + a) - c} 的解。这个说法对吗？若不对，正确解是多少？`, `Check and correct: Someone says x = ${claim} solves ${b}(x + ${a}) - ${c} = ${b * (x + a) - c}. Is this correct? If not, what is the correct solution?`),
          answer: `不对，x=${x}`,
        };
      }
      return {
        question: t(lang, `判断并纠正：x = ${x + 1} 是否是方程 ${b}x + ${a} = ${b * x + a} 的解？`, `Check and correct: Is x = ${x + 1} a solution of ${b}x + ${a} = ${b * x + a}?`),
        answer: `不对，x=${x}`,
      };
    }
    case 'reverse_engineer_constant': {
      const x = 5 + a;
      const target = b * x + c;
      if (difficulty === 'Hard') {
        const missing = target - d * (x - a);
        return {
          question: t(lang, `把 □ 填成多少，才能使 x = ${x} 成为方程 ${d}(x - ${a}) + □ = ${target} 的解？`, `What should □ be so that x = ${x} is a solution of ${d}(x - ${a}) + □ = ${target}?`),
          answer: String(missing),
        };
      }
      const missing = target - b * x;
      return {
        question: t(lang, `把 □ 填成多少，才能使 x = ${x} 成为方程 ${b}x + □ = ${target} 的解？`, `What should □ be so that x = ${x} is a solution of ${b}x + □ = ${target}?`),
        answer: String(missing),
      };
    }
    default:
      return { question: '', answer: '' };
  }
}

function validateBankItem(item) {
  const issues = [];
  if (!item || typeof item !== 'object') return ['item must be an object'];
  if (typeof item.kind !== 'string' || !item.kind.trim()) issues.push('missing kind');
  if (typeof item.question !== 'string' || !item.question.trim()) issues.push('missing question');
  if (typeof item.answer === 'undefined') issues.push('missing answer');
  if (String(item.question ?? '').includes('math-diagram')) issues.push('diagram block not allowed');
  if (String(item.question ?? '').includes('```')) issues.push('fenced block not allowed');
  if (String(item.question ?? '').toLowerCase().includes('undefined')) issues.push('question contains undefined');
  return issues;
}

function validateBankItems(items) {
  const issues = [];
  if (!Array.isArray(items) || items.length === 0) return ['items must be a non-empty array'];
  items.forEach((item, index) => {
    const itemIssues = validateBankItem(item);
    itemIssues.forEach((issue) => issues.push(`item ${index + 1}: ${issue}`));
  });
  return issues;
}

function buildItems(count, { conceptId, lang = 'zh', difficulty = 'Easy', grade = '8', curriculum = null } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (safeCount === 0) return [];
  if (!LINEAR_EQUATIONS_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase())) return [];

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const historyKey = `${curriculum ?? 'general'}|${grade ?? '8'}|${normalizedDifficulty}|${String(conceptId ?? '').trim().toLowerCase()}`;
  const families = [
    'one_step_add',
    'one_step_mul',
    'two_step_linear',
    'variable_both_sides',
    'brackets_distribution',
    'fractions_equation',
    'decimals_equation',
    'word_problem_setup',
    'check_solution_and_correct',
    'reverse_engineer_constant',
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

  const issues = validateBankItems(items);
  if (issues.length > 0) {
    throw new Error(`Invalid linear equations qbank items: ${issues.join('; ')}`);
  }

  writeRecentKinds(historyKey, items.map((item) => item.kind));
  return items;
}

function buildBatch(options = {}) {
  const items = buildItems(options.count ?? 0, options);
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.map((item, index) => formatQuestion(index, item.question)).join('\n\n');
}

function isLinearEquationsQuestionBankConcept(conceptId = '') {
  return LINEAR_EQUATIONS_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase());
}

export {
  LINEAR_EQUATIONS_CONCEPT_IDS,
  buildBatch,
  buildItems,
  isLinearEquationsQuestionBankConcept,
};
