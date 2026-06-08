// src/utils/diagramLabelPolicy.ts

/**
 * Returns the label string only if it was explicitly provided (non-empty).
 * Returns undefined if the label is absent, null, or empty string.
 * Used to prevent auto-generated labels from overriding blank/intentional omissions.
 */
export function explicitLabel(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s.length > 0 ? s : undefined;
}

/**
 * Returns label text cleaned of LaTeX artifacts for SVG display.
 */
export function cleanLabel(value: unknown): string {
  if (value === null || value === undefined) return '';
  let text = String(value).trim();
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
  text = text.replace(/\\sqrt\{([^{}]+)\}/g, '√$1');
  text = text.replace(/\\pi\b/g, 'π');
  text = text.replace(/\\circ\b/g, '°');
  text = text.replace(/\\angle\b/g, '∠');
  text = text.replace(/\\times\b/g, '×');
  text = text.replace(/\\text\{([^}]*)\}/g, '$1');
  return text.trim();
}
