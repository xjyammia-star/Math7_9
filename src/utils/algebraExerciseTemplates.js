import { buildAdvancedAlgebraExerciseItems, isAdvancedAlgebraQuestionBankConcept } from "./algebraAdvancedExerciseTemplates.js";

const ALGEBRA_QBANK_CONCEPT_IDS = new Set([
  'arithmetic',
  'rational-numbers',
  'fractions-decimals',
  'ratio-proportion',
  'powers-roots',
  'indices-laws',
  'surds',
]);

const ALGEBRA_HISTORY_KEY = 'math7-9:algebra-qbank-history:v1';
const ALGEBRA_HISTORY_LIMIT = 120;

function getStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    return null;
  }
  return null;
}

const MEMORY_HISTORY = {};

function readHistoryMap() {
  const storage = getStorage();
  if (!storage) return MEMORY_HISTORY;

  try {
    const raw = storage.getItem(ALGEBRA_HISTORY_KEY);
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
    storage.setItem(ALGEBRA_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures in non-browser/test environments.
  }
}

function makeHistoryKey(conceptId, grade, difficulty, curriculum) {
  return `${curriculum ?? 'general'}|${grade ?? '8'}|${difficulty ?? 'Easy'}|${String(conceptId ?? '').trim().toLowerCase()}`;
}

function readRecentFamilies(historyKey) {
  const history = readHistoryMap();
  return Array.isArray(history[historyKey]) ? history[historyKey] : [];
}

function writeRecentFamilies(historyKey, families) {
  if (!Array.isArray(families) || families.length === 0) return;
  const history = readHistoryMap();
  const previous = Array.isArray(history[historyKey]) ? history[historyKey] : [];
  const merged = [...previous, ...families].slice(-ALGEBRA_HISTORY_LIMIT);
  history[historyKey] = merged;
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
  const divisor = gcd(n, d);
  return { numerator: n / divisor, denominator: d / divisor };
}

function fractionText(numerator, denominator) {
  const reduced = reduceFraction(numerator, denominator);
  if (reduced.denominator === 1) return String(reduced.numerator);
  return `${reduced.numerator}/${reduced.denominator}`;
}

function mixedText(numerator, denominator) {
  const reduced = reduceFraction(numerator, denominator);
  const whole = Math.trunc(reduced.numerator / reduced.denominator);
  const rest = Math.abs(reduced.numerator % reduced.denominator);
  if (rest === 0) return String(whole);
  if (whole === 0) return `${rest}/${reduced.denominator}`;
  return `${whole} ${rest}/${reduced.denominator}`;
}

function decimalText(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(6))).replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
}

function formatQuestion(index, question) {
  return `${index + 1}. ${question}`;
}

function buildQuestion(kind, payload, lang, difficulty) {
  switch (kind) {
    case 'integer_add_sub': {
      const a = absInt(payload.seed, 12, 30);
      const b = absInt(payload.seed * 3, 2, 9);
      const c = absInt(payload.seed * 5, 1, 7);
      const d = absInt(payload.seed * 7, 2, 6);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `计算：(${a} - ${b}) + (${c} + ${d})。`, `Calculate: (${a} - ${b}) + (${c} + ${d}).`),
          answer: a - b + c + d,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `计算：${a} - (-${b}) + ${c}。`, `Calculate: ${a} - (-${b}) + ${c}.`),
          answer: a + b + c,
        };
      }
      return {
        question: t(lang, `计算：${a} + ${b} - ${c}。`, `Calculate: ${a} + ${b} - ${c}.`),
        answer: a + b - c,
      };
    }
    case 'order_of_operations': {
      const a = absInt(payload.seed, 5, 20);
      const b = absInt(payload.seed * 2, 2, 8);
      const c = absInt(payload.seed * 4, 3, 6);
      const d = absInt(payload.seed * 5, 1, 7);
      const e = absInt(payload.seed * 6, 1, 5);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `计算：${a} + ${b} × (${c} - ${d}) + ${e}。`, `Calculate: ${a} + ${b} × (${c} - ${d}) + ${e}.`),
          answer: a + b * (c - d) + e,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `计算：(${a} + ${b}) × ${c} - ${d}。`, `Calculate: (${a} + ${b}) × ${c} - ${d}.`),
          answer: (a + b) * c - d,
        };
      }
      return {
        question: t(lang, `计算：${a} + ${b} × ${c}。`, `Calculate: ${a} + ${b} × ${c}.`),
        answer: a + b * c,
      };
    }
    case 'mixed_operations': {
      const a = absInt(payload.seed, 3, 14);
      const b = absInt(payload.seed * 2, 2, 8);
      const c = absInt(payload.seed * 3, 4, 20);
      const d = absInt(payload.seed * 4, 2, 6);
      const e = absInt(payload.seed * 5, 1, 7);
      const safeC = c - (c % d);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `计算：(${a} × ${b} - ${safeC}) ÷ ${d} + ${e}。`, `Calculate: (${a} × ${b} - ${safeC}) ÷ ${d} + ${e}.`),
          answer: ((a * b - safeC) / d) + e,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `计算：${a} × ${b} + ${safeC} ÷ ${d}。`, `Calculate: ${a} × ${b} + ${safeC} ÷ ${d}.`),
          answer: a * b + (safeC / d),
        };
      }
      return {
        question: t(lang, `计算：${a} × ${b} - ${c}。`, `Calculate: ${a} × ${b} - ${c}.`),
        answer: a * b - c,
      };
    }
    case 'missing_number_additive': {
      const x = absInt(payload.seed, 4, 18);
      const a = absInt(payload.seed * 2, 2, 9);
      const b = x + a;
      const c = absInt(payload.seed * 3, 1, 7);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `已知 ${a} + x - ${c} = ${b}，求 x。`, `Given ${a} + x - ${c} = ${b}, find x.`),
          answer: b - a + c,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `已知 x - ${a} = ${c}，求 x。`, `Given x - ${a} = ${c}, find x.`),
          answer: a + c,
        };
      }
      return {
        question: t(lang, `已知 x + ${a} = ${b}，求 x。`, `Given x + ${a} = ${b}, find x.`),
        answer: b - a,
      };
    }
    case 'missing_number_multiplicative': {
      const x = absInt(payload.seed, 2, 12);
      const a = absInt(payload.seed * 2, 2, 9);
      const b = a * x;
      const c = absInt(payload.seed * 3, 1, 6);
      if (difficulty === 'Hard') {
        const target = a * (x + c);
        return {
          question: t(lang, `已知 ${a} × (x + ${c}) = ${target}，求 x。`, `Given ${a} × (x + ${c}) = ${target}, find x.`),
          answer: x,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `已知 x ÷ ${a} = ${x}，求 x。`, `Given x ÷ ${a} = ${x}, find x.`),
          answer: a * x,
        };
      }
      return {
        question: t(lang, `已知 ${a} × x = ${b}，求 x。`, `Given ${a} × x = ${b}, find x.`),
        answer: x,
      };
    }
    case 'compare_two_expressions': {
      const a = absInt(payload.seed, 2, 12);
      const b = absInt(payload.seed * 2, 2, 8);
      const c = absInt(payload.seed * 3, 1, 9);
      const d = absInt(payload.seed * 5, 1, 7);
      const left = a + b * c;
      const right = (a + d) + (b * c - d);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `比较两个算式的结果：A = (${a} + ${d}) × ${c}，B = ${a} + ${d} × ${c}。哪个更大？`, `Compare the values: A = (${a} + ${d}) × ${c}, B = ${a} + ${d} × ${c}. Which is larger?`),
          answer: (a + d) * c > a + d * c ? 'A' : 'B',
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `比较两个算式：A = ${a} + ${b} × ${c}，B = (${a} + ${b}) × ${c}。哪个更大？`, `Compare the values: A = ${a} + ${b} × ${c}, B = (${a} + ${b}) × ${c}. Which is larger?`),
          answer: left > right ? 'A' : 'B',
        };
      }
      return {
        question: t(lang, `比较两个算式：A = ${a} + ${b} × ${c}，B = ${a} + (${b} × ${c})。它们相等吗？`, `Compare the values: A = ${a} + ${b} × ${c}, B = ${a} + (${b} × ${c}). Are they equal?`),
        answer: 'same',
      };
    }
    case 'rounding_estimate': {
      const a = absInt(payload.seed, 15, 60);
      const b = absInt(payload.seed * 2, 15, 60);
      const est = Math.round(a / 10) * 10 + Math.round(b / 10) * 10;
      const exact = a + b;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `先估算再判断：把 ${a} 和 ${b} 都四舍五入到十位后，估计和是多少？再算出准确值。`, `Estimate first and then check: round ${a} and ${b} to the nearest ten. What is the estimate of their sum? Then calculate the exact sum.`),
          answer: exact,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `估算：${a} + ${b}（把每个数四舍五入到十位）`, `Estimate: ${a} + ${b} (round each number to the nearest ten).`),
          answer: est,
        };
      }
      return {
        question: t(lang, `估算：${a} + ${b}（先把每个数四舍五入到十位）`, `Estimate: ${a} + ${b} (round each number to the nearest ten).`),
        answer: est,
      };
    }
    case 'pattern_next_term': {
      const start = absInt(payload.seed, 2, 12);
      const step = absInt(payload.seed * 2, 2, 8);
      const a1 = start;
      const a2 = start + step;
      const a3 = start + 2 * step;
      const a4 = start + 3 * step;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `数列：${a1}, ${a2}, ${a3}, ${a4}, … 求第 6 项。`, `Sequence: ${a1}, ${a2}, ${a3}, ${a4}, ... Find the 6th term.`),
          answer: start + 5 * step,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `数列：${a1}, ${a2}, ${a3}, … 求下一个数。`, `Sequence: ${a1}, ${a2}, ${a3}, ... Find the next term.`),
          answer: a4,
        };
      }
      return {
        question: t(lang, `数列：${a1}, ${a2}, ${a3}, … 求下一个数。`, `Sequence: ${a1}, ${a2}, ${a3}, ... Find the next term.`),
        answer: a4,
      };
    }
    case 'word_problem_two_step': {
      const apples = absInt(payload.seed, 3, 8);
      const packs = absInt(payload.seed * 2, 2, 6);
      const bonus = absInt(payload.seed * 3, 1, 5);
      if (difficulty === 'Hard') {
        const total = apples * packs + bonus;
        return {
          question: t(lang, `小华买了 ${packs} 袋苹果，每袋 ${apples} 个，又得到 ${bonus} 个。现在一共有多少个苹果？`, `Xiaohua bought ${packs} bags of apples with ${apples} apples in each bag, then received ${bonus} more apples. How many apples are there now?`),
          answer: total,
        };
      }
      if (difficulty === 'Medium') {
        const total = apples * packs - bonus;
        return {
          question: t(lang, `一盒彩笔有 ${apples} 支，买了 ${packs} 盒后送出 ${bonus} 支，还剩多少支？`, `A box has ${apples} pencils. After buying ${packs} boxes and giving away ${bonus} pencils, how many pencils remain?`),
          answer: total,
        };
      }
      return {
        question: t(lang, `每盒彩笔有 ${apples} 支，买了 ${packs} 盒，一共有多少支？`, `Each box has ${apples} pencils. If you buy ${packs} boxes, how many pencils do you have?`),
        answer: apples * packs,
      };
    }
    case 'check_calculation': {
      const a = absInt(payload.seed, 4, 18);
      const b = absInt(payload.seed * 2, 2, 8);
      const c = absInt(payload.seed * 3, 2, 9);
      const wrong = a + b * c + 5;
      const correct = a + b * c;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `有人把 ${a} + ${b} × ${c} 算成 ${wrong}。正确答案是多少？`, `Someone calculated ${a} + ${b} × ${c} as ${wrong}. What is the correct answer?`),
          answer: correct,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `有人把 (${a} + ${b}) × ${c} 算错了。正确答案是多少？`, `Someone made a mistake in calculating (${a} + ${b}) × ${c}. What is the correct answer?`),
          answer: (a + b) * c,
        };
      }
      return {
        question: t(lang, `检查计算：${a} + ${b} × ${c} 的结果是多少？`, `Check the calculation: what is the result of ${a} + ${b} × ${c}?`),
        answer: correct,
      };
    }
    case 'compare_number_line': {
      const a = -absInt(payload.seed, 1, 12);
      const b = absInt(payload.seed * 2, -6, 16) - 6;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `在数轴上，${a} 和 ${b} 哪个更大？`, `On the number line, which is greater: ${a} or ${b}?`),
          answer: a > b ? String(a) : String(b),
        };
      }
      return {
        question: t(lang, `比较：${a} 和 ${b}，哪个更大？`, `Compare ${a} and ${b}. Which is greater?`),
        answer: a > b ? String(a) : String(b),
      };
    }
    case 'order_negative_numbers': {
      const values = [
        -(2 + (payload.seed % 9)),
        -(12 + (payload.seed % 7)),
        1 + (payload.seed % 8),
        10 + (payload.seed % 9),
      ];
      const shuffled = [values[2], values[0], values[3], values[1]];
      const sorted = [...shuffled].sort((x, y) => x - y);
      return {
        question: t(lang, `把这四个数从小到大排列：${shuffled[0]}, ${shuffled[1]}, ${shuffled[2]}, ${shuffled[3]}。`, `Arrange these four numbers from least to greatest: ${shuffled[0]}, ${shuffled[1]}, ${shuffled[2]}, ${shuffled[3]}.`),
        answer: sorted.join(', '),
      };
    }
    case 'add_sub_negatives': {
      const a = absInt(payload.seed, 2, 12);
      const b = absInt(payload.seed * 2, 1, 8);
      const c = absInt(payload.seed * 3, 1, 7);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `计算：(-${a}) + ${b} - (-${c})。`, `Calculate: (-${a}) + ${b} - (-${c}).`),
          answer: -a + b + c,
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `计算：${a} - (-${b}) + (-${c})。`, `Calculate: ${a} - (-${b}) + (-${c}).`),
          answer: a + b - c,
        };
      }
      return {
        question: t(lang, `计算：(-${a}) + ${b}。`, `Calculate: (-${a}) + ${b}.`),
        answer: -a + b,
      };
    }
    case 'temperature_change': {
      const start = absInt(payload.seed, -8, 22) - 10;
      const rise = absInt(payload.seed * 2, 1, 12);
      const fall = absInt(payload.seed * 3, 1, 8);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `早上气温是 ${start}℃，中午上升了 ${rise}℃，晚上又下降了 ${fall}℃。晚上气温是多少？`, `The temperature was ${start}°C in the morning, rose by ${rise}°C at noon, then fell by ${fall}°C in the evening. What is the evening temperature?`),
          answer: start + rise - fall,
        };
      }
      return {
        question: t(lang, `早上气温是 ${start}℃，上升了 ${rise}℃，现在是多少？`, `The temperature was ${start}°C in the morning and then rose by ${rise}°C. What is it now?`),
        answer: start + rise,
      };
    }
    case 'absolute_value': {
      const a = absInt(payload.seed, -9, 18) - 9;
      const b = absInt(payload.seed * 2, -6, 16) - 8;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `计算：|${a}| + |${b}|。`, `Calculate: |${a}| + |${b}|.`),
          answer: Math.abs(a) + Math.abs(b),
        };
      }
      return {
        question: t(lang, `数 ${a} 到 0 的距离是多少？`, `How far is ${a} from 0?`),
        answer: Math.abs(a),
      };
    }
    case 'opposite_number': {
      const a = -(2 + payload.seed);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `数 ${a} 的相反数和绝对值分别是多少？请写出相反数。`, `What is the opposite of ${a}? (Write the opposite only.)`),
          answer: String(-a),
        };
      }
      return {
        question: t(lang, `写出 ${a} 的相反数。`, `Write the opposite of ${a}.`),
        answer: String(-a),
      };
    }
    case 'sign_prediction': {
      const a = absInt(payload.seed, 2, 12);
      const b = absInt(payload.seed * 2, 1, 8);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `不必先算出结果，判断 ${a} - (${a + b}) 的结果是正、负还是零。`, `Without fully calculating, decide whether ${a} - (${a + b}) is positive, negative, or zero.`),
          answer: 'negative',
        };
      }
      return {
        question: t(lang, `判断 ${-a} + ${b} 的结果是正、负还是零。`, `Decide whether ${-a} + ${b} is positive, negative, or zero.`),
        answer: (-a + b) > 0 ? 'positive' : (-a + b) < 0 ? 'negative' : 'zero',
      };
    }
    case 'net_change_context': {
      const start = absInt(payload.seed, 20, 80);
      const gain = absInt(payload.seed * 2, 5, 20);
      const loss = absInt(payload.seed * 3, 3, 15);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `一个账户原有 ${start} 元，先存入 ${gain} 元，再取出 ${loss} 元，最后又存入 ${loss - 1} 元。现在有多少钱？`, `An account starts with ${start} yuan. It receives a deposit of ${gain} yuan, then a withdrawal of ${loss} yuan, then another deposit of ${loss - 1} yuan. What is the final amount?`),
          answer: start + gain - loss + (loss - 1),
        };
      }
      return {
        question: t(lang, `一个账户原有 ${start} 元，存入 ${gain} 元后又取出 ${loss} 元，现在有多少钱？`, `An account starts with ${start} yuan, gets a deposit of ${gain} yuan, then a withdrawal of ${loss} yuan. What is the final amount?`),
        answer: start + gain - loss,
      };
    }
    case 'compare_two_situations': {
      const start = absInt(payload.seed, 5, 20);
      const gainA = absInt(payload.seed * 2, 3, 10);
      const lossA = absInt(payload.seed * 3, 1, 8);
      const gainB = absInt(payload.seed * 4, 2, 9);
      const lossB = absInt(payload.seed * 5, 1, 7);
      const finalA = start + gainA - lossA;
      const finalB = start + gainB - lossB;
      return {
        question: t(lang, `A 方案：先加 ${gainA} 再减 ${lossA}；B 方案：先加 ${gainB} 再减 ${lossB}。哪个结果更大？`, `Plan A: add ${gainA} then subtract ${lossA}. Plan B: add ${gainB} then subtract ${lossB}. Which result is larger?`),
        answer: finalA > finalB ? 'A' : finalB > finalA ? 'B' : 'same',
      };
    }
    case 'correction_negative_error': {
      const a = absInt(payload.seed, 2, 12);
      const b = absInt(payload.seed * 2, 2, 9);
      const wrong = -a - b;
      return {
        question: t(lang, `有人把 ${-a} - ${b} 算成 ${wrong}。正确答案是多少？`, `Someone calculated ${-a} - ${b} as ${wrong}. What is the correct answer?`),
        answer: -a - b,
      };
    }
    case 'fraction_to_decimal': {
      const patterns = [
        [1, 2], [3, 4], [2, 5], [7, 8], [9, 10], [3, 20], [7, 25], [11, 50], [13, 100], [4, 5],
      ];
      const cycle = Math.floor(payload.seed / patterns.length);
      const [baseN, d] = patterns[payload.seed % patterns.length];
      const n = baseN + cycle;
      return {
        question: t(lang, `把 ${fractionText(n, d)} 化成小数。`, `Convert ${fractionText(n, d)} to a decimal.`),
        answer: decimalText(n / d),
      };
    }
    case 'decimal_to_percent': {
      const values = [0.1, 0.25, 0.5, 0.6, 0.75, 0.8, 0.2, 0.4, 0.3, 0.9];
      const cycle = Math.floor(payload.seed / values.length);
      const value = values[payload.seed % values.length] + cycle * 0.1;
      return {
        question: t(lang, `把 ${decimalText(value)} 化成百分数。`, `Convert ${decimalText(value)} to a percentage.`),
        answer: `${Math.round(value * 100)}%`,
      };
    }
    case 'percent_to_fraction': {
      const values = [10, 20, 25, 30, 40, 50, 60, 75, 80, 90];
      const cycle = Math.floor(payload.seed / values.length);
      const value = values[payload.seed % values.length] + cycle * 10;
      return {
        question: t(lang, `把 ${value}% 化成最简分数。`, `Convert ${value}% to a simplified fraction.`),
        answer: fractionText(value, 100),
      };
    }
    case 'compare_fraction_decimal': {
      const patterns = [
        [[1, 2], 0.4],
        [[3, 5], 0.58],
        [[7, 10], 0.69],
        [[2, 3], 0.7],
        [[5, 8], 0.62],
        [[9, 20], 0.46],
      ];
      const cycle = Math.floor(payload.seed / patterns.length);
      const [[baseN, baseD], baseDec] = patterns[payload.seed % patterns.length];
      const n = baseN + cycle;
      const d = baseD + cycle;
      const dec = baseDec + cycle * 0.1;
      return {
        question: t(lang, `比较 ${fractionText(n, d)} 和 ${decimalText(dec)}，哪个更大？`, `Compare ${fractionText(n, d)} and ${decimalText(dec)}. Which is larger?`),
        answer: n / d > dec ? fractionText(n, d) : decimalText(dec),
      };
    }
    case 'part_of_whole': {
      const whole = absInt(payload.seed, 8, 40) + Math.floor(payload.seed / 6) * 5;
      const [baseN, d] = [[1, 2], [1, 3], [3, 4], [2, 5], [4, 5], [3, 8]][payload.seed % 6];
      const n = baseN + Math.floor(payload.seed / 6);
      const part = (whole * n) / d;
      return {
        question: t(lang, `求 ${fractionText(n, d)} 的 ${whole}。`, `Find ${fractionText(n, d)} of ${whole}.`),
        answer: decimalText(part),
      };
    }
    case 'fraction_add_sub': {
      const den = [4, 5, 8, 10, 12][payload.seed % 5] + Math.floor(payload.seed / 5);
      const n1 = absInt(payload.seed, 1, den - 1);
      const n2 = absInt(payload.seed * 2, 1, den - 1);
      const sum = n1 + n2;
      const diff = Math.max(n1, n2) - Math.min(n1, n2);
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `计算：${fractionText(n1, den)} + ${fractionText(n2, den)} - ${fractionText(1, den)}。`, `Calculate: ${fractionText(n1, den)} + ${fractionText(n2, den)} - ${fractionText(1, den)}.`),
          answer: fractionText(sum - 1, den),
        };
      }
      if (difficulty === 'Medium') {
        return {
          question: t(lang, `计算：${fractionText(n1, den)} + ${fractionText(n2, den)}。`, `Calculate: ${fractionText(n1, den)} + ${fractionText(n2, den)}.`),
          answer: fractionText(sum, den),
        };
      }
      return {
        question: t(lang, `计算：${fractionText(Math.max(n1, n2), den)} - ${fractionText(Math.min(n1, n2), den)}。`, `Calculate: ${fractionText(Math.max(n1, n2), den)} - ${fractionText(Math.min(n1, n2), den)}.`),
        answer: fractionText(diff, den),
      };
    }
    case 'mixed_number_operation': {
      const den = [2, 4, 5, 8][payload.seed % 4] + Math.floor(payload.seed / 4);
      const whole1 = absInt(payload.seed, 1, 4) + Math.floor(payload.seed / 8);
      const whole2 = absInt(payload.seed * 2, 1, 4) + Math.floor(payload.seed / 10);
      const n1 = absInt(payload.seed * 3, 1, den - 1);
      const n2 = absInt(payload.seed * 4, 1, den - 1);
      const num = whole1 * den + n1 + whole2 * den + n2;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `计算：${whole1} ${fractionText(n1, den)} + ${whole2} ${fractionText(n2, den)} - ${fractionText(1, den)}。`, `Calculate: ${whole1} ${fractionText(n1, den)} + ${whole2} ${fractionText(n2, den)} - ${fractionText(1, den)}.`),
          answer: mixedText(num - 1, den),
        };
      }
      return {
        question: t(lang, `计算：${whole1} ${fractionText(n1, den)} + ${whole2} ${fractionText(n2, den)}。`, `Calculate: ${whole1} ${fractionText(n1, den)} + ${whole2} ${fractionText(n2, den)}.`),
        answer: mixedText(num, den),
      };
    }
    case 'simplify_fraction': {
      const factor = absInt(payload.seed, 2, 8) + Math.floor(payload.seed / 6);
      const num = factor * absInt(payload.seed * 2, 2, 9);
      const den = factor * absInt(payload.seed * 3, 2, 10);
      const reduced = reduceFraction(num, den);
      return {
        question: t(lang, `化简分数 ${num}/${den}。`, `Simplify the fraction ${num}/${den}.`),
        answer: fractionText(reduced.numerator, reduced.denominator),
      };
    }
    case 'ratio_as_fraction': {
      const a = absInt(payload.seed, 2, 12) + Math.floor(payload.seed / 4);
      const b = absInt(payload.seed * 2, 2, 12) + Math.floor(payload.seed / 5);
      return {
        question: t(lang, `把比 ${a}:${b} 写成最简分数。`, `Write the ratio ${a}:${b} as a simplified fraction.`),
        answer: fractionText(a, b),
      };
    }
    case 'reverse_whole_from_part': {
      const whole = absInt(payload.seed, 12, 60) + Math.floor(payload.seed / 5) * 3;
      const [baseN, d] = [[1, 2], [1, 3], [3, 4], [2, 5], [4, 5]][payload.seed % 5];
      const n = baseN + Math.floor(payload.seed / 5);
      const part = (whole * n) / d;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `某个数的 ${fractionText(n, d)} 是 ${decimalText(part)}。这个数是多少？`, `A number's ${fractionText(n, d)} is ${decimalText(part)}. What is the whole number?`),
          answer: String(whole),
        };
      }
      return {
        question: t(lang, `已知 ${fractionText(n, d)} 的量是 ${decimalText(part)}，求整体。`, `Given that ${fractionText(n, d)} of a quantity is ${decimalText(part)}, find the whole.`),
        answer: String(whole),
      };
    }
    case 'simplify_ratio': {
      const factor = absInt(payload.seed, 2, 7);
      const a = factor * absInt(payload.seed * 2, 2, 8);
      const b = factor * absInt(payload.seed * 3, 2, 9);
      const reduced = reduceFraction(a, b);
      if (difficulty === 'Hard') {
        const diff = a - b;
        return {
          question: t(lang, `两个数的比是 ${a}:${b}，它们的差是 ${diff}。求这两个数。`, `Two numbers are in the ratio ${a}:${b}, and their difference is ${diff}. Find the two numbers.`),
          answer: `${a} 和 ${b}`,
        };
      }
      return {
        question: t(lang, `化简比 ${a}:${b}。`, `Simplify the ratio ${a}:${b}.`),
        answer: `${reduced.numerator}:${reduced.denominator}`,
      };
    }
    case 'share_in_ratio': {
      const total = absInt(payload.seed, 12, 80);
      const left = absInt(payload.seed * 2, 1, 6);
      const right = absInt(payload.seed * 3, 1, 6);
      const sum = left + right;
      const part = (total * left) / sum;
      if (difficulty === 'Hard') {
        const newLeft = left + 1;
        const newRight = right + 2;
        const multiplier = absInt(payload.seed * 4, 2, 8);
        const originalLeft = left * multiplier;
        const originalRight = right * multiplier;
        const changedTotal = originalLeft + originalRight + multiplier;
        return {
          question: t(lang, `A、B 两部分的比是 ${left}:${right}。如果 A 增加 ${multiplier} 个、B 增加 ${2 * multiplier} 个后，A:B 变成 ${newLeft}:${newRight}，求原来 A、B 各是多少。`, `Two parts A and B are in the ratio ${left}:${right}. If A increases by ${multiplier} and B increases by ${2 * multiplier}, the ratio becomes ${newLeft}:${newRight}. Find the original A and B.`),
          answer: `${originalLeft} 和 ${originalRight}`,
        };
      }
      return {
        question: t(lang, `把 ${total} 按 ${left}:${right} 分配，第一份是多少？`, `Share ${total} in the ratio ${left}:${right}. What is the first share?`),
        answer: decimalText(part),
      };
    }
    case 'direct_proportion_table': {
      const x = absInt(payload.seed, 2, 12);
      const k = absInt(payload.seed * 2, 2, 8);
      const y = x * k;
      if (difficulty === 'Hard') {
        const x2 = x + absInt(payload.seed * 3, 2, 6);
        const y2 = x2 * k;
        return {
          question: t(lang, `若 x 与 y 成正比例，且 x = ${x} 时 y = ${y}。当 x 增加 ${x2 - x} 后，y 变为多少？再问：k 的值是多少？`, `If x and y are directly proportional, and y = ${y} when x = ${x}. When x increases by ${x2 - x}, what is the new y? Also, what is k?`),
          answer: `${y2}，k=${k}`,
        };
      }
      return {
        question: t(lang, `若 x 与 y 成正比例，且 x = ${x} 时 y = ${y}。当 x = ${x + 1} 时 y 是多少？`, `If x and y are directly proportional, and y = ${y} when x = ${x}. What is y when x = ${x + 1}?`),
        answer: String((x + 1) * k),
      };
    }
    case 'unit_rate': {
      const quantity = absInt(payload.seed, 3, 12);
      const cost = absInt(payload.seed * 2, 6, 40);
      const unit = cost / quantity;
      if (difficulty === 'Hard') {
        const quantity2 = quantity + absInt(payload.seed * 3, 1, 5);
        const cost2 = cost + absInt(payload.seed * 4, 5, 25);
        return {
          question: t(lang, `A 方案 ${quantity} 个物品花 ${cost} 元，B 方案 ${quantity2} 个物品花 ${cost2} 元。哪个方案的单价更低？`, `Plan A costs ${cost} yuan for ${quantity} items, and Plan B costs ${cost2} yuan for ${quantity2} items. Which plan has the lower unit price?`),
          answer: cost / quantity < cost2 / quantity2 ? 'A' : cost2 / quantity2 < cost / quantity ? 'B' : 'same',
        };
      }
      return {
        question: t(lang, `${quantity} 个物品花费 ${cost} 元，单价是多少？`, `If ${quantity} items cost ${cost} yuan, what is the unit price?`),
        answer: decimalText(unit),
      };
    }
    case 'scale_map': {
      const scale = [1000, 2000, 5000, 10000][payload.seed % 4];
      const mapDistance = absInt(payload.seed, 2, 12);
      const real = mapDistance * scale;
      if (difficulty === 'Hard') {
        const mapDistance2 = mapDistance + absInt(payload.seed * 3, 2, 7);
        const real2 = mapDistance2 * scale;
        return {
          question: t(lang, `比例尺 1:${scale} 的地图上，甲乙两地相距 ${mapDistance} cm，丙丁两地相距 ${mapDistance2} cm。两段实际距离相差多少米？`, `On a map with scale 1:${scale}, A and B are ${mapDistance} cm apart, and C and D are ${mapDistance2} cm apart. How many meters apart are the two real distances?`),
          answer: String((real2 - real) / 100),
        };
      }
      return {
        question: t(lang, `比例尺 1:${scale} 的地图上，两地相距 ${mapDistance} cm。实际距离是多少 cm？`, `On a map with scale 1:${scale}, the distance between two places is ${mapDistance} cm. What is the real distance in cm?`),
        answer: String(real),
      };
    }
    case 'recipe_scaling': {
      const servings = absInt(payload.seed, 2, 6);
      const target = servings + absInt(payload.seed * 2, 1, 5);
      const sugar = absInt(payload.seed * 3, 2, 12);
      const scaled = (sugar * target) / servings;
      if (difficulty === 'Hard') {
        const target2 = target + absInt(payload.seed * 4, 2, 6);
        const sugar2 = (sugar * target2) / servings;
        return {
          question: t(lang, `做 ${servings} 人份需要 ${sugar} 克糖。若改做 ${target2} 人份并额外再加 ${sugar2 - scaled} 克糖，最终一共需要多少克糖？`, `A recipe for ${servings} servings uses ${sugar} g of sugar. If you scale it to ${target2} servings and then add ${sugar2 - scaled} more grams, how much sugar is needed in total?`),
          answer: decimalText(sugar2 + (sugar2 - scaled)),
        };
      }
      return {
        question: t(lang, `做 ${servings} 人份需要 ${sugar} 克糖。做 ${target} 人份需要多少克糖？`, `A recipe for ${servings} servings uses ${sugar} g of sugar. How much sugar is needed for ${target} servings?`),
        answer: decimalText(scaled),
      };
    }
    case 'inverse_proportion': {
      const workers = absInt(payload.seed, 2, 8);
      const days = absInt(payload.seed * 2, 4, 12);
      const work = workers * days;
      const newWorkers = workers + 2;
      const newDays = work / newWorkers;
      if (difficulty === 'Hard') {
        const extraWorkers = workers + 4;
        const extraDays = work / extraWorkers;
        return {
          question: t(lang, `${workers} 个人完成一项工作要 ${days} 天。如果改成 ${newWorkers} 个人做需要多少天？再改成 ${extraWorkers} 个人做又需要多少天？`, `If ${workers} people take ${days} days to finish a job, how many days would ${newWorkers} people need? How about ${extraWorkers} people?`),
          answer: `${decimalText(newDays)} 和 ${decimalText(extraDays)}`,
        };
      }
      return {
        question: t(lang, `${workers} 个人完成一项工作要 ${days} 天。如果改成 ${newWorkers} 个人做，预计要多少天？`, `${workers} people take ${days} days to finish a job. If ${newWorkers} people do it, about how many days will it take?`),
        answer: decimalText(newDays),
      };
    }
    case 'missing_value_proportion': {
      const a = absInt(payload.seed, 2, 12);
      const b = absInt(payload.seed * 2, 4, 20);
      const c = absInt(payload.seed * 3, 3, 16);
      const x = (b * c) / a;
      if (difficulty === 'Hard') {
        return {
          question: t(lang, `若 ${a}:${b} = ${c}:x，且 ${a}、${b}、${c}、x 的和是 ${a + b + c + x}，求 x。`, `If ${a}:${b} = ${c}:x, and ${a}, ${b}, ${c}, and x add up to ${a + b + c + x}, find x.`),
          answer: decimalText(x),
        };
      }
      return {
        question: t(lang, `若 ${a}:${b} = ${c}:x，求 x。`, `If ${a}:${b} = ${c}:x, find x.`),
        answer: decimalText(x),
      };
    }
    case 'compare_two_rates': {
      const a1 = absInt(payload.seed, 2, 10);
      const b1 = absInt(payload.seed * 2, 10, 60);
      const a2 = absInt(payload.seed * 3, 2, 10);
      const b2 = absInt(payload.seed * 4, 10, 60);
      const rate1 = b1 / a1;
      const rate2 = b2 / a2;
      if (difficulty === 'Hard') {
        const b1Per10 = (b1 / a1) * 10;
        const b2Per10 = (b2 / a2) * 10;
        return {
          question: t(lang, `比较两种方案的“每 10 个”的平均价格：A 方案 ${a1} 个花 ${b1} 元，B 方案 ${a2} 个花 ${b2} 元。哪一种更便宜？`, `Compare the average price per 10 items: Plan A costs ${b1} yuan for ${a1} items, and Plan B costs ${b2} yuan for ${a2} items. Which is cheaper?`),
          answer: b1Per10 < b2Per10 ? 'A' : b2Per10 < b1Per10 ? 'B' : 'same',
        };
      }
      return {
        question: t(lang, `比较两种方案的单价：A 方案 ${a1} 个花 ${b1} 元，B 方案 ${a2} 个花 ${b2} 元。哪个更便宜？`, `Compare two unit prices: Plan A costs ${b1} yuan for ${a1} items, and Plan B costs ${b2} yuan for ${a2} items. Which is cheaper?`),
        answer: rate1 < rate2 ? 'A' : rate2 < rate1 ? 'B' : 'same',
      };
    }
    case 'proportional_word_problem': {
      const base = absInt(payload.seed, 2, 8);
      const factor = absInt(payload.seed * 2, 2, 6);
      const total = base * factor;
      const extra = absInt(payload.seed * 3, 1, 5);
      if (difficulty === 'Hard') {
        const k = absInt(payload.seed * 4, 3, 10);
        const red = base * k;
        const blue = factor * k;
        return {
          question: t(lang, `一盒彩球里红球和蓝球的比是 ${base}:${factor}。如果红球增加 ${k} 个、蓝球增加 ${2 * k} 个后，比变成 ${(base + 1)}:${(factor + 2)}，求原来红球和蓝球各有多少个。`, `The ratio of red to blue balls in a box is ${base}:${factor}. If red increases by ${k} and blue increases by ${2 * k}, the ratio becomes ${base + 1}:${factor + 2}. Find the original red and blue counts.`),
          answer: `${red} 和 ${blue}`,
        };
      }
      return {
        question: t(lang, `一盒彩球里红球和蓝球的比是 ${base}:${factor}。如果红球有 ${total} 个，蓝球有多少个？`, `The ratio of red to blue balls is ${base}:${factor}. If there are ${total} red balls, how many blue balls are there?`),
        answer: String(factor * factor),
      };
    }
    case '': {
      const p = 2 + (payload.seed % 3);
      const q = 3 + (payload.seed % 4);
      const r = 4 + (payload.seed % 3);
      const s = 5 + (payload.seed % 4);
      const l = (q * r) / gcd(q, r);
      const aScale = l / q;
      const cScale = l / r;
      const unit = absInt(payload.seed * 7, 3, 12);
      const A = p * aScale * unit;
      const B = l * unit;
      const C = s * cScale * unit;
      return {
        question: t(
          lang,
          `?? A:B = ${p}:${q},B:C = ${r}:${s},? A?B?C ???? ${A + B + C}?? A?B?C?`,
          `Given A:B = ${p}:${q}, B:C = ${r}:${s}, and A+B+C = ${A + B + C}, find A, B, and C.`
        ),
        answer: `${A}?${B}?${C}`,
      };
    }
    case '': {
      const unit = absInt(payload.seed * 5, 4, 12);
      const originalA = 3 * unit;
      const originalB = 5 * unit;
      const addA = unit;
      const subtractB = 2 * unit;
      return {
        question: t(
          lang,
          `?????? 3:5????????? ${addA},?????? ${subtractB} ?,??? 4:3?????????`,
          `Two numbers are in the ratio 3:5. If the first increases by ${addA} and the second decreases by ${subtractB}, the ratio becomes 4:3. Find the original numbers.`
        ),
        answer: `${originalA} ? ${originalB}`,
      };
    }
    case '': {
      const baseFeeA = absInt(payload.seed, 5, 20);
      const perA = absInt(payload.seed * 2, 2, 8);
      const baseFeeB = absInt(payload.seed * 3, 4, 18);
      const perB = absInt(payload.seed * 4, 1, 6);
      const usage = absInt(payload.seed * 5, 5, 20);
      const costA = baseFeeA + perA * usage;
      const costB = baseFeeB + perB * usage;
      return {
        question: t(
          lang,
          `??A:??? ${baseFeeA} ?,?? ${perA} ?;??B:??? ${baseFeeB} ?,?? ${perB} ???? ${usage} ?,????????`,
          `Plan A has a base fee of ${baseFeeA} yuan and costs ${perA} yuan per item; Plan B has a base fee of ${baseFeeB} yuan and costs ${perB} yuan per item. For ${usage} items, which plan is cheaper?`
        ),
        answer: costA < costB ? 'A' : costB < costA ? 'B' : 'same',
      };
    }
    case '': {
      const scale = absInt(payload.seed, 2, 8);
      const part1 = scale * absInt(payload.seed * 2, 2, 8);
      const part2 = scale * absInt(payload.seed * 3, 2, 8);
      const extra = absInt(payload.seed * 4, 1, 5);
      const total = part1 + part2 + extra * 2;
      return {
        question: t(
          lang,
          `???????????? ${part1}:${part2}?????? ${extra} ????? ${extra} ?????? ${total} ?,??????????`,
          `The quantities of A and B are in the ratio ${part1}:${part2}. If both A and B increase by ${extra}, and the total becomes ${total}, what were the original quantities?`
        ),
        answer: `${part1} ? ${part2}`,
      };
    }
    default:
      return {
        question: t(lang, '请回答一个代数题。', 'Please answer an algebra question.'),
        answer: '',
      };
  }
}

const ALGEBRA_BANKS = {
  arithmetic: {
    families: [
      'integer_add_sub',
      'order_of_operations',
      'mixed_operations',
      'missing_number_additive',
      'missing_number_multiplicative',
      'compare_two_expressions',
      'rounding_estimate',
      'pattern_next_term',
      'word_problem_two_step',
      'check_calculation',
    ],
  },
  'rational-numbers': {
    families: [
      'compare_number_line',
      'order_negative_numbers',
      'add_sub_negatives',
      'temperature_change',
      'absolute_value',
      'opposite_number',
      'sign_prediction',
      'net_change_context',
      'compare_two_situations',
      'correction_negative_error',
    ],
  },
  'fractions-decimals': {
    families: [
      'fraction_to_decimal',
      'decimal_to_percent',
      'percent_to_fraction',
      'compare_fraction_decimal',
      'part_of_whole',
      'fraction_add_sub',
      'mixed_number_operation',
      'simplify_fraction',
      'ratio_as_fraction',
      'reverse_whole_from_part',
    ],
  },
  'ratio-proportion': {
    familiesByDifficulty: {
      Easy: [
        'simplify_ratio',
        'share_in_ratio',
        'unit_rate',
        'direct_proportion_table',
        'scale_map',
        'recipe_scaling',
        'inverse_proportion',
        'missing_value_proportion',
        'compare_two_rates',
        'proportional_word_problem',
      ],
      Medium: [
        'simplify_ratio',
        'share_in_ratio',
        'unit_rate',
        'direct_proportion_table',
        'scale_map',
        'recipe_scaling',
        'inverse_proportion',
        'missing_value_proportion',
        'compare_two_rates',
        'proportional_word_problem',
      ],
      Hard: [
        'inverse_proportion',
        'missing_value_proportion',
        'compare_two_rates',
        'proportional_word_problem',
        'recipe_scaling',
        'scale_map',
        'simplify_ratio',
        'share_in_ratio',
        'unit_rate',
        'direct_proportion_table',
      ],
    },
  },
};

function buildBankItem(conceptId, familyKind, seed, lang, difficulty, grade, curriculum) {
  const payload = { seed, conceptId, grade, curriculum };
  const { question, answer } = buildQuestion(familyKind, payload, lang, difficulty);
  return {
    conceptId,
    kind: familyKind,
    question,
    answer,
    lang,
    difficulty,
    grade,
    curriculum,
  };
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

function buildBankItems(count, { conceptId, lang = 'zh', difficulty = 'Easy', grade = '8', curriculum = null } = {}) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (safeCount === 0) return [];

  if (isAdvancedAlgebraQuestionBankConcept(conceptId)) {
    return buildAdvancedAlgebraExerciseItems(safeCount, { conceptId, lang, difficulty, grade, curriculum });
  }

  const spec = ALGEBRA_BANKS[conceptId];
  if (!spec) return [];

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const historyKey = makeHistoryKey(conceptId, grade, normalizedDifficulty, curriculum);
  const recentFamilies = readRecentFamilies(historyKey);
  const familyOrder = Array.isArray(spec.familiesByDifficulty?.[normalizedDifficulty])
    ? spec.familiesByDifficulty[normalizedDifficulty]
    : spec.families;
  const startIndex = recentFamilies.length > 0
    ? (familyOrder.indexOf(recentFamilies[recentFamilies.length - 1]) + 1) % familyOrder.length
    : 0;
  const seedBase = recentFamilies.length;

  const items = [];
  for (let i = 0; i < safeCount; i += 1) {
    const familyKind = familyOrder[(startIndex + i) % familyOrder.length];
    const seed = seedBase + i;
    items.push(buildBankItem(conceptId, familyKind, seed, lang, normalizedDifficulty, grade, curriculum));
  }

  const issues = validateBankItems(items);
  if (issues.length > 0) {
    throw new Error(`Invalid algebra qbank items: ${issues.join('; ')}`);
  }

  writeRecentFamilies(historyKey, items.map((item) => item.kind));
  return items;
}

function renderBankItem(item, index) {
  return formatQuestion(index, item.question);
}

function buildAlgebraExerciseBatch(options = {}) {
  const items = buildBankItems(options.count ?? 0, options);
  if (!Array.isArray(items) || items.length === 0) return '';

  const issues = validateBankItems(items);
  if (issues.length > 0) {
    throw new Error(`Invalid algebra qbank batch: ${issues.join('; ')}`);
  }

  const rendered = items.map((item, index) => renderBankItem(item, index));
  const duplicateQuestion = new Set();
  for (const line of rendered) {
    if (duplicateQuestion.has(line)) {
      throw new Error('Algebra qbank render validation failed: duplicate question text in batch');
    }
    duplicateQuestion.add(line);
  }

  return rendered.join('\n\n');
}

function isAlgebraQuestionBankConcept(conceptId = '', conceptTitle = '', conceptDesc = '') {
  const id = String(conceptId ?? '').trim().toLowerCase();
  const title = `${String(conceptTitle ?? '').toLowerCase()} ${String(conceptDesc ?? '').toLowerCase()}`;
  if (ALGEBRA_QBANK_CONCEPT_IDS.has(id)) return true;
  if (/(integer|rational number|fraction|decimal|percent|ratio|proportion)/.test(title)) return true;
  return false;
}

export {
  ALGEBRA_QBANK_CONCEPT_IDS,
  buildAlgebraExerciseBatch,
  buildBankItems,
  isAlgebraQuestionBankConcept,
  validateBankItems,
};


