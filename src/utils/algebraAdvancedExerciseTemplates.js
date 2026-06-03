const ADVANCED_ALGEBRA_CONCEPT_IDS = new Set(['powers-roots', 'indices-laws', 'surds']);

const HISTORY_KEY = 'math7-9:algebra-advanced-qbank-history:v1';
const HISTORY_LIMIT = 120;

function getStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    return null;
  }
  return null;
}

function normalizeDifficulty(value) {
  const text = String(value ?? 'Easy').toLowerCase();
  if (text.includes('hard')) return 'Hard';
  if (text.includes('medium')) return 'Medium';
  return 'Easy';
}

function t(lang, zh, en) {
  return String(lang ?? 'zh').toLowerCase().startsWith('zh') ? zh : en;
}

function absInt(seed, offset, spread) {
  return offset + (Math.abs(seed) % spread);
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const temp = x % y;
    x = y;
    y = temp;
  }
  return x || 1;
}

function reduceFraction(numerator, denominator) {
  const sign = denominator < 0 ? -1 : 1;
  const n = numerator * sign;
  const d = Math.abs(denominator);
  const div = gcd(n, d);
  return { numerator: n / div, denominator: d / div };
}

function fractionText(numerator, denominator) {
  const reduced = reduceFraction(numerator, denominator);
  if (reduced.denominator === 1) return String(reduced.numerator);
  return `${reduced.numerator}/${reduced.denominator}`;
}

function rootText(index, value) {
  return index === 2 ? `√${value}` : `∛${value}`;
}

function decimalText(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(6))).replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
}

const HISTORY = {};

function readHistoryMap() {
  const storage = getStorage();
  if (!storage) return HISTORY;
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
    Object.assign(HISTORY, next);
    return;
  }
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function makeHistoryKey(conceptId, grade, difficulty, curriculum) {
  return `${curriculum ?? 'general'}|${grade ?? '8'}|${difficulty ?? 'Easy'}|${String(conceptId ?? '').trim().toLowerCase()}`;
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

const ADVANCED_ALGEBRA_BANKS = {
  'powers-roots': {
    families: [
      'square_eval',
      'cube_eval',
      'sqrt_exact',
      'cuberoot_exact',
      'reverse_square',
      'reverse_cube',
      'compare_root_estimate',
      'scientific_notation_order',
      'mixed_power_root',
      'multi_step_root_power',
    ],
  },
  'indices-laws': {
    families: [
      'same_base_multiply',
      'same_base_divide',
      'power_of_power',
      'zero_exponent',
      'negative_exponent',
      'mixed_expression',
      'compare_forms',
      'reverse_index',
      'chain_laws',
      'parameter_rewrite',
    ],
  },
  surds: {
    families: [
      'simplify_surd',
      'add_like_surds',
      'multiply_surds',
      'rationalise_denom',
      'compare_surds',
      'estimate_surd',
      'mixed_surd_expression',
      'reverse_construct_surd',
      'surd_context_area',
      'multi_step_surd',
    ],
  },
};

function buildPowersRootsQuestion(kind, seed, occurrence, lang, difficulty) {
  const cycle = Math.floor(seed / 10);
  const bump = occurrence * 3;
  const base = 2 + (seed % 7) + cycle + bump;
  const other = 3 + ((seed + 2) % 6) + cycle + bump;
  const square = base * base;
  const cube = other * other * other;

  switch (kind) {
    case 'square_eval':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `已知 a = ${base}，先求 a²，再求 2a² - ${base}.`, `Given a = ${base}, find a², then calculate 2a² - ${base}.`),
            answer: String(2 * square - base),
          }
        : {
            question: t(lang, `计算：${base}²。`, `Calculate: ${base}².`),
            answer: String(square),
          };
    case 'cube_eval':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `已知 b = ${other}，先求 b³，再求 b³ - b²。`, `Given b = ${other}, find b³, then calculate b³ - b².`),
            answer: String(cube - other * other),
          }
        : {
            question: t(lang, `计算：${other}³。`, `Calculate: ${other}³.`),
            answer: String(cube),
          };
    case 'sqrt_exact': {
      const n = (base + cycle + 2) ** 2;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `已知 √${n} = x，先求 x，再求 x²。`, `Given √${n} = x, find x and then x².`),
            answer: String(n),
          }
        : {
            question: t(lang, `求 √${n}。`, `Find √${n}.`),
            answer: String(base + cycle + 2),
          };
    }
    case 'cuberoot_exact': {
      const n = (other + cycle + 2) ** 3;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `已知 ∛${n} = y，先求 y，再求 y²。`, `Given ∛${n} = y, find y and then y².`),
            answer: String(n),
          }
        : {
            question: t(lang, `求 ∛${n}。`, `Find ∛${n}.`),
            answer: String(other + cycle + 2),
          };
    }
    case 'reverse_square': {
      const side = 4 + base + cycle;
      const area = side * side;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `一个正方形的面积是 ${area}，若边长增加 2，再求新面积。`, `A square has area ${area}. If its side length increases by 2, what is the new area?`),
            answer: String((side + 2) * (side + 2)),
          }
        : {
            question: t(lang, `一个正方形的面积是 ${area}，边长是多少？`, `A square has area ${area}. What is its side length?`),
            answer: String(side),
          };
    }
    case 'reverse_cube': {
      const side = 3 + other + cycle;
      const volume = side * side * side;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `一个正方体的体积是 ${volume}，若棱长减少 1，再求新体积。`, `A cube has volume ${volume}. If its edge length decreases by 1, what is the new volume?`),
            answer: String((side - 1) ** 3),
          }
        : {
            question: t(lang, `一个正方体的体积是 ${volume}，棱长是多少？`, `A cube has volume ${volume}. What is its edge length?`),
            answer: String(side),
          };
    }
    case 'compare_root_estimate': {
      const a = (base + 1) ** 2 + 2;
      const b = (other + 1) ** 2 - 1;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `不直接计算，比较 √${a} 和 ${decimalText(Math.sqrt(b) + 0.3)} 的大小。`, `Without direct calculation, compare √${a} and ${decimalText(Math.sqrt(b) + 0.3)}.`),
            answer: Math.sqrt(a) > Math.sqrt(b) + 0.3 ? `√${a}` : decimalText(Math.sqrt(b) + 0.3),
          }
        : {
            question: t(lang, `估算并比较：√${a} 和 √${b}，哪个更大？`, `Estimate and compare: √${a} and √${b}. Which is larger?`),
            answer: Math.sqrt(a) > Math.sqrt(b) ? `√${a}` : `√${b}`,
          };
    }
    case 'scientific_notation_order': {
      const n1 = 4 + base;
      const n2 = 5 + other;
      const p1 = cycle + 3;
      const p2 = cycle + 2;
      const x = `${n1}×10^${p1}`;
      const y = `${n2}×10^${p2}`;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `比较 ${x} 和 ${y}，并写出更大者。`, `Compare ${x} and ${y}, then write the larger one.`),
            answer: p1 > p2 ? x : y,
          }
        : {
            question: t(lang, `比较 ${x} 和 ${y}。`, `Compare ${x} and ${y}.`),
            answer: p1 > p2 ? x : y,
          };
    }
    case 'mixed_power_root': {
      const a = 2 + (seed % 5);
      const b = 3 + ((seed + cycle) % 5);
      const c = 4 + ((seed + 2 * cycle) % 4);
      const value = Math.sqrt((a * a) * (b * b));
      return difficulty === 'Hard'
        ? {
            question: t(lang, `已知 A = √(${a}²×${b}²)，B = ${c}²。比较 A 与 B。`, `Let A = √(${a}²×${b}²), B = ${c}². Compare A and B.`),
            answer: value > c * c ? 'A' : value < c * c ? 'B' : 'same',
          }
        : {
            question: t(lang, `化简：√(${a}²×${b}²)。`, `Simplify: √(${a}²×${b}²).`),
            answer: String(a * b),
          };
    }
    case 'multi_step_root_power': {
      const scale = 1 + occurrence;
      const triple = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
      ][seed % 4].map((value) => value * scale);
      const [u, v, w] = triple;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `一个直角三角形的两条直角边是 ${u} 和 ${v}。先求斜边，再求斜边的平方。`, `A right triangle has legs ${u} and ${v}. Find the hypotenuse first, then square it.`),
            answer: String(w * w),
          }
        : {
            question: t(lang, `一个直角三角形的两条直角边是 ${u} 和 ${v}。求斜边。`, `A right triangle has legs ${u} and ${v}. Find the hypotenuse.`),
            answer: String(w),
          };
    }
    default:
      return { question: '', answer: '' };
  }
}

function buildIndicesQuestion(kind, seed, occurrence, lang, difficulty) {
  const cycle = Math.floor(seed / 10);
  const bump = occurrence * 2;
  const a = 2 + (seed % 5) + cycle + bump;
  const b = 3 + ((seed + 1) % 4) + cycle + bump;
  const c = 2 + ((seed + 2) % 5) + occurrence;

  switch (kind) {
    case 'same_base_multiply':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：${a}^${b} × ${a}^${c} × ${a}.`, `Simplify: ${a}^${b} × ${a}^${c} × ${a}.`),
            answer: `${a}^${b + c + 1}`,
          }
        : {
            question: t(lang, `化简：${a}^${b} × ${a}^${c}。`, `Simplify: ${a}^${b} × ${a}^${c}.`),
            answer: `${a}^${b + c}`,
          };
    case 'same_base_divide':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：${a}^${b + 2} ÷ ${a}^${c} ÷ ${a}.`, `Simplify: ${a}^${b + 2} ÷ ${a}^${c} ÷ ${a}.`),
            answer: `${a}^${b + 1 - c}`,
          }
        : {
            question: t(lang, `化简：${a}^${b + 2} ÷ ${a}^${c}.`, `Simplify: ${a}^${b + 2} ÷ ${a}^${c}.`),
            answer: `${a}^${b + 2 - c}`,
          };
    case 'power_of_power':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：(${a}^${b})^${c} × ${a}^${cycle + 1}。`, `Simplify: (${a}^${b})^${c} × ${a}^${cycle + 1}.`),
            answer: `${a}^${b * c + cycle + 1}`,
          }
        : {
            question: t(lang, `化简：(${a}^${b})^${c}。`, `Simplify: (${a}^${b})^${c}.`),
            answer: `${a}^${b * c}`,
          };
    case 'zero_exponent':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `已知 ${a}^0 = 1，化简：${a}^0 + ${b}^0 + ${c}^0。`, `Given ${a}^0 = 1, simplify: ${a}^0 + ${b}^0 + ${c}^0.`),
            answer: '3',
          }
        : {
            question: t(lang, `化简：${a}^0。`, `Simplify: ${a}^0.`),
            answer: '1',
          };
    case 'negative_exponent':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：${a}^-${b} × ${a}^${b}。`, `Simplify: ${a}^-${b} × ${a}^${b}.`),
            answer: '1',
          }
        : {
            question: t(lang, `化简：${a}^-${b}。`, `Simplify: ${a}^-${b}.`),
            answer: `1/${a}^${b}`,
          };
    case 'mixed_expression':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：${a}^${b + 1} × ${a}^-${c} ÷ ${a}^${cycle}.`, `Simplify: ${a}^${b + 1} × ${a}^-${c} ÷ ${a}^${cycle}.`),
            answer: `${a}^${b + 1 - c - cycle}`,
          }
        : {
            question: t(lang, `化简：${a}^${b} × ${a}^-${c}.`, `Simplify: ${a}^${b} × ${a}^-${c}.`),
            answer: `${a}^${b - c}`,
          };
    case 'compare_forms': {
      const x = a ** (b + 1);
      const y = a ** b * a;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `比较 ${a}^${b + 1} × ${a} 和 ${a}^${b + 2}，哪个更大？`, `Compare ${a}^${b + 1} × ${a} and ${a}^${b + 2}. Which is larger?`),
            answer: 'same',
          }
        : {
            question: t(lang, `比较 ${x} 和 ${y}，它们是否相等？`, `Compare ${x} and ${y}. Are they equal?`),
            answer: 'same',
          };
    }
    case 'reverse_index':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `若 ${a}^x = ${a ** (b + 2)}，且 ${a}^{x-1} 也要化成整数，求 x。`, `If ${a}^x = ${a ** (b + 2)}, and ${a}^{x-1} is also an integer power, find x.`),
            answer: String(b + 2),
          }
        : {
            question: t(lang, `若 ${a}^x = ${a ** b}，求 x。`, `If ${a}^x = ${a ** b}, find x.`),
            answer: String(b),
          };
    case 'chain_laws':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：(${a}^${b})^${c} × ${a}^${cycle + 2} ÷ ${a}^${cycle}.`, `Simplify: (${a}^${b})^${c} × ${a}^${cycle + 2} ÷ ${a}^${cycle}.`),
            answer: `${a}^${b * c + 2}`,
          }
        : {
            question: t(lang, `化简：(${a}^${b})^${c} × ${a}^${cycle}.`, `Simplify: (${a}^${b})^${c} × ${a}^${cycle}.`),
            answer: `${a}^${b * c + cycle}`,
          };
    case 'parameter_rewrite':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `已知 x = ${a}，化简：x^${b} × x^${c} ÷ x。`, `Given x = ${a}, simplify: x^${b} × x^${c} ÷ x.`),
            answer: `${a}^${b + c - 1}`,
          }
        : {
            question: t(lang, `已知 x = ${a}，求 x^${b}。`, `Given x = ${a}, find x^${b}.`),
            answer: String(a ** b),
          };
    default:
      return { question: '', answer: '' };
  }
}

function buildSurdsQuestion(kind, seed, occurrence, lang, difficulty) {
  const cycle = Math.floor(seed / 10);
  const bump = occurrence * 2;
  const base = 2 + (seed % 6) + cycle + bump;
  const rootA = base * base * (1 + ((seed + occurrence) % 3));
  const rootB = base * base * (2 + ((seed + occurrence) % 2));
  const like = 3 + (seed % 4) + occurrence;

  switch (kind) {
    case 'simplify_surd':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：√${rootA} + √${rootB}。`, `Simplify: √${rootA} + √${rootB}.`),
            answer: `${base}√${1 + (seed % 3)} + ${base}√${2 + (seed % 2)}`,
          }
        : {
            question: t(lang, `化简：√${rootA}。`, `Simplify: √${rootA}.`),
            answer: `${base}√${1 + (seed % 3)}`,
          };
    case 'add_like_surds':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：${like}√${base} + 2√${base} - √${base}。`, `Simplify: ${like}√${base} + 2√${base} - √${base}.`),
            answer: `${like + 1}√${base}`,
          }
        : {
            question: t(lang, `化简：${like}√${base} + 2√${base}。`, `Simplify: ${like}√${base} + 2√${base}.`),
            answer: `${like + 2}√${base}`,
          };
    case 'multiply_surds': {
      const a = 2 + (seed % 5) + occurrence;
      const b = 3 + ((seed + 1) % 5) + occurrence;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：√${a} × √${b} × √${a * b}。`, `Simplify: √${a} × √${b} × √${a * b}.`),
            answer: String(a * b),
          }
        : {
            question: t(lang, `化简：√${a} × √${b}。`, `Simplify: √${a} × √${b}.`),
            answer: String(Math.sqrt(a * b)),
          };
    }
    case 'rationalise_denom': {
      const d = base + 1;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `有理化分母并化简：1/(√${d} + 1)。`, `Rationalise the denominator and simplify: 1/(√${d} + 1).`),
            answer: `(${rootText(2, d)} - 1)/${d - 1}`,
          }
        : {
            question: t(lang, `有理化分母：1/√${d}。`, `Rationalise the denominator: 1/√${d}.`),
            answer: `√${d}/${d}`,
          };
    }
    case 'compare_surds': {
      const a = base * base + 1;
      const b = base * base + 4;
      return difficulty === 'Hard'
        ? {
            question: t(lang, `不借助计算器，比较 √${a} + 1 和 √${b}。`, `Without a calculator, compare √${a} + 1 and √${b}.`),
            answer: Math.sqrt(a) + 1 > Math.sqrt(b) ? `√${a} + 1` : `√${b}`,
          }
        : {
            question: t(lang, `比较 √${a} 和 √${b}，哪个更大？`, `Compare √${a} and √${b}. Which is larger?`),
            answer: `√${b}`,
          };
    }
    case 'estimate_surd':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `估算 √${rootA + 3} 和 √${rootB - 1}，并判断它们的差大约是多少。`, `Estimate √${rootA + 3} and √${rootB - 1}, then estimate their difference.`),
            answer: decimalText(Math.sqrt(rootA + 3) - Math.sqrt(rootB - 1)),
          }
        : {
            question: t(lang, `估算 √${rootA + 3}。`, `Estimate √${rootA + 3}.`),
            answer: decimalText(Math.sqrt(rootA + 3)),
          };
    case 'mixed_surd_expression':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简：2√${base} + √${base * 4} - √${base} + 1/√${base}.`, `Simplify: 2√${base} + √${base * 4} - √${base} + 1/√${base}.`),
            answer: `${3}√${base} + 1/√${base}`,
          }
        : {
            question: t(lang, `化简：2√${base} + √${base * 4}。`, `Simplify: 2√${base} + √${base * 4}.`),
            answer: `${4}√${base}`,
          };
    case 'reverse_construct_surd':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `若化简后结果是 5√${base}，原式可能是什么？（写出一种即可）`, `If the simplified result is 5√${base}, what could the original expression be? (Give one example.)`),
            answer: `√${base * 25}`,
          }
        : {
            question: t(lang, `把 √${base * 4} 写成最简根式。`, `Write √${base * 4} in simplest surd form.`),
            answer: `2√${base}`,
          };
    case 'surd_context_area':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `一个正方形面积是 ${rootA}，边长是多少？如果边长再增加 1，新面积是多少？`, `A square has area ${rootA}. What is its side length? If the side increases by 1, what is the new area?`),
            answer: `${base} 和 ${(base + 1) * (base + 1)}`,
          }
        : {
            question: t(lang, `一个正方形面积是 ${rootA}，边长是多少？`, `A square has area ${rootA}. What is its side length?`),
            answer: String(base),
          };
    case 'multi_step_surd':
      return difficulty === 'Hard'
        ? {
            question: t(lang, `化简并比较：√${rootA} + √${rootB} 与 ${2 * base}√${base}。`, `Simplify and compare: √${rootA} + √${rootB} with ${2 * base}√${base}.`),
            answer: `${2 * base}√${base}`,
          }
        : {
            question: t(lang, `化简：√${rootA} + √${rootA}.`, `Simplify: √${rootA} + √${rootA}.`),
            answer: `${2 * base}√${1 + (seed % 3)}`,
          };
    default:
      return { question: '', answer: '' };
  }
}

function buildAdvancedAlgebraQuestion(conceptId, familyKind, seed, occurrence, lang, difficulty) {
  switch (conceptId) {
    case 'powers-roots':
      return buildPowersRootsQuestion(familyKind, seed, occurrence, lang, difficulty);
    case 'indices-laws':
      return buildIndicesQuestion(familyKind, seed, occurrence, lang, difficulty);
    case 'surds':
      return buildSurdsQuestion(familyKind, seed, occurrence, lang, difficulty);
    default:
      return { question: '', answer: '' };
  }
}

function buildAdvancedAlgebraExerciseItems(count, { conceptId, lang = 'zh', difficulty = 'Easy', grade = '8', curriculum = null } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (safeCount === 0) return [];
  if (!ADVANCED_ALGEBRA_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase())) return [];

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const historyKey = makeHistoryKey(conceptId, grade, normalizedDifficulty, curriculum);
  const families = ADVANCED_ALGEBRA_BANKS[String(conceptId ?? '').trim().toLowerCase()]?.families ?? [];
  const recentKinds = readRecentKinds(historyKey);
  const startIndex = recentKinds.length > 0
    ? (families.indexOf(recentKinds[recentKinds.length - 1]) + 1) % families.length
    : 0;
  const items = [];

  for (let i = 0; i < safeCount; i += 1) {
    const familyKind = families[(startIndex + i) % families.length];
    const seed = i + recentKinds.length;
    const occurrence = Math.floor(i / families.length);
    const { question, answer } = buildAdvancedAlgebraQuestion(String(conceptId).trim().toLowerCase(), familyKind, seed, occurrence, lang, normalizedDifficulty);
    items.push({
      conceptId,
      kind: familyKind,
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

function buildAdvancedAlgebraExerciseBatch(options = {}) {
  const items = buildAdvancedAlgebraExerciseItems(options.count ?? 0, options);
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.map((item, index) => `${index + 1}. ${item.question}`).join('\n\n');
}

function isAdvancedAlgebraQuestionBankConcept(conceptId = '') {
  return ADVANCED_ALGEBRA_CONCEPT_IDS.has(String(conceptId ?? '').trim().toLowerCase());
}

export {
  ADVANCED_ALGEBRA_CONCEPT_IDS,
  buildAdvancedAlgebraExerciseBatch,
  buildAdvancedAlgebraExerciseItems,
  isAdvancedAlgebraQuestionBankConcept,
};
