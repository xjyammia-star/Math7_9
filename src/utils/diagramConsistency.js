function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasMathDiagramBlock(text) {
  return /```math-diagram[\s\S]*?```/i.test(String(text ?? "")) || /"template"\s*:\s*"/i.test(String(text ?? ""));
}

function hasCircleDiameterTemplate(text) {
  return /"template"\s*:\s*"circle_diameter_points"/i.test(String(text ?? ""));
}

function hasDiameterCue(text) {
  return /(?:直径|diameter)/i.test(String(text ?? ""));
}

function hasAngleCueNeedingBD(text) {
  return /(?:∠\s*ABD|angle\s*ABD|∠\s*BCD|angle\s*BCD|ABD|BCD)/i.test(String(text ?? ""));
}

function hasTangentChordCue(text) {
  return /(?:切线|tangent|切点|弦|chord)/i.test(String(text ?? ""));
}

function hasAngleBACCue(text) {
  return /(?:∠\s*BAC|angle\s*BAC|BAC)/i.test(String(text ?? ""));
}

function hasExpectedTangentChordLabelMap(text) {
  const source = String(text ?? "");
  return /"label_A"\s*:\s*"A"/i.test(source) &&
    /"label_B"\s*:\s*"C"/i.test(source) &&
    /"label_C"\s*:\s*"D"/i.test(source);
}

function hasTangentChordAngleCue(text) {
  return /(?:∠\s*(?:BAC|PAB|ADB|ABD)|angle\s*(?:BAC|PAB|ADB|ABD)|(?:BAC|PAB|ADB|ABD))/i.test(String(text ?? ""));
}

function hasTangentChordArcPointDCue(text) {
  const source = String(text ?? "");
  return /(?:点\s*D|D\s*在|point\s*D|D\s+on\s+the\s+(?:minor|major)?\s*arc|D\s*lies\s*on\s+the\s+(?:minor|major)?\s*arc|∠\s*ADB|angle\s*ADB)/i.test(source);
}

function hasDualTangentChordArcPointsCue(text) {
  const source = String(text ?? "");
  return /(?:C\s*在[^。\n]{0,18}(?:劣弧|minor arc)[^。\n]{0,18}AB|D\s*在[^。\n]{0,18}(?:优弧|major arc)[^。\n]{0,18}AB|C\s*在[^。\n]{0,18}(?:优弧|major arc)[^。\n]{0,18}AB|D\s*在[^。\n]{0,18}(?:劣弧|minor arc)[^。\n]{0,18}AB)/i.test(source);
}

function hasExpectedTangentChordLabels(text, source) {
  const generated = String(text ?? "");
  const sourceText = String(source ?? "");
  const needsDArcPoint = hasTangentChordArcPointDCue(sourceText);

  if (!/"label_A"\s*:\s*"A"/i.test(generated)) return false;

  if (needsDArcPoint) {
    return /"label_(?:C|D)"\s*:\s*"D"/i.test(generated);
  }

  return true;
}

function hasExpectedDualTangentChordLabels(text) {
  const source = String(text ?? "");
  return /"label_A"\s*:\s*"A"/i.test(source) &&
    /"label_B"\s*:\s*"B"/i.test(source) &&
    /"label_C"\s*:\s*"C"/i.test(source) &&
    /"label_D"\s*:\s*"D"/i.test(source);
}

function hasCircleThreePointsCue(text) {
  const source = String(text ?? "");
  return /(?:A\s*[、,]\s*B\s*[、,]\s*C.*(?:\bO\b|⊙O|圆)|A、B、C.*O上|A,B,C.*O上|三点.*O上|AOB|ACB|AOC|∠\s*AOB|∠\s*ACB|∠\s*AOC)/i.test(source);
}

function hasCircleSectorCue(text) {
  const source = String(text ?? "");
  return /(?:扇形|sector|圆心角|分钟|sector_count|扫过|摆动|弧长|面积)/i.test(source);
}

function extractAskedTargets(text) {
  const source = String(text ?? "");
  const angles = new Set();
  const segments = new Set();
  const labels = new Set();
  const quantityKeys = new Set();

  for (const match of source.matchAll(/(?:求出|求得|求)\s*([^。！？?!；;\n]+)/g)) {
    const phrase = normalizeText(match[1]);

    for (const angleMatch of phrase.matchAll(/∠\s*([A-Z]{3})/g)) {
      angles.add(angleMatch[1].toUpperCase());
    }

    for (const segmentMatch of phrase.matchAll(/^([A-Z]{2,4})(?:的)?(?:长|长度|边长|周长|半径|直径|弧长|面积|高|宽)?/g)) {
      labels.add(segmentMatch[1].toUpperCase());
    }

    if (/(?:面积|扇形面积)/.test(phrase)) quantityKeys.add('area');
    if (/(?:半径)/.test(phrase)) quantityKeys.add('radius');
    if (/(?:直径)/.test(phrase)) quantityKeys.add('diameter');
    if (/(?:弧长)/.test(phrase)) quantityKeys.add('arc');
    if (/(?:周长)/.test(phrase)) quantityKeys.add('perimeter');
    if (/(?:高)/.test(phrase)) quantityKeys.add('height');
    if (/(?:宽)/.test(phrase)) quantityKeys.add('width');
    if (/(?:长|边长)/.test(phrase)) quantityKeys.add('length');
  }

  return {
    angles: [...angles],
    labels: [...labels],
    quantities: [...quantityKeys],
  };
}

function hasNumericAngleValue(text, key) {
  const source = String(text ?? "");
  const patterns = [
    new RegExp(`"label_${key}"\\s*:\\s*"(?!\\?)[^"]*\\d[^"]*"`, "i"),
    new RegExp(`"label_${key}"\\s*:\\s*(?!\\?)[^,}\\]]*\\d`, "i"),
  ];
  return patterns.some((pattern) => pattern.test(source));
}

function hasAnyNumericLabel(text, keys) {
  return keys.some((key) => hasNumericAngleValue(text, key));
}

function getAngleAliases(angle) {
  const normalized = String(angle ?? "").toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return [normalized.toLowerCase()].filter(Boolean);
  }

  const [first, vertex, last] = normalized;
  const aliases = [
    `${first}${vertex}${last}`,
    `${last}${vertex}${first}`,
    `${vertex}${first}${last}`,
    `${vertex}${last}${first}`,
  ].map((value) => value.toLowerCase());
  return [...new Set(aliases)];
}

function hasNumericAngleLeakForAngle(text, angle) {
  const keys = [];
  for (const alias of getAngleAliases(angle)) {
    keys.push(`angle_${alias}`, `label_angle_${alias}`);
  }
  keys.push("angle", "label_angle");
  return hasAnyNumericLabel(text, keys);
}

function replaceNumericFieldWithQuestion(text, key) {
  const source = String(text ?? "");
  const escapedKey = escapeRegExp(key);
  const quotedPattern = new RegExp(`("${escapedKey}"\\s*:\\s*")([^"]*\\d[^"]*?)(")`, "ig");
  const unquotedPattern = new RegExp(`("${escapedKey}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?(?:°|º|cm|mm|m|km|%)?)`, "ig");

  return source
    .replace(quotedPattern, (_match, prefix, _value, suffix) => `${prefix}?${suffix}`)
    .replace(unquotedPattern, (_match, prefix) => `${prefix}"?"`);
}

function replaceNumericFieldWithQuestionStrict(text, key) {
  const source = String(text ?? "");
  const escapedKey = escapeRegExp(key);
  const pattern = new RegExp(`("${escapedKey}"\\s*:\\s*)(?:"[^"]*\\d[^"]*"|-?\\d+(?:\\.\\d+)?(?:°|º|cm|mm|m|km|%)?)`, "ig");
  return source.replace(pattern, (_match, prefix) => `${prefix}"?"`);
}

function replaceFieldValueWithQuestion(text, key) {
  const source = String(text ?? "");
  const escapedKey = escapeRegExp(key);
  const quotedPattern = new RegExp(`("${escapedKey}"\\s*:\\s*)"(.*?)"`, "ig");
  const numericPattern = new RegExp(`("${escapedKey}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?(?:°|º|cm|mm|m|km|%)?)`, "ig");

  return source
    .replace(quotedPattern, (_match, prefix, value) => {
      return /\d/.test(String(value)) ? `${prefix}"?"` : _match;
    })
    .replace(numericPattern, (_match, prefix) => `${prefix}"?"`);
}

function extractCentralAngles(text) {
  const source = String(text ?? "");
  const angles = new Set();
  for (const match of source.matchAll(/∠\s*([A-Z])O([A-Z])/g)) {
    angles.add(`${match[1].toUpperCase()}O${match[2].toUpperCase()}`);
  }
  return [...angles];
}

export function needsCircleDiameterRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasDiameterCue(source) || !hasAngleCueNeedingBD(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  return !hasCircleDiameterTemplate(generatedText);
}

export function needsCircleSectorRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasCircleSectorCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;
  if (!/"template"\s*:\s*"circle_sector"/i.test(String(generatedText ?? ""))) return true;

  const rendered = String(generatedText ?? "");
  const hasRadius = /"radius"\s*:\s*(?!null)(?:-?\d+(?:\.\d+)?|"[^"]+")/i.test(rendered);
  const hasAngle = /"angle"\s*:\s*(?!null)(?:-?\d+(?:\.\d+)?|"[^"]+")/i.test(rendered) ||
    /"angle_deg"\s*:\s*(?!null)(?:-?\d+(?:\.\d+)?|"[^"]+")/i.test(rendered) ||
    /"label_angle"\s*:\s*(?!null)(?:-?\d+(?:\.\d+)?|"[^"]+")/i.test(rendered);
  const hasMinutes = /"(?:minutes|time_minutes|label_minutes)"\s*:\s*(?!null)(?:-?\d+(?:\.\d+)?|"[^"]+")/i.test(rendered);
  const hasSectorCount = /"sector_count"\s*:\s*(?!null)(?:-?\d+(?:\.\d+)?|"[^"]+")/i.test(rendered);

  return !(hasRadius && (hasAngle || hasMinutes || hasSectorCount));
}

export function needsTangentChordRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasTangentChordCue(source) || !hasTangentChordAngleCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  if (hasDualTangentChordArcPointsCue(source)) {
    if (!/"template"\s*:\s*"circle_tangent_chord_dual_points"/i.test(String(generatedText ?? ""))) return true;
    return !hasExpectedDualTangentChordLabels(generatedText);
  }

  if (!/"template"\s*:\s*"circle_chord_tangent"/i.test(String(generatedText ?? ""))) return true;
  return !hasExpectedTangentChordLabels(generatedText, source);
}

export function needsTargetAngleLeakRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  return needsQuestionAnswerLeakRepair({ conceptTitle, conceptDesc, generatedText, diagramPolicy });
}

export function needsQuestionAnswerLeakRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  const { angles: askedAngles, labels: askedLabels, quantities } = extractAskedTargets(source);
  if (askedAngles.length === 0 && askedLabels.length === 0 && quantities.length === 0) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  for (const angle of askedAngles) {
    if (hasNumericAngleLeakForAngle(generatedText, angle)) {
      return true;
    }
  }

  for (const label of askedLabels) {
    const keys = [label.toLowerCase()];
    const reversed = label.length === 2 ? `${label[1]}${label[0]}`.toLowerCase() : '';
    if (reversed) keys.push(reversed);
    if (hasAnyNumericLabel(generatedText, keys)) {
      return true;
    }
  }

  const quantityKeyMap = {
    area: ["area"],
    radius: ["radius"],
    diameter: ["ab", "diameter"],
    arc: ["arc"],
    perimeter: ["perimeter", "circ"],
    height: ["height", "h"],
    width: ["width", "w"],
    length: ["length", "l"],
  };

  for (const quantity of quantities) {
    const candidateKeys = quantityKeyMap[quantity] ?? [];
    if (candidateKeys.length > 0 && hasAnyNumericLabel(generatedText, candidateKeys)) {
      return true;
    }
  }

  return false;
}

export function maskQuestionAnswerLeaks({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return String(generatedText ?? "");

  const source = normalizeText([conceptTitle, conceptDesc].filter(Boolean).join("\n"));
  const { angles: askedAngles, labels: askedLabels, quantities } = extractAskedTargets(source);
  const angleKeys = new Set();
  const labelKeys = new Set();
  const quantityKeys = new Set();

  for (const angle of askedAngles) {
    for (const alias of getAngleAliases(angle)) {
      angleKeys.add(`angle_${alias}`);
      angleKeys.add(`label_angle_${alias}`);
    }
    angleKeys.add("angle");
    angleKeys.add("label_angle");
  }

  for (const label of askedLabels) {
    const key = label.toLowerCase();
    const reversed = label.length === 2 ? `${label[1]}${label[0]}`.toLowerCase() : "";
    labelKeys.add(key);
    if (reversed) labelKeys.add(reversed);
  }

  const quantityKeyMap = {
    area: ["area"],
    radius: ["radius"],
    diameter: ["ab", "diameter"],
    arc: ["arc"],
    perimeter: ["perimeter", "circ"],
    height: ["height", "h"],
    width: ["width", "w"],
    length: ["length", "l"],
  };

  for (const quantity of quantities) {
    for (const candidateKey of quantityKeyMap[quantity] ?? []) {
      quantityKeys.add(candidateKey);
    }
  }

  const shouldMaskValue = (value) => typeof value === "string"
    ? /\d/.test(value)
    : typeof value === "number" && Number.isFinite(value);

  const applyMasksToObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    for (const key of angleKeys) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && shouldMaskValue(obj[key])) {
        obj[key] = "?";
      }
    }
    for (const key of labelKeys) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && shouldMaskValue(obj[key])) {
        obj[key] = "?";
      }
    }
    for (const key of quantityKeys) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && shouldMaskValue(obj[key])) {
        obj[key] = "?";
      }
    }
    return obj;
  };

  const maskDiagramBlock = (block) => {
    const trimmed = String(block ?? "").trim();
    const jsonText = trimmed
      .replace(/^```math-diagram\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    if (!jsonText) return trimmed;

    try {
      const parsed = JSON.parse(jsonText);
      const masked = applyMasksToObject(parsed);
      return `\`\`\`math-diagram\n${JSON.stringify(masked)}\n\`\`\``;
    } catch {
      let fallback = trimmed;
      for (const key of [...angleKeys, ...labelKeys, ...quantityKeys]) {
        fallback = replaceFieldValueWithQuestion(fallback, key);
      }
      return fallback;
    }
  };

  const original = String(generatedText ?? "");
  if (!/```math-diagram[\s\S]*?```/i.test(original)) {
    let fallback = original;
    for (const key of [...angleKeys, ...labelKeys, ...quantityKeys]) {
      fallback = replaceFieldValueWithQuestion(fallback, key);
    }
    return fallback;
  }

  const masked = original.replace(/```math-diagram[\s\S]*?```/gi, (block) => maskDiagramBlock(block));
  return masked
    .replace(/("(?:label_)?angle_[^"]+"\s*:\s*")([^"]*\d[^"]*?)(")/ig, (_match, prefix, _value, suffix) => `${prefix}?${suffix}`)
    .replace(/("(?:label_)?angle"\s*:\s*")([^"]*\d[^"]*?)(")/ig, (_match, prefix, _value, suffix) => `${prefix}?${suffix}`);
}

export function needsCentralAngleRayRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  const centralAngles = extractCentralAngles(source);
  if (centralAngles.length === 0) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  const templateMatch = String(generatedText ?? "").match(/"template"\s*:\s*"([^"]+)"/i);
  const template = String(templateMatch?.[1] ?? "");
  const sourceText = String(generatedText ?? "");
  const hasShowOC = /"show_oc"\s*:\s*true/i.test(sourceText) ||
    /"show_center_rays"\s*:\s*true/i.test(sourceText) ||
    /"show_radii"\s*:\s*true/i.test(sourceText) ||
    /"label_angle_aoc"\s*:/i.test(sourceText) ||
    /"label_oc"\s*:/i.test(sourceText);
  const hasShowArcTangent = /"show_arc_tangent"\s*:\s*true/i.test(sourceText) || /"show_tangent_at_C"\s*:\s*true/i.test(sourceText);
  const hasPerpHidden = /"show_perpendicular"\s*:\s*false/i.test(sourceText);
  const hasPerpShown = /"show_perpendicular"\s*:\s*true/i.test(sourceText) || !hasPerpHidden;

  for (const angle of centralAngles) {
    const [, first = "", third = ""] = angle.match(/^([A-Z])O([A-Z])$/i) ?? [];
    const needsC = first === "C" || third === "C";

    if (template === "circle_sector") {
      continue;
    }

    if (template === "circle_chord") {
      if (!(hasPerpShown || hasShowOC)) return true;
      continue;
    }

    if (template === "circle_diameter_points") {
      if ((first === "D" || third === "D")) return true;
      if (needsC && !hasShowOC) {
        return true;
      }
      continue;
    }

    if (template === "circle_tangent" || template === "circle_chord_tangent") {
      if (needsC && !(hasShowOC || hasShowArcTangent)) {
        return true;
      }
      continue;
    }

    if (template === "circle_cyclic_quadrilateral") {
      if (!(hasShowOC || /"label_angle_aoc"\s*:\s*/i.test(sourceText))) {
        return true;
      }
      continue;
    }

    if (template) {
      return true;
    }
  }

  return false;
}

export function needsCircleThreePointsRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasCircleThreePointsCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  const templateMatch = String(generatedText ?? "").match(/"template"\s*:\s*"([^"]+)"/i);
  const template = String(templateMatch?.[1] ?? "");
  return template !== "circle_three_points";
}

