// src/utils/tutorMarkdown.ts

/**
 * Normalizes tutor plain text content for display.
 * Strips excessive whitespace and normalizes line endings.
 */
export function normalizeTutorPlainText(content: string): string {
  if (!content) return '';
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Determines whether tutor content should be rendered with math support.
 * Returns true if the content contains LaTeX math delimiters or known math patterns.
 */
export function shouldRenderTutorContentWithMath(content: string): boolean {
  if (!content) return false;
  return (
    content.includes('$$') ||
    content.includes('$') ||
    content.includes('\\[') ||
    content.includes('\\(') ||
    content.includes('\\frac') ||
    content.includes('\\sqrt') ||
    content.includes('\\sum') ||
    content.includes('\\int') ||
    content.includes('^{') ||
    content.includes('_{')
  );
}

/**
 * Processes tutor markdown content.
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
      if (buffer.length > 0) sections[currentSection] = buffer.join('\n').trim();
      currentSection = headingMatch[1].toLowerCase().replace(/\s+/g, '_');
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0) sections[currentSection] = buffer.join('\n').trim();
  return sections;
}
