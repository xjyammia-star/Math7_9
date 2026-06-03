function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasMathDiagramBlock(text) {
  return /```math-diagram[\s\S]*?```/i.test(String(text ?? "")) || /"template"\s*:\s*"/i.test(String(text ?? ""));
}

const GENERIC_POINT_PLACEHOLDERS = new Set([
  "่ตท็น",
  "็ป็น",
  "ๅผ€ๅง",
  "็ป“ๆ",
  "start",
  "end",
  "point",
  "point a",
  "point b",
  "point c",
  "point d",
]);

function isGenericPointPlaceholder(value) {
  const normalized = normalizeText(String(value ?? "")).toLowerCase();
  return GENERIC_POINT_PLACEHOLDERS.has(normalized);
}

function hasCircleIntersectingChordsCue(text) {
  const source = String(text ?? "");
  return /(?:็ธไบคไบๅๅ…ไธ€็น|ไธคๅผฆ็ธไบค|intersecting chords|AP\s*[:๏ผ\/]\s*PB|CP\s*[:๏ผ\/]\s*PD|ๅผฆABไธCD็ธไบค|ๅๅ…ไธ€็นP)/i.test(source);
}

function hasDiameterCue(text) {
  return /(?:็ดๅพ|diameter)/i.test(String(text ?? ""));
}

function hasDiameterIntersectingChordsCue(text) {
  const source = String(text ?? "");
  return hasDiameterCue(source) && (
    hasCircleIntersectingChordsCue(source) ||
    /(?:AC|BD).{0,24}(?:⊥|perpendicular)/i.test(source) ||
    /(?:intersect|交于|相交).{0,24}(?:AC|BD)/i.test(source)
  );
}

function hasDiameterTangentChordCue(text) {
  const source = String(text ?? "");
  return hasDiameterCue(source) && /(?:tangent|切线|CP|点P|point\s*P|AB的延长线|AB\s*的\s*延长线|连接AC|连接AD|∠AED|AED)/i.test(source);
}
function hasAngleCueNeedingBD(text) {
  return /(?:โ \s*ABD|angle\s*ABD|โ \s*BCD|angle\s*BCD|ABD|BCD)/i.test(String(text ?? ""));
}

function hasTangentChordCue(text) {
  return /(?:ๅ็บฟ|tangent|ๅ็น|ๅผฆ|chord)/i.test(String(text ?? ""));
}

function hasCircleChordCue(text) {
  const source = String(text ?? "");
  return /(?:ๅผฆ|chord)/i.test(source) && /(?:ๅ|circle|โ|O)/i.test(source);
}

function hasCenterToChordDistanceCue(text) {
  const source = String(text ?? "");
  return /(?:ๅๅฟ.*ๅฐๅผฆ|ๅผฆ.*ๅฐๅๅฟ|center.*to.*chord|distance.*from.*center.*to.*chord|O.*ๅฐ.*ๅผฆ|O.*ๅผฆ.*่ท็ฆป|ๅๅฟO.*ๅผฆ[A-Z]{2}.*่ท็ฆป)/i.test(source);
}

function hasChordMidpointCue(text) {
  const source = String(text ?? "");
  return /(?:ไธญ็น|midpoint|mid point)/i.test(source);
}

function extractTangentPointCue(text) {
  const source = String(text ?? "");
  const patterns = [
    /่ฟ้กถ็น\s*([A-Z])\s*็ๅ็บฟ/i,
    /่ฟ็น\s*([A-Z])\s*็ๅ็บฟ/i,
    /็น\s*([A-Z])\s*ๅค็ๅ็บฟ/i,
    /tangent at\s*([A-Z])/i,
    /tangent through point\s*([A-Z])/i,
    /at point\s*([A-Z])/i,
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) return match[1].toUpperCase();
  }
  return null;
}

function hasAngleBACCue(text) {
  return /(?:โ \s*BAC|angle\s*BAC|BAC)/i.test(String(text ?? ""));
}

function hasExpectedTangentChordLabelMap(text) {
  const source = String(text ?? "");
  return /"label_A"\s*:\s*"A"/i.test(source) &&
    /"label_B"\s*:\s*"C"/i.test(source) &&
    /"label_C"\s*:\s*"D"/i.test(source);
}

function hasTangentChordAngleCue(text) {
  return /(?:โ \s*(?:BAC|PAB|ADB|ABD)|angle\s*(?:BAC|PAB|ADB|ABD)|(?:BAC|PAB|ADB|ABD))/i.test(String(text ?? ""));
}

function hasTangentChordArcPointDCue(text) {
  const source = String(text ?? "");
  return /(?:็น\s*D|D\s*ๅจ|point\s*D|D\s+on\s+the\s+(?:minor|major)?\s*arc|D\s*lies\s*on\s+the\s+(?:minor|major)?\s*arc|โ \s*ADB|angle\s*ADB)/i.test(source);
}

function hasDualTangentChordArcPointsCue(text) {
  const source = String(text ?? "");
  return /(?:C\s*ๅจ[^ใ€\n]{0,18}(?:ๅฃๅผง|minor arc)[^ใ€\n]{0,18}AB|D\s*ๅจ[^ใ€\n]{0,18}(?:ไผๅผง|major arc)[^ใ€\n]{0,18}AB|C\s*ๅจ[^ใ€\n]{0,18}(?:ไผๅผง|major arc)[^ใ€\n]{0,18}AB|D\s*ๅจ[^ใ€\n]{0,18}(?:ๅฃๅผง|minor arc)[^ใ€\n]{0,18}AB)/i.test(source);
}

function hasArcTypeCue(text) {
  const source = String(text ?? "");
  return /(?:ไผๅผง|ๅฃๅผง|minor arc|major arc|on the minor arc|on the major arc)/i.test(source);
}

function hasCyclicQuadrilateralExtensionCue(text) {
  const source = String(text ?? "");
  return /(?:\u5ef6\u957f.*CD.*E|CD.*\u5ef6\u957f.*E|\u8fde\u63a5.*AE|connect.*AE|(?:\u2220|angle)\s*ADE)/i.test(source);
}

function inferNamedArcType(text, point) {
  const source = String(text ?? "");
  const p = escapeRegExp(String(point ?? "").trim());
  if (!p) return null;

  const minorPatterns = [
    new RegExp(`${p}[^\nใ€]{0,24}(?:ๅฃๅผง|minor arc)[^\nใ€]{0,24}(?:AB|AC)`, 'i'),
    new RegExp(`(?:ๅฃๅผง|minor arc)[^\nใ€]{0,24}(?:AB|AC)[^\nใ€]{0,24}${p}`, 'i'),
    new RegExp(`${p}[^\nใ€]{0,24}on the minor arc[^\nใ€]{0,24}(?:AB|AC)`, 'i'),
    new RegExp(`on the minor arc[^\nใ€]{0,24}(?:AB|AC)[^\nใ€]{0,24}${p}`, 'i'),
  ];
  const majorPatterns = [
    new RegExp(`${p}[^\nใ€]{0,24}(?:ไผๅผง|major arc)[^\nใ€]{0,24}(?:AB|AC)`, 'i'),
    new RegExp(`(?:ไผๅผง|major arc)[^\nใ€]{0,24}(?:AB|AC)[^\nใ€]{0,24}${p}`, 'i'),
    new RegExp(`${p}[^\nใ€]{0,24}on the major arc[^\nใ€]{0,24}(?:AB|AC)`, 'i'),
    new RegExp(`on the major arc[^\nใ€]{0,24}(?:AB|AC)[^\nใ€]{0,24}${p}`, 'i'),
  ];

  if (minorPatterns.some((pattern) => pattern.test(source))) return 'minor';
  if (majorPatterns.some((pattern) => pattern.test(source))) return 'major';
  return null;
}

function hasExpectedTangentChordLabels(text, source, tangentPointCue = null) {
  const generated = String(text ?? "");
  const sourceText = String(source ?? "");
  const needsDArcPoint = hasTangentChordArcPointDCue(sourceText);
  const expectedTangentPoint = String(tangentPointCue ?? 'A').toUpperCase();

  if (!new RegExp(`"label_A"\\s*:\\s*"${escapeRegExp(expectedTangentPoint)}"`, 'i').test(generated)) return false;

  if (needsDArcPoint) {
    return /"label_(?:C|D)"\s*:\s*"D"/i.test(generated);
  }

  return true;
}

function hasExpectedDualTangentChordLabels(text, tangentPointCue = null) {
  const source = String(text ?? "");
  const expectedTangentPoint = String(tangentPointCue ?? 'A').toUpperCase();
  return new RegExp(`"label_A"\\s*:\\s*"${escapeRegExp(expectedTangentPoint)}"`, 'i').test(source) &&
    /"label_B"\s*:\s*"B"/i.test(source) &&
    /"label_C"\s*:\s*"C"/i.test(source) &&
    /"label_D"\s*:\s*"D"/i.test(source);
}

function inferArcTypeCueForPoint(text, point) {
  const source = normalizeText(String(text ?? ""));
  const p = escapeRegExp(String(point ?? "").trim());
  if (!p) return null;

  const fragments = source
    .split(/[ใ€.!?๏ผ;๏ผ,]/)
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  for (const fragment of fragments) {
    if (!new RegExp(`(?:^|[^A-Z])${p}(?:$|[^A-Z])`, 'i').test(fragment)) continue;

    if (/(?:ๅฃๅผง|minor arc)[\s\S]{0,20}(?:AB|AC)|(?:AB|AC)[\s\S]{0,20}(?:ๅฃๅผง|minor arc)/i.test(fragment)) {
      return 'minor';
    }
    if (/(?:ไผๅผง|major arc)[\s\S]{0,20}(?:AB|AC)|(?:AB|AC)[\s\S]{0,20}(?:ไผๅผง|major arc)/i.test(fragment)) {
      return 'major';
    }
    if (/on the minor arc[\s\S]{0,20}(?:AB|AC)|(?:AB|AC)[\s\S]{0,20}on the minor arc/i.test(fragment)) {
      return 'minor';
    }
    if (/on the major arc[\s\S]{0,20}(?:AB|AC)|(?:AB|AC)[\s\S]{0,20}on the major arc/i.test(fragment)) {
      return 'major';
    }
  }

  return null;
}

function hasExpectedArcTypeField(text, data, point, field = 'arc_type') {
  const source = normalizeText(String(text ?? ""));
  const expected = inferArcTypeCueForPoint(source, point);
  if (!expected) return true;
  const actual = String(data?.[field] ?? data?.c_arc ?? data?.arc ?? '').toLowerCase();
  return actual.includes(expected);
}

function hasCircleThreePointsCue(text) {
  const source = String(text ?? "");
  return /(?:A\s*[ใ€,]\s*B\s*[ใ€,]\s*C.*(?:\bO\b|โO|ๅ)|Aใ€Bใ€C.*Oไธ|A,B,C.*Oไธ|ไธ็น.*Oไธ|AOB|ACB|AOC|โ \s*AOB|โ \s*ACB|โ \s*AOC)/i.test(source);
}

function hasCircleSectorCue(text) {
  const source = String(text ?? "");
  return /(?:ๆๅฝข|sector|ๅๅฟ่ง’|ๅ้’|sector_count|ๆซ่ฟ|ๆ‘ๅจ|ๅผง้•ฟ|้ข็งฏ)/i.test(source);
}

function extractDiagramBlockJson(text) {
  const source = String(text ?? "");
  const match = source.match(/```math-diagram\s*([\s\S]*?)```/i);
  if (!match) return null;
  const jsonText = String(match[1] ?? "").trim();
  if (!jsonText) return null;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function extractAskedTargets(text) {
  const source = String(text ?? "");
  const angles = new Set();
  const segments = new Set();
  const labels = new Set();
  const quantityKeys = new Set();

  for (const match of source.matchAll(/(?:ๆฑๅบ|ๆฑๅพ—|ๆฑ)\s*([^ใ€๏ผ๏ผ?!๏ผ;\n]+)/g)) {
    const phrase = normalizeText(match[1]);

    for (const angleMatch of phrase.matchAll(/โ \s*([A-Z]{3})/g)) {
      angles.add(angleMatch[1].toUpperCase());
    }

    for (const segmentMatch of phrase.matchAll(/^([A-Z]{2,4})(?:็)?(?:้•ฟ|้•ฟๅบฆ|่พน้•ฟ|ๅ‘จ้•ฟ|ๅๅพ|็ดๅพ|ๅผง้•ฟ|้ข็งฏ|้ซ|ๅฎฝ)?/g)) {
      labels.add(segmentMatch[1].toUpperCase());
    }

    if (/(?:้ข็งฏ|ๆๅฝข้ข็งฏ)/.test(phrase)) quantityKeys.add('area');
    if (/(?:ๅๅพ)/.test(phrase)) quantityKeys.add('radius');
    if (/(?:็ดๅพ)/.test(phrase)) quantityKeys.add('diameter');
    if (/(?:ๅผง้•ฟ)/.test(phrase)) quantityKeys.add('arc');
    if (/(?:ๅ‘จ้•ฟ)/.test(phrase)) quantityKeys.add('perimeter');
    if (/(?:้ซ)/.test(phrase)) quantityKeys.add('height');
    if (/(?:ๅฎฝ)/.test(phrase)) quantityKeys.add('width');
    if (/(?:้•ฟ|่พน้•ฟ)/.test(phrase)) quantityKeys.add('length');
  }

  return {
    angles: [...angles],
    labels: [...labels],
    quantities: [...quantityKeys],
  };
}

function extractExplicitAngleNumbers(text) {
  const source = String(text ?? "");
  const values = new Set();

  const anglePatterns = [
    /(?:โ |angle)\s*[A-Z]{1,4}\s*(?:=|:|is|ไธบ|ๆฏ)\s*(-?\d+(?:\.\d+)?)\s*(?:ยฐ|ยบ|ๅบฆ)?/gi,
    /(?:โ |angle)[^\nใ€๏ผ๏ผ๏ผ;๏ผ,]{0,24}?(-?\d+(?:\.\d+)?)\s*(?:ยฐ|ยบ|ๅบฆ)/gi,
  ];

  for (const pattern of anglePatterns) {
    for (const match of source.matchAll(pattern)) {
      const value = Number(match[1]);
      if (Number.isFinite(value)) {
        values.add(String(value));
      }
    }
  }

  return [...values];
}

function extractExplicitAngleStatements(text) {
  const source = String(text ?? "");
  const statements = [];
  const patterns = [
    /(?:โ |angle)\s*([A-Z]{1,4})\s*(?:=|:|is|ไธบ|ๆฏ)\s*(-?\d+(?:\.\d+)?)\s*(?:ยฐ|ยบ|ๅบฆ)?/gi,
    /(?:โ |angle)\s*([A-Z]{1,4})[^\nใ€๏ผ๏ผ๏ผ;๏ผ,]{0,24}?(-?\d+(?:\.\d+)?)\s*(?:ยฐ|ยบ|ๅบฆ)/gi,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const name = String(match[1] ?? "").toUpperCase();
      const value = Number(match[2]);
      if (name && Number.isFinite(value)) {
        statements.push({ name, value });
      }
    }
  }

  return statements;
}

function hasAngleFieldValueMismatch(text, source) {
  const generated = String(text ?? "");
  const sourceAngles = new Set(extractExplicitAngleNumbers(source));
  if (sourceAngles.size === 0) return false;

  try {
    const data = extractDiagramBlockJson(generated);
    if (!data || typeof data !== "object") return false;

    const visit = (node) => {
      if (!node || typeof node !== "object") return false;
      for (const [key, value] of Object.entries(node)) {
        if (/angle/i.test(String(key))) {
          if (value === undefined || value === null || value === "?") continue;
          const numeric = Number(String(value).replace(/[^-\d.]/g, ""));
          if (Number.isFinite(numeric) && !sourceAngles.has(String(numeric))) {
            return true;
          }
        }
        if (value && typeof value === "object" && !Array.isArray(value)) {
          if (visit(value)) return true;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === "object" && visit(item)) return true;
          }
        }
      }
      return false;
    };

    if (visit(data)) return true;
  } catch {
    return false;
  }

  return false;
}

function hasGenericPointLabelLeak(text) {
  const generated = String(text ?? "");
  const data = extractDiagramBlockJson(generated);
  if (!data || typeof data !== "object") return false;

  const visit = (node) => {
    if (!node || typeof node !== "object") return false;
    for (const [key, value] of Object.entries(node)) {
      if (/^label_/i.test(String(key)) || String(key).toLowerCase() === "labels") {
        if (typeof value === "string" && isGenericPointPlaceholder(value)) return true;
        if (Array.isArray(value) && value.some((item) => typeof item === "string" && isGenericPointPlaceholder(item))) return true;
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (visit(value)) return true;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === "object" && visit(item)) return true;
        }
      }
    }
    return false;
  };

  return visit(data);
}

function extractExpectedPointNames(source) {
  const text = normalizeText(source);
  const points = new Set();

  const addPoint = (value) => {
    const name = String(value ?? "").trim().toUpperCase();
    if (!name) return;
    if (/^[A-Z]('?|)$/.test(name)) {
      points.add(name);
      return;
    }
    if (/^[A-Z]{2,4}$/.test(name)) {
      for (const ch of name) points.add(ch);
    }
  };

  const askedTargets = extractAskedTargets(text);
  for (const label of askedTargets.labels) addPoint(label);
  for (const angle of askedTargets.angles) {
    for (const ch of String(angle ?? "").toUpperCase()) {
      if (/[A-Z]/.test(ch)) points.add(ch);
    }
  }

  for (const match of text.matchAll(/\b[A-Z]{3,4}\b/g)) {
    for (const ch of match[0]) {
      if (/[A-Z]/.test(ch)) points.add(ch);
    }
  }

  for (const match of text.matchAll(/(?:\u2220|angle)\s*([A-Z]{3,4})/gi)) {
    for (const ch of String(match[1] ?? "").toUpperCase()) {
      if (/[A-Z]/.test(ch)) points.add(ch);
    }
  }

  for (const match of text.matchAll(/\u70b9\s*([A-Z])|([A-Z])\s*\u70b9/gi)) {
    addPoint(match[1]);
    addPoint(match[2]);
  }

  for (const match of text.matchAll(/point\s*([A-Z])/gi)) {
    addPoint(match[1]);
  }

  for (const match of text.matchAll(/\b([A-Z]('?|))\s*[\(๏ผ]\s*-?\d+(?:\.\d+)?\s*[,๏ผ]\s*-?\d+(?:\.\d+)?\s*[\)๏ผ]/g)) {
    addPoint(match[1]);
  }

  if (/\bO\b/.test(text) ||
      /(?:โ\s*O|circle\s*O|center\s*O|centre\s*O|ๅ\s*O|ๅ“\s*O|ไปฅOไธบๅๅฟ|ไปฅO็บๅ“ๅฟ)/i.test(text) ||
      /O\s*(?:is the center|is the centre|is the center of|is the centre of)/i.test(text)) {
    addPoint('O');
  }

  if (/(?:ๅปถ้•ฟ|extend(?:ed)?|extended)\s*(?:side\s*)?CD.*(?:\bpoint\s*E\b|\bE\b|็นE|ๅฐ็นE)|(?:CD).*(?:ๅปถ้•ฟ|extend(?:ed)?).*(?:\bpoint\s*E\b|\bE\b|็นE)/i.test(text) ||
      /(?:\bpoint\s*E\b|\bE\b)\s*(?:lies on|is on|on)\s*(?:the\s*)?(?:extension|ๅปถ้•ฟ็บฟ).*(?:CD|side\s*CD|line\s*CD)/i.test(text) ||
      /(?:\bE\b)\s*(?:on|lies on|is on)\s*(?:the\s*)?(?:extension of\s*)?(?:CD|side\s*CD|line\s*CD)/i.test(text)) {
    addPoint('E');
  }

  return [...points];
}

function collectDiagramPointLabels(data) {
  const labels = new Set();

  const add = (value) => {
    const name = String(value ?? "").trim().toUpperCase();
    if (!name) return;
    if (/^[A-Z]('?|)$/.test(name)) {
      labels.add(name);
    }
  };

  const visit = (node) => {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node.labels)) {
      for (const item of node.labels) {
        if (typeof item === "string") add(item);
      }
    }

    if (Object.prototype.hasOwnProperty.call(node, "label") &&
      (Object.prototype.hasOwnProperty.call(node, "x") || Object.prototype.hasOwnProperty.call(node, "y"))) {
      if (typeof node.label === "string") add(node.label);
    }

    for (const [key, value] of Object.entries(node)) {
      if (/^label_[A-Z]('?|)$/i.test(String(key))) {
        if (typeof value === "string") add(value);
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        visit(value);
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === "object") visit(item);
        }
      }
    }
  };

  visit(data);
  return labels;
}

function hasDiagramFieldValue(data, key) {
  if (!data || typeof data !== "object") return false;
  const target = String(key ?? "").toLowerCase();
  let found = false;

  const visit = (node) => {
    if (!node || typeof node !== "object" || found) return;
    for (const [nodeKey, value] of Object.entries(node)) {
      if (String(nodeKey).toLowerCase() === target) {
        if (value !== undefined && value !== null && value !== "") {
          found = true;
          return;
        }
      }
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === "object") visit(item);
            if (found) return;
          }
        } else {
          visit(value);
        }
      }
      if (found) return;
    }
  };

  visit(data);
  return found;
}

function hasAnyDiagramField(data, keys) {
  return keys.some((key) => hasDiagramFieldValue(data, key));
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

function hasAngleLabelForAngle(text, angle) {
  const source = String(text ?? "");
  for (const alias of getAngleAliases(angle)) {
    const key = escapeRegExp(alias);
    if (new RegExp(`"(?:label_)?angle_${key}"\\s*:`, 'i').test(source)) return true;
  }
  return false;
}

function replaceNumericFieldWithQuestion(text, key) {
  const source = String(text ?? "");
  const escapedKey = escapeRegExp(key);
  const quotedPattern = new RegExp(`("${escapedKey}"\\s*:\\s*")([^"]*\\d[^"]*?)(")`, "ig");
  const unquotedPattern = new RegExp(`("${escapedKey}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?(?:ยฐ|ยบ|cm|mm|m|km|%)?)`, "ig");

  return source
    .replace(quotedPattern, (_match, prefix, _value, suffix) => `${prefix}?${suffix}`)
    .replace(unquotedPattern, (_match, prefix) => `${prefix}"?"`);
}

function replaceNumericFieldWithQuestionStrict(text, key) {
  const source = String(text ?? "");
  const escapedKey = escapeRegExp(key);
  const pattern = new RegExp(`("${escapedKey}"\\s*:\\s*)(?:"[^"]*\\d[^"]*"|-?\\d+(?:\\.\\d+)?(?:ยฐ|ยบ|cm|mm|m|km|%)?)`, "ig");
  return source.replace(pattern, (_match, prefix) => `${prefix}"?"`);
}

function replaceFieldValueWithQuestion(text, key) {
  const source = String(text ?? "");
  const escapedKey = escapeRegExp(key);
  const quotedPattern = new RegExp(`("${escapedKey}"\\s*:\\s*)"(.*?)"`, "ig");
  const numericPattern = new RegExp(`("${escapedKey}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?(?:ยฐ|ยบ|cm|mm|m|km|%)?)`, "ig");

  return source
    .replace(quotedPattern, (_match, prefix, value) => {
      return /\d/.test(String(value)) ? `${prefix}"?"` : _match;
    })
    .replace(numericPattern, (_match, prefix) => `${prefix}"?"`);
}

function extractCentralAngles(text) {
  const source = String(text ?? "");
  const angles = new Set();
  for (const match of source.matchAll(/โ \s*([A-Z])O([A-Z])/g)) {
    angles.add(`${match[1].toUpperCase()}O${match[2].toUpperCase()}`);
  }
  return [...angles];
}

export function needsCircleDiameterRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasDiameterCue(source) || !hasAngleCueNeedingBD(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const expectedPoints = extractExpectedPointNames(source);
  const actualPoints = collectDiagramPointLabels(data);
  const templateName = String(data.template ?? "");
  if (templateName === "circle_diameter_points") {
    const hasCoreLabels = ["A", "B", "C", "D"].every((point) => actualPoints.has(point));
    const hasRadiusField = hasAnyDiagramField(data, ["radius", "label_radius", "label_diameter", "diameter"]);
    if (hasCoreLabels && hasRadiusField) {
      return false;
    }
  }
  if (expectedPoints.some((point) => !actualPoints.has(point))) return true;
  if (hasDiameterCue(source) && !hasAnyDiagramField(data, ["label_ab", "label_diameter", "diameter"]) && templateName !== "circle_diameter_points") return true;
  if (!hasAnyDiagramField(data, ["radius"])) return true;

  const askedAngles = extractAskedTargets(source).angles;
  for (const angle of askedAngles) {
    const aliases = getAngleAliases(angle);
    const found = aliases.some((alias) => hasDiagramFieldValue(data, `label_angle_${alias}`) || hasDiagramFieldValue(data, `angle_${alias}`));
    if (!found) return true;
  }

  return false;
}

export function needsCircleChordRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasCircleChordCue(source) && !hasCenterToChordDistanceCue(source)) return false;
  if (hasDiameterCue(source) || hasCircleSectorCue(source) || hasCircleIntersectingChordsCue(source) || hasCircleThreePointsCue(source) || /cyclic quadrilateral|inscribed in a circle|ๅ…ๆฅๅ่พนๅฝข/i.test(source) || (hasTangentChordCue(source) && hasTangentChordAngleCue(source))) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const expectedPoints = extractExpectedPointNames(source);
  const actualPoints = collectDiagramPointLabels(data);
  if (expectedPoints.some((point) => !actualPoints.has(point))) return true;

  if (!hasAnyDiagramField(data, ["radius"])) return true;
  if (!hasAnyDiagramField(data, ["label_chord", "label_ab", "label_ac"])) return true;

  const needsCenterDistance = hasCenterToChordDistanceCue(source);
  const showPerpendicular = Object.prototype.hasOwnProperty.call(data, "show_perpendicular") ? String(data.show_perpendicular).toLowerCase() !== "false" : false;
  const hasCenterDistanceMark = hasAnyDiagramField(data, ["label_oc", "show_oc", "label_angle_aoc"]) || showPerpendicular;
  const usesWaterDepthSemantics = hasAnyDiagramField(data, ["water_depth", "depth", "label_depth", "label_water_depth"]);

  if (needsCenterDistance) {
    if (!hasCenterDistanceMark) return true;
    if (usesWaterDepthSemantics && !hasDiagramFieldValue(data, "label_oc")) return true;
  }

  if (hasChordMidpointCue(source)) {
    if (!actualPoints.has("C")) return true;
  }

  return false;
}

export function needsCircleDiameterIntersectingChordsRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasDiameterIntersectingChordsCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return true;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const template = String(data.template ?? data.type ?? "").trim();
  if (!["circle_diameter_chords", "circle_intersecting_chords", "circle_diameter_points"].includes(template)) return true;

  const hasRadius = hasAnyDiagramField(data, ["radius"]);
  const actualPoints = collectDiagramPointLabels(data);
  const expectedPoints = ["A", "B", "C", "D"];
  if (!hasRadius) return true;
  if (expectedPoints.some((point) => !actualPoints.has(point))) return true;

  if (template === "circle_diameter_chords" && !hasAnyDiagramField(data, ["label_ab", "label_diameter"])) return true;
  if (template === "circle_intersecting_chords" && !hasAnyDiagramField(data, ["ap", "pb", "cp", "cd"])) return true;
  if (template === "circle_diameter_points" && !hasAnyDiagramField(data, ["label_ab", "label_diameter", "diameter"])) return true;

  return false;
}

export function needsCircleDiameterTangentChordRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasDiameterTangentChordCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return true;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;
  if (String(data.template ?? data.type ?? "").trim() !== "circle_diameter_tangent_chord") return true;

  const expectedPoints = ["A", "B", "C", "D", "E", "P", "O"];
  const actualPoints = collectDiagramPointLabels(data);
  if (expectedPoints.some((point) => !actualPoints.has(point))) return true;
  if (!hasAnyDiagramField(data, ["radius"])) return true;
  if (!hasAnyDiagramField(data, ["label_ab", "label_ac", "label_ad", "label_cp"])) return true;

  return false;
}

export function needsCircleSectorRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasCircleSectorCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;
  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const hasRadius = hasAnyDiagramField(data, ["radius", "outer_radius", "radius_outer", "label_radius", "label_outer_radius", "label_radius_outer"]);
  const hasAngle = hasAnyDiagramField(data, ["angle", "angle_deg", "label_angle"]);
  const hasMinutes = hasAnyDiagramField(data, ["minutes", "time_minutes", "label_minutes"]);
  const hasSectorCount = hasAnyDiagramField(data, ["sector_count"]);
  const expectedPoints = extractExpectedPointNames(source);
  const actualPoints = collectDiagramPointLabels(data);

  return !(hasRadius && (hasAngle || hasMinutes || hasSectorCount) && expectedPoints.every((point) => actualPoints.has(point)));
}

export function needsPointLabelRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  if (hasGenericPointLabelLeak(generatedText)) return true;

  const source = normalizeText([conceptTitle, conceptDesc].filter(Boolean).join("\n"));
  const expectedPoints = extractExpectedPointNames(source);
  if (expectedPoints.length === 0) return false;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return false;

  const actualPoints = collectDiagramPointLabels(data);
  return expectedPoints.some((point) => !actualPoints.has(point));
}

export function needsCircleIntersectingChordsRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!hasCircleIntersectingChordsCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const ap = Number(data.ap ?? data.AP);
  const pb = Number(data.pb ?? data.PB);
  const hasAp = Number.isFinite(ap) && ap > 0;
  const hasPb = Number.isFinite(pb) && pb > 0;
  const hasCp = Number.isFinite(Number(data.cp ?? data.CP)) && Number(data.cp ?? data.CP) > 0;
  const hasCd = Number.isFinite(Number(data.cd ?? data.CD ?? data.cd_total)) && Number(data.cd ?? data.CD ?? data.cd_total) > 0;
  const hasRatio = Number.isFinite(Number(data.cp_pd_ratio ?? data.ratio_cp_pd ?? data.cp_to_pd ?? data.ratio)) &&
    Number(data.cp_pd_ratio ?? data.ratio_cp_pd ?? data.cp_to_pd ?? data.ratio) > 0;
  const hasDiff = Number.isFinite(Number(data.cp_minus_pd ?? data.cp_pd_diff ?? data.cp_gt_pd_by ?? data.difference));

  return !(hasAp && hasPb && (hasCp || hasCd || hasRatio || hasDiff));
}

export function needsLinearIntersectionRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  const hasTwoLineCue = /(?:ไธคๆก็ด็บฟ|ไธคๆก็บฟ|ไธค็ด็บฟ|two lines|line intersection|intersection of two lines|็ด็บฟ.*ไบค็น|ไบค็น.*็ด็บฟ|็ธไบค็ด็บฟ|ไธ€ๆฌกๅฝๆ•ฐ.*ไบค็น|ๆญฃๆฏ”ไพๅฝๆ•ฐ.*ไบค็น|่ฟ็น[A-Z].*่ฟ็น[A-Z])/i.test(source);
  if (!hasTwoLineCue) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const hasPrimary = Number.isFinite(Number(data.slope ?? data.k)) &&
    Number.isFinite(Number(data.xmin)) &&
    Number.isFinite(Number(data.xmax));
  const hasSecondary = Number.isFinite(Number(data.secondary_slope ?? data.k2 ?? data.m2 ?? data.slope_2 ?? data.slope2)) &&
    Number.isFinite(Number(data.secondary_intercept ?? data.b2 ?? data.c2 ?? data.intercept_2 ?? data.intercept2));
  const hasA = !!(data.label_A || data.label_x_intercept);
  const hasB = !!(data.label_B || data.label_y_intercept);
  const asksIntersection = /(?:ไบค็น|intersection|็ธไบค|ๆฑ.*ไบค็น)/i.test(source);
  const hasIntersection = !!(data.show_intersection || data.label_intersection || data.label_P);

  return !(hasPrimary && hasSecondary && hasA && hasB && (!asksIntersection || hasIntersection));
}

export function needsTangentChordRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  const problemSource = normalizeText([conceptTitle, conceptDesc].filter(Boolean).join("\n"));
  if (!hasTangentChordCue(source) || !hasTangentChordAngleCue(source)) return false;
  if (!hasMathDiagramBlock(generatedText)) return false;

  const tangentPointCue = extractTangentPointCue(problemSource);
  const expectedCArcType = inferArcTypeCueForPoint(problemSource, 'C');
  const expectedDArcType = inferArcTypeCueForPoint(problemSource, 'D');
  const expectedArcType = expectedDArcType ?? expectedCArcType;
  const wantsDualArcPoints = hasDualTangentChordArcPointsCue(source);
  const data = extractDiagramBlockJson(generatedText);

  if (tangentPointCue && (!data || String(data.label_A ?? "").toUpperCase() !== tangentPointCue)) {
    return true;
  }

  if (wantsDualArcPoints) {
    if (!data || typeof data !== "object") return true;
    const hasCoreDualLabels = ["A", "B", "C", "D"].every((label) => String(data[`label_${label}`] ?? "").toUpperCase() === label);
    if (!hasCoreDualLabels) return true;
    if (expectedCArcType && !hasExpectedArcTypeField(source, data, 'C', 'arc_type')) return true;
    if (expectedDArcType && !hasExpectedArcTypeField(source, data, 'D', 'd_arc_type')) return true;
    return false;
  }

  if (!data || typeof data !== "object") return true;
  if (!hasExpectedTangentChordLabels(generatedText, source, tangentPointCue)) return true;
  if (expectedArcType && !hasExpectedArcTypeField(source, data, 'C')) return true;
  return false;
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

export function needsAngleValueSourceMismatchRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc].filter(Boolean).join("\n"));
  if (!hasMathDiagramBlock(generatedText)) return false;

  return hasAngleFieldValueMismatch(generatedText, source);
}

export function needsCircleCyclicQuadrilateralRepair({ conceptTitle = "", conceptDesc = "", generatedText = "", diagramPolicy = "maybe_draw" } = {}) {
  if (diagramPolicy === "must_not_draw") return false;

  const source = normalizeText([conceptTitle, conceptDesc, generatedText].filter(Boolean).join("\n"));
  if (!/cyclic quadrilateral|inscribed in a circle|ABCD.*O|A,B,C,D.*O/i.test(source)) {
    return false;
  }
  if (!hasMathDiagramBlock(generatedText)) return false;

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const labels = Array.isArray(data.labels) ? data.labels : [];
  if (labels.length < 4 && !(data.label_A && data.label_B && data.label_C && data.label_D)) return true;

  const extensionCue = hasCyclicQuadrilateralExtensionCue(source);
  if (data.label_E !== undefined && !extensionCue) return true;
  if (extensionCue && String(data.label_E ?? "").trim() === "") return true;
  if (extensionCue && /(?:\u2220|angle)\s*ADE/i.test(source) && data.label_angle_ade === undefined) return true;

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

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const hasShowOC = hasAnyDiagramField(data, ["show_oc", "show_center_rays", "show_radii", "label_oc"]);
  const hasShowArcTangent = hasAnyDiagramField(data, ["show_arc_tangent", "show_tangent_at_C"]);
  const hasPerpShown = hasAnyDiagramField(data, ["show_perpendicular"]) ? String(data.show_perpendicular).toLowerCase() !== "false" : false;

  for (const angle of centralAngles) {
    const [, first = "", third = ""] = angle.match(/^([A-Z])O([A-Z])$/i) ?? [];
    const needsC = first === "C" || third === "C";

    if (!hasAnyDiagramField(data, [`label_angle_${angle.toLowerCase()}`, `angle_${angle.toLowerCase()}`])) {
      return true;
    }

    if (first === "D" || third === "D") {
      return true;
    }

    if (needsC && !(hasShowOC || hasShowArcTangent || hasPerpShown)) {
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

  const data = extractDiagramBlockJson(generatedText);
  if (!data || typeof data !== "object") return true;

  const labels = Array.isArray(data.labels) ? data.labels : [];
  const hasABC = labels.length >= 3 || (data.label_A && data.label_B && data.label_C);
  const sourceMentionsO = /\bO\b|circle\s*O|center\s*O|centre\s*O|ๅๅฟO/i.test(source);
  const hasO = sourceMentionsO ? hasAnyDiagramField(data, ["label_O"]) : true;

  return !(hasABC && hasO);
}


