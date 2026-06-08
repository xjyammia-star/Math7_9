// src/utils/mathUtils.ts

/**
 * Sanitizes LaTeX math expressions for safe rendering with KaTeX/rehype-katex.
 * Fixes common issues with math delimiters and special characters.
 */
export function sanitizeMath(content: string): string {
  if (!content) return '';

  return content
    // Normalize display math blocks
    .replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_, math) => `$$${math.trim()}$$`)
    // Normalize inline math
    .replace(/\$([^$\n]+?)\$/g, (_, math) => `$${math.trim()}$`)
    // Fix escaped brackets used as math delimiters
    .replace(/\\\[/g, '$$').replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$').replace(/\\\)/g, '$')
    // Remove zero-width spaces that can break math rendering
    .replace(/\u200b/g, '');
}
