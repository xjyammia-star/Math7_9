// src/utils/functionDiagramPolicy.ts

export interface FunctionAnnotation {
  x: number;
  y: number;
  label: string;
  type: 'root' | 'vertex' | 'intercept' | 'point';
}

/**
 * Computes key annotations for a linear function y = kx + b.
 */
export function getLinearFunctionAnnotations(
  k: number,
  b: number
): FunctionAnnotation[] {
  const annotations: FunctionAnnotation[] = [];

  // Y-intercept
  annotations.push({ x: 0, y: b, label: `(0, ${b})`, type: 'intercept' });

  // X-intercept (root), if k != 0
  if (Math.abs(k) > 1e-10) {
    const xRoot = -b / k;
    annotations.push({ x: xRoot, y: 0, label: `(${+xRoot.toFixed(2)}, 0)`, type: 'root' });
  }

  return annotations;
}

/**
 * Computes key annotations for a quadratic function y = ax² + bx + c.
 */
export function getQuadraticFunctionAnnotations(
  a: number,
  b: number,
  c: number
): FunctionAnnotation[] {
  const annotations: FunctionAnnotation[] = [];
  if (Math.abs(a) < 1e-10) return annotations;

  // Vertex
  const vx = -b / (2 * a);
  const vy = c - (b * b) / (4 * a);
  annotations.push({ x: vx, y: vy, label: `(${+vx.toFixed(2)}, ${+vy.toFixed(2)})`, type: 'vertex' });

  // Y-intercept
  annotations.push({ x: 0, y: c, label: `(0, ${c})`, type: 'intercept' });

  // X-intercepts (roots)
  const discriminant = b * b - 4 * a * c;
  if (discriminant >= 0) {
    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    annotations.push({ x: x1, y: 0, label: `(${+x1.toFixed(2)}, 0)`, type: 'root' });
    if (Math.abs(x1 - x2) > 1e-10) {
      annotations.push({ x: x2, y: 0, label: `(${+x2.toFixed(2)}, 0)`, type: 'root' });
    }
  }

  return annotations;
}
