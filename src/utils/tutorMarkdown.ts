// src/utils/tutorMarkdown.ts

/**
 * Processes tutor markdown content, handling special formatting
 * for mathematical expressions and educational content.
 */
export function processTutorMarkdown(content: string): string {
  if (!content) return '';
  return content.trim();
}

/**
 * Extracts sections from tutor markdown response.
 */
export function extractSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = content.split('\n');
  let currentSection = 'main';
  let buffer: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      if (buffer.length > 0) {
        sections[currentSection] = buffer.join('\n').trim();
      }
      currentSection = headingMatch[1].toLowerCase().replace(/\s+/g, '_');
      buffer = [];
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length > 0) {
    sections[currentSection] = buffer.join('\n').trim();
  }

  return sections;
}
