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

function extractAskedAngles(text) {
  const source = String(text ?? "");
  const angles = new Set();
  for (const match of source.matchAll(/(?:求出|求得|求)\s*∠\s*([A-Z]{3})/g)) {
    angles.add(match[1].toUpperCase());
  }
  return [...angles];
}

function hasNumericAngleValue(text, key) {
  const source = String(text ?? "");
  const patterns = [
    new RegExp(`"label_${key}"\\s*:\\s*"(?!\\?)[^"]*\\d[^"]*"`, "i"),
    new RegExp(`"label_${key}"\\s*:\\s*(?!\\?)[^,}\\]]*\\d`, "i"),
  ];
  return patterns.some((pattern) => pattern.test(source));
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
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  const askedAngles = extractAskedAngles(source);
  if (askedAngles.length === 0) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  for (const angle of askedAngles) {
    if (angle === "PAB" || angle === "BAP") {
      if (/"template"\s*:\s*"circle_chord_tangent"/i.test(String(generatedText ?? "")) && hasNumericAngleValue(generatedText, "angle")) {
        return true;
      }
    }

    const key = `angle_${angle.toLowerCase()}`;
    if (hasNumericAngleValue(generatedText, key)) {
      return true;
    }
  }

  return false;
}

