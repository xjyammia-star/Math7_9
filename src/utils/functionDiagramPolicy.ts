// src/utils/functionDiagramPolicy.ts
//
// Annotation policy for function-graph templates (linear_function /
// quadratic_function) in MathDiagram.tsx.
//
// ANSWER-LEAK GUARD (project iron rule): the figure must NEVER display a
// value the problem asks the student to find. Intercepts of y = kx + b
// directly reveal k and b, and the vertex of a parabola reveals its
// equation — so NOTHING here is computed or shown automatically.
//
// Every annotation is strictly OPT-IN: it appears only when the AI
// explicitly passes both the enabling flag AND the label text (the AI is
// instructed to do so only for values GIVEN in the problem text, and to
// prefer point NAMES like "A" over coordinate values).

export interface LinearFunctionAnnotations {
  /** Label for the x-intercept dot (e.g. "A"). Empty string = no dot. */
  xInterceptLabel: string;
  /** Label for the y-intercept dot (e.g. "B"). Empty string = no dot. */
  yInterceptLabel: string;
  /** Master switch: true only when the AI explicitly enables intercept dots. */
  showInterceptDots: boolean;
}

export interface QuadraticFunctionAnnotations {
  /** Label for the vertex dot (e.g. "P"). Empty string = no dot. */
  vertexLabel: string;
  /** Master switch: true only when the AI explicitly enables the vertex dot. */
  showVertexDot: boolean;
}

function readLabel(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Reads intercept-dot annotations for y = kx + b from the diagram JSON.
 * Default: everything OFF. The AI must pass "show_intercepts": true plus
 * "x_intercept_label" and/or "y_intercept_label" for anything to appear.
 */
export function getLinearFunctionAnnotations(data: any): LinearFunctionAnnotations {
  const xInterceptLabel = readLabel(data?.x_intercept_label ?? data?.label_x_intercept);
  const yInterceptLabel = readLabel(data?.y_intercept_label ?? data?.label_y_intercept);
  const showInterceptDots =
    data?.show_intercepts === true && (xInterceptLabel !== '' || yInterceptLabel !== '');
  return { xInterceptLabel, yInterceptLabel, showInterceptDots };
}

/**
 * Reads vertex-dot annotations for y = ax² + bx + c from the diagram JSON.
 * Default: OFF. The AI must pass "show_vertex": true plus "vertex_label".
 */
export function getQuadraticFunctionAnnotations(data: any): QuadraticFunctionAnnotations {
  const vertexLabel = readLabel(data?.vertex_label ?? data?.label_vertex);
  const showVertexDot = data?.show_vertex === true && vertexLabel !== '';
  return { vertexLabel, showVertexDot };
}
