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
 *   rectangle_fold        – rectangle with a fold line (EF) and reflected vertex
 *   parallelogram         – parallelogram with base, side, angle
 *   circle                – circle with optional radius label, tangent from external pt
 *   linear_function       – y = kx + b on a coordinate grid
 *   quadratic_function    – y = ax² + bx + c on a coordinate grid
 *   number_line           – horizontal number line with marked points / arrows
 *   coordinate_points     – free points + segments on a grid
 *   cylinder_unrolled     – unrolled lateral surface (for shortest-path problems)
 *   ladder                – ladder-against-wall right triangle
 *   similar_triangles     – two similar triangles side by side
 */

import React from 'react';

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

// ─── Template renderers ──────────────────────────────────────────────────────

/** right_triangle: legs a (horizontal) and b (vertical), right angle at B */
function RightTriangle({ data }: { data: any }) {
  const a: number = data.leg_h ?? data.legs?.[0] ?? data.a ?? 3;
  const b: number = data.leg_v ?? data.legs?.[1] ?? data.b ?? 4;
  const hyp = Math.sqrt(a * a + b * b);
  const labelA: string = data.labels?.A ?? data.label_A ?? 'A';
  const labelB: string = data.labels?.B ?? data.label_B ?? 'B';
  const labelC: string = data.labels?.C ?? data.label_C ?? 'C';
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
      <RightAngleMark v={B} a={A} b={C} />
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
  const lA = data.labels?.A ?? 'A', lB = data.labels?.B ?? 'B', lC = data.labels?.C ?? 'C';
  const lAB = data.labels?.AB ?? '', lBC = data.labels?.BC ?? '', lCA = data.labels?.CA ?? '';
  const rightAt: string = data.right_angle ?? '';

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
    </g>
  );
}

/** rectangle: plain w×h rectangle */
function Rectangle({ data }: { data: any }) {
  const w: number = data.width ?? data.w ?? 6;
  const h: number = data.height ?? data.h ?? 4;
  const labels: string[] = data.labels ?? ['A', 'B', 'C', 'D'];
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
      <Dot p={A} label={labels[0]} offset={{ x: -18, y: -4 }} />
      <Dot p={B} label={labels[1]} offset={{ x: -18, y: 12 }} />
      <Dot p={C} label={labels[2]} offset={{ x: 8,  y: 12 }} />
      <Dot p={D} label={labels[3]} offset={{ x: 8,  y: -4 }} />
      <SegLabel a={A} b={B} label={lH} />
      <SegLabel a={B} b={C} label={lW} />
    </g>
  );
}

/**
 * rectangle_fold — rectangle ABCD with a fold.
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
  const lA  = data.label_A  ?? 'A';
  const lB  = data.label_B  ?? 'B';
  const lC  = data.label_C  ?? 'C';
  const lD  = data.label_D  ?? 'D';
  const lE  = data.label_E  ?? '';   // no default — AI must explicitly pass the letter from the problem
  const lF  = data.label_F  ?? '';   // same
  const lVp = data.label_Ap ?? data.label_Vp ?? '';

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

      {/* Segment labels */}
      {lEF && <SegLabel a={sE} b={sF} label={lEF} color={GOLD} />}
      {lAE && <SegLabel a={sA} b={sE} label={lAE} />}
      {lBE && <SegLabel a={sB} b={sE} label={lBE} />}
      {lDF && <SegLabel a={sD} b={sF} label={lDF} />}
      {lCF && <SegLabel a={sC} b={sF} label={lCF} />}
      {lAF && <SegLabel a={sA} b={sF} label={lAF} />}
      {lBF && <SegLabel a={sB} b={sF} label={lBF} />}
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
      <Dot p={W_} label={data.label_top  ?? 'A'} offset={{ x: -18, y: 0 }} />
      <Dot p={F}  label={data.label_foot_pt ?? 'B'} offset={{ x: 8, y: 12 }} />
      <Dot p={O}  label={data.label_corner ?? 'O'} offset={{ x: -18, y: 12 }} />
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

/** linear_function: plots y = kx + b */
function LinearFunction({ data }: { data: any }) {
  const k: number = data.slope ?? data.k ?? 1;
  const b: number = data.intercept ?? data.b ?? 0;
  const xMin: number = data.xmin ?? -5, xMax: number = data.xmax ?? 5;
  const yMin: number = data.ymin ?? (k * xMin + b - 2);
  const yMax: number = data.ymax ?? (k * xMax + b + 2);
  const sc = makeScaler(xMin, xMax, yMin, yMax);
  const p1 = sc({ x: xMin, y: k * xMin + b });
  const p2 = sc({ x: xMax, y: k * xMax + b });
  const label: string = data.label ?? `y = ${k}x${b >= 0 ? '+' + b : b}`;
  // Mark intercepts
  const xIntercept = -b / k;
  const extras: React.ReactNode[] = [];
  if (xIntercept >= xMin && xIntercept <= xMax) {
    const p = sc({ x: xIntercept, y: 0 });
    extras.push(<Dot key="xi" p={p} label={`(${+xIntercept.toFixed(2)},0)`}
      color={GREY} offset={{ x: 6, y: 14 }} />);
  }
  if (b >= yMin && b <= yMax) {
    const p = sc({ x: 0, y: b });
    extras.push(<Dot key="yi" p={p} label={`(0,${b})`} color={GREY} offset={{ x: 8, y: -10 }} />);
  }
  return (
    <g>
      <Axes sc={sc} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />
      <Seg a={p1} b={p2} stroke={GOLD} sw={2.5} />
      <text x={p2.x - 8} y={p2.y - 12} fontSize={12} fill={GOLD} fontWeight="700"
        textAnchor="end">{label}</text>
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
  const vLabel = data.show_vertex !== false ? `(${+vx.toFixed(2)}, ${+vy.toFixed(2)})` : '';
  const label = data.label ?? `y = ${a}x²${b !== 0 ? (b > 0 ? '+' + b : b) + 'x' : ''}${c !== 0 ? (c > 0 ? '+' + c : c) : ''}`;
  return (
    <g>
      <Axes sc={sc} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />
      <path d={d} fill="none" stroke={GOLD} strokeWidth={2.5} strokeLinejoin="round" />
      {vx >= xMin && vx <= xMax && (
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
  const segs: [string, string][] = data.segments ?? data.lines ?? [];
  if (rawPts.length === 0) return null;
  const xs = rawPts.map(p => p.x), ys = rawPts.map(p => p.y);
  const margin = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 0.3 + 2;
  const xMin = Math.min(...xs) - margin, xMax = Math.max(...xs) + margin;
  const yMin = Math.min(...ys) - margin, yMax = Math.max(...ys) + margin;
  const sc = makeScaler(xMin, xMax, yMin, yMax);
  const ptMap: Record<string, Pt> = {};
  rawPts.forEach(p => { if (p.label) ptMap[p.label] = sc({ x: p.x, y: p.y }); });
  return (
    <g>
      <Axes sc={sc} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />
      {segs.map(([a, b], i) => {
        const pa = ptMap[a], pb = ptMap[b];
        if (!pa || !pb) return null;
        return <Seg key={i} a={pa} b={pb} stroke={GOLD} sw={2} />;
      })}
      {rawPts.map((p, i) => (
        <Dot key={i} p={sc({ x: p.x, y: p.y })} label={p.label}
          offset={{ x: 8, y: -12 }} />
      ))}
    </g>
  );
}

/** similar_triangles: two similar triangles with ratio */
function SimilarTriangles({ data }: { data: any }) {
  const ratio: number = data.ratio ?? 2;
  const base1: number = data.base ?? 3;
  const sides1 = data.sides ?? [base1, base1 * 1.3, base1 * 0.8];
  const sides2 = sides1.map((s: number) => s * ratio);
  const labels1: string[] = data.labels1 ?? ['A', 'B', 'C'];
  const labels2: string[] = data.labels2 ?? ["A'", "B'", "C'"];

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
      <Dot p={sc(A1)} label={labels1[0]} offset={{ x: -6, y: -14 }} />
      <Dot p={sc(B1)} label={labels1[1]} offset={{ x: -18, y: 10 }} />
      <Dot p={sc(C1)} label={labels1[2]} offset={{ x: 8, y: 10 }} />
      <Dot p={sc(A2)} label={labels2[0]} color="#10b981" offset={{ x: -6, y: -14 }} />
      <Dot p={sc(B2)} label={labels2[1]} color="#10b981" offset={{ x: -18, y: 10 }} />
      <Dot p={sc(C2)} label={labels2[2]} color="#10b981" offset={{ x: 8, y: 10 }} />
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
  const height = side * Math.sin(theta);
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
      <Dot p={sc(A)} label={data.labels?.[0] ?? 'A'} offset={{ x: -6, y: -14 }} />
      <Dot p={sc(B)} label={data.labels?.[1] ?? 'B'} offset={{ x: -18, y: 10 }} />
      <Dot p={sc(C)} label={data.labels?.[2] ?? 'C'} offset={{ x: 8, y: 10 }} />
      <Dot p={sc(D)} label={data.labels?.[3] ?? 'D'} offset={{ x: 8, y: -4 }} />
      <SegLabel a={sc(B)} b={sc(C)} label={lBase} />
      <SegLabel a={sc(A)} b={sc(B)} label={lSide} />
      <AngleMark v={sc(B)} a={sc(A)} b={sc(C)} label={`${angleDeg}°`} r={22} />
    </g>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface MathDiagramProps {
  data: any;
}

const MathDiagram: React.FC<MathDiagramProps> = ({ data: rawData }) => {
  let parsed = rawData;

  // If it arrived as a string, try to parse JSON
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch {
      return <DiagramError msg="无法解析图形数据" />;
    }
  }

  const template: string = parsed?.template ?? parsed?.type ?? '';

  let content: React.ReactNode;
  try {
    switch (template) {
      case 'right_triangle':      content = <RightTriangle data={parsed} />; break;
      case 'triangle':            content = <Triangle data={parsed} />; break;
      case 'rectangle':           content = <Rectangle data={parsed} />; break;
      case 'rectangle_fold':      content = <RectangleFold data={parsed} />; break;
      case 'parallelogram':       content = <Parallelogram data={parsed} />; break;
      case 'ladder':              content = <Ladder data={parsed} />; break;
      case 'cylinder_unrolled':   content = <CylinderUnrolled data={parsed} />; break;
      case 'linear_function':     content = <LinearFunction data={parsed} />; break;
      case 'quadratic_function':  content = <QuadraticFunction data={parsed} />; break;
      case 'number_line':
      case 'numberline':          content = <NumberLine data={parsed} />; break;
      case 'coordinate_points':   content = <CoordinatePoints data={parsed} />; break;
      case 'similar_triangles':   content = <SimilarTriangles data={parsed} />; break;
      default:
        content = <DiagramError msg={`未知模板: "${template}"`} />;
    }
  } catch (e: any) {
    content = <DiagramError msg={`渲染出错: ${e?.message}`} />;
  }

  return (
    <div className="my-6 flex justify-center bg-slate-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="max-w-full h-auto drop-shadow-2xl"
        style={{ overflow: 'visible', maxHeight: 320 }}>
        {content}
      </svg>
    </div>
  );
};

function DiagramError({ msg }: { msg: string }) {
  return (
    <text x={W / 2} y={H / 2} textAnchor="middle" fill="#ef4444" fontSize={13}>{msg}</text>
  );
}

export default MathDiagram;
