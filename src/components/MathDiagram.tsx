/**
 * MathDiagram.tsx — Template-driven math diagram renderer
 *
 * AI outputs a simple JSON with a "template" key + numeric values.
 * ALL coordinate calculation happens here in TypeScript — the AI never
 * computes coordinates itself.
 *
 * Supported templates:
 *   right_triangle        – right-angled triangle, legs a/b
 *   triangle              – general triangle, all three side lengths
 *   rectangle             – plain rectangle w×h
 *   circle                – full circle with a radius line
 *   rectangle_fold        – rectangle with a fold line (EF) and reflected vertex
 *   parallelogram         – parallelogram with base, side, angle
 *   circle                – circle with optional radius label, tangent from external pt
 *   circle_annulus        – concentric circles with outer/inner radius labels
 *   circle_intersecting_chords – two chords intersecting inside a circle
 *   linear_function       – y = kx + b on a coordinate grid
 *   quadratic_function    – y = ax² + bx + c on a coordinate grid
 *   number_line           – horizontal number line with marked points / arrows
 *   coordinate_points     – free points + segments on a grid
 *   cylinder_unrolled     – unrolled lateral surface (for shortest-path problems)
 *   rectangular_prism_net – cuboid net with length/width/height labels
 *   ladder                – ladder-against-wall right triangle
 *   similar_triangles     – two similar triangles side by side
 */

import React from 'react';
import { explicitLabel } from '../utils/diagramLabelPolicy';
import { getLinearFunctionAnnotations, getQuadraticFunctionAnnotations } from '../utils/functionDiagramPolicy';
import PythonCircleDiagram from './PythonCircleDiagram';

// ─── SVG canvas constants ────────────────────────────────────────────────────
const W = 480;
const H = 360;
const PAD = 48;            // padding inside SVG
const GOLD  = '#f59e0b';
const GREY  = '#94a3b8';
const DIM   = '#64748b';
const WHITE = '#f8fafc';
const FILL  = 'rgba(245,158,11,0.08)';
const FILL2 = 'rgba(148,163,184,0.08)';

// ─── Utility types ───────────────────────────────────────────────────────────
interface Pt { x: number; y: number }

// ─── Low-level SVG helpers ───────────────────────────────────────────────────

/** Map a math-space point to SVG pixels given a viewport */
function makeScaler(xMin: number, xMax: number, yMin: number, yMax: number) {
  const sx = (W - 2 * PAD) / (xMax - xMin);
  const sy = (H - 2 * PAD) / (yMax - yMin);
  const s  = Math.min(sx, sy);
  // Centre the drawing
  const offX = PAD + ((W - 2 * PAD) - s * (xMax - xMin)) / 2;
  const offY = PAD + ((H - 2 * PAD) - s * (yMax - yMin)) / 2;
  return (p: Pt): Pt => ({
    x: offX + (p.x - xMin) * s,
    y: H - offY - (p.y - yMin) * s,   // flip Y axis
  });
}

/** Polygon SVG element */
function Poly({ pts, fill = FILL, stroke = GOLD, sw = 2.5, dash = '' }:
  { pts: Pt[]; fill?: string; stroke?: string; sw?: number; dash?: string }) {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />;
}

/** Line segment SVG element */
function Seg({ a, b, stroke = GOLD, sw = 2.5, dash = '' }:
  { a: Pt; b: Pt; stroke?: string; sw?: number; dash?: string }) {
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
    stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" />;
}

/** Point dot + label */
function Dot({ p, label, color = GOLD, offset = { x: 8, y: -10 } }:
  { p: Pt; label?: string; color?: string; offset?: Pt }) {
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={4} fill={color} />
      {label && (
        <>
          <text x={p.x + offset.x} y={p.y + offset.y} fontSize={13}
            fontWeight="700" fill="none" stroke="#020617" strokeWidth={4}
            strokeLinejoin="round" style={{ pointerEvents: 'none' }}>{label}</text>
          <text x={p.x + offset.x} y={p.y + offset.y} fontSize={13}
            fontWeight="700" fill={WHITE} style={{ pointerEvents: 'none' }}>{label}</text>
        </>
      )}
    </g>
  );
}

/** Mid-segment length label (rendered perpendicular to the segment) */
function SegLabel({ a, b, label, color = DIM }:
  { a: Pt; b: Pt; label: string; color?: string }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // Perpendicular offset
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len * 14;
  const ny =  dx / len * 14;
  return (
    <g>
      <text x={mx + nx} y={my + ny} fontSize={12} fontWeight="700" textAnchor="middle"
        dominantBaseline="middle" fill="none" stroke="#020617" strokeWidth={3.5}
        strokeLinejoin="round">{label}</text>
      <text x={mx + nx} y={my + ny} fontSize={12} fontWeight="700" textAnchor="middle"
        dominantBaseline="middle" fill={color}>{label}</text>
    </g>
  );
}

function cleanDiagramLabelText(value: unknown): string {
  let text = String(value ?? '').trim();
  if (!text) return '';

  text = text.replace(/\\+frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
  text = text.replace(/\\+sqrt\{([^{}]+)\}/g, '√$1');
  text = text.replace(/\\+pi\b/g, '\u03c0');
  text = text.replace(/\\+circ\b/g, '\u00b0');
  text = text.replace(/\\+angle\b/g, '\u2220');
  text = text.replace(/\\+times\b/g, '\u00d7');
  text = text.replace(/\\+div\b/g, '\u00f7');
  text = text.replace(/\\+text\{([^}]*)\}/g, '$1');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/** Right-angle square marker at vertex `v`, coming from `a` and going to `b` */
function RightAngleMark({ v, a, b, size = 10, color = GREY }:
  { v: Pt; a: Pt; b: Pt; size?: number; color?: string }) {
  const ua = norm({ x: a.x - v.x, y: a.y - v.y });
  const ub = norm({ x: b.x - v.x, y: b.y - v.y });
  const p1 = { x: v.x + ua.x * size, y: v.y + ua.y * size };
  const p2 = { x: v.x + ua.x * size + ub.x * size, y: v.y + ua.y * size + ub.y * size };
  const p3 = { x: v.x + ub.x * size, y: v.y + ub.y * size };
  return <polyline points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
    fill="none" stroke={color} strokeWidth={1.8} />;
}

/** Arc angle marker */
function AngleMark({ v, a, b, r = 18, label, color = GREY }:
  { v: Pt; a: Pt; b: Pt; r?: number; label?: string; color?: string }) {
  const ua = norm({ x: a.x - v.x, y: a.y - v.y });
  const ub = norm({ x: b.x - v.x, y: b.y - v.y });
  const startAngle = Math.atan2(ua.y, ua.x);
  const endAngle   = Math.atan2(ub.y, ub.x);
  const x1 = v.x + r * Math.cos(startAngle);
  const y1 = v.y + r * Math.sin(startAngle);
  const x2 = v.x + r * Math.cos(endAngle);
  const y2 = v.y + r * Math.sin(endAngle);
  // Determine sweep
  let diff = endAngle - startAngle;
  while (diff < 0) diff += 2 * Math.PI;
  const sweep = diff < Math.PI ? 1 : 0;
  const mid = startAngle + (diff < Math.PI ? diff : diff - 2 * Math.PI) / 2;
  const lx = v.x + (r + 14) * Math.cos(mid);
  const ly = v.y + (r + 14) * Math.sin(mid);
  return (
    <g>
      <path d={`M${x1},${y1} A${r},${r} 0 0 ${sweep} ${x2},${y2}`}
        fill="none" stroke={color} strokeWidth={1.8} />
      {label && (
        <text x={lx} y={ly} fontSize={11} textAnchor="middle"
          dominantBaseline="middle" fill={color} fontWeight="700">{label}</text>
      )}
    </g>
  );
}

/** Coordinate axes with tick marks */
function Axes({ sc, xMin, xMax, yMin, yMax }:
  { sc: (p: Pt) => Pt; xMin: number; xMax: number; yMin: number; yMax: number }) {
  const o  = sc({ x: 0, y: 0 });
  const xL = sc({ x: xMin, y: 0 });
  const xR = sc({ x: xMax, y: 0 });
  const yB = sc({ x: 0, y: yMin });
  const yT = sc({ x: 0, y: yMax });
  const ticks: React.ReactNode[] = [];
  const step = Math.ceil((xMax - xMin) / 10);
  for (let v = Math.ceil(xMin); v <= xMax; v += step) {
    if (v === 0) continue;
    const p = sc({ x: v, y: 0 });
    ticks.push(
      <g key={`xt${v}`}>
        <line x1={p.x} y1={p.y - 4} x2={p.x} y2={p.y + 4} stroke={GREY} strokeWidth={1.5} />
        <text x={p.x} y={p.y + 16} fontSize={10} fill={GREY} textAnchor="middle">{v}</text>
      </g>
    );
  }
  for (let v = Math.ceil(yMin); v <= yMax; v += step) {
    if (v === 0) continue;
    const p = sc({ x: 0, y: v });
    ticks.push(
      <g key={`yt${v}`}>
        <line x1={p.x - 4} y1={p.y} x2={p.x + 4} y2={p.y} stroke={GREY} strokeWidth={1.5} />
        <text x={p.x - 8} y={p.y + 4} fontSize={10} fill={GREY} textAnchor="end">{v}</text>
      </g>
    );
  }
  // Arrow heads
  const arr = (x1: number, y1: number, x2: number, y2: number, label: string, lx: number, ly: number) => (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={GREY} strokeWidth={1.8} />
      <text x={lx} y={ly} fontSize={12} fill={GREY} textAnchor="middle" fontWeight="700">{label}</text>
    </>
  );
  return (
    <g>
      {/* Grid lines */}
      {Array.from({ length: Math.floor(xMax) - Math.ceil(xMin) + 1 }, (_, i) => Math.ceil(xMin) + i).map(v => {
        const p = sc({ x: v, y: yMin }); const q = sc({ x: v, y: yMax });
        return <line key={`gx${v}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={GREY} strokeWidth={0.4} strokeOpacity={0.25} />;
      })}
      {Array.from({ length: Math.floor(yMax) - Math.ceil(yMin) + 1 }, (_, i) => Math.ceil(yMin) + i).map(v => {
        const p = sc({ x: xMin, y: v }); const q = sc({ x: xMax, y: v });
        return <line key={`gy${v}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={GREY} strokeWidth={0.4} strokeOpacity={0.25} />;
      })}
      {arr(xL.x, o.y, xR.x, o.y, 'x', xR.x + 10, o.y + 4)}
      {arr(o.x, yB.y, o.x, yT.y, 'y', o.x, yT.y - 10)}
      <text x={o.x - 8} y={o.y + 14} fontSize={10} fill={GREY}>O</text>
      {ticks}
    </g>
  );
}

// ─── Math helpers ────────────────────────────────────────────────────────────
function norm(v: Pt): Pt {
  const l = Math.sqrt(v.x * v.x + v.y * v.y) || 1;
  return { x: v.x / l, y: v.y / l };
}
function dist(a: Pt, b: Pt) { return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2); }
function midPt(a: Pt, b: Pt): Pt { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

function lineIntersection(p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null {
  const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 1e-9) return null;
  const a = x1 * y2 - y1 * x2;
  const b = x3 * y4 - y3 * x4;
  return {
    x: (a * (x3 - x4) - (x1 - x2) * b) / den,
    y: (a * (y3 - y4) - (y1 - y2) * b) / den,
  };
}

function circleFromThreePoints(a: Pt, b: Pt, c: Pt): { cx: number; cy: number; r: number } | null {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-9) return null;

  const a2 = a.x * a.x + a.y * a.y;
  const b2 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;
  const cx = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
  const cy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;

  return { cx, cy, r: dist({ x: cx, y: cy }, a) };
}

/** Build a triangle from three side lengths using cosine rule. Returns [A, B, C] in math space. */
function triangleFromSides(a: number, b: number, c: number): [Pt, Pt, Pt] {
  // B at origin, C at (a, 0), A computed via cosine rule
  const cosB = (a * a + c * c - b * b) / (2 * a * c);
  const sinB = Math.sqrt(Math.max(0, 1 - cosB * cosB));
  return [
    { x: c * cosB, y: c * sinB },   // A
    { x: 0,        y: 0 },           // B
    { x: a,        y: 0 },           // C
  ];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function numberFromValueOrLabel(value: unknown): number | null {
  const direct = asFiniteNumber(value);
  if (direct !== null) return direct;
  if (typeof value !== 'string') return null;
  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function coerceLabeledNumericFields(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const fallbackMap: Record<string, string[]> = {
    radius: ['label_radius', 'label_r', 'outer_radius', 'radius_outer', 'label_outer_radius', 'label_radius_outer'],
    angle: ['label_angle'],
    angle_deg: ['label_angle_deg'],
    minutes: ['label_minutes', 'label_time_minutes'],
    time_minutes: ['label_time_minutes', 'label_minutes'],
    sector_count: ['label_sector_count'],
    width: ['label_width'],
    height: ['label_height'],
    length: ['label_length'],
    base: ['label_base'],
    side: ['label_side'],
    leg_h: ['label_leg_h'],
    leg_v: ['label_leg_v'],
    foot_dist: ['label_foot_dist'],
    circumference: ['label_circumference'],
    op_dist: ['label_op_dist'],
    tangent_length: ['label_tangent_length', 'label_pa'],
    pa_length: ['label_pa', 'label_tangent_length'],
    pa: ['label_pa'],
    pb: ['label_pb'],
    ap: ['label_ap'],
    cp: ['label_cp'],
    pd: ['label_pd'],
    cd: ['label_cd'],
    chord_half: ['label_chord_half'],
    water_depth: ['label_depth', 'label_water_depth'],
    depth: ['label_depth', 'label_water_depth'],
    diameter: ['label_diameter'],
  };

  const next = { ...data };
  for (const [field, labels] of Object.entries(fallbackMap)) {
    if (next[field] !== undefined && next[field] !== null) continue;
    for (const label of labels) {
      if (next[label] === undefined || next[label] === null) continue;
      const numeric = numberFromValueOrLabel(next[label]);
      if (numeric !== null) {
        next[field] = numeric;
        break;
      }
    }
  }

  return next;
}

function getSectorCount(data: any): number | null {
  return asFiniteNumber(data.sector_count ?? data.piece_count ?? data.parts ?? data.equal_parts ?? data.slices);
}

function hasRequiredLabels(labels: unknown, count: number): boolean {
  return Array.isArray(labels) && labels.length >= count && labels.slice(0, count).every(label => typeof label === 'string' && label.trim() !== '');
}

function validateDiagramData(template: string, data: any): string | null {
  data = coerceLabeledNumericFields(data);
  switch (template) {
    case 'right_triangle': {
      const a = asFiniteNumber(data.leg_h ?? data.legs?.[0] ?? data.a);
      const b = asFiniteNumber(data.leg_v ?? data.legs?.[1] ?? data.b);
      return a !== null && b !== null && a > 0 && b > 0 ? null : 'right_triangle requires two positive leg lengths';
    }
    case 'triangle': {
      if (Array.isArray(data.points) && data.points.length >= 3) {
        const badPoint = data.points.slice(0, 3).some((p: any) => asFiniteNumber(p?.x) === null || asFiniteNumber(p?.y) === null);
        return badPoint ? 'triangle contains invalid point coordinates' : null;
      }
      const sides = data.sides ?? [data.a, data.b, data.c];
      const nums = sides.map((v: unknown) => asFiniteNumber(v));
      if (nums.some((n: number | null) => n === null)) return 'triangle requires three numeric sides';
      const [a, b, c] = nums as number[];
      return a + b > c && a + c > b && b + c > a ? null : 'triangle sides do not form a valid triangle';
    }
    case 'rectangle':
      return asFiniteNumber(data.width ?? data.w) !== null && asFiniteNumber(data.height ?? data.h) !== null ? null : 'rectangle requires width and height';
    case 'circle': {
      const radius = asFiniteNumber(data.radius ?? data.r);
      return radius !== null && radius > 0 ? null : 'circle requires a positive radius';
    }
    case 'circle_annulus': {
      const outer = asFiniteNumber(data.outer_radius ?? data.radius ?? data.r);
      const inner = asFiniteNumber(data.inner_radius ?? data.r_inner ?? data.radius_inner);
      return outer !== null && inner !== null && outer > inner && inner > 0
        ? null
        : 'circle_annulus requires positive outer_radius greater than inner_radius';
    }
    case 'rectangle_diagonal': {
      const w = asFiniteNumber(data.width ?? data.w);
      const h = asFiniteNumber(data.height ?? data.h);
      return w !== null && h !== null && w > 0 && h > 0
        ? null
        : 'rectangle_diagonal requires positive width and height';
    }
    case 'square_diagonal': {
      const side = asFiniteNumber(data.side ?? data.width ?? data.w ?? data.height ?? data.h);
      const diagonal = asFiniteNumber(data.diagonal ?? data.label_AC);
      return side !== null && side > 0 && (diagonal === null || diagonal > 0)
        ? null
        : 'square_diagonal requires a positive side and optional positive diagonal';
    }
    case 'composite_overlay': {
      const bounds = data.bounds ?? {};
      const xMin = asFiniteNumber(bounds.xMin ?? bounds.minX);
      const xMax = asFiniteNumber(bounds.xMax ?? bounds.maxX);
      const yMin = asFiniteNumber(bounds.yMin ?? bounds.minY);
      const yMax = asFiniteNumber(bounds.yMax ?? bounds.maxY);
      if (xMin === null || xMax === null || yMin === null || yMax === null || xMax <= xMin || yMax <= yMin) {
        return 'composite_overlay requires numeric bounds';
      }
      if (!Array.isArray(data.layers) || data.layers.length === 0) {
        return 'composite_overlay requires layers';
      }
      return data.layers.every((layer: any) => {
        if (!layer || typeof layer !== 'object') return false;
        switch (String(layer.kind ?? '').trim()) {
          case 'poly':
            return Array.isArray(layer.pts) && layer.pts.length >= 3 && layer.pts.every((pt: any) => asFiniteNumber(pt?.x) !== null && asFiniteNumber(pt?.y) !== null);
          case 'seg':
            return asFiniteNumber(layer.a?.x) !== null && asFiniteNumber(layer.a?.y) !== null && asFiniteNumber(layer.b?.x) !== null && asFiniteNumber(layer.b?.y) !== null;
          case 'dot':
            return asFiniteNumber(layer.p?.x) !== null && asFiniteNumber(layer.p?.y) !== null;
          case 'segLabel':
            return asFiniteNumber(layer.a?.x) !== null && asFiniteNumber(layer.a?.y) !== null && asFiniteNumber(layer.b?.x) !== null && asFiniteNumber(layer.b?.y) !== null && typeof layer.label === 'string';
          case 'text':
            return asFiniteNumber(layer.x) !== null && asFiniteNumber(layer.y) !== null && typeof layer.text === 'string';
          case 'circle':
            return asFiniteNumber(layer.c?.x) !== null && asFiniteNumber(layer.c?.y) !== null && asFiniteNumber(layer.r) !== null && layer.r > 0;
          case 'arc':
            return asFiniteNumber(layer.c?.x) !== null && asFiniteNumber(layer.c?.y) !== null && asFiniteNumber(layer.r) !== null && layer.r > 0 && asFiniteNumber(layer.startAngle) !== null && asFiniteNumber(layer.endAngle) !== null;
          default:
            return false;
        }
      }) ? null : 'composite_overlay contains invalid layers';
    }
    case 'adjacent_squares_diagonal': {
      const small = asFiniteNumber(data.small_side ?? data.left_side ?? data.a);
      const large = asFiniteNumber(data.large_side ?? data.right_side ?? data.b);
      return small !== null && large !== null && small > 0 && large > small
        ? null
        : 'adjacent_squares_diagonal requires positive small_side and larger large_side';
    }
    case 'rectangle_fold': {
      const w = asFiniteNumber(data.width);
      const h = asFiniteNumber(data.height);
      const validSides = ['AB', 'AD', 'BC', 'CD'];
      const eSide = String(data.E_side ?? '');
      const fSide = String(data.F_side ?? '');
      const eRatio = asFiniteNumber(data.E_ratio);
      const fRatio = asFiniteNumber(data.F_ratio);
      if (w === null || h === null || w <= 0 || h <= 0) return 'rectangle_fold requires width and height';
      if (!validSides.includes(eSide) || !validSides.includes(fSide)) return 'rectangle_fold requires valid E_side and F_side';
      if (eRatio === null || fRatio === null) return 'rectangle_fold requires E_ratio and F_ratio';
      return null;
    }
    case 'parallelogram': {
      const base = asFiniteNumber(data.base);
      const side = asFiniteNumber(data.side);
      const angle = asFiniteNumber(data.angle);
      return base !== null && side !== null && angle !== null && base > 0 && side > 0 && angle > 0 && angle < 180
        ? null
        : 'parallelogram requires positive base/side and angle between 0 and 180';
    }
    case 'ladder': {
      const length = asFiniteNumber(data.length ?? data.ladder);
      const foot = asFiniteNumber(data.foot_dist ?? data.foot);
      return length !== null && foot !== null && length > 0 && foot > 0 && foot <= length
        ? null
        : 'ladder requires length and a valid foot distance';
    }
    case 'cylinder_unrolled': {
      const circ = asFiniteNumber(data.circumference ?? data.radius);
      const height = asFiniteNumber(data.height);
      return circ !== null && height !== null && circ > 0 && height > 0
        ? null
        : 'cylinder_unrolled requires positive circumference and height';
    }
    case 'rectangular_prism_net': {
      const length = asFiniteNumber(data.length ?? data.l ?? data.a);
      const width = asFiniteNumber(data.width ?? data.w ?? data.b);
      const height = asFiniteNumber(data.height ?? data.h ?? data.c);
      return length !== null && width !== null && height !== null &&
        length > 0 && width > 0 && height > 0
        ? null
        : 'rectangular_prism_net requires positive length, width and height';
    }
    case 'linear_function': {
      const slope = asFiniteNumber(data.slope ?? data.k);
      const xMin = asFiniteNumber(data.xmin);
      const xMax = asFiniteNumber(data.xmax);
      return slope !== null && xMin !== null && xMax !== null && xMin < xMax
        ? null
        : 'linear_function requires slope, xmin and xmax';
    }
    case 'quadratic_function': {
      const a = asFiniteNumber(data.a);
      const xMin = asFiniteNumber(data.xmin);
      const xMax = asFiniteNumber(data.xmax);
      return a !== null && a !== 0 && xMin !== null && xMax !== null && xMin < xMax
        ? null
        : 'quadratic_function requires non-zero a, xmin and xmax';
    }
    case 'number_line':
    case 'numberline': {
      const range = Array.isArray(data.range) ? data.range : null;
      if (!range || range.length < 2) return 'number_line requires a range';
      const lo = asFiniteNumber(range[0]);
      const hi = asFiniteNumber(range[1]);
      return lo !== null && hi !== null && lo < hi ? null : 'number_line range is invalid';
    }
    case 'coordinate_points': {
      const points = Array.isArray(data.points) ? data.points : [];
      if (points.length === 0) return 'coordinate_points requires at least one point';
      const badPoint = points.some((p: any) => asFiniteNumber(p?.x) === null || asFiniteNumber(p?.y) === null);
      if (badPoint) return 'coordinate_points contains invalid point coordinates';
      const polygons = Array.isArray(data.polygons) ? data.polygons : [];
      const badPolygon = polygons.some((polygon: any) => {
        const pts = Array.isArray(polygon?.pts) ? polygon.pts : [];
        return pts.length < 3 || pts.some((pt: any) => asFiniteNumber(pt?.x) === null || asFiniteNumber(pt?.y) === null);
      });
      return badPolygon ? 'coordinate_points contains invalid polygons' : null;
    }
    case 'similar_triangles': {
      const ratio = asFiniteNumber(data.ratio);
      const sides = Array.isArray(data.sides) ? data.sides : [];
      const nums = sides.map((v: unknown) => asFiniteNumber(v));
      return ratio !== null && ratio > 0 && nums.length >= 3 && nums.every((n: number | null) => n !== null && n > 0)
        ? null
        : 'similar_triangles requires positive ratio and side lengths';
    }
    case 'circle_chord': {
      const radius = asFiniteNumber(data.radius);
      const depth = asFiniteNumber(data.water_depth ?? data.depth);
      const chordHalf = asFiniteNumber(data.chord_half ?? (data.chord ? data.chord / 2 : null));
      if (radius !== null && depth !== null && radius > 0 && depth >= 0 && depth <= radius * 2) return null;
      return radius !== null && chordHalf !== null && radius > 0 && chordHalf >= 0 && chordHalf <= radius
        ? null
        : 'circle_chord requires a radius and either a chord within the circle or a valid water_depth';
    }
    case 'circle_sector': {
      const radius = numberFromValueOrLabel(data.radius ?? data.outer_radius ?? data.label_radius ?? data.label_outer_radius);
      const angle = numberFromValueOrLabel(data.angle ?? data.angle_deg ?? data.label_angle);
      const minutes = numberFromValueOrLabel(data.minutes ?? data.time_minutes ?? data.label_minutes);
      const sectorCount = getSectorCount(data);
      return radius !== null && radius > 0 && (
        (angle !== null && angle > 0 && angle <= 360) ||
        (minutes !== null && minutes > 0 && minutes <= 60) ||
        (sectorCount !== null && sectorCount > 0)
      )
        ? null
        : 'circle_sector requires a positive radius and a valid angle, minute span, or sector_count';
    }
    case 'circle_tangent': {
      const radius = asFiniteNumber(data.radius);
      const op = asFiniteNumber(data.op_dist);
      const tangentLength = numberFromValueOrLabel(data.tangent_length ?? data.pa_length ?? data.pa ?? data.PA ?? data.label_pa);
      const angleApb = numberFromValueOrLabel(data.angle_apb ?? data.angle ?? data.label_angle_apb ?? data.label_angle);
      return (
        (radius !== null && op !== null && radius > 0 && op > radius) ||
        (tangentLength !== null && tangentLength > 0) ||
        (tangentLength !== null && angleApb !== null && tangentLength > 0 && angleApb > 0 && angleApb < 180)
      )
        ? null
        : 'circle_tangent requires op_dist to be larger than radius, or a positive tangent_length, or a tangent_length with angle_apb';
    }
    case 'circle_chord_tangent': {
      const radius = asFiniteNumber(data.radius ?? 5);
      const angle = asFiniteNumber(data.angle ?? data.angle_pab);
      return radius !== null && radius > 0 && (angle === null || (angle > 0 && angle < 90))
        ? null
        : 'circle_chord_tangent requires a positive radius and optional angle between 0 and 90';
    }
    case 'circle_tangent_chord_dual_points': {
      const radius = asFiniteNumber(data.radius ?? 5);
      const angle = asFiniteNumber(data.angle ?? data.angle_pab);
      return radius !== null && radius > 0 && (angle === null || (angle > 0 && angle < 90))
        ? null
        : 'circle_tangent_chord_dual_points requires a positive radius and optional angle between 0 and 90';
    }
    case 'circle_cyclic_quadrilateral': {
      const radius = asFiniteNumber(data.radius ?? 5);
      return radius !== null && radius > 0
        ? null
        : 'circle_cyclic_quadrilateral requires a positive radius';
    }
    case 'circle_three_points': {
      const radius = asFiniteNumber(data.radius ?? 5);
      return radius !== null && radius > 0
        ? null
        : 'circle_three_points requires a positive radius';
    }
    case 'circle_diameter_points': {
      const radius = asFiniteNumber(data.radius ?? 5);
      return radius !== null && radius > 0
        ? null
        : 'circle_diameter_points requires a positive radius';
    }
    case 'circle_intersecting_chords': {
      const ap = asFiniteNumber(data.ap);
      const pb = asFiniteNumber(data.pb);
      const cp = asFiniteNumber(data.cp);
      const cd = asFiniteNumber(data.cd ?? data.CD ?? data.cd_total);
      const cpPdDiff = asFiniteNumber(data.cp_minus_pd ?? data.cp_pd_diff ?? data.cp_gt_pd_by ?? data.difference);
      const cpPdRatio = asFiniteNumber(data.cp_pd_ratio ?? data.ratio_cp_pd ?? data.cp_to_pd ?? data.ratio);
      return ap !== null && pb !== null && ap > 0 && pb > 0 && (
        (cp !== null && cp > 0) ||
        (cd !== null && cd > 0) ||
        (cpPdRatio !== null && cpPdRatio > 0) ||
        cpPdDiff !== null
      )
        ? null
        : 'circle_intersecting_chords requires positive ap, pb and either cp, cd, cp_pd_ratio, or cp_minus_pd';
    }
    case 'circle_diameter_chords': {
      const radius = asFiniteNumber(data.radius ?? 5);
      return radius !== null && radius > 0
        ? null
        : 'circle_diameter_chords requires a positive radius';
    }
    case 'circle_diameter_tangent_chord': {
      const radius = asFiniteNumber(data.radius ?? 5);
      return radius !== null && radius > 0
        ? null
        : 'circle_diameter_tangent_chord requires a positive radius';
    }
    default:
      return null;
  }
}

function normalizeDiagramData(template: string, data: any): any {
  data = coerceLabeledNumericFields(data);
  if (
    template === 'circle_chord' &&
    data?.radius !== undefined &&
    (data?.angle !== undefined || data?.angle_deg !== undefined || data?.minutes !== undefined || data?.time_minutes !== undefined) &&
    data?.chord_half === undefined &&
    data?.chord === undefined &&
    data?.water_depth === undefined &&
    data?.depth === undefined
  ) {
    return { ...data, template: 'circle_sector' };
  }

  if ((template === 'coordinate_points') && Array.isArray(data.segments)) {
    const pointLabels = new Set(
      (data.points ?? [])
        .map((p: any) => p?.label)
        .filter((label: unknown) => typeof label === 'string' && label.trim() !== '')
    );

    const segments = data.segments.filter((seg: any) => {
      const pair = Array.isArray(seg) ? seg : [seg?.from, seg?.to];
      return pair.length === 2 && pointLabels.has(pair[0]) && pointLabels.has(pair[1]);
    });

    return { ...data, segments };
  }

  return data;
}

// ─── Template renderers ──────────────────────────────────────────────────────

/** right_triangle: legs a (horizontal) and b (vertical), right angle at B */
function RightTriangle({ data }: { data: any }) {
  const a: number = data.leg_h ?? data.legs?.[0] ?? data.a ?? 3;
  const b: number = data.leg_v ?? data.legs?.[1] ?? data.b ?? 4;
  const hyp = Math.sqrt(a * a + b * b);
  const showRightAngleMark: boolean = data.show_right_angle_mark !== false;
  const labelA: string = explicitLabel(data.labels?.A ?? data.label_A);
  const labelB: string = explicitLabel(data.labels?.B ?? data.label_B);
  const labelC: string = explicitLabel(data.labels?.C ?? data.label_C);
  const labelAB: string = data.labels?.AB ?? data.label_AB ?? String(b);
  const labelBC: string = data.labels?.BC ?? data.label_BC ?? String(a);
  const labelAC: string = data.labels?.AC ?? data.label_AC ?? (
    Number.isInteger(hyp) ? String(hyp) : data.label_hyp ?? ''
  );
  const angleA: string = data.angle_A ?? '';
  const angleC: string = data.angle_C ?? '';

  // Math coords: B=(0,0), C=(a,0), A=(0,b)
  const pad = Math.max(a, b) * 0.25;
  const sc = makeScaler(-pad, a + pad, -pad, b + pad);
  const B = sc({ x: 0, y: 0 });
  const C = sc({ x: a, y: 0 });
  const A = sc({ x: 0, y: b });

  return (
    <g>
      <Poly pts={[A, B, C]} />
      {showRightAngleMark && <RightAngleMark v={B} a={A} b={C} />}
      <Dot p={A} label={labelA} offset={{ x: -18, y: -4 }} />
      <Dot p={B} label={labelB} offset={{ x: -18, y: 12 }} />
      <Dot p={C} label={labelC} offset={{ x: 8, y: 12 }} />
      {labelAB && <SegLabel a={A} b={B} label={labelAB} color={GOLD} />}
      {labelBC && <SegLabel a={B} b={C} label={labelBC} color={GOLD} />}
      {labelAC && <SegLabel a={A} b={C} label={labelAC} color={GOLD} />}
      {angleA  && <AngleMark v={A} a={B} b={C} label={angleA} />}
      {angleC  && <AngleMark v={C} a={A} b={B} label={angleC} />}
    </g>
  );
}

/** triangle: general triangle from three sides or three explicit points */
function Triangle({ data }: { data: any }) {
  let A: Pt, B: Pt, C: Pt;
  if (data.points && data.points.length >= 3) {
    [A, B, C] = data.points.map((p: any) => ({ x: Number(p[0] ?? p.x), y: Number(p[1] ?? p.y) }));
  } else {
    const sides = data.sides ?? [data.a ?? 5, data.b ?? 4, data.c ?? 3];
    [A, B, C] = triangleFromSides(sides[0], sides[1], sides[2]);
  }
  const all = [A, B, C];
  const xs = all.map(p => p.x), ys = all.map(p => p.y);
  const pad = (Math.max(...xs) - Math.min(...xs) + Math.max(...ys) - Math.min(...ys)) * 0.2;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad, Math.min(...ys) - pad, Math.max(...ys) + pad);
  const [sA, sB, sC] = [sc(A), sc(B), sc(C)];
  const lA = explicitLabel(data.labels?.A), lB = explicitLabel(data.labels?.B), lC = explicitLabel(data.labels?.C);
  const lAB = data.labels?.AB ?? '', lBC = data.labels?.BC ?? '', lCA = data.labels?.CA ?? '';
  const rightAt: string = data.right_angle ?? '';
  const lArea: string = cleanDiagramLabelText(data.label_area ?? '');
  const lPerimeter: string = cleanDiagramLabelText(data.label_perimeter ?? '');
  const centroid = {
    x: (sA.x + sB.x + sC.x) / 3,
    y: (sA.y + sB.y + sC.y) / 3,
  };

  return (
    <g>
      <Poly pts={[sA, sB, sC]} />
      <Dot p={sA} label={lA} offset={{ x: -6, y: -14 }} />
      <Dot p={sB} label={lB} offset={{ x: -18, y: 10 }} />
      <Dot p={sC} label={lC} offset={{ x: 8, y: 10 }} />
      {lAB && <SegLabel a={sA} b={sB} label={lAB} color={GOLD} />}
      {lBC && <SegLabel a={sB} b={sC} label={lBC} color={GOLD} />}
      {lCA && <SegLabel a={sC} b={sA} label={lCA} color={GOLD} />}
      {rightAt === 'A' && <RightAngleMark v={sA} a={sB} b={sC} />}
      {rightAt === 'B' && <RightAngleMark v={sB} a={sA} b={sC} />}
      {rightAt === 'C' && <RightAngleMark v={sC} a={sA} b={sB} />}
      {lArea && (
        <text x={centroid.x} y={centroid.y - 8} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArea}</text>
      )}
      {lPerimeter && (
        <text x={centroid.x} y={centroid.y + 10} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lPerimeter}</text>
      )}
    </g>
  );
}

/** rectangle: plain w×h rectangle */
function Rectangle({ data }: { data: any }) {
  const w: number = data.width ?? data.w ?? 6;
  const h: number = data.height ?? data.h ?? 4;
  const labels: string[] = Array.isArray(data.labels) ? data.labels : [];
  const lW: string = data.label_width  ?? String(w);
  const lH: string = data.label_height ?? String(h);
  const pad = Math.max(w, h) * 0.22;
  const sc = makeScaler(-pad, w + pad, -pad, h + pad);
  // A=top-left, B=bottom-left, C=bottom-right, D=top-right
  const A = sc({ x: 0, y: h }), B = sc({ x: 0, y: 0 });
  const C = sc({ x: w, y: 0 }), D = sc({ x: w, y: h });
  return (
    <g>
      <Poly pts={[A, B, C, D]} />
      <Dot p={A} label={explicitLabel(labels[0])} offset={{ x: -18, y: -4 }} />
      <Dot p={B} label={explicitLabel(labels[1])} offset={{ x: -18, y: 12 }} />
      <Dot p={C} label={explicitLabel(labels[2])} offset={{ x: 8,  y: 12 }} />
      <Dot p={D} label={explicitLabel(labels[3])} offset={{ x: 8,  y: -4 }} />
      <SegLabel a={A} b={B} label={lH} />
      <SegLabel a={B} b={C} label={lW} />
      {cleanDiagramLabelText(data.label_area ?? '') && (
        <text x={(A.x + C.x) / 2} y={(A.y + C.y) / 2 - 8} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{cleanDiagramLabelText(data.label_area ?? '')}</text>
      )}
      {cleanDiagramLabelText(data.label_perimeter ?? '') && (
        <text x={(A.x + C.x) / 2} y={(A.y + C.y) / 2 + 10} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{cleanDiagramLabelText(data.label_perimeter ?? '')}</text>
      )}
    </g>
  );
}

/** circle: full circle with radius label and optional area/circumference label */
function Circle({ data }: { data: any }) {
  const r: number = data.radius ?? data.r ?? 5;
  const O: Pt = { x: 0, y: 0 };
  const A: Pt = { x: r, y: 0 };
  const pad = r * 0.3;
  const sc = makeScaler(-r - pad, r + pad, -r - pad, r + pad);
  const sO = sc(O);
  const sA = sc(A);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sO.x);
  const lO = explicitLabel(data.label_O ?? 'O');
  const lA = explicitLabel(data.label_A ?? 'A');
  const lRadius = cleanDiagramLabelText(data.label_radius ?? '');
  const lArea = cleanDiagramLabelText(data.label_area ?? '');
  const lCirc = cleanDiagramLabelText(data.label_circumference ?? '');

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />
      <Seg a={sO} b={sA} stroke={GOLD} sw={2.4} />
      <Dot p={sO} label={lO} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sA} label={lA} offset={{ x: 10, y: -10 }} />
      {lRadius && <SegLabel a={sO} b={sA} label={lRadius} color={GOLD} />}
      {lArea && (
        <text x={sO.x} y={sO.y - 8} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArea}</text>
      )}
      {lCirc && (
        <text x={sO.x} y={sO.y + 12} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lCirc}</text>
      )}
    </g>
  );
}

/** circle_annulus: concentric circles for ring area problems */
function CircleAnnulus({ data }: { data: any }) {
  const outer: number = data.outer_radius ?? data.radius ?? 6;
  const inner: number = data.inner_radius ?? data.r_inner ?? 3;
  const O: Pt = { x: 0, y: 0 };
  const A: Pt = { x: outer, y: 0 };
  const B: Pt = { x: inner, y: 0 };
  const pad = outer * 0.3;
  const sc = makeScaler(-outer - pad, outer + pad, -outer - pad, outer + pad);
  const sO = sc(O);
  const sA = sc(A);
  const sB = sc(B);
  const outerR = Math.abs(sc({ x: outer, y: 0 }).x - sO.x);
  const innerR = Math.abs(sc({ x: inner, y: 0 }).x - sO.x);
  const lO = explicitLabel(data.label_O ?? 'O');
  const lA = explicitLabel(data.label_A ?? 'A');
  const lB = explicitLabel(data.label_B ?? 'B');
  const lOuter = cleanDiagramLabelText(data.label_outer_radius ?? data.label_radius ?? '');
  const lInner = cleanDiagramLabelText(data.label_inner_radius ?? '');
  const lArea = cleanDiagramLabelText(data.label_area ?? '');

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={outerR}
        fill={FILL} stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />
      <circle cx={sO.x} cy={sO.y} r={innerR}
        fill="#020617" stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />
      <Seg a={sO} b={sA} stroke={GOLD} sw={2.4} />
      <Seg a={sO} b={sB} stroke={GREY} sw={2.0} dash="4,3" />
      <Dot p={sO} label={lO} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sA} label={lA} offset={{ x: 10, y: -10 }} />
      <Dot p={sB} label={lB} offset={{ x: 10, y: 10 }} />
      {lOuter && <SegLabel a={sO} b={sA} label={lOuter} color={GOLD} />}
      {lInner && <SegLabel a={sO} b={sB} label={lInner} color={GREY} />}
      {lArea && (
        <text x={sO.x} y={sO.y + 6} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArea}</text>
      )}
    </g>
  );
}

/** composite_overlay: data-driven composite or shaded figure */
function CompositeOverlay({ data }: { data: any }) {
  const bounds = data.bounds ?? {};
  const xMin: number = data.xMin ?? bounds.xMin ?? bounds.minX ?? 0;
  const xMax: number = data.xMax ?? bounds.xMax ?? bounds.maxX ?? 10;
  const yMin: number = data.yMin ?? bounds.yMin ?? bounds.minY ?? 0;
  const yMax: number = data.yMax ?? bounds.yMax ?? bounds.maxY ?? 10;
  const labels = data.labels ?? {};
  const layers = Array.isArray(data.layers) ? data.layers : [];
  const pad = Math.max(xMax - xMin, yMax - yMin) * 0.22;
  const sc = makeScaler(xMin - pad, xMax + pad, yMin - pad, yMax + pad);

  const renderLayer = (layer: any, index: number): React.ReactNode => {
    switch (String(layer?.kind ?? '')) {
      case 'poly':
        return <Poly key={index} pts={(layer.pts ?? []).map(sc)} fill={layer.fill} stroke={layer.stroke} sw={layer.sw} dash={layer.dash} />;
      case 'seg':
        return <Seg key={index} a={sc(layer.a)} b={sc(layer.b)} stroke={layer.stroke} sw={layer.sw} dash={layer.dash} />;
      case 'dot':
        return <Dot key={index} p={sc(layer.p)} label={explicitLabel(layer.label ?? labels[layer.name])} color={layer.color} offset={layer.offset ?? { x: 8, y: -10 }} />;
      case 'segLabel':
        if (!cleanDiagramLabelText(layer.label)) return null;
        return <SegLabel key={index} a={sc(layer.a)} b={sc(layer.b)} label={String(layer.label ?? '')} color={layer.color} />;
      case 'text': {
        const p = sc({ x: Number(layer.x), y: Number(layer.y) });
        const text = cleanDiagramLabelText(layer.text);
        if (!text) return null;
        const fill = layer.color ?? GOLD;
        const fontSize = Number.isFinite(Number(layer.fontSize)) ? Number(layer.fontSize) : 14;
        return (
          <g key={index}>
            <text x={p.x} y={p.y} fontSize={fontSize} fontWeight="700"
              textAnchor={layer.anchor ?? 'middle'} dominantBaseline="middle"
              fill="none" stroke="#020617" strokeWidth={4} strokeLinejoin="round">{text}</text>
            <text x={p.x} y={p.y} fontSize={fontSize} fontWeight="700"
              textAnchor={layer.anchor ?? 'middle'} dominantBaseline="middle"
              fill={fill} style={{ pointerEvents: 'none' }}>{text}</text>
          </g>
        );
      }
      case 'circle': {
        const center = sc(layer.c);
        const edge = sc({ x: Number(layer.c?.x) + Number(layer.r), y: Number(layer.c?.y) });
        const radius = Math.abs(edge.x - center.x);
        return <circle key={index} cx={center.x} cy={center.y} r={radius} fill={layer.fill ?? 'none'} stroke={layer.stroke ?? GOLD} strokeWidth={layer.sw ?? 2.2} strokeDasharray={layer.dash ?? ''} />;
      }
      case 'arc': {
        const center = sc(layer.c);
        const start = Number(layer.startAngle);
        const end = Number(layer.endAngle);
        const radius = Math.abs(sc({ x: Number(layer.c?.x) + Number(layer.r), y: Number(layer.c?.y) }).x - center.x);
        const x1 = center.x + radius * Math.cos(start);
        const y1 = center.y + radius * Math.sin(start);
        const x2 = center.x + radius * Math.cos(end);
        const y2 = center.y + radius * Math.sin(end);
        let diff = end - start;
        while (diff < 0) diff += 2 * Math.PI;
        const sweep = diff < Math.PI ? 1 : 0;
        return <path key={index} d={`M${x1},${y1} A${radius},${radius} 0 0 ${sweep} ${x2},${y2}`} fill="none" stroke={layer.stroke ?? GOLD} strokeWidth={layer.sw ?? 2.2} />;
      }
      default:
        return null;
    }
  };

  return <g>{layers.map(renderLayer)}</g>;
}

/** rectangle_diagonal / square_diagonal: rectangle or square with diagonal AC */
function RectangleDiagonal({ data }: { data: any }) {
  const w: number = data.width ?? data.w ?? data.side ?? 6;
  const h: number = data.height ?? data.h ?? data.side ?? 4;
  const labelMap = Array.isArray(data.labels)
    ? { A: data.labels[0], B: data.labels[1], C: data.labels[2], D: data.labels[3] }
    : (data.labels ?? {});
  const lAB: string = data.label_AB ?? String(h);
  const lBC: string = data.label_BC ?? String(w);
  const lAC: string = data.label_AC ?? '?';
  const lArea: string = cleanDiagramLabelText(data.label_area ?? '');
  const pad = Math.max(w, h) * 0.24;
  const sc = makeScaler(-pad, w + pad, -pad, h + pad);
  // A=top-left, B=bottom-left, C=bottom-right, D=top-right
  const A = sc({ x: 0, y: h }), B = sc({ x: 0, y: 0 });
  const C = sc({ x: w, y: 0 }), D = sc({ x: w, y: h });

  return (
    <g>
      <Poly pts={[A, B, C, D]} />
      <Seg a={A} b={C} stroke={GOLD} sw={2.6} />
      <RightAngleMark v={B} a={A} b={C} />
      <Dot p={A} label={explicitLabel(data.label_A ?? labelMap.A)} offset={{ x: -18, y: -4 }} />
      <Dot p={B} label={explicitLabel(data.label_B ?? labelMap.B)} offset={{ x: -18, y: 12 }} />
      <Dot p={C} label={explicitLabel(data.label_C ?? labelMap.C)} offset={{ x: 8, y: 12 }} />
      <Dot p={D} label={explicitLabel(data.label_D ?? labelMap.D)} offset={{ x: 8, y: -4 }} />
      {lAB && <SegLabel a={A} b={B} label={lAB} color={GOLD} />}
      {lBC && <SegLabel a={B} b={C} label={lBC} color={GOLD} />}
      {lAC && <SegLabel a={A} b={C} label={lAC} color={GOLD} />}
      {lArea && (
        <text x={(A.x + C.x) / 2} y={(A.y + C.y) / 2 + 8} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArea}</text>
      )}
    </g>
  );
}

/** adjacent_squares_diagonal: two adjacent squares split by a diagonal */
function AdjacentSquaresDiagonal({ data }: { data: any }) {
  const small: number = data.small_side ?? data.left_side ?? data.a ?? 3;
  const large: number = data.large_side ?? data.right_side ?? data.b ?? 6;
  const totalW = small + large;
  const crossY = (large * small) / totalW;
  const pad = Math.max(large, totalW) * 0.22;
  const sc = makeScaler(-pad, totalW + pad, -pad, large + pad);

  const A = { x: 0, y: 0 };
  const B = { x: small, y: 0 };
  const C = { x: small, y: small };
  const D = { x: 0, y: small };
  const E = { x: small, y: 0 };
  const F = { x: totalW, y: 0 };
  const G = { x: totalW, y: large };
  const H = { x: small, y: large };
  const P = { x: small, y: crossY };

  const lSmall = String(data.label_small_side ?? `${small} cm`);
  const lLarge = String(data.label_large_side ?? `${large} cm`);
  const lArea = cleanDiagramLabelText(data.label_area ?? '');

  return (
    <g>
      <Poly pts={[A, B, C, D].map(sc)} fill="rgba(248,250,252,0.03)" stroke={GREY} />
      <Poly pts={[E, F, G, H].map(sc)} fill="rgba(248,250,252,0.03)" stroke={GREY} />
      <Poly pts={[A, B, P].map(sc)} fill="rgba(245,158,11,0.18)" stroke="none" />
      <Poly pts={[P, H, G].map(sc)} fill="rgba(245,158,11,0.18)" stroke="none" />
      <Seg a={sc(A)} b={sc(G)} stroke={GOLD} sw={2.6} />
      <Dot p={sc(A)} label={explicitLabel(data.label_A ?? 'A')} offset={{ x: -14, y: 12 }} />
      <Dot p={sc(C)} label={explicitLabel(data.label_C ?? 'C')} offset={{ x: 8, y: -4 }} />
      <Dot p={sc(H)} label={explicitLabel(data.label_H ?? 'H')} offset={{ x: 8, y: -4 }} />
      <Dot p={sc(G)} label={explicitLabel(data.label_G ?? 'G')} offset={{ x: 8, y: 12 }} />
      <SegLabel a={sc(A)} b={sc(B)} label={lSmall} color={GOLD} />
      <SegLabel a={sc(B)} b={sc(C)} label={lSmall} color={GOLD} />
      <SegLabel a={sc(E)} b={sc(F)} label={lLarge} color={GOLD} />
      <SegLabel a={sc(F)} b={sc(G)} label={lLarge} color={GOLD} />
      <SegLabel a={sc(D)} b={sc(A)} label={lSmall} color={GOLD} />
      <SegLabel a={sc(H)} b={sc(G)} label={lLarge} color={GOLD} />
      {lArea && (
        <text x={(sc(A).x + sc(G).x) / 2} y={(sc(A).y + sc(G).y) / 2} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArea}</text>
      )}
    </g>
  );
}

/**
 * rectangle_fold – rectangle ABCD with a fold.
 *
 * Coordinate convention (matches most Chinese textbook problems):
 *   A = top-left,  B = top-right,  C = bottom-right,  D = bottom-left
 *   (so AB is the top edge with length = width,  AD is the left edge with length = height)
 *
 * The fold crease goes from point E (on one side) to point F (on another side).
 * The folded vertex (fold_vertex, default "A") lands at fold_land_x, fold_land_y.
 *
 * Required fields:
 *   width, height           — rectangle dimensions
 *   fold_vertex             — which corner is folded: "A"|"B"|"C"|"D" (default "A")
 *   E_side / E_ratio        — where E sits: which side ("AB"|"AD"|"BC"|"CD") + ratio 0–1 from first letter
 *   F_side / F_ratio        — same for F
 *   fold_land_x, fold_land_y — coordinates of where the folded vertex lands (in the rect coordinate system)
 *
 * Optional label overrides:
 *   label_A … label_D, label_E, label_F, label_Ap (label for the folded image, default "A'")
 *   label_EF, label_AE, label_AF, label_BE, label_BF, label_DF, label_CE, label_CF
 */
function RectangleFold({ data }: { data: any }) {
  const w: number = data.width  ?? 10;
  const h: number = data.height ?? 6;

  // ── Rectangle corners (math coords): A top-left, B top-right, C bottom-right, D bottom-left
  const rectPts: Record<string, Pt> = {
    A: { x: 0, y: h },
    B: { x: w, y: h },
    C: { x: w, y: 0 },
    D: { x: 0, y: 0 },
  };

  // ── Helper: point on a side at a given ratio (0 = first letter, 1 = second letter)
  function ptOnSide(side: string, ratio: number): Pt {
    const p1 = rectPts[side[0]], p2 = rectPts[side[1]];
    if (!p1 || !p2) return { x: 0, y: 0 };
    return { x: p1.x + (p2.x - p1.x) * ratio, y: p1.y + (p2.y - p1.y) * ratio };
  }

  // ── E and F positions
  const eSide: string  = data.E_side  ?? 'AD';
  const eRatio: number = data.E_ratio ?? 0.5;
  const fSide: string  = data.F_side  ?? 'BC';
  const fRatio: number = data.F_ratio ?? 0.5;
  const E = ptOnSide(eSide, eRatio);
  const F = ptOnSide(fSide, fRatio);

  // ── Folded vertex and its image
  const foldVertex: string = data.fold_vertex ?? 'A';
  const V = rectPts[foldVertex];

  // Image of V: if explicitly given use it, otherwise reflect V over line EF
  let Vp: Pt;
  if (data.fold_land_x !== undefined && data.fold_land_y !== undefined) {
    Vp = { x: Number(data.fold_land_x), y: Number(data.fold_land_y) };
  } else {
    // Reflect V over EF
    const efDx = F.x - E.x, efDy = F.y - E.y;
    const efLen2 = efDx * efDx + efDy * efDy || 1;
    const t = ((V.x - E.x) * efDx + (V.y - E.y) * efDy) / efLen2;
    Vp = { x: 2 * (E.x + t * efDx) - V.x, y: 2 * (E.y + t * efDy) - V.y };
  }

  // ── Viewport: include all points with generous padding
  const allPts = [...Object.values(rectPts), E, F, Vp];
  const xs = allPts.map(p => p.x), ys = allPts.map(p => p.y);
  const rangeX = Math.max(...xs) - Math.min(...xs) || w;
  const rangeY = Math.max(...ys) - Math.min(...ys) || h;
  const pad = Math.max(rangeX, rangeY) * 0.25;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
                        Math.min(...ys) - pad, Math.max(...ys) + pad);

  const sA = sc(rectPts.A), sB = sc(rectPts.B);
  const sC = sc(rectPts.C), sD = sc(rectPts.D);
  const sE = sc(E), sF = sc(F), sVp = sc(Vp);

  // Label defaults — empty string means "don't show"
  const lA  = explicitLabel(data.label_A);
  const lB  = explicitLabel(data.label_B);
  const lC  = explicitLabel(data.label_C);
  const lD  = explicitLabel(data.label_D);
  const lE  = explicitLabel(data.label_E);
  const lF  = explicitLabel(data.label_F);
  const lVp = explicitLabel(data.label_Ap ?? data.label_Vp);

  // Smart offsets for corner labels
  const cornerOffset = (key: string) => {
    if (key === 'A') return { x: -18, y: -4 };
    if (key === 'B') return { x:   8, y: -4 };
    if (key === 'C') return { x:   8, y:  14 };
    if (key === 'D') return { x: -18, y:  14 };
    return { x: 8, y: -10 };
  };

  // Smart offset for E/F based on which side they're on
  const sideOffset = (side: string): Pt => {
    if (side.includes('A') && side.includes('D')) return { x: -20, y: 0 }; // left side
    if (side.includes('B') && side.includes('C')) return { x:  10, y: 0 }; // right side
    if (side.includes('A') && side.includes('B')) return { x:   0, y:-14 }; // top
    if (side.includes('D') && side.includes('C')) return { x:   0, y: 14 }; // bottom
    return { x: 8, y: -10 };
  };

  // Segment labels
  const lEF = data.label_EF ?? '';
  const lAE = data.label_AE ?? '';
  const lBE = data.label_BE ?? '';
  const lDF = data.label_DF ?? '';
  const lCF = data.label_CF ?? '';
  const lAF = data.label_AF ?? '';
  const lBF = data.label_BF ?? '';
  const lAB = data.label_AB ?? data.label_width ?? '';
  const lBC = data.label_BC ?? data.label_height ?? '';
  const lCD = data.label_CD ?? data.label_width ?? '';
  const lAD = data.label_AD ?? data.label_height ?? '';
  const lApB = data.label_ApB ?? '';

  return (
    <g>
      {/* Main rectangle */}
      <Poly pts={[sA, sB, sC, sD]} />

      {/* Fold crease line EF (dashed gold) */}
      <Seg a={sE} b={sF} stroke={GOLD} sw={2.2} dash="7,4" />

      {/* Folded triangle: E, F, V' (the flipped region) */}
      <Poly pts={[sE, sF, sVp]}
        fill="rgba(245,158,11,0.10)" stroke={GOLD} sw={1.6} dash="4,3" />

      {/* Corner labels */}
      <Dot p={sA} label={lA} offset={cornerOffset('A')} />
      <Dot p={sB} label={lB} offset={cornerOffset('B')} />
      <Dot p={sC} label={lC} offset={cornerOffset('C')} />
      <Dot p={sD} label={lD} offset={cornerOffset('D')} />

      {/* E and F */}
      <Dot p={sE} label={lE} offset={sideOffset(eSide)} />
      <Dot p={sF} label={lF} offset={sideOffset(fSide)} />

      {/* Folded vertex image V' */}
      <Dot p={sVp} label={lVp} color={GREY}
        offset={{ x: Vp.x > w / 2 ? 10 : -22, y: Vp.y > h / 2 ? -14 : 12 }} />

      {/* Rectangle side lengths */}
      {lAB && <SegLabel a={sA} b={sB} label={lAB} color={GOLD} />}
      {lBC && <SegLabel a={sB} b={sC} label={lBC} color={GOLD} />}
      {lCD && <SegLabel a={sC} b={sD} label={lCD} color={GOLD} />}
      {lAD && <SegLabel a={sD} b={sA} label={lAD} color={GOLD} />}

      {/* Segment labels */}
      {lEF && <SegLabel a={sE} b={sF} label={lEF} color={GOLD} />}
      {lAE && <SegLabel a={sA} b={sE} label={lAE} />}
      {lBE && <SegLabel a={sB} b={sE} label={lBE} />}
      {lDF && <SegLabel a={sD} b={sF} label={lDF} />}
      {lCF && <SegLabel a={sC} b={sF} label={lCF} />}
      {lAF && <SegLabel a={sA} b={sF} label={lAF} />}
      {lBF && <SegLabel a={sB} b={sF} label={lBF} />}
      {lApB && <SegLabel a={sVp} b={sB} label={lApB} color={GOLD} />}
    </g>
  );
}

/** ladder: ladder of length L leaning against a wall. foot_dist from wall. */
function Ladder({ data }: { data: any }) {
  const L: number = data.length ?? data.ladder ?? 10;
  const foot: number = data.foot_dist ?? data.foot ?? 6;
  const wallH = Math.sqrt(Math.max(0, L * L - foot * foot));
  const pad = Math.max(foot, wallH) * 0.22;
  const sc = makeScaler(-pad, foot + pad, -pad, wallH + pad);
  const O  = sc({ x: 0, y: 0 });       // corner
  const W_ = sc({ x: 0, y: wallH });   // top of ladder on wall
  const F  = sc({ x: foot, y: 0 });    // foot of ladder
  const lL = data.label_ladder ?? String(L);
  const lW = data.label_wall   ?? (Number.isInteger(wallH) ? String(wallH) : '');
  const lF = data.label_foot   ?? String(foot);

  return (
    <g>
      {/* Wall and ground */}
      <Seg a={sc({ x: 0, y: -pad * 0.3 })} b={sc({ x: 0, y: wallH + pad * 0.5 })} stroke={GREY} sw={2} />
      <Seg a={sc({ x: -pad * 0.3, y: 0 })} b={sc({ x: foot + pad * 0.5, y: 0 })} stroke={GREY} sw={2} />
      {/* Ladder */}
      <Seg a={W_} b={F} stroke={GOLD} sw={3} />
      <RightAngleMark v={O} a={W_} b={F} />
      <Dot p={W_} label={explicitLabel(data.label_top)} offset={{ x: -18, y: 0 }} />
      <Dot p={F}  label={explicitLabel(data.label_foot_pt)} offset={{ x: 8, y: 12 }} />
      <Dot p={O}  label={explicitLabel(data.label_corner)} offset={{ x: -18, y: 12 }} />
      {lL && <SegLabel a={W_} b={F} label={lL} color={GOLD} />}
      {lW && <SegLabel a={O}  b={W_} label={lW} />}
      {lF && <SegLabel a={O}  b={F}  label={lF} />}
    </g>
  );
}

/** cylinder_unrolled: shows unrolled lateral surface as rectangle; diagonal = shortest path */
function CylinderUnrolled({ data }: { data: any }) {
  const circ: number  = data.circumference ?? (2 * Math.PI * (data.radius ?? 3));
  const cylH: number  = data.height ?? 8;
  const pathW: number = data.path_width ?? circ; // width of unrolled surface
  const lC = data.label_circ  ?? `${+circ.toFixed(2)}`;
  const lH = data.label_height ?? String(cylH);
  const w = pathW, h = cylH;
  const pad = Math.max(w, h) * 0.22;
  const sc = makeScaler(-pad, w + pad, -pad, h + pad);
  const A = sc({ x: 0, y: h }), B = sc({ x: 0, y: 0 });
  const C = sc({ x: w, y: 0 }), D = sc({ x: w, y: h });
  const pathLen = Math.sqrt(w * w + h * h);
  const lPath = data.label_path ?? (Number.isInteger(pathLen) ? String(pathLen) : `${+pathLen.toFixed(2)}`);
  return (
    <g>
      <Poly pts={[A, B, C, D]} fill={FILL2} stroke={GREY} sw={2} />
      {/* Diagonal = shortest path */}
      <Seg a={A} b={C} stroke={GOLD} sw={2.5} />
      <Dot p={A} label="A" offset={{ x: -18, y: -4 }} />
      <Dot p={B} label="B" offset={{ x: -18, y: 12 }} />
      <Dot p={C} label="C" offset={{ x: 8,  y: 12 }} />
      <Dot p={D} label="D" offset={{ x: 8,  y: -4 }} />
      <SegLabel a={A} b={B} label={lH} />
      <SegLabel a={B} b={C} label={lC} />
      {lPath && <SegLabel a={A} b={C} label={lPath} color={GOLD} />}
    </g>
  );
}

/** rectangular_prism_net: cuboid net with six faces and three edge lengths */
function RectangularPrismNet({ data }: { data: any }) {
  const length: number = data.length ?? data.l ?? data.a ?? 8;
  const width: number = data.width ?? data.w ?? data.b ?? 5;
  const height: number = data.height ?? data.h ?? data.c ?? 4;

  const lLabel = data.label_length ?? data.label_l ?? data.label_a ?? String(length);
  const wLabel = data.label_width ?? data.label_w ?? data.label_b ?? String(width);
  const hLabel = data.label_height ?? data.label_h ?? data.label_c ?? String(height);
  const pathStart = data.path_start ?? data.surface_path_start ?? null;
  const pathEnd = data.path_end ?? data.surface_path_end ?? null;
  const pathLabel = data.label_path ?? data.surface_path_label ?? '';
  const showPathLine = data.path_show_line !== false && data.surface_path_show_line !== false;

  const left = -width;
  const right = length + width;
  const bottom = -width;
  const top = height + width + height;
  const pad = Math.max(length, width, height) * 0.35;
  const sc = makeScaler(left - pad, right + pad, bottom - pad, top + pad);

  const rect = (x: number, y: number, w: number, h: number) => ([
    sc({ x, y }),
    sc({ x: x + w, y }),
    sc({ x: x + w, y: y + h }),
    sc({ x, y: y + h }),
  ]);

  const front = { x: 0, y: 0, w: length, h: height };
  const topFace = { x: 0, y: height, w: length, h: width };
  const back = { x: 0, y: height + width, w: length, h: height };
  const bottomFace = { x: 0, y: -width, w: length, h: width };
  const leftFace = { x: -width, y: 0, w: width, h: height };
  const rightFace = { x: length, y: 0, w: width, h: height };

  const faceStyles = [
    { face: front, fill: FILL, stroke: GOLD, sw: 2.4 },
    { face: topFace, fill: FILL2, stroke: GREY, sw: 2 },
    { face: back, fill: FILL2, stroke: GREY, sw: 2 },
    { face: bottomFace, fill: FILL2, stroke: GREY, sw: 2 },
    { face: leftFace, fill: FILL2, stroke: GREY, sw: 2 },
    { face: rightFace, fill: FILL2, stroke: GREY, sw: 2 },
  ];

  return (
    <g>
      {faceStyles.map(({ face, fill, stroke, sw }, index) => (
        <Poly
          key={index}
          pts={rect(face.x, face.y, face.w, face.h)}
          fill={fill}
          stroke={stroke}
          sw={sw}
        />
      ))}

      {/* Fold lines */}
      <Seg a={sc({ x: 0, y: 0 })} b={sc({ x: length, y: 0 })} stroke={GREY} sw={1.6} dash="5,4" />
      <Seg a={sc({ x: 0, y: height })} b={sc({ x: length, y: height })} stroke={GREY} sw={1.6} dash="5,4" />
      <Seg a={sc({ x: 0, y: height + width })} b={sc({ x: length, y: height + width })} stroke={GREY} sw={1.6} dash="5,4" />
      <Seg a={sc({ x: 0, y: 0 })} b={sc({ x: 0, y: height })} stroke={GREY} sw={1.6} dash="5,4" />
      <Seg a={sc({ x: length, y: 0 })} b={sc({ x: length, y: height })} stroke={GREY} sw={1.6} dash="5,4" />

      {/* Dimension labels */}
      <SegLabel a={sc({ x: 0, y: height })} b={sc({ x: length, y: height })} label={String(lLabel)} color={GOLD} />
      <SegLabel a={sc({ x: 0, y: 0 })} b={sc({ x: 0, y: height })} label={String(hLabel)} color={GOLD} />
      <SegLabel a={sc({ x: 0, y: height })} b={sc({ x: 0, y: height + width })} label={String(wLabel)} color={GOLD} />

      <text x={sc({ x: length / 2, y: height / 2 }).x} y={sc({ x: length / 2, y: height / 2 }).y}
        fontSize={12} fontWeight="700" textAnchor="middle" fill={WHITE}>前</text>
      <text x={sc({ x: length / 2, y: height + width / 2 }).x} y={sc({ x: length / 2, y: height + width / 2 }).y}
        fontSize={12} fontWeight="700" textAnchor="middle" fill={GREY}>上</text>
      <text x={sc({ x: length / 2, y: height + width + height / 2 }).x} y={sc({ x: length / 2, y: height + width + height / 2 }).y}
        fontSize={12} fontWeight="700" textAnchor="middle" fill={GREY}>后</text>

      {pathStart && pathEnd && showPathLine && (() => {
        const start = sc({ x: Number(pathStart.x), y: Number(pathStart.y) });
        const end = sc({ x: Number(pathEnd.x), y: Number(pathEnd.y) });
        const startLabel = explicitLabel(pathStart.label ?? pathStart.name ?? '');
        const endLabel = explicitLabel(pathEnd.label ?? pathEnd.name ?? '');
        return (
          <g>
            <Seg a={start} b={end} stroke={GREY} sw={2.4} dash="6,4" />
            {pathLabel && <SegLabel a={start} b={end} label={String(pathLabel)} color={GREY} />}
            {startLabel && <Dot p={start} label={startLabel} color={GREY} offset={{ x: -18, y: 14 }} />}
            {endLabel && <Dot p={end} label={endLabel} color={GREY} offset={{ x: 8, y: -10 }} />}
          </g>
        );
      })()}
    </g>
  );
}

/** linear_function: plots y = kx + b */
function LinearFunction({ data }: { data: any }) {
  const k: number = data.slope ?? data.k ?? 1;
  const b: number = data.intercept ?? data.b ?? 0;
  const k2: number | null = asFiniteNumber(data.secondary_slope ?? data.k2 ?? data.m2 ?? data.slope_2 ?? data.slope2);
  const b2: number | null = asFiniteNumber(data.secondary_intercept ?? data.b2 ?? data.c2 ?? data.intercept_2 ?? data.intercept2);
  const xMin: number = data.xmin ?? -5, xMax: number = data.xmax ?? 5;
  const yValues = [k * xMin + b, k * xMax + b];
  if (k2 !== null && b2 !== null) {
    yValues.push(k2 * xMin + b2, k2 * xMax + b2);
  }
  const yMin: number = data.ymin ?? (Math.min(...yValues) - 2);
  const yMax: number = data.ymax ?? (Math.max(...yValues) + 2);
  const sc = makeScaler(xMin, xMax, yMin, yMax);
  const p1 = sc({ x: xMin, y: k * xMin + b });
  const p2 = sc({ x: xMax, y: k * xMax + b });
  const p1b = k2 !== null && b2 !== null ? sc({ x: xMin, y: k2 * xMin + b2 }) : null;
  const p2b = k2 !== null && b2 !== null ? sc({ x: xMax, y: k2 * xMax + b2 }) : null;
  const label: string = data.label ?? `y = ${k}x${b >= 0 ? '+' + b : b}`;
  const label2: string = data.secondary_label ?? data.label_2 ?? (k2 !== null && b2 !== null ? `y = ${k2}x${b2 >= 0 ? '+' + b2 : b2}` : '');
  const { xInterceptLabel, yInterceptLabel, showInterceptDots } = getLinearFunctionAnnotations(data);
  const extras: React.ReactNode[] = [];
  if (showInterceptDots) {
    const xIntercept = -b / k;
    if (xIntercept >= xMin && xIntercept <= xMax && xInterceptLabel) {
      const p = sc({ x: xIntercept, y: 0 });
      extras.push(<Dot key="xi" p={p} label={xInterceptLabel}
        color={GREY} offset={{ x: 6, y: 14 }} />);
    }
    if (b >= yMin && b <= yMax && yInterceptLabel) {
      const p = sc({ x: 0, y: b });
      extras.push(<Dot key="yi" p={p} label={yInterceptLabel} color={GREY} offset={{ x: 8, y: -10 }} />);
    }
  }
  const showIntersection = data.show_intersection !== false && k2 !== null && b2 !== null && k !== k2;
  if (showIntersection) {
    const xInt = (b2 - b) / (k - k2);
    const yInt = k * xInt + b;
    if (xInt >= xMin && xInt <= xMax && yInt >= yMin && yInt <= yMax) {
      extras.push(
        <Dot
          key="intersection"
          p={sc({ x: xInt, y: yInt })}
          label={data.label_intersection ?? data.label_P ?? ''}
          color="#10b981"
          offset={{ x: 10, y: -12 }}
        />
      );
    }
  }
  return (
    <g>
      <Axes sc={sc} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />
      <Seg a={p1} b={p2} stroke={GOLD} sw={2.5} />
      {p1b && p2b && (
        <Seg a={p1b} b={p2b} stroke="#10b981" sw={2.5} />
      )}
      <text x={p2.x - 8} y={p2.y - 12} fontSize={12} fill={GOLD} fontWeight="700"
        textAnchor="end">{label}</text>
      {p2b && (
        <text x={p2b.x - 8} y={p2b.y - 12} fontSize={12} fill="#10b981" fontWeight="700"
          textAnchor="end">{label2}</text>
      )}
      {extras}
    </g>
  );
}

/** quadratic_function: plots y = ax² + bx + c */
function QuadraticFunction({ data }: { data: any }) {
  const a: number = data.a ?? 1, b: number = data.b ?? 0, c: number = data.c ?? 0;
  const xMin: number = data.xmin ?? -5, xMax: number = data.xmax ?? 5;
  const f = (x: number) => a * x * x + b * x + c;
  const ys = Array.from({ length: 60 }, (_, i) => f(xMin + i * (xMax - xMin) / 59));
  const yMin = Math.min(...ys) - 1, yMax = Math.max(...ys) + 1;
  const sc = makeScaler(xMin, xMax, yMin, yMax);
  const pts = Array.from({ length: 60 }, (_, i) => {
    const x = xMin + i * (xMax - xMin) / 59;
    return sc({ x, y: f(x) });
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  // Vertex
  const vx = -b / (2 * a), vy = f(vx);
  const { vertexLabel, showVertexDot } = getQuadraticFunctionAnnotations(data);
  const vLabel = showVertexDot ? (vertexLabel || '') : '';
  const label = data.label ?? `y = ${a}x²${b !== 0 ? (b > 0 ? '+' + b : b) + 'x' : ''}${c !== 0 ? (c > 0 ? '+' + c : c) : ''}`;
  return (
    <g>
      <Axes sc={sc} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />
      <path d={d} fill="none" stroke={GOLD} strokeWidth={2.5} strokeLinejoin="round" />
      {showVertexDot && vx >= xMin && vx <= xMax && (
        <Dot p={sc({ x: vx, y: vy })} label={vLabel} color={GREY}
          offset={{ x: 8, y: vy < (yMin + yMax) / 2 ? -14 : 14 }} />
      )}
      <text x={pts[pts.length - 1].x - 8} y={pts[pts.length - 1].y - 10}
        fontSize={12} fill={GOLD} fontWeight="700" textAnchor="end">{label}</text>
    </g>
  );
}

/** number_line: horizontal number line with marked points and optional arrows */
function NumberLine({ data }: { data: any }) {
  const range: [number, number] = data.range ?? [-10, 10];
  const [lo, hi] = range;
  const pts: { val: number; label: string; open?: boolean }[] = data.points ?? [];
  const arrows: { from: number; dir: 'left' | 'right'; label?: string }[] = data.arrows ?? [];
  const sc = makeScaler(lo - 0.5, hi + 0.5, -1.5, 1.5);
  const L = sc({ x: lo, y: 0 }), R = sc({ x: hi, y: 0 });
  const ticks: React.ReactNode[] = [];
  const span = hi - lo;
  const step = span <= 10 ? 1 : span <= 20 ? 2 : 5;
  for (let v = Math.ceil(lo); v <= hi; v += step) {
    const p = sc({ x: v, y: 0 });
    ticks.push(
      <g key={v}>
        <line x1={p.x} y1={p.y - 6} x2={p.x} y2={p.y + 6} stroke={GREY} strokeWidth={1.5} />
        <text x={p.x} y={p.y + 18} fontSize={11} fill={GREY} textAnchor="middle">{v}</text>
      </g>
    );
  }
  return (
    <g>
      <Seg a={L} b={R} stroke={GREY} sw={2} />
      {ticks}
      {pts.map((pt, i) => {
        const p = sc({ x: pt.val, y: 0 });
        return (
          <g key={i}>
            {pt.open
              ? <circle cx={p.x} cy={p.y} r={5} fill="#020617" stroke={GOLD} strokeWidth={2} />
              : <circle cx={p.x} cy={p.y} r={5} fill={GOLD} />}
            {pt.label && (
              <text x={p.x} y={p.y - 14} fontSize={12} fill={GOLD}
                fontWeight="700" textAnchor="middle">{pt.label}</text>
            )}
          </g>
        );
      })}
      {arrows.map((ar, i) => {
        const from = sc({ x: ar.from, y: 0 });
        const toX = ar.dir === 'right' ? R.x + 10 : L.x - 10;
        return (
          <g key={i}>
            <Seg a={from} b={{ x: toX, y: from.y }} stroke={GOLD} sw={2.5} />
            {ar.label && (
              <text x={(from.x + toX) / 2} y={from.y - 14} fontSize={11}
                fill={GOLD} fontWeight="700" textAnchor="middle">{ar.label}</text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** coordinate_points: free points + labelled segments on a grid */
function CoordinatePoints({ data }: { data: any }) {
  const rawPts: { x: number; y: number; label?: string }[] = data.points ?? [];
  const segs: ([string, string] | { from: string; to: string; dash?: boolean; label?: string })[] =
    data.segments ?? data.lines ?? [];
  const polygons: Array<{ pts: Array<{ x: number; y: number }>; fill?: string; stroke?: string; sw?: number; dash?: string }> =
    data.polygons ?? [];
  const angleMarks: Array<{
    vertex?: string;
    at?: string;
    from?: string;
    to?: string;
    a?: string;
    b?: string;
    label?: string;
    kind?: string;
    right?: boolean;
    r?: number;
  }> = data.angleMarks ?? [];
  const showAxes: boolean = data.axes !== false; // default true, set axes:false for pure geometry
  const showCircle: { cx?: number; cy?: number; r?: number } | null = data.circle ?? null;

  if (rawPts.length === 0) return null;

  const xs = rawPts.map(p => p.x), ys = rawPts.map(p => p.y);
  // Include circle bounds if present
  if (showCircle?.r) {
    const cx = showCircle.cx ?? 0, cy = showCircle.cy ?? 0, r = showCircle.r;
    xs.push(cx - r, cx + r); ys.push(cy - r, cy + r);
  }
  const margin = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 0.28 + 1.5;
  const xMin = Math.min(...xs) - margin, xMax = Math.max(...xs) + margin;
  const yMin = Math.min(...ys) - margin, yMax = Math.max(...ys) + margin;
  const sc = makeScaler(xMin, xMax, yMin, yMax);
  const ptMap: Record<string, Pt> = {};
  rawPts.forEach(p => { if (p.label) ptMap[p.label] = sc({ x: p.x, y: p.y }); });

  return (
    <g>
      {showAxes && <Axes sc={sc} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />}
      {polygons.map((polygon, index) => (
        <Poly
          key={`poly-${index}`}
          pts={(polygon.pts ?? []).map(sc)}
          fill={polygon.fill}
          stroke={polygon.stroke}
          sw={polygon.sw}
          dash={polygon.dash}
        />
      ))}
      {/* Optional circle (e.g. for chord/tangent problems) */}
      {showCircle?.r && (() => {
        const cx = sc({ x: showCircle.cx ?? 0, y: showCircle.cy ?? 0 });
        const rPx = Math.abs(sc({ x: (showCircle.cx ?? 0) + showCircle.r, y: showCircle.cy ?? 0 }).x - cx.x);
        return <circle cx={cx.x} cy={cx.y} r={rPx} fill="none" stroke={GREY} strokeWidth={1.8} strokeDasharray="4,3" />;
      })()}
      {segs.map((seg, i) => {
        const [a, b] = Array.isArray(seg) ? seg : [seg.from, seg.to];
        const isDash = !Array.isArray(seg) && seg.dash;
        const segLabel = !Array.isArray(seg) ? seg.label : undefined;
        const pa = ptMap[a], pb = ptMap[b];
        if (!pa || !pb) return null;
        return (
          <g key={i}>
            <Seg a={pa} b={pb} stroke={GOLD} sw={2} dash={isDash ? '5,4' : ''} />
            {segLabel && <SegLabel a={pa} b={pb} label={segLabel} color={GOLD} />}
          </g>
        );
      })}
      {rawPts.map((p, i) => (
        <Dot key={i} p={sc({ x: p.x, y: p.y })} label={p.label}
          offset={(p as any).offset ?? { x: 8, y: -12 }} />
      ))}
      {cleanDiagramLabelText(data.label_area ?? '') && (
        <text x={sc({ x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 }).x}
          y={sc({ x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 }).y - 10}
          fontSize={12} fontWeight="700" textAnchor="middle" fill={GOLD}>
          {cleanDiagramLabelText(data.label_area ?? '')}
        </text>
      )}
      {cleanDiagramLabelText(data.label_perimeter ?? '') && (
        <text x={sc({ x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 }).x}
          y={sc({ x: (xMin + xMax) / 2, y: (yMin + yMax) / 2 }).y + 10}
          fontSize={12} fontWeight="700" textAnchor="middle" fill={GOLD}>
          {cleanDiagramLabelText(data.label_perimeter ?? '')}
        </text>
      )}
      {angleMarks.map((mark, i) => {
        const vertexLabel = mark.vertex ?? mark.at;
        const fromLabel = mark.from ?? mark.a;
        const toLabel = mark.to ?? mark.b;
        if (!vertexLabel || !fromLabel || !toLabel) return null;
        const v = ptMap[vertexLabel];
        const a = ptMap[fromLabel];
        const b = ptMap[toLabel];
        if (!v || !a || !b) return null;
        if (mark.right || mark.kind === 'right') {
          return <RightAngleMark key={`am-${i}`} v={v} a={a} b={b} size={mark.r ?? 10} color={GREY} />;
        }
        return <AngleMark key={`am-${i}`} v={v} a={a} b={b} r={mark.r ?? 18} label={mark.label} color={GREY} />;
      })}
    </g>
  );
}

/** similar_triangles: two similar triangles with ratio */
function SimilarTriangles({ data }: { data: any }) {
  const ratio: number = data.ratio ?? 2;
  const base1: number = data.base ?? 3;
  const sides1 = data.sides ?? [base1, base1 * 1.3, base1 * 0.8];
  const sides2 = sides1.map((s: number) => s * ratio);
  const labels1: string[] = Array.isArray(data.labels1) ? data.labels1 : [];
  const labels2: string[] = Array.isArray(data.labels2) ? data.labels2 : [];

  const [A1, B1, C1] = triangleFromSides(sides1[0], sides1[1], sides1[2]);
  const [A2r, B2r, C2r] = triangleFromSides(sides2[0], sides2[1], sides2[2]);

  // Shift second triangle to the right
  const shiftX = sides1[0] + Math.max(...[A1, B1, C1].map(p => p.x)) * 0.3 + sides2[0] * 0.2;
  const A2 = { x: A2r.x + shiftX, y: A2r.y };
  const B2 = { x: B2r.x + shiftX, y: B2r.y };
  const C2 = { x: C2r.x + shiftX, y: C2r.y };

  const all = [A1, B1, C1, A2, B2, C2];
  const xs = all.map(p => p.x), ys = all.map(p => p.y);
  const pad = (Math.max(...xs) - Math.min(...xs)) * 0.15;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);

  return (
    <g>
      <Poly pts={[A1, B1, C1].map(sc)} />
      <Poly pts={[A2, B2, C2].map(sc)} fill="rgba(16,185,129,0.08)" stroke="#10b981" />
      <Dot p={sc(A1)} label={explicitLabel(labels1[0])} offset={{ x: -6, y: -14 }} />
      <Dot p={sc(B1)} label={explicitLabel(labels1[1])} offset={{ x: -18, y: 10 }} />
      <Dot p={sc(C1)} label={explicitLabel(labels1[2])} offset={{ x: 8, y: 10 }} />
      <Dot p={sc(A2)} label={explicitLabel(labels2[0])} color="#10b981" offset={{ x: -6, y: -14 }} />
      <Dot p={sc(B2)} label={explicitLabel(labels2[1])} color="#10b981" offset={{ x: -18, y: 10 }} />
      <Dot p={sc(C2)} label={explicitLabel(labels2[2])} color="#10b981" offset={{ x: 8, y: 10 }} />
      {data.show_sides !== false && (
        <>
          <SegLabel a={sc(B1)} b={sc(C1)} label={String(+sides1[0].toFixed(1))} />
          <SegLabel a={sc(B2)} b={sc(C2)} label={String(+sides2[0].toFixed(1))} color="#10b981" />
        </>
      )}
    </g>
  );
}

/** parallelogram: base b, side a, angle θ (degrees) */
function Parallelogram({ data }: { data: any }) {
  const base: number = data.base ?? 6;
  const side: number = data.side ?? 4;
  const angleDeg: number = data.angle ?? 60;
  const theta = angleDeg * Math.PI / 180;
  // B=(0,0), C=(base,0), D=(base+side*cos, side*sin), A=(side*cos, side*sin)
  const B = { x: 0, y: 0 };
  const C = { x: base, y: 0 };
  const D = { x: base + side * Math.cos(theta), y: side * Math.sin(theta) };
  const A = { x: side * Math.cos(theta), y: side * Math.sin(theta) };
  const all = [A, B, C, D];
  const xs = all.map(p => p.x), ys = all.map(p => p.y);
  const pad = Math.max(base, side) * 0.22;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);
  const lBase = data.label_base ?? String(base);
  const lSide = data.label_side ?? String(side);
  const lH    = data.label_height ?? '';
  const lAngle = cleanDiagramLabelText(data.label_angle ?? '');
  const lArea = cleanDiagramLabelText(data.label_area ?? '');
  const lPerimeter = cleanDiagramLabelText(data.label_perimeter ?? '');
  const height = side * Math.sin(theta);
  const center = sc({ x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 });
  return (
    <g>
      <Poly pts={all.map(sc)} />
      {/* Height dashed line */}
      {lH && (
        <>
          <Seg a={sc(A)} b={sc({ x: A.x, y: 0 })} stroke={GREY} sw={1.5} dash="5,4" />
          <RightAngleMark v={sc({ x: A.x, y: 0 })}
            a={sc({ x: A.x - 0.5, y: 0 })} b={sc({ x: A.x, y: 0.5 })} color={GREY} />
          <SegLabel a={sc(A)} b={sc({ x: A.x, y: 0 })} label={lH} />
        </>
      )}
      <Dot p={sc(A)} label={explicitLabel(data.labels?.[0])} offset={{ x: -6, y: -14 }} />
      <Dot p={sc(B)} label={explicitLabel(data.labels?.[1])} offset={{ x: -18, y: 10 }} />
      <Dot p={sc(C)} label={explicitLabel(data.labels?.[2])} offset={{ x: 8, y: 10 }} />
      <Dot p={sc(D)} label={explicitLabel(data.labels?.[3])} offset={{ x: 8, y: -4 }} />
      {lBase && <SegLabel a={sc(B)} b={sc(C)} label={lBase} />}
      {lSide && <SegLabel a={sc(A)} b={sc(B)} label={lSide} />}
      {lAngle && <AngleMark v={sc(B)} a={sc(A)} b={sc(C)} label={lAngle} r={22} />}
      {lArea && (
        <text x={center.x} y={center.y - 10} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArea}</text>
      )}
      {lPerimeter && (
        <text x={center.x} y={center.y + 4} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lPerimeter}</text>
      )}
    </g>
  );
}

/**
 * circle_chord — circle with centre O, a chord AB, and optional perpendicular from O to chord.
 * Fields: radius, chord_half (half the chord length, so AC=CB=chord_half),
 *         show_perpendicular (bool, default true), oc_length (optional label for OC),
 *         label_O, label_A, label_B, label_C, label_radius, label_chord
 */
function CircleChord({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const waterDepth: number | null = data.water_depth ?? data.depth ?? null;
  // Water depth is measured upward from the pipe's lowest point, not down from the centre.
  const chordYFromDepth = waterDepth !== null ? waterDepth - r : null;
  const chordHalf: number = data.chord_half ?? (data.chord ? data.chord / 2 : (
    chordYFromDepth !== null ? Math.sqrt(Math.max(0, r * r - chordYFromDepth * chordYFromDepth)) : r * 0.6
  ));
  const showPerp: boolean = data.show_perpendicular === true || (waterDepth === null && data.show_perpendicular !== false);

  // O at centre. Chord AB is horizontal, C is midpoint (foot of perpendicular from O).
  // For water-depth problems, OC is derived from the depth and should not be shown by default.
  const oc = chordYFromDepth ?? Math.sqrt(Math.max(0, r * r - chordHalf * chordHalf));
  const showOC: boolean = showPerp || data.show_oc === true || data.label_oc !== undefined || data.label_angle_aoc !== undefined;

  const O: Pt  = { x: 0, y: 0 };
  const A: Pt  = { x: -chordHalf, y: oc };
  const B: Pt  = { x:  chordHalf, y: oc };
  const C: Pt  = { x: 0,          y: oc };

  const pad = r * 0.35;
  const sc = makeScaler(-r - pad, r + pad, -r - pad, r + pad);
  const sO = sc(O), sA = sc(A), sB = sc(B), sC = sc(C);

  // Draw circle as SVG circle element using pixel radius
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sc({ x: 0, y: 0 }).x);

  const lO  = explicitLabel(data.label_O);
  const lA  = explicitLabel(data.label_A);
  const lB  = explicitLabel(data.label_B);
  const lC  = explicitLabel(data.label_C);
  const lOA = data.label_radius ?? String(r);
  const lOC = data.label_oc !== undefined ? String(data.label_oc) : '';
  const lAC = data.label_chord_half !== undefined ? String(data.label_chord_half) : '';
  const lChord = data.label_chord !== undefined ? String(data.label_chord) : '';
  const lDepth = data.label_depth !== undefined ? String(data.label_depth) : '';

  return (
    <g>
      {/* Circle */}
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.6} />

      {/* Chord AB */}
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.5} />

      {/* Radius OA */}
      <Seg a={sO} b={sA} stroke={GREY} sw={1.5} dash="4,3" />

      {/* Radius OB */}
      <Seg a={sO} b={sB} stroke={GREY} sw={1.5} dash="4,3" />

      {/* Perpendicular / optional OC helper */}
      {showOC && (
        <>
          <Seg a={sO} b={sC} stroke={GOLD} sw={2} dash="5,4" />
          {showPerp && <RightAngleMark v={sC} a={sA} b={sO} size={9} />}
        </>
      )}

      {/* Labels */}
      <Dot p={sO} label={lO} offset={{ x: -16, y: 10 }} />
      <Dot p={sA} label={lA} offset={{ x: -18, y: 0 }} />
      <Dot p={sB} label={lB} offset={{ x: 10,  y: 0 }} />
      {lC && <Dot p={sC} label={lC} offset={{ x: 6, y: -14 }} color={GREY} />}

      {/* Segment labels */}
      {lOA && <SegLabel a={sO} b={sA} label={lOA} color={GREY} />}
      {lOC && <SegLabel a={sO} b={sC} label={lOC} />}
      {lAC && <SegLabel a={sA} b={sC} label={lAC} color={GOLD} />}
      {lChord && <SegLabel a={sA} b={sB} label={lChord} color={GOLD} />}
      {lDepth && (
        <>
          <Seg a={sc({ x: r * 0.82, y: -r })} b={sc({ x: r * 0.82, y: oc })} stroke={GOLD} sw={1.8} dash="5,4" />
          <SegLabel a={sc({ x: r * 0.82, y: -r })} b={sc({ x: r * 0.82, y: oc })} label={lDepth} color={GOLD} />
        </>
      )}
      {data.label_angle_aoc && <AngleMark v={sO} a={sA} b={sC} label={String(data.label_angle_aoc)} r={22} color={GOLD} />}
    </g>
  );
}

function humanizeDiagramValidationError(message: string): string {
  const msg = String(message ?? '').trim();
  if (!msg) return '图形生成失败，系统正在自动重新尝试。';

  if (msg.includes('circle_sector requires')) {
    return '扇形图信息不足，系统正在自动重新生成。';
  }
  if (msg.includes('circle_tangent requires')) {
    return '切线图信息不足，系统正在自动重新生成。';
  }
  if (msg.includes('circle_chord_tangent requires')) {
    return '切线-弦图信息不足，系统正在自动重新生成。';
  }
  if (msg.includes('circle_tangent_chord_dual_points requires')) {
    return '双弧点切线-弦图信息不足，系统正在自动重新生成。';
  }
  if (msg.includes('circle_cyclic_quadrilateral requires')) {
    return '圆内接四边形图信息不足，系统正在自动重新生成。';
  }
  if (msg.includes('circle_three_points requires')) {
    return '三点同圆图信息不足，系统正在自动重新生成。';
  }
  if (msg.includes('circle_diameter_points requires')) {
    return '直径圆图信息不足，系统正在自动重新生成。';
  }
  return '图形生成失败，系统正在自动重新尝试。';
}

/**
 * circle_intersecting_chords - two chords AB and CD intersecting at P inside a circle.
 * Fields: ap, pb, optional cp/pd for layout, optional cd for total chord CD.
 * Labels show only explicitly known values to avoid leaking answers.
 */
function CircleIntersectingChords({ data }: { data: any }) {
  const ap: number = data.ap ?? data.AP ?? 4;
  const pb: number = data.pb ?? data.PB ?? 6;
  const cd: number | null = data.cd ?? data.CD ?? data.cd_total ?? null;
  const explicitCp = asFiniteNumber(data.cp ?? data.CP);
  const explicitPd = asFiniteNumber(data.pd ?? data.PD);
  const ratioValue = asFiniteNumber(data.cp_pd_ratio ?? data.ratio_cp_pd ?? data.cp_to_pd ?? data.ratio);
  const cpPdDiff = asFiniteNumber(data.cp_minus_pd ?? data.cp_pd_diff ?? data.cp_gt_pd_by ?? data.difference);
  const ratioFromLegacyCpRatio = cd === null && explicitCp === null && explicitPd === null
    ? asFiniteNumber(data.cp_ratio)
    : null;
  const cpPdRatio = ratioValue ?? ratioFromLegacyCpRatio;
  const cdFraction: number = data.cp_ratio ?? 0.35;
  const product = ap * pb;
  const diffPd = cpPdDiff !== null
    ? (-cpPdDiff + Math.sqrt(cpPdDiff * cpPdDiff + 4 * product)) / 2
    : null;
  const diffCp = cpPdDiff !== null && diffPd !== null ? diffPd + cpPdDiff : null;
  const ratioCp = cpPdRatio !== null ? Math.sqrt(product * cpPdRatio) : null;
  const ratioPd = cpPdRatio !== null ? Math.sqrt(product / cpPdRatio) : null;
  const cp: number = explicitCp ?? diffCp ?? ratioCp ?? (cd ? cd * cdFraction : 3);
  const pd: number = explicitPd ?? diffPd ?? ratioPd ?? (cd ? Math.max(cd - cp, cp * 1.15) : (ap * pb / cp));
  const angleDeg: number = data.angle ?? 62;
  const theta = angleDeg * Math.PI / 180;

  const P: Pt = { x: 0, y: 0 };
  const A: Pt = { x: -ap, y: 0 };
  const B: Pt = { x: pb, y: 0 };
  const C: Pt = { x: -cp * Math.cos(theta), y: cp * Math.sin(theta) };
  const D: Pt = { x: pd * Math.cos(theta), y: -pd * Math.sin(theta) };
  const circle = circleFromThreePoints(A, B, C);

  const xs = [A.x, B.x, C.x, D.x];
  const ys = [A.y, B.y, C.y, D.y];
  if (circle) {
    xs.push(circle.cx - circle.r, circle.cx + circle.r);
    ys.push(circle.cy - circle.r, circle.cy + circle.r);
  }
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const pad = span * 0.2 + 0.8;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);

  const sP = sc(P), sA = sc(A), sB = sc(B), sC = sc(C), sD = sc(D);

  return (
    <g>
      {circle && (() => {
        const center = sc({ x: circle.cx, y: circle.cy });
        const rPx = Math.abs(sc({ x: circle.cx + circle.r, y: circle.cy }).x - center.x);
        return <circle cx={center.x} cy={center.y} r={rPx} fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.6} />;
      })()}
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.5} />
      <Seg a={sC} b={sD} stroke={GOLD} sw={2.5} />
      <Dot p={sA} label={explicitLabel(data.label_A)} offset={{ x: -16, y: -10 }} />
      <Dot p={sB} label={explicitLabel(data.label_B)} offset={{ x: 10, y: -10 }} />
      <Dot p={sC} label={explicitLabel(data.label_C)} offset={{ x: -12, y: -12 }} />
      <Dot p={sD} label={explicitLabel(data.label_D)} offset={{ x: 8, y: 14 }} />
      <Dot p={sP} label={explicitLabel(data.label_P)} offset={{ x: 8, y: -10 }} color={WHITE} />
      <SegLabel a={sA} b={sP} label={data.label_ap ?? String(ap)} color={GOLD} />
      <SegLabel a={sP} b={sB} label={data.label_pb ?? String(pb)} color={GOLD} />
      {(data.label_cp !== undefined) && <SegLabel a={sC} b={sP} label={String(data.label_cp)} color={GOLD} />}
      {(data.label_pd !== undefined) && <SegLabel a={sP} b={sD} label={String(data.label_pd)} color={GOLD} />}
      {((data.label_cd !== undefined) || cd) && <SegLabel a={sC} b={sD} label={String(data.label_cd ?? cd)} color={GOLD} />}
      {(data.label_ratio !== undefined || cpPdRatio !== null) && (
        <text x={(sC.x + sD.x) / 2 + 12} y={(sC.y + sD.y) / 2} fontSize={12}
          fontWeight="700" fill={GOLD}>{String(data.label_ratio ?? `CP:PD=${cpPdRatio}`)}</text>
      )}
      {(data.label_difference !== undefined || cpPdDiff !== null) && (
        <text x={(sC.x + sD.x) / 2 + 12} y={(sC.y + sD.y) / 2} fontSize={12}
          fontWeight="700" fill={GOLD}>{String(data.label_difference ?? `CP-PD=${cpPdDiff}`)}</text>
      )}
    </g>
  );
}

/**
 * circle_diameter_chords - diameter AB with chords AC and BD intersecting at E.
 * Intended for circle theorem problems that combine a diameter with two crossing chords.
 */
function CircleDiameterChords({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const cDeg: number = data.c_angle ?? 58;
  const dDeg: number = data.d_angle ?? 302;
  const showRightAngle: boolean = data.show_right_angle === true || data.show_perpendicular === true;

  const O: Pt = { x: 0, y: 0 };
  const A: Pt = { x: -r, y: 0 };
  const B: Pt = { x: r, y: 0 };
  const C: Pt = { x: r * Math.cos(cDeg * Math.PI / 180), y: r * Math.sin(cDeg * Math.PI / 180) };
  const D: Pt = { x: r * Math.cos(dDeg * Math.PI / 180), y: r * Math.sin(dDeg * Math.PI / 180) };
  const E = lineIntersection(A, C, B, D) ?? { x: 0, y: 0 };

  const xs = [A.x, B.x, C.x, D.x, E.x, O.x];
  const ys = [A.y, B.y, C.y, D.y, E.y, O.y];
  const pad = r * 0.28;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);
  const sO = sc(O), sA = sc(A), sB = sc(B), sC = sc(C), sD = sc(D), sE = sc(E);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sO.x);

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.5} />
      <Seg a={sA} b={sC} stroke={GOLD} sw={2.2} />
      <Seg a={sB} b={sD} stroke={GOLD} sw={2.2} />
      <Dot p={sE} label={explicitLabel(data.label_E)} offset={{ x: 8, y: -10 }} color={WHITE} />
      <Dot p={sO} label={explicitLabel(data.label_O)} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sA} label={explicitLabel(data.label_A)} offset={{ x: -20, y: 0 }} />
      <Dot p={sB} label={explicitLabel(data.label_B)} offset={{ x: 10, y: 0 }} />
      <Dot p={sC} label={explicitLabel(data.label_C)} offset={{ x: 10, y: -12 }} />
      <Dot p={sD} label={explicitLabel(data.label_D)} offset={{ x: 10, y: 14 }} />
      {showRightAngle && <RightAngleMark v={sE} a={sA} b={sB} size={10} color={GREY} />}
      {data.label_ab && <SegLabel a={sA} b={sB} label={String(data.label_ab)} color={GOLD} />}
      {data.label_ac && <SegLabel a={sA} b={sC} label={String(data.label_ac)} color={GOLD} />}
      {data.label_bd && <SegLabel a={sB} b={sD} label={String(data.label_bd)} color={GOLD} />}
      {data.label_ae && <SegLabel a={sA} b={sE} label={String(data.label_ae)} color={GREY} />}
      {data.label_be && <SegLabel a={sB} b={sE} label={String(data.label_be)} color={GREY} />}
    </g>
  );
}

/**
 * circle_diameter_tangent_chord - diameter AB with a chord CD, a tangent at C meeting the extension of AB at P, and intersection E.
 * Intended for circle theorem problems combining diameter, tangent, and chord configurations.
 */
function CircleDiameterTangentChord({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const cDeg: number = data.c_angle ?? 58;
  const dDeg: number = data.d_angle ?? 310;

  const O: Pt = { x: 0, y: 0 };
  const A: Pt = { x: -r, y: 0 };
  const B: Pt = { x: r, y: 0 };
  const C: Pt = { x: r * Math.cos(cDeg * Math.PI / 180), y: r * Math.sin(cDeg * Math.PI / 180) };
  const D: Pt = { x: r * Math.cos(dDeg * Math.PI / 180), y: r * Math.sin(dDeg * Math.PI / 180) };
  const E = lineIntersection(A, B, C, D) ?? { x: 0, y: 0 };
  const pX = r / Math.cos(cDeg * Math.PI / 180 || 1e-6);
  const P: Pt = { x: pX, y: 0 };
  const tangentLen = Math.hypot(P.x - C.x, P.y - C.y);
  const tangentDir = norm({ x: P.x - C.x, y: P.y - C.y });
  const tangentA: Pt = { x: C.x - tangentDir.x * tangentLen * 0.55, y: C.y - tangentDir.y * tangentLen * 0.55 };
  const tangentB: Pt = { x: P.x, y: 0 };

  const xs = [A.x, B.x, C.x, D.x, E.x, P.x];
  const ys = [A.y, B.y, C.y, D.y, E.y, P.y];
  const pad = r * 0.38;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);

  const sO = sc(O), sA = sc(A), sB = sc(B), sC = sc(C), sD = sc(D), sE = sc(E), sP = sc(P);
  const sTanA = sc(tangentA), sTanB = sP;
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sO.x);

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.5} />
      <Seg a={sA} b={sC} stroke={GOLD} sw={2.2} />
      <Seg a={sA} b={sD} stroke={GOLD} sw={2.2} />
      <Seg a={sC} b={sD} stroke={GOLD} sw={2.2} />
      <Seg a={sC} b={sP} stroke={GOLD} sw={2.2} />
      <Seg a={sTanA} b={sTanB} stroke={GREY} sw={1.8} dash="4,3" />

      <Dot p={sA} label={explicitLabel(data.label_A ?? 'A')} offset={{ x: -20, y: 0 }} />
      <Dot p={sB} label={explicitLabel(data.label_B ?? 'B')} offset={{ x: 10, y: 0 }} />
      <Dot p={sC} label={explicitLabel(data.label_C ?? 'C')} offset={{ x: 10, y: -12 }} />
      <Dot p={sD} label={explicitLabel(data.label_D ?? 'D')} offset={{ x: 10, y: 14 }} />
      <Dot p={sE} label={explicitLabel(data.label_E ?? 'E')} offset={{ x: 8, y: -10 }} color={WHITE} />
      <Dot p={sP} label={explicitLabel(data.label_P ?? 'P')} offset={{ x: 10, y: 0 }} color={WHITE} />
      <Dot p={sO} label={explicitLabel(data.label_O ?? 'O')} offset={{ x: 8, y: 12 }} color={WHITE} />

      {data.label_ab && <SegLabel a={sA} b={sB} label={String(data.label_ab)} color={GOLD} />}
      {data.label_ac && <SegLabel a={sA} b={sC} label={String(data.label_ac)} color={GOLD} />}
      {data.label_ad && <SegLabel a={sA} b={sD} label={String(data.label_ad)} color={GOLD} />}
      {data.label_cp && <SegLabel a={sC} b={sP} label={String(data.label_cp)} color={GOLD} />}
      {data.label_ae && <SegLabel a={sA} b={sE} label={String(data.label_ae)} color={GREY} />}
      {data.label_ed && <SegLabel a={sE} b={sD} label={String(data.label_ed)} color={GREY} />}
      <RightAngleMark v={sC} a={sO} b={sP} size={9} color={GREY} />
    </g>
  );
}

/**
 * circle_tangent — circle with external point P, two tangents PA and PB.
 * Fields: radius, op_dist (distance OP), label_O, label_P, label_A, label_B,
 *         label_radius, label_pa (tangent length), show_chord (draw AB, default true),
 *         show_arc_tangent (draw tangent at arc point C intersecting PA/PB at D/E)
 */
function CircleTangent({ data }: { data: any }) {
  const tangentLength = numberFromValueOrLabel(data.tangent_length ?? data.pa_length ?? data.pa ?? data.PA ?? data.label_pa);
  const angleApbDeg = numberFromValueOrLabel(data.angle_apb ?? data.angle ?? data.label_angle_apb ?? data.label_angle);
  const halfAngle = angleApbDeg !== null ? angleApbDeg * Math.PI / 360 : null;
  const explicitRadius = asFiniteNumber(data.radius);
  const explicitOp = asFiniteNumber(data.op_dist);
  const defaultRadius = explicitRadius ?? 5;
  const r: number = explicitRadius ?? (
    tangentLength !== null && halfAngle !== null
      ? tangentLength * Math.tan(halfAngle)
      : defaultRadius
  );
  const op: number = explicitOp ?? (
    tangentLength !== null && halfAngle !== null
      ? tangentLength / Math.cos(halfAngle)
      : explicitRadius !== null && halfAngle !== null
        ? explicitRadius / Math.sin(halfAngle)
        : tangentLength !== null
          ? Math.sqrt(r * r + tangentLength * tangentLength)
          : halfAngle !== null
            ? r / Math.sin(halfAngle)
            : 13
  );

  // PA = sqrt(OP² - r²)
  const pa = Math.sqrt(Math.max(0, op * op - r * r));
  // Angle at O between OP and OA
  const alpha = Math.asin(r / op);

  const O: Pt = { x: 0,  y: 0 };
  const P: Pt = { x: op, y: 0 };
  const A: Pt = { x: r * Math.cos(Math.PI / 2 - alpha), y:  r * Math.sin(Math.PI / 2 - alpha) };
  const B: Pt = { x: A.x, y: -A.y };
  const showArcTangent: boolean = data.show_arc_tangent === true || data.show_tangent_at_C === true;
  const cArcType = String(data.c_arc_type ?? data.cArcType ?? '').toLowerCase();
  const cAngleMinor = data.c_angle !== undefined ? data.c_angle * Math.PI / 180 : (Math.atan2(B.y, B.x) - Math.atan2(A.y, A.x) + 2 * Math.PI) % (2 * Math.PI) * 0.55;
  const cAngleMajor = data.c_angle !== undefined ? data.c_angle * Math.PI / 180 : Math.PI;
  const cAngle = cArcType.includes('minor') ? cAngleMinor : cArcType.includes('major') ? cAngleMajor : cAngleMajor;
  const C: Pt = { x: r * Math.cos(cAngle), y: r * Math.sin(cAngle) };
  const tangentDir: Pt = { x: -Math.sin(cAngle), y: Math.cos(cAngle) };
  const t1: Pt = { x: C.x - tangentDir.x * op, y: C.y - tangentDir.y * op };
  const t2: Pt = { x: C.x + tangentDir.x * op, y: C.y + tangentDir.y * op };
  const showOC: boolean = data.show_oc === true || data.label_oc !== undefined || data.label_angle_aoc !== undefined || data.show_arc_tangent === true || data.show_tangent_at_C === true;
  const D = showArcTangent ? lineIntersection(P, A, t1, t2) : null;
  const E = showArcTangent ? lineIntersection(P, B, t1, t2) : null;

  const allPts = [O, P, A, B, ...(showOC || showArcTangent ? [C] : []), ...(showArcTangent ? [D, E].filter(Boolean) as Pt[] : [])];
  const xs = allPts.map(p => p.x), ys = allPts.map(p => p.y);
  const pad = Math.max(op, r) * 0.28;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);

  const sO = sc(O), sP = sc(P), sA = sc(A), sB = sc(B), sC = sc(C);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sc({ x: 0, y: 0 }).x);

  const lO  = explicitLabel(data.label_O);
  const lP  = explicitLabel(data.label_P);
  const lA  = explicitLabel(data.label_A);
  const lB  = explicitLabel(data.label_B);
  const lC  = explicitLabel(!showArcTangent ? (data.label_C ?? data.label_D) : data.label_C);
  const lD  = explicitLabel(data.label_D);
  const lE  = explicitLabel(data.label_E);
  const showRadiusLabel = data.show_radius_label === true || data.radius_given === true;
  const showOpLabel = data.show_op_label === true || data.op_given === true;
  const lR  = showRadiusLabel && data.label_radius !== undefined ? String(data.label_radius) : '';
  const lPA = data.label_pa !== undefined ? String(data.label_pa) : '';
  const lOP = showOpLabel && data.label_op !== undefined ? String(data.label_op) : '';
  const lAngleApb = data.label_angle_apb ?? data.label_angle ?? (angleApbDeg !== null ? `${angleApbDeg}°` : '');
  const lAngleAdb = data.label_angle_adb ?? '';
  const showChord: boolean = data.show_chord !== false;

  return (
    <g>
      {/* Circle */}
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.6} />

      {/* Tangent lines through A and B. Extend them to D/E when those points exist. */}
      <Seg a={sP} b={showArcTangent && D ? sc(D) : sA} stroke={GOLD} sw={2.5} />
      <Seg a={sP} b={showArcTangent && E ? sc(E) : sB} stroke={GOLD} sw={2.5} />

      {/* Radii OA and OB (dashed) */}
      <Seg a={sO} b={sA} stroke={GREY} sw={1.5} dash="4,3" />
      <Seg a={sO} b={sB} stroke={GREY} sw={1.5} dash="4,3" />

      {/* OP line (dashed) */}
      <Seg a={sO} b={sP} stroke={GREY} sw={1.2} dash="4,3" />
      {showOC && <Seg a={sO} b={sC} stroke={GREY} sw={1.4} dash="4,3" />}

      {/* Right angles at tangent points */}
      <RightAngleMark v={sA} a={sO} b={sP} size={9} />
      <RightAngleMark v={sB} a={sO} b={sP} size={9} />

      {/* Chord AB */}
      {showChord && <Seg a={sA} b={sB} stroke={GREY} sw={1.5} dash="4,3" />}
      {lAngleApb && <AngleMark v={sP} a={sA} b={sB} label={String(lAngleApb)} r={26} color={GOLD} />}
      {lAngleAdb && <AngleMark v={sC} a={sA} b={sB} label={String(lAngleAdb)} r={24} color={GOLD} />}

      {/* Tangent at C, meeting PA and PB at D and E */}
      {showArcTangent && D && E && (() => {
        const sC = sc(C), sD = sc(D), sE = sc(E);
        return (
          <>
            <Poly pts={[sP, sD, sE]} fill="rgba(245,158,11,0.04)" stroke="none" />
            <Seg a={sD} b={sE} stroke={GOLD} sw={2.2} />
            <Seg a={sO} b={sC} stroke={GREY} sw={1.4} dash="4,3" />
            <RightAngleMark v={sC} a={sO} b={sD} size={8} />
            <Dot p={sD} label={lD} offset={{ x: -18, y: -10 }} />
            <Dot p={sE} label={lE} offset={{ x: -18, y: 14 }} />
          </>
        );
      })()}

      {/* Labels */}
      <Dot p={sO} label={lO} offset={{ x: -16, y: 10 }} />
      <Dot p={sP} label={lP} offset={{ x: 10,  y: 0 }} />
      <Dot p={sA} label={lA} offset={{ x: -8,  y: -14 }} />
      <Dot p={sB} label={lB} offset={{ x: -8,  y: 12 }} />
      {showOC && <Dot p={sC} label={lC} offset={{ x: 10, y: -10 }} />}

      {lR  && <SegLabel a={sO} b={sA} label={lR} color={GREY} />}
      {lPA && <SegLabel a={sP} b={sA} label={lPA} color={GOLD} />}
      {lOP && <SegLabel a={sO} b={sP} label={lOP} />}
      {showOC && data.label_oc !== undefined && <SegLabel a={sO} b={sC} label={String(data.label_oc)} color={GREY} />}
      {data.label_angle_aoc && <AngleMark v={sO} a={sA} b={sC} label={String(data.label_angle_aoc)} r={24} color={GOLD} />}
    </g>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * circle_chord_tangent - tangent line PQ at A, chord AB, and a named point on the
 * opposite arc side (typically C, or D when the problem names that arc point D).
 * Useful for tangent-chord / alternate segment theorem.
 * Fields: radius, angle or angle_pab, label_O/P/Q/A/B/C, label_angle.
 */
function CircleChordTangent({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const angleDeg: number = data.angle ?? data.angle_pab ?? 42;
  const theta = (90 - angleDeg) * Math.PI / 180;
  const arcType = String(data.arc_type ?? data.c_arc ?? data.arc ?? '').toLowerCase();
  const showOC: boolean = data.show_oc === true || data.label_oc !== undefined || data.label_angle_aoc !== undefined || data.show_arc_tangent === true || data.show_tangent_at_C === true;

  const O: Pt = { x: 0, y: 0 };
  const A: Pt = { x: -r, y: 0 };
  const tangentLen = r * 1.25;
  const P: Pt = { x: -r, y: tangentLen };
  const Q: Pt = { x: -r, y: -tangentLen };

  // Ray from A into the circle; the second intersection with the circle is B.
  const chordLen = 2 * r * Math.cos(theta);
  const B: Pt = {
    x: A.x + chordLen * Math.cos(theta),
    y: A.y + chordLen * Math.sin(theta),
  };

  const angleA = Math.atan2(A.y, A.x);
  const angleB = Math.atan2(B.y, B.x);
  let minorSweep = angleB - angleA;
  while (minorSweep < 0) minorSweep += 2 * Math.PI;
  if (minorSweep > Math.PI) minorSweep -= 2 * Math.PI;
  const wantsMinorArc = arcType.includes('minor') || arcType.includes('劣');
  const cAngle = wantsMinorArc
    ? angleA + minorSweep * 0.55
    : angleA + minorSweep - Math.sign(minorSweep || 1) * Math.PI * 0.9;
  const C: Pt = { x: r * Math.cos(cAngle), y: r * Math.sin(cAngle) };

  const allPts = [O, A, B, C, P, Q];
  const xs = allPts.map(p => p.x), ys = allPts.map(p => p.y);
  const pad = r * 0.3;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);

  const sO = sc(O), sA = sc(A), sB = sc(B), sC = sc(C), sP = sc(P), sQ = sc(Q);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sc({ x: 0, y: 0 }).x);

  const lO = explicitLabel(data.label_O);
  const lP = explicitLabel(data.label_P);
  const lQ = explicitLabel(data.label_Q);
  const lA = explicitLabel(data.label_A);
  const lB = explicitLabel(data.label_B);
  const lC = explicitLabel(data.label_C);
  const lAngle = data.label_angle ?? `${angleDeg}°`;

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.6} />

      <Seg a={sP} b={sQ} stroke={GOLD} sw={2.5} />
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.5} />
      <Seg a={sA} b={sC} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sB} b={sC} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sO} b={sA} stroke={GREY} sw={1.4} dash="4,3" />
      {showOC && <Seg a={sO} b={sC} stroke={GREY} sw={1.4} dash="4,3" />}

      <RightAngleMark v={sA} a={sO} b={sP} size={9} />
      <AngleMark v={sA} a={sP} b={sB} label={lAngle} r={24} color={GOLD} />

      <Dot p={sO} label={lO} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sP} label={lP} offset={{ x: -18, y: -8 }} />
      <Dot p={sQ} label={lQ} offset={{ x: -18, y: 14 }} />
      <Dot p={sA} label={lA} offset={{ x: -20, y: 4 }} />
      <Dot p={sB} label={lB} offset={{ x: 10, y: -10 }} />
      <Dot p={sC} label={lC} offset={{ x: 10, y: 14 }} />
      {showOC && data.label_oc !== undefined && <SegLabel a={sO} b={sC} label={String(data.label_oc)} color={GREY} />}
      {data.label_angle_aoc && <AngleMark v={sO} a={sA} b={sC} label={String(data.label_angle_aoc)} r={24} color={GOLD} />}
    </g>
  );
}

/**
 * circle_tangent_chord_dual_points - tangent at A, chord AB, and two named arc points C/D.
 * Useful when the problem explicitly names both a minor-arc point C and a major-arc point D.
 */
function CircleTangentChordDualPoints({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const angleDeg: number = data.angle ?? data.angle_pab ?? 42;
  const theta = (90 - angleDeg) * Math.PI / 180;
  const arcType = String(data.arc_type ?? data.c_arc ?? data.arc ?? 'minor').toLowerCase();
  const dArcType = String(data.d_arc_type ?? data.arc_type_d ?? data.arc2_type ?? 'major').toLowerCase();

  const O: Pt = { x: 0, y: 0 };
  const A: Pt = { x: -r, y: 0 };
  const tangentLen = r * 1.25;
  const P: Pt = { x: -r, y: tangentLen };
  const Q: Pt = { x: -r, y: -tangentLen };

  const chordLen = 2 * r * Math.cos(theta);
  const B: Pt = {
    x: A.x + chordLen * Math.cos(theta),
    y: A.y + chordLen * Math.sin(theta),
  };

  const angleA = Math.atan2(A.y, A.x);
  const angleB = Math.atan2(B.y, B.x);
  let minorSweep = angleB - angleA;
  while (minorSweep < 0) minorSweep += 2 * Math.PI;
  if (minorSweep > Math.PI) minorSweep -= 2 * Math.PI;
  const majorSweep = minorSweep - Math.sign(minorSweep || 1) * 2 * Math.PI;

  const cAngle = arcType.includes('major')
    ? angleA + majorSweep * 0.55
    : angleA + minorSweep * 0.28;
  const dAngle = dArcType.includes('minor')
    ? angleA + minorSweep * 0.72
    : angleA + majorSweep * 0.72;
  const C: Pt = { x: r * Math.cos(cAngle), y: r * Math.sin(cAngle) };
  const D: Pt = { x: r * Math.cos(dAngle), y: r * Math.sin(dAngle) };

  const allPts = [O, A, B, C, D, P, Q];
  const xs = allPts.map(p => p.x), ys = allPts.map(p => p.y);
  const pad = r * 0.3;
  const sc = makeScaler(Math.min(...xs) - pad, Math.max(...xs) + pad,
    Math.min(...ys) - pad, Math.max(...ys) + pad);

  const sO = sc(O), sA = sc(A), sB = sc(B), sC = sc(C), sD = sc(D), sP = sc(P), sQ = sc(Q);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sc({ x: 0, y: 0 }).x);

  const lO = explicitLabel(data.label_O);
  const lP = explicitLabel(data.label_P);
  const lQ = explicitLabel(data.label_Q);
  const lA = explicitLabel(data.label_A);
  const lB = explicitLabel(data.label_B);
  const lC = explicitLabel(data.label_C);
  const lD = explicitLabel(data.label_D);
  const lAngle = data.label_angle ?? `${angleDeg}°`;

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.6} />

      <Seg a={sP} b={sQ} stroke={GOLD} sw={2.5} />
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.5} />
      <Seg a={sA} b={sC} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sB} b={sC} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sA} b={sD} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sB} b={sD} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sO} b={sA} stroke={GREY} sw={1.4} dash="4,3" />

      <RightAngleMark v={sA} a={sO} b={sP} size={9} />
      <AngleMark v={sA} a={sP} b={sB} label={lAngle} r={24} color={GOLD} />

      <Dot p={sO} label={lO} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sP} label={lP} offset={{ x: -18, y: -8 }} />
      <Dot p={sQ} label={lQ} offset={{ x: -18, y: 14 }} />
      <Dot p={sA} label={lA} offset={{ x: -20, y: 4 }} />
      <Dot p={sB} label={lB} offset={{ x: 10, y: -10 }} />
      <Dot p={sC} label={lC} offset={{ x: 10, y: 14 }} />
      <Dot p={sD} label={lD} offset={{ x: 10, y: -12 }} />
    </g>
  );
}

/**
 * circle_cyclic_quadrilateral - quadrilateral ABCD inscribed in circle O.
 * Fields: radius, labels, label_O, optional angle labels such as label_A.
 */
function CircleCyclicQuadrilateral({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const labels: string[] = Array.isArray(data.labels) ? data.labels : [];
  const hasExplicitAngles = Array.isArray(data.angles) || Array.isArray(data.point_angles);
  const cArcType = String(data.c_arc_type ?? data.cArcType ?? '').toLowerCase();
  const dArcType = String(data.d_arc_type ?? data.arc_type_d ?? data.arc2_type ?? '').toLowerCase();
  const showExtensionToE: boolean = data.label_E !== undefined;
  const angleDegs: number[] = hasExplicitAngles
    ? (data.angles ?? data.point_angles)
    : [
        126,
        24,
        cArcType.includes('major') ? 248 : 72,
        dArcType.includes('minor') ? 108 : 286,
      ];
  const showCenterRays: boolean = data.show_center_rays === true || data.show_radii === true ||
    data.label_angle_aob !== undefined || data.label_angle_aoc !== undefined || data.label_oc !== undefined;

  const O: Pt = { x: 0, y: 0 };
  const pts = angleDegs.slice(0, 4).map((deg) => {
    const rad = deg * Math.PI / 180;
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
  });

  const pad = r * 0.3;
  const sc = makeScaler(-r - pad, r + pad, -r - pad, r + pad);
  const sO = sc(O);
  const sPts = pts.map(sc);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sO.x);
  const [sA, sB, sC, sD] = sPts;
  const ePoint = showExtensionToE
    ? {
        x: pts[3].x + (pts[3].x - pts[2].x) * 0.92,
        y: pts[3].y + (pts[3].y - pts[2].y) * 0.92,
      }
    : null;
  const sE = ePoint ? sc(ePoint) : null;

  const labelFor = (i: number) => explicitLabel(labels[i]);
  const angleLabels = [
    data.label_A,
    data.label_B,
    data.label_C,
    data.label_D,
  ];

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />

      <Poly pts={sPts} fill="none" stroke={GOLD} sw={2.4} />
      {showCenterRays && (
        <>
          <Seg a={sO} b={sPts[0]} stroke={GREY} sw={1.4} dash="4,3" />
          <Seg a={sO} b={sPts[1]} stroke={GREY} sw={1.4} dash="4,3" />
          <Seg a={sO} b={sPts[2]} stroke={GREY} sw={1.4} dash="4,3" />
          <Seg a={sO} b={sPts[3]} stroke={GREY} sw={1.4} dash="4,3" />
        </>
      )}
      <Dot p={sO} label={explicitLabel(data.label_O)} offset={{ x: 8, y: 12 }} color={WHITE} />

      {sPts.map((p, i) => (
        <g key={labelFor(i)}>
          <Dot p={p} label={labelFor(i)} offset={(data.label_offsets?.[i]) ?? { x: 8, y: -10 }} />
          {angleLabels[i] && (
            <text x={p.x + (i < 2 ? 16 : -18)} y={p.y + (i === 0 ? 16 : -12)}
              fontSize={11} fontWeight="700" fill={GOLD}>{angleLabels[i]}</text>
          )}
        </g>
      ))}
      {showExtensionToE && sE && (
        <>
          <Seg a={sD} b={sE} stroke={GREY} sw={1.5} dash="4,3" />
          <Seg a={sA} b={sE} stroke={GOLD} sw={2.2} />
          <Dot
            p={sE}
            label={String(data.label_E)}
            offset={{
              x: Math.sign(sE.x - sD.x || 1) * 10,
              y: Math.sign(sE.y - sD.y || -1) * 10,
            }}
          />
        </>
      )}
      {data.label_angle_aob && <AngleMark v={sO} a={sPts[0]} b={sPts[1]} label={String(data.label_angle_aob)} r={24} color={GOLD} />}
      {!data.label_angle_aob && data.label_angle_aoc && <AngleMark v={sO} a={sPts[0]} b={sPts[2]} label={String(data.label_angle_aoc)} r={24} color={GOLD} />}
      {showExtensionToE && data.label_angle_ade && sE && <AngleMark v={sD} a={sA} b={sE} label={String(data.label_angle_ade)} r={24} color={GOLD} />}
      {showCenterRays && data.label_oc !== undefined && <SegLabel a={sO} b={sPts[2]} label={String(data.label_oc)} color={GREY} />}
    </g>
  );
}

/**
 * circle_three_points - three named points A/B/C on a circle with angle relations.
 */
function CircleThreePoints({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const labels: string[] = Array.isArray(data.labels) ? data.labels : [];
  const angles: number[] = data.angles ?? data.point_angles ?? [120, 20, -80];

  const O: Pt = { x: 0, y: 0 };
  const pts = angles.slice(0, 3).map((deg) => {
    const rad = deg * Math.PI / 180;
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
  });

  const pad = r * 0.35;
  const sc = makeScaler(-r - pad, r + pad, -r - pad, r + pad);
  const sO = sc(O);
  const sPts = pts.map(sc);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sO.x);

  const [sA, sB, sC] = sPts;

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />
      <Seg a={sO} b={sA} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sO} b={sB} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sO} b={sC} stroke={GREY} sw={1.4} dash="4,3" />
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.2} />
      <Seg a={sB} b={sC} stroke={GOLD} sw={2.2} />
      <Seg a={sC} b={sA} stroke={GOLD} sw={2.2} />

      <Dot p={sO} label={explicitLabel(data.label_O)} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sA} label={explicitLabel(labels[0])} offset={{ x: -20, y: -12 }} />
      <Dot p={sB} label={explicitLabel(labels[1])} offset={{ x: 10, y: -12 }} />
      <Dot p={sC} label={explicitLabel(labels[2])} offset={{ x: 10, y: 14 }} />

      {data.label_angle_aob && <AngleMark v={sO} a={sA} b={sB} label={String(data.label_angle_aob)} r={24} color={GOLD} />}
      {data.label_angle_acb && <AngleMark v={sC} a={sA} b={sB} label={String(data.label_angle_acb)} r={24} color={GOLD} />}
      {data.label_sum && (
        <text x={sO.x} y={sO.y - pixelR - 18} fontSize={12} textAnchor="middle" fill={GOLD} fontWeight="700">
          {String(data.label_sum)}
        </text>
      )}
    </g>
  );
}

/**
 * circle_diameter_points - AB is a diameter, with C/D on the same arc side.
 * Useful for problems that explicitly state AB is a diameter of circle O.
 */
function CircleDiameterPoints({ data }: { data: any }) {
  const r: number = data.radius ?? 5;
  const side = data.arc_side === 'below' ? -1 : 1;
  const cDeg: number = data.c_angle ?? 38;
  const dDeg: number = data.d_angle ?? 116;
  const showOC: boolean = data.show_oc === true || data.label_oc !== undefined || data.label_angle_aoc !== undefined;

  const O: Pt = { x: 0, y: 0 };
  const A: Pt = { x: -r, y: 0 };
  const B: Pt = { x: r, y: 0 };
  const pointOnArc = (deg: number): Pt => {
    const rad = deg * Math.PI / 180;
    return { x: r * Math.cos(rad), y: side * r * Math.sin(rad) };
  };
  const C = pointOnArc(cDeg);
  const D = pointOnArc(dDeg);

  const pad = r * 0.3;
  const sc = makeScaler(-r - pad, r + pad, -r - pad, r + pad);
  const sO = sc(O), sA = sc(A), sB = sc(B), sC = sc(C), sD = sc(D);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sO.x);

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.65} />
      <Seg a={sA} b={sB} stroke={GOLD} sw={2.6} />
      <Seg a={sB} b={sD} stroke={GOLD} sw={2.2} />
      <Seg a={sA} b={sC} stroke={GREY} sw={1.5} dash="4,3" />
      <Seg a={sB} b={sC} stroke={GREY} sw={1.5} dash="4,3" />
      {showOC && <Seg a={sO} b={sC} stroke={GREY} sw={1.5} dash="4,3" />}
      <Seg a={sA} b={sD} stroke={GOLD} sw={2.2} />
      <Seg a={sD} b={sC} stroke={GOLD} sw={2.2} />
      <Seg a={sC} b={sB} stroke={GOLD} sw={2.2} />

      <Dot p={sO} label={explicitLabel(data.label_O)} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sA} label={explicitLabel(data.label_A)} offset={{ x: -20, y: 0 }} />
      <Dot p={sB} label={explicitLabel(data.label_B)} offset={{ x: 10, y: 0 }} />
      <Dot p={sC} label={explicitLabel(data.label_C)} offset={{ x: 10, y: 10 }} />
      <Dot p={sD} label={explicitLabel(data.label_D)} offset={{ x: 8, y: -12 }} />

      {data.label_ab && <SegLabel a={sA} b={sB} label={String(data.label_ab)} color={GOLD} />}
      {data.label_angle_bcd && <AngleMark v={sC} a={sB} b={sD} label={String(data.label_angle_bcd)} r={20} color={GOLD} />}
      {data.label_angle_abd && <AngleMark v={sB} a={sA} b={sD} label={String(data.label_angle_abd)} r={20} color={GOLD} />}
      {data.label_angle_cad && <AngleMark v={sA} a={sC} b={sD} label={String(data.label_angle_cad)} r={24} color={GOLD} />}
      {data.label_angle_aoc && <AngleMark v={sO} a={sA} b={sC} label={String(data.label_angle_aoc)} r={24} color={GOLD} />}
      {data.label_oc !== undefined && <SegLabel a={sO} b={sC} label={String(data.label_oc)} color={GREY} />}
    </g>
  );
}

/**
 * circle_sector - circular sector swept by a clock hand or central angle.
 * Fields: radius, angle/angle_deg or minutes/time_minutes, label_radius, label_angle.
 */
function CircleSector({ data }: { data: any }) {
  const r: number = numberFromValueOrLabel(data.radius ?? data.outer_radius ?? data.label_radius ?? data.label_outer_radius) ?? 5;
  const minutes: number | null = numberFromValueOrLabel(data.minutes ?? data.time_minutes ?? data.label_minutes);
  const sectorCount = getSectorCount(data);
  const angleDeg: number = numberFromValueOrLabel(data.angle ?? data.angle_deg ?? data.label_angle) ?? (minutes !== null ? minutes * 6 : (
    sectorCount !== null && sectorCount > 0 ? 360 / sectorCount : 60
  ));
  const startDeg: number = data.start_angle ?? 90;
  const endDeg = startDeg - angleDeg;

  const O: Pt = { x: 0, y: 0 };
  const polar = (deg: number): Pt => {
    const rad = deg * Math.PI / 180;
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
  };
  const A = polar(startDeg);
  const B = polar(endDeg);

  const pad = r * 0.28;
  const sc = makeScaler(-r - pad, r + pad, -r - pad, r + pad);
  const sO = sc(O), sA = sc(A), sB = sc(B);
  const pixelR = Math.abs(sc({ x: r, y: 0 }).x - sO.x);
  const largeArc = angleDeg > 180 ? 1 : 0;
  const sectorPath = `M${sO.x},${sO.y} L${sA.x},${sA.y} A${pixelR},${pixelR} 0 ${largeArc} 1 ${sB.x},${sB.y} Z`;

  const mid = polar(startDeg - angleDeg / 2);
  const sMid = sc({ x: mid.x * 0.65, y: mid.y * 0.65 });
  const lRadius = cleanDiagramLabelText(data.label_radius ?? `${r}`);
  const lAngle = cleanDiagramLabelText(data.label_angle ?? `${angleDeg}\u00b0`);
  const lArc = cleanDiagramLabelText(data.label_arc ?? '');
  const lArea = cleanDiagramLabelText(data.label_area ?? (data.show_area_label === true ? '\u6247\u5f62\u9762\u79ef?' : ''));

  return (
    <g>
      <circle cx={sO.x} cy={sO.y} r={pixelR}
        fill="none" stroke={GREY} strokeWidth={2} strokeOpacity={0.55} />
      <path d={sectorPath} fill={FILL} stroke={GOLD} strokeWidth={2.4} />
      <Seg a={sO} b={sA} stroke={GOLD} sw={2.2} />
      <Seg a={sO} b={sB} stroke={GOLD} sw={2.2} />
      <AngleMark v={sO} a={sA} b={sB} label={lAngle} r={34} color={GOLD} />

      <Dot p={sO} label={explicitLabel(data.label_O)} offset={{ x: 8, y: 12 }} color={WHITE} />
      <Dot p={sA} label={explicitLabel(data.label_A)} offset={{ x: -28, y: -10 }} />
      <Dot p={sB} label={explicitLabel(data.label_B)} offset={{ x: 10, y: -10 }} />
      {lRadius && <SegLabel a={sO} b={sA} label={lRadius} color={GREY} />}
      {lArc && (
        <text x={sMid.x} y={sMid.y - 22} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArc}</text>
      )}
      {lArea && (
        <text x={sMid.x} y={sMid.y + 2} fontSize={12} fontWeight="700"
          textAnchor="middle" fill={GOLD}>{lArea}</text>
      )}
    </g>
  );
}

interface MathDiagramProps {
  data: any;
}

const MathDiagram: React.FC<MathDiagramProps> = ({ data: rawData }) => {
  let parsed = rawData;

  // If it arrived as a string, try to parse JSON
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch {
      return <SilentDiagramFallback />;
    }
  }

  let template: string = String(parsed?.template ?? parsed?.type ?? '').trim();
  parsed = normalizeDiagramData(template, parsed);
  template = String(parsed?.template ?? parsed?.type ?? template).trim();
  const validationError = validateDiagramData(template, parsed);

  let content: React.ReactNode;
  const largerDiagramTemplates = new Set([
    'rectangle_fold',
    'cylinder_unrolled',
    'rectangular_prism_net',
    'adjacent_squares_diagonal',
    'composite_overlay',
    'coordinate_points',
  ]);
  const svgMaxHeight = largerDiagramTemplates.has(template) ? 560 : 360;
  try {
    if (validationError) {
      content = <SilentDiagramFallback />;
    } else switch (template) {
      case 'right_triangle':      content = <RightTriangle data={parsed} />; break;
      case 'triangle':            content = <Triangle data={parsed} />; break;
      case 'rectangle':           content = <Rectangle data={parsed} />; break;
      case 'circle':              content = <Circle data={parsed} />; break;
      case 'rectangle_diagonal':
      case 'square_diagonal':     content = <RectangleDiagonal data={parsed} />; break;
      case 'adjacent_squares_diagonal': content = <AdjacentSquaresDiagonal data={parsed} />; break;
      case 'composite_overlay': content = <CompositeOverlay data={parsed} />; break;
      case 'rectangle_fold':      content = <RectangleFold data={parsed} />; break;
      case 'parallelogram':       content = <Parallelogram data={parsed} />; break;
      case 'ladder':              content = <Ladder data={parsed} />; break;
      case 'cylinder_unrolled':   content = <CylinderUnrolled data={parsed} />; break;
      case 'rectangular_prism_net': content = <RectangularPrismNet data={parsed} />; break;
      case 'circle_chord':        content = <CircleChord data={parsed} />; break;
      case 'circle_sector':       content = <CircleSector data={parsed} />; break;
      case 'circle_annulus':      content = <CircleAnnulus data={parsed} />; break;
      case 'circle_tangent':      content = <CircleTangent data={parsed} />; break;
      case 'circle_chord_tangent': content = <CircleChordTangent data={parsed} />; break;
      case 'circle_tangent_chord_dual_points': content = <CircleTangentChordDualPoints data={parsed} />; break;
      case 'circle_cyclic_quadrilateral': content = <CircleCyclicQuadrilateral data={parsed} />; break;
      case 'circle_three_points': content = <CircleThreePoints data={parsed} />; break;
      case 'circle_diameter_points': content = <CircleDiameterPoints data={parsed} />; break;
      case 'circle_intersecting_chords': content = <CircleIntersectingChords data={parsed} />; break;
      case 'circle_diameter_chords': content = <CircleDiameterChords data={parsed} />; break;
      case 'circle_diameter_tangent_chord': content = <CircleDiameterTangentChord data={parsed} />; break;
      case 'linear_function':     content = <LinearFunction data={parsed} />; break;
      case 'quadratic_function':  content = <QuadraticFunction data={parsed} />; break;
      case 'number_line':
      case 'numberline':          content = <NumberLine data={parsed} />; break;
      case 'coordinate_points':   content = <CoordinatePoints data={parsed} />; break;
      case 'similar_triangles':   content = <SimilarTriangles data={parsed} />; break;
      default:
        content = <SilentDiagramFallback />;
    }
  } catch (e: any) {
    content = <SilentDiagramFallback />;
  }

  const fallback = (
    <div className="my-6 flex justify-center bg-slate-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="max-w-full h-auto drop-shadow-2xl"
        style={{ overflow: 'visible', maxHeight: svgMaxHeight }}>
        {content}
      </svg>
    </div>
  );

  if (template.startsWith('circle')) {
    return (
      <PythonCircleDiagram
        template={template}
        data={parsed}
        fallback={fallback}
        svgMaxHeight={svgMaxHeight}
      />
    );
  }

  return fallback;
};

function SilentDiagramFallback() {
  return <g aria-hidden="true" />;
}

export default MathDiagram;
