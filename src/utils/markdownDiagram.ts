export interface EmbeddedDiagram {
  leadingText: string;
  trailingText: string;
  diagramData: any;
}

function isDiagramPayload(value: any): boolean {
  return Boolean(value && typeof value === 'object' && (value.template || value.type));
}

export function extractEmbeddedDiagram(text: string): EmbeddedDiagram | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = text.slice(start, end + 1).trim();
  if (!(candidate.includes('"template"') || candidate.includes('"type"'))) return null;

  try {
    const diagramData = JSON.parse(candidate);
    if (!isDiagramPayload(diagramData)) return null;

    return {
      leadingText: text.slice(0, start).trim(),
      trailingText: text.slice(end + 1).trim(),
      diagramData,
    };
  } catch {
    return null;
  }
}
