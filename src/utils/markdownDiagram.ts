// src/utils/markdownDiagram.ts

export interface EmbeddedDiagram {
  leadingText: string;
  diagramData: any;
  trailingText: string;
}

/**
 * Extracts an embedded JSON diagram block from a markdown paragraph.
 * Returns null if no diagram is found.
 */
export function extractEmbeddedDiagram(text: string): EmbeddedDiagram | null {
  const jsonMatch = text.match(/^([\s\S]*?)(\{[\s\S]*"(?:template|type|geometry|window)"[\s\S]*\})([\s\S]*)$/);
  if (!jsonMatch) return null;

  try {
    const diagramData = JSON.parse(jsonMatch[2]);
    return {
      leadingText: jsonMatch[1].trim(),
      diagramData,
      trailingText: jsonMatch[3].trim(),
    };
  } catch {
    return null;
  }
}
