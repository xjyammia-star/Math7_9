function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
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

export function needsTangentChordRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasTangentChordCue(source) || !hasAngleBACCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  if (!/"template"\s*:\s*"circle_chord_tangent"/i.test(String(generatedText ?? ""))) return true;
  return !hasExpectedTangentChordLabelMap(generatedText);
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
    const angleKeys = [`angle_${angle.toLowerCase()}`];
    if (angle === "PAB" || angle === "BAP") {
      angleKeys.push("angle");
    }

    if (hasAnyNumericLabel(generatedText, angleKeys)) {
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

