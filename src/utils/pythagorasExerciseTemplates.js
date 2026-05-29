const PYTHAGORAS_SCENARIOS = [
  {
    id: 'cn_direct_hypotenuse',
    curricula: ['CN'],
    grades: ['7', '8'],
    difficulties: ['Easy', 'Medium'],
    kind: 'direct_hypotenuse',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '345', legAB: 3, legBC: 4, hypotenuse: 5 },
      { variantId: '6810', legAB: 6, legBC: 8, hypotenuse: 10 },
      { variantId: '51213', legAB: 5, legBC: 12, hypotenuse: 13 },
    ],
  },
  {
    id: 'cn_direct_leg_ab',
    curricula: ['CN'],
    grades: ['7', '8', '9'],
    difficulties: ['Easy', 'Medium'],
    kind: 'direct_leg_ab',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '51213', legAB: 12, legBC: 5, hypotenuse: 13 },
      { variantId: '7825', legAB: 24, legBC: 7, hypotenuse: 25 },
    ],
  },
  {
    id: 'cn_direct_leg_bc',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'direct_leg_bc',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '72425', legAB: 7, legBC: 24, hypotenuse: 25 },
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
    ],
  },
  {
    id: 'cn_show_right_triangle',
    curricula: ['CN'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'show_right_triangle',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
      { variantId: '94041', legAB: 9, legBC: 40, hypotenuse: 41 },
    ],
  },
  {
    id: 'cn_exact_surd',
    curricula: ['CN'],
    grades: ['9'],
    difficulties: ['Hard'],
    kind: 'direct_hypotenuse_surd',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '79root130', legAB: 7, legBC: 9, hypotenuse: Math.sqrt(130) },
      { variantId: '1013root269', legAB: 10, legBC: 13, hypotenuse: Math.sqrt(269) },
    ],
  },
  {
    id: 'us_ladder_easy',
    curricula: ['US'],
    grades: ['7', '8'],
    difficulties: ['Easy', 'Medium'],
    kind: 'ladder_height',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '6810', length: 10, foot: 6, height: 8 },
      { variantId: '51213', length: 13, foot: 5, height: 12 },
      { variantId: '81517', length: 17, foot: 8, height: 15 },
    ],
  },
  {
    id: 'us_ladder_hard',
    curricula: ['US'],
    grades: ['8', '9'],
    difficulties: ['Hard'],
    kind: 'ladder_height',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '91715', length: 15, foot: 9, height: 12 },
      { variantId: '72524', length: 25, foot: 7, height: 24 },
    ],
  },
  {
    id: 'uk_show_right_triangle',
    curricula: ['UK'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'show_right_triangle',
    diagramTemplate: 'right_triangle',
    values: [
      { variantId: '72425', legAB: 7, legBC: 24, hypotenuse: 25 },
      { variantId: '202129', legAB: 20, legBC: 21, hypotenuse: 29 },
      { variantId: '81517', legAB: 8, legBC: 15, hypotenuse: 17 },
      { variantId: '116061', legAB: 11, legBC: 60, hypotenuse: 61 },
      { variantId: '138485', legAB: 13, legBC: 84, hypotenuse: 85 },
    ],
  },
  {
    id: 'sg_ladder_context',
    curricula: ['SG'],
    grades: ['7', '8', '9'],
    difficulties: ['Easy', 'Medium'],
    kind: 'ladder_height',
    diagramTemplate: 'ladder',
    unit: 'm',
    values: [
      { variantId: '81517', length: 17, foot: 8, height: 15 },
      { variantId: '261024', length: 26, foot: 10, height: 24 },
      { variantId: '131284', length: 85, foot: 13, height: 84 },
      { variantId: '151225', length: 25, foot: 15, height: 20 },
    ],
  },
  {
    id: 'ib_coordinate_distance',
    curricula: ['IB'],
    grades: ['8', '9'],
    difficulties: ['Medium', 'Hard'],
    kind: 'coordinate_distance',
    diagramTemplate: 'coordinate_points',
    values: [
      {
        variantId: '068',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 6, y: 0, label: 'B' },
          { x: 6, y: 8, label: 'C' },
        ],
      },
      {
        variantId: '0912',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 9, y: 0, label: 'B' },
          { x: 9, y: 12, label: 'C' },
        ],
      },
      {
        variantId: '51213',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 5, y: 0, label: 'B' },
          { x: 5, y: 12, label: 'C' },
        ],
      },
      {
        variantId: '81517',
        points: [
          { x: 0, y: 0, label: 'A' },
          { x: 8, y: 0, label: 'B' },
          { x: 8, y: 15, label: 'C' },
        ],
      },
    ],
  },
];

const HISTORY_KEY = 'math7-9:pythagoras-variant-history:v3';
const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
const GRADE_ORDER = { '6': 6, '7': 7, '8': 8, '9': 9 };
const DEFAULT_UNIT = 'cm';

function isFinitePositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function toText(value) {
  return String(value ?? '').trim();
}

function normalizeGrade(value) {
  const grade = toText(value);
  return GRADE_ORDER[grade] ? grade : '7';
}

function normalizeDifficulty(value) {
  const difficulty = toText(value);
  return DIFFICULTY_ORDER[difficulty] !== undefined ? difficulty : 'Medium';
}

function normalizeCurriculum(value) {
  const curriculum = toText(value).toUpperCase();
  return ['CN', 'US', 'UK', 'SG', 'IB'].includes(curriculum) ? curriculum : null;
}

function formatLength(value, unit = DEFAULT_UNIT) {
  return `${value} ${unit}`;
}

function createHistoryKey({ curriculum, grade, difficulty }) {
  return `${HISTORY_KEY}:${curriculum ?? 'ANY'}:${normalizeGrade(grade)}:${normalizeDifficulty(difficulty)}`;
}

function canUseLocalStorage() {
  return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
}

function readRecentVariantKeys(historyKey) {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = localStorage.getItem(historyKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value) => typeof value === 'string');
  } catch {
    return [];
  }
}

function writeRecentVariantKeys(historyKey, keys) {
  if (!canUseLocalStorage()) return;
  try {
    const prior = readRecentVariantKeys(historyKey);
    const merged = [...keys, ...prior].filter((key, index, list) => list.indexOf(key) === index);
    localStorage.setItem(historyKey, JSON.stringify(merged.slice(0, 24)));
  } catch {
    // Silent fallback. History is only a soft guard.
  }
}

function rngValue(randomSource) {
  if (typeof randomSource === 'function') {
    const value = Number(randomSource());
    if (Number.isFinite(value) && value >= 0 && value < 1) return value;
  }
  return Math.random();
}

function shuffle(values, randomSource) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rngValue(randomSource) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scenarioMatchesContext(scenario, { curriculum, grade, difficulty }) {
  const normalizedCurriculum = normalizeCurriculum(curriculum);
  const normalizedGrade = normalizeGrade(grade);
  const normalizedDifficulty = normalizeDifficulty(difficulty);

  const curriculumOk =
    !normalizedCurriculum || scenario.curricula.includes(normalizedCurriculum);

  const gradeOk = scenario.grades.includes(normalizedGrade);
  const difficultyOk = scenario.difficulties.includes(normalizedDifficulty);

  return curriculumOk && gradeOk && difficultyOk;
}

function getCandidateScenarios(context) {
  const filtered = PYTHAGORAS_SCENARIOS.filter((scenario) => scenarioMatchesContext(scenario, context));
  if (filtered.length > 0) return filtered;

  return PYTHAGORAS_SCENARIOS.filter((scenario) => scenario.grades.includes(normalizeGrade(context.grade)));
}

function scenarioVariantKey(scenario, valueSet) {
  return `${scenario.id}:${valueSet.variantId}`;
}

function buildVariantPool(scenarios) {
  return scenarios.flatMap((scenario) =>
    scenario.values.map((valueSet) => ({
      key: scenarioVariantKey(scenario, valueSet),
      scenario,
      valueSet,
    }))
  );
}

function pickVariants(variantPool, count, randomSource, recentVariantKeys) {
  const fresh = variantPool.filter((variant) => !recentVariantKeys.has(variant.key));
  const stale = variantPool.filter((variant) => recentVariantKeys.has(variant.key));
  const ordered = [...shuffle(fresh, randomSource), ...shuffle(stale, randomSource)];
  const selected = [];
  const usedKeys = new Set();

  for (const variant of ordered) {
    if (selected.length >= count) break;
    if (usedKeys.has(variant.key)) continue;
    selected.push(variant);
    usedKeys.add(variant.key);
  }

  return selected.slice(0, count);
}

function buildQuestionText(item, lang, context) {
  const zh = lang === 'zh';
  const unit = item.unit ?? DEFAULT_UNIT;

  if (item.kind === 'direct_hypotenuse') {
    if (zh) {
      return `在直角三角形ABC中，∠B = 90°，AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}。求 AC 的长度。`;
    }
    return `In right triangle ABC, angle B = 90°, AB = ${formatLength(item.legAB, unit)}, and BC = ${formatLength(item.legBC, unit)}. Find the length of AC.`;
  }

  if (item.kind === 'direct_hypotenuse_surd') {
    if (zh) {
      return `在直角三角形ABC中，∠B = 90°，AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}。求 AC 的长度，并用最简根式表示。`;
    }
    return `In right triangle ABC, angle B = 90°, AB = ${formatLength(item.legAB, unit)}, and BC = ${formatLength(item.legBC, unit)}. Find the length of AC in simplest surd form.`;
  }

  if (item.kind === 'direct_leg_ab') {
    if (zh) {
      return `在直角三角形ABC中，∠B = 90°，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。求 AB 的长度。`;
    }
    return `In right triangle ABC, angle B = 90°, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}. Find the length of AB.`;
  }

  if (item.kind === 'direct_leg_bc') {
    if (zh) {
      return `在直角三角形ABC中，∠B = 90°，AB = ${formatLength(item.legAB, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。求 BC 的长度。`;
    }
    return `In right triangle ABC, angle B = 90°, AB = ${formatLength(item.legAB, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}. Find the length of BC.`;
  }

  if (item.kind === 'show_right_triangle') {
    if (context.curriculum === 'UK') {
      return zh
        ? `证明三角形ABC在 B 点是直角三角形。已知 AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。`
        : `Show that triangle ABC is right-angled at B. Given AB = ${formatLength(item.legAB, unit)}, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}.`;
    }

    if (context.curriculum === 'US') {
      return zh
        ? `判断三角形ABC是否为直角三角形，并说明理由。已知 AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。`
        : `Decide whether triangle ABC is a right triangle, and explain your reasoning. Given AB = ${formatLength(item.legAB, unit)}, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}.`;
    }

    return zh
      ? `已知三角形ABC的三边分别为 AB = ${formatLength(item.legAB, unit)}，BC = ${formatLength(item.legBC, unit)}，AC = ${formatLength(item.hypotenuse, unit)}。判断它是否为直角三角形。`
      : `Given triangle ABC with AB = ${formatLength(item.legAB, unit)}, BC = ${formatLength(item.legBC, unit)}, and AC = ${formatLength(item.hypotenuse, unit)}, determine whether it is a right triangle.`;
  }

  if (item.kind === 'ladder_height') {
    if (zh) {
      return `一把长度为 ${formatLength(item.length, unit)} 的梯子靠在墙上，梯脚离墙 ${formatLength(item.foot, unit)}。梯子顶端到地面的高度是多少？`;
    }
    return `A ladder of length ${formatLength(item.length, unit)} leans against a wall. The foot of the ladder is ${formatLength(item.foot, unit)} from the wall. How high up the wall does it reach?`;
  }

  if (item.kind === 'coordinate_distance') {
    if (zh) {
      return `在平面直角坐标系中，A(0, 0)，B(${item.bx}, 0)，C(${item.bx}, ${item.cy})。求 AC 的长度。`;
    }
    return `On a coordinate grid, A(0, 0), B(${item.bx}, 0), and C(${item.bx}, ${item.cy}) are plotted. Find the length of AC.`;
  }

  return zh ? '请解答这个勾股定理题。' : 'Solve this Pythagorean theorem question.';
}

function buildDiagramSpec(item) {
  if (item.diagramTemplate === 'ladder') {
    return {
      template: 'ladder',
      length: item.length,
      foot_dist: item.foot,
      label_ladder: formatLength(item.length, item.unit),
      label_foot: formatLength(item.foot, item.unit),
      label_wall: formatLength(item.height, item.unit),
      label_top: 'A',
      label_foot_pt: 'B',
      label_corner: 'O',
    };
  }

  if (item.diagramTemplate === 'coordinate_points') {
    return {
      template: 'coordinate_points',
      axes: true,
      points: item.points.map((point) => ({ ...point })),
      segments: [
        { from: 'A', to: 'B', label: formatLength(item.ab, item.unit) },
        { from: 'B', to: 'C', label: formatLength(item.bc, item.unit) },
        { from: 'A', to: 'C', label: item.kind === 'coordinate_distance' ? '?' : formatLength(item.ac, item.unit) },
      ],
    };
  }

  const baseSpec = {
    template: 'right_triangle',
    leg_h: item.legBC,
    leg_v: item.legAB,
    labels: { A: 'A', B: 'B', C: 'C' },
    label_AB: formatLength(item.legAB, item.unit),
    label_BC: formatLength(item.legBC, item.unit),
    label_AC: formatLength(item.hypotenuse, item.unit),
  };

  if (item.kind === 'direct_hypotenuse' || item.kind === 'direct_hypotenuse_surd') {
    baseSpec.label_AC = '?';
  } else if (item.kind === 'direct_leg_ab') {
    baseSpec.label_AB = '?';
  } else if (item.kind === 'direct_leg_bc') {
    baseSpec.label_BC = '?';
  } else if (item.kind === 'show_right_triangle') {
    baseSpec.label_AB = formatLength(item.legAB, item.unit);
    baseSpec.label_BC = formatLength(item.legBC, item.unit);
    baseSpec.label_AC = formatLength(item.hypotenuse, item.unit);
  }

  return baseSpec;
}

function computeDirectHypotenuseAnswer(item) {
  return Math.sqrt(item.legAB ** 2 + item.legBC ** 2);
}

function validateScenarioItem(item) {
  const issues = [];

  if (!item || typeof item !== 'object') {
    return ['item must be an object'];
  }

  if (item.diagramTemplate === 'right_triangle') {
    if (!isFinitePositiveNumber(item.legAB)) issues.push('legAB must be a positive finite number');
    if (!isFinitePositiveNumber(item.legBC)) issues.push('legBC must be a positive finite number');
    if (!isFinitePositiveNumber(item.hypotenuse)) issues.push('hypotenuse must be a positive finite number');
    if (issues.length === 0) {
      const expected = computeDirectHypotenuseAnswer(item);
      if (Math.abs(expected - item.hypotenuse) > 1e-9 && item.kind !== 'direct_hypotenuse_surd') {
        issues.push('side lengths do not satisfy the Pythagorean theorem');
      }
    }
  }

  if (item.diagramTemplate === 'ladder') {
    if (!isFinitePositiveNumber(item.length)) issues.push('length must be a positive finite number');
    if (!isFinitePositiveNumber(item.foot)) issues.push('foot must be a positive finite number');
    if (!isFinitePositiveNumber(item.height)) issues.push('height must be a positive finite number');
    if (issues.length === 0 && item.length <= item.foot) {
      issues.push('ladder length must be greater than the foot distance');
    }
    if (issues.length === 0) {
      const expected = Math.sqrt(item.length ** 2 - item.foot ** 2);
      if (Math.abs(expected - item.height) > 1e-9) {
        issues.push('ladder values do not satisfy the Pythagorean theorem');
      }
    }
  }

  if (item.diagramTemplate === 'coordinate_points') {
    if (!Array.isArray(item.points) || item.points.length < 3) {
      issues.push('coordinate_points requires three points');
    } else {
      const [A, B, C] = item.points;
      const pointsValid = [A, B, C].every((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
      if (!pointsValid) {
        issues.push('coordinate_points contains invalid point coordinates');
      } else {
        const ab = Math.hypot(B.x - A.x, B.y - A.y);
        const bc = Math.hypot(C.x - B.x, C.y - B.y);
        const ac = Math.hypot(C.x - A.x, C.y - A.y);
        if (Math.abs((ab ** 2) + (bc ** 2) - (ac ** 2)) > 1e-9) {
          issues.push('coordinate points do not form a right triangle');
        }
      }
    }
  }

  return issues;
}

function validateRenderedScenarioItem(item, rendered) {
  const issues = validateScenarioItem(item);
  const expectedSpec = JSON.stringify(buildDiagramSpec(item));

  if (!rendered.includes(expectedSpec)) {
    issues.push('rendered diagram block does not match the expected spec');
  }

  if (item.kind === 'direct_hypotenuse' && !rendered.includes('AC 的长度') && !rendered.includes('Find the length of AC')) {
    issues.push('hypotenuse question text is missing the expected target');
  }

  if (item.kind === 'direct_leg_ab' && !rendered.includes('AB 的长度') && !rendered.includes('Find the length of AB')) {
    issues.push('AB question text is missing the expected target');
  }

  if (item.kind === 'direct_leg_bc' && !rendered.includes('BC 的长度') && !rendered.includes('Find the length of BC')) {
    issues.push('BC question text is missing the expected target');
  }

  if (item.kind === 'ladder_height' && !rendered.includes('ladder') && !rendered.includes('梯子')) {
    issues.push('ladder question text is missing ladder wording');
  }

  if (item.kind === 'coordinate_distance' && !rendered.includes('coordinate grid') && !rendered.includes('平面直角坐标系')) {
    issues.push('coordinate question text is missing coordinate wording');
  }

  return issues;
}

function renderScenarioItem(item, index, lang, context) {
  const question = buildQuestionText(item, lang, context);
  const diagram = JSON.stringify(buildDiagramSpec(item));
  return `${index + 1}. ${question}\n\n\`\`\`math-diagram\n${diagram}\n\`\`\``;
}

export function isPythagorasConcept(conceptId = '', conceptTitle = '', conceptDesc = '') {
  const text = `${conceptId} ${conceptTitle} ${conceptDesc}`.toLowerCase();
  return text.includes('pythagoras') || text.includes('勾股') || text.includes('pythagorean');
}

export function buildPythagorasExerciseItems(count, options = {}) {
  const {
    lang = 'zh',
    curriculum = null,
    grade = '7',
    difficulty = 'Medium',
    random = Math.random,
    recentVariantKeys = null,
    persistHistory = true,
  } = options;

  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const context = {
    curriculum: normalizeCurriculum(curriculum),
    grade: normalizeGrade(grade),
    difficulty: normalizeDifficulty(difficulty),
  };

  const historyKey = createHistoryKey(context);
  const recentKeys = recentVariantKeys ?? (persistHistory ? new Set(readRecentVariantKeys(historyKey)) : new Set());
  const candidates = getCandidateScenarios(context);
  const variantPool = buildVariantPool(candidates);
  const selectedVariants = pickVariants(variantPool, safeCount, random, recentKeys);

  const items = selectedVariants.map(({ scenario, valueSet, key }) => {
    const unit = scenario.unit ?? DEFAULT_UNIT;
    const item = {
      id: key,
      curriculum: context.curriculum,
      grade: context.grade,
      difficulty: context.difficulty,
      lang,
      unit,
      kind: scenario.kind,
      diagramTemplate: scenario.diagramTemplate,
      ...valueSet,
    };

    if (item.diagramTemplate === 'coordinate_points') {
      const points = item.points ?? [];
      item.ax = points[0].x;
      item.ay = points[0].y;
      item.bx = points[1].x;
      item.by = points[1].y;
      item.cx = points[2].x;
      item.cy = points[2].y;
      item.ab = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      item.bc = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
      item.ac = Math.hypot(points[2].x - points[0].x, points[2].y - points[0].y);
    }

    validateScenarioItem(item).forEach((issue) => {
      if (issue) {
        throw new Error(`Invalid Pythagoras scenario ${item.id}: ${issue}`);
      }
    });

    return item;
  });

  if (persistHistory) {
    writeRecentVariantKeys(historyKey, items.map((item) => item.id));
  }

  return items;
}

export function validatePythagorasExerciseItems(items) {
  const issues = [];
  if (!Array.isArray(items) || items.length === 0) {
    return ['items must be a non-empty array'];
  }

  items.forEach((item, index) => {
    const itemIssues = validateScenarioItem(item);
    itemIssues.forEach((issue) => issues.push(`item ${index + 1}: ${issue}`));
  });

  return issues;
}

export function buildPythagorasExerciseBatch(options = {}) {
  const items = buildPythagorasExerciseItems(options.count ?? 0, options);
  const issues = validatePythagorasExerciseItems(items);
  if (issues.length > 0) {
    throw new Error(`Invalid Pythagoras exercise batch: ${issues.join('; ')}`);
  }

  const rendered = items.map((item, index) => renderScenarioItem(item, index, options.lang ?? 'zh', options));
  const renderedIssues = items.flatMap((item, index) => validateRenderedScenarioItem(item, rendered[index]));
  if (renderedIssues.length > 0) {
    throw new Error(`Pythagoras render validation failed: ${renderedIssues.join('; ')}`);
  }

  return rendered.join('\n\n');
}
