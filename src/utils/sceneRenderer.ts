// src/utils/sceneRenderer.ts
// Converts AI-generated Scene JSON into precise SVG strings
// This replaces asking AI to compute SVG coordinates directly

export interface SceneJSON {
  scene: string;
  [key: string]: any;
}

const W = 360, H = 360, CX = 180, CY = 180;
const R = 110; // default circle radius in pixels
const GOLD = "#f59e0b";
const GRAY = "#94a3b8";
const WHITE = "#f8fafc";
const DASH = 'stroke-dasharray="5,4"';

function pt(x: number, y: number) { return { x, y }; }
function circle_pt(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180; // 0° = top
  return pt(cx + r * Math.cos(rad), cy + r * Math.sin(rad));
}
function label_offset(px: number, py: number, cx: number, cy: number, d = 18) {
  const dx = px - cx, dy = py - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return pt(px + dx / len * d, py + dy / len * d);
}
function dot(x: number, y: number, color = GOLD) {
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${color}"/>`;
}
function line(x1: number, y1: number, x2: number, y2: number, color = GOLD, w = 2.5, extra = "") {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}" ${extra}/>`;
}
function text(x: number, y: number, label: string, anchor = "middle") {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="15" font-family="system-ui,sans-serif" fill="${WHITE}" text-anchor="${anchor}">${label}</text>`;
}
function arc_path(cx: number, cy: number, r: number, a1: number, a2: number) {
  const p1 = circle_pt(cx, cy, r, a1);
  const p2 = circle_pt(cx, cy, r, a2);
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
  return `<path d="M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="2.5"/>`;
}

// ─── Scene Renderers ──────────────────────────────────────────────────────────

function render_circle_with_tangent_chord(s: SceneJSON): string {
  // PA tangent at A, chord BC parallel to PA, D on minor arc BC
  // Geometric fact: if BC ∥ PA (tangent at A, A at top, PA horizontal),
  // then B and C MUST be mirror images about the vertical axis through A.
  const cx = CX, cy = CY, r = R;
  const Ap = circle_pt(cx, cy, r, 0);   // A fixed at top → tangent PA horizontal

  // Respect AI's angle_B but enforce the parallel constraint:
  // normalize to [0,360), take its angular distance from the top,
  // clamp to a visually sensible range, mirror to get C.
  let rawB = Number(s.angle_B);
  if (!Number.isFinite(rawB)) rawB = 130;
  let distFromTop = ((rawB % 360) + 360) % 360;
  if (distFromTop > 180) distFromTop = 360 - distFromTop;
  distFromTop = Math.min(165, Math.max(95, distFromTop));
  const Bp = circle_pt(cx, cy, r, distFromTop);            // lower-left side
  const Cp = circle_pt(cx, cy, r, 360 - distFromTop);      // mirrored → BC horizontal ∥ PA

  // D on minor arc BC (the bottom arc between B and C), clamped inside it
  let rawD = Number(s.angle_D);
  if (!Number.isFinite(rawD)) rawD = 180;
  rawD = ((rawD % 360) + 360) % 360;
  const Dp = circle_pt(cx, cy, r,
    Math.min(360 - distFromTop - 12, Math.max(distFromTop + 12, rawD)));
  // P external: tangent at A is horizontal, P is to the left
  const Pp = pt(Ap.x - 100, Ap.y);

  const elems: string[] = [];
  // Circle
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  // Tangent line PA (dashed extension)
  elems.push(line(Pp.x, Pp.y, Ap.x + 60, Ap.y, GRAY, 1.5, DASH));
  // Segment PA (solid)
  elems.push(line(Pp.x, Pp.y, Ap.x, Ap.y, GOLD, 2.5));
  // Chord AB, AC
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GOLD, 2.5));
  elems.push(line(Ap.x, Ap.y, Cp.x, Cp.y, GOLD, 2.5));
  // Chord BC
  elems.push(line(Bp.x, Bp.y, Cp.x, Cp.y, GOLD, 2.5));
  // BD, CD
  elems.push(line(Bp.x, Bp.y, Dp.x, Dp.y, GOLD, 2.5));
  elems.push(line(Cp.x, Cp.y, Dp.x, Dp.y, GOLD, 2.5));
  // Center O
  elems.push(dot(cx, cy, GRAY));
  // Points
  for (const [p, lbl] of [[Pp,"P"],[Ap,"A"],[Bp,"B"],[Cp,"C"],[Dp,"D"]] as [typeof Pp, string][]) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, p === Pp ? Ap.x : cx, p === Pp ? Ap.y : cy);
    const anchor = p.x < cx - 10 ? "end" : p.x > cx + 10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  const lo = label_offset(cx, cy, cx + 20, cy);
  elems.push(text(cx + 14, cy + 5, "O", "start"));
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_cyclic_quadrilateral(s: SceneJSON): string {
  // ABCD inscribed in circle, possible diagonals, extension point E
  const cx = CX, cy = CY, r = R;
  const labels = (s.labels as string[]) || ["A","B","C","D"];

  // ── Normalize angles so ABCD is ALWAYS a proper (non self-intersecting)
  //    cyclic quadrilateral, even if AI gives them in a bad order. ──
  let angles = (Array.isArray(s.angles) ? (s.angles as any[]).map(Number) : []);
  if (angles.length !== 4 || angles.some(a => !Number.isFinite(a))) {
    angles = [200, 290, 20, 110];
  }
  angles = angles.map(a => ((a % 360) + 360) % 360).sort((x, y) => x - y);
  // enforce minimum angular separation of 25° between consecutive vertices
  for (let i = 1; i < 4; i++) {
    if (angles[i] - angles[i-1] < 25) angles[i] = angles[i-1] + 25;
  }
  if (angles[3] - angles[0] > 334) angles[3] = angles[0] + 334;
  angles = angles.map(a => ((a % 360) + 360) % 360);

  // ── Optional "diameter":"AB" / "AC" / "BD" / "AD" / "BC" / "CD" ──
  // Forces the two named vertices to be exactly antipodal (180° apart)
  // while keeping A→B→C→D in clockwise cyclic order.
  const dia = typeof s.diameter === 'string' ? (s.diameter as string).toUpperCase() : '';
  const DIA_LAYOUTS: Record<string, number[]> = {
    AB: [250, 70, 130, 190],
    AC: [250, 340, 70, 160],
    BD: [250, 340, 80, 160],
    AD: [250, 310, 10, 70],
    BC: [250, 340, 160, 205],
    CD: [225, 290, 20, 200],
  };
  if (DIA_LAYOUTS[dia]) angles = DIA_LAYOUTS[dia];

  const pts = angles.map(a => circle_pt(cx, cy, r, a));
  const elems: string[] = [];
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  // Sides
  for (let i = 0; i < 4; i++) {
    const p1 = pts[i], p2 = pts[(i+1)%4];
    elems.push(line(p1.x, p1.y, p2.x, p2.y));
  }
  // Diagonals
  if (s.diagonals) {
    elems.push(line(pts[0].x, pts[0].y, pts[2].x, pts[2].y, GRAY, 1.5, DASH));
    elems.push(line(pts[1].x, pts[1].y, pts[3].x, pts[3].y, GRAY, 1.5, DASH));
  }
  // Extension point E on extension of AB beyond B
  if (s.extension_E) {
    const A = pts[0], B = pts[1];
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.sqrt(dx*dx+dy*dy);
    const E = pt(B.x + dx/len*50, B.y + dy/len*50);
    elems.push(line(A.x, A.y, E.x, E.y, GOLD, 2, DASH));
    elems.push(dot(E.x, E.y));
    const lo = label_offset(E.x, E.y, cx, cy);
    elems.push(text(lo.x, lo.y, "E"));
    // CE segment
    if (s.CE) elems.push(line(pts[2].x, pts[2].y, E.x, E.y, GOLD, 2.5));
  }
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx+12, cy+5, "O", "start"));
  pts.forEach((p, i) => {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, labels[i], anchor));
  });
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_circle_two_chords(s: SceneJSON): string {
  // Two chords AB and CD intersecting at point P inside circle
  const cx = CX, cy = CY, r = R;
  // Place intersection P slightly off-center
  const Pp = pt(cx - 20, cy + 10);
  // A, B on circle along one chord direction
  const angleAB = s.angleAB ?? 30; // degrees of chord AB from horizontal
  const angleCD = s.angleCD ?? (angleAB + 90); // perpendicular or given
  const rad1 = angleAB * Math.PI / 180;
  const rad2 = angleCD * Math.PI / 180;
  // Find circle intersections for each chord through P
  function chord_pts(px: number, py: number, rad: number) {
    // line: (px + t*cos, py + t*sin), find t where on circle
    const dx = Math.cos(rad), dy = Math.sin(rad);
    const fx = px - cx, fy = py - cy;
    const a = 1, b = 2*(fx*dx+fy*dy), c = fx*fx+fy*fy-r*r;
    const disc = b*b - 4*a*c;
    const t1 = (-b + Math.sqrt(disc))/2, t2 = (-b - Math.sqrt(disc))/2;
    return [pt(px+t1*dx, py+t1*dy), pt(px+t2*dx, py+t2*dy)];
  }
  const [Ap, Bp] = chord_pts(Pp.x, Pp.y, rad1);
  const [Cp, Dp] = chord_pts(Pp.x, Pp.y, rad2);
  const elems: string[] = [];
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y));
  elems.push(line(Cp.x, Cp.y, Dp.x, Dp.y));
  // Right angle mark at P if perpendicular
  if (s.perpendicular) {
    const sz = 10;
    elems.push(`<rect x="${(Pp.x-sz/2).toFixed(1)}" y="${(Pp.y-sz/2).toFixed(1)}" width="${sz}" height="${sz}" fill="none" stroke="${GRAY}" stroke-width="1.5" transform="rotate(${angleAB} ${Pp.x.toFixed(1)} ${Pp.y.toFixed(1)})"/>`);
  }
  for (const [p, lbl] of [[Ap,"A"],[Bp,"B"],[Cp,"C"],[Dp,"D"],[Pp,"P"]] as [typeof Pp, string][]) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, p === Pp ? cx : cx, p === Pp ? cy : cy, p === Pp ? 16 : 18);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx+12, cy+5, "O", "start"));
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_right_triangle_with_circle(s: SceneJSON): string {
  // Right triangle ∠C=90°, circle O on hypotenuse tangent to both legs
  const a = s.BC ?? 9, b = s.AC ?? 12;
  const c = Math.sqrt(a*a + b*b);
  const r_val = a * b / c; // radius when O is at specific point
  const scale = 220 / Math.max(a, b);
  const ox_svg = 60, oy_svg = 340;
  const svg_x = (mx: number) => ox_svg + mx * scale;
  const svg_y = (my: number) => oy_svg - my * scale;
  // C at origin, A at (0,b), B at (a,0)
  const Cp = pt(svg_x(0), svg_y(0));
  const Ap = pt(svg_x(0), svg_y(b));
  const Bp = pt(svg_x(a), svg_y(0));
  // O on AB: AO = b - r_val
  const t = (b - r_val) / c;
  const Op = pt(svg_x(t*a), svg_y(b - t*b));
  // Tangent points D on AC, E on BC
  const Dp = pt(svg_x(0), svg_y(r_val));
  const Ep = pt(svg_x(r_val), svg_y(0));
  // F: second tangent from A, AF = b - r_val
  const AF = b - r_val;
  const t2 = AF / c;
  const Fp = pt(svg_x(t2*a), svg_y(b - t2*b));
  const r_px = r_val * scale;
  const elems: string[] = [];
  elems.push(line(Cp.x, Cp.y, Ap.x, Ap.y));
  elems.push(line(Cp.x, Cp.y, Bp.x, Bp.y));
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y));
  elems.push(`<circle cx="${Op.x.toFixed(1)}" cy="${Op.y.toFixed(1)}" r="${r_px.toFixed(1)}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  elems.push(line(Ap.x, Ap.y, Fp.x, Fp.y, GRAY, 1.5, DASH));
  elems.push(line(Op.x, Op.y, Dp.x, Dp.y, GRAY, 1.5, DASH));
  elems.push(line(Op.x, Op.y, Ep.x, Ep.y, GRAY, 1.5, DASH));
  // Right angle at C
  const sq = 12;
  elems.push(`<rect x="${Cp.x.toFixed(1)}" y="${(Cp.y-sq).toFixed(1)}" width="${sq}" height="${sq}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  for (const [p, lbl, side] of [
    [Cp,"C","corner"],[Ap,"A","left"],[Bp,"B","right"],
    [Op,"O","inner"],[Dp,"D","left"],[Ep,"E","bottom"],[Fp,"F","left"]
  ] as [typeof Cp, string, string][]) {
    if (!s.show_F && lbl === "F") continue;
    elems.push(dot(p.x, p.y));
    const off = side === "left" ? pt(p.x - 18, p.y + 5) :
                side === "right" ? pt(p.x + 18, p.y + 5) :
                side === "bottom" ? pt(p.x, p.y + 18) :
                side === "inner" ? pt(p.x + 14, p.y - 8) :
                pt(p.x - 14, p.y + 5);
    const anchor = side === "left" ? "end" : side === "right" ? "start" : "middle";
    elems.push(text(off.x, off.y, lbl, anchor));
  }
  return `<svg viewBox="0 0 ${svg_x(a)+60} ${oy_svg+40}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_circle_diameter_points(s: SceneJSON): string {
  // Circle with diameter AB, points C/D on arc
  // ANGLE CONVENTION (same as all other scenes): 0 = top of circle, clockwise.
  const cx = CX, cy = CY, r = R;
  const Ap = pt(cx - r, cy); // A left
  const Bp = pt(cx + r, cy); // B right
  const angle_C = Number.isFinite(Number(s.angle_C)) ? Number(s.angle_C) : -60; // upper-left
  const angle_D = Number.isFinite(Number(s.angle_D)) ? Number(s.angle_D) : 60;  // upper-right
  const Cp = circle_pt(cx, cy, r, angle_C);
  const Dp = circle_pt(cx, cy, r, angle_D);
  const elems: string[] = [];
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GRAY, 1.5, DASH));
  // Connect points per s.segments
  const pts: Record<string, {x:number,y:number}> = {A:Ap,B:Bp,C:Cp,D:Dp};
  const segs: string[] = s.segments ?? ["AC","BC"];
  for (const seg of segs) {
    const p1 = pts[seg[0]], p2 = pts[seg[1]];
    if (p1 && p2) elems.push(line(p1.x, p1.y, p2.x, p2.y));
  }
  // Only show D if the problem actually uses it (angle_D given or a segment mentions D)
  const usesD = Number.isFinite(Number(s.angle_D)) || segs.some(seg => seg.includes('D'));
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx, cy+18, "O"));
  for (const [key, lbl] of [["A","A"],["B","B"],["C","C"],["D","D"]] as [string,string][]) {
    if (key === 'D' && !usesD) continue;
    const p = pts[key];
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_generic_circle(s: SceneJSON): string {
  // Generic: circle + named points on circle at given angles + named segments
  const cx = CX, cy = CY, r = R;
  const elems: string[] = [];
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  const pts: Record<string, {x:number,y:number}> = {};
  const pointDefs = s.points as Record<string, number> ?? {};
  for (const [lbl, angle] of Object.entries(pointDefs)) {
    pts[lbl] = circle_pt(cx, cy, r, angle as number);
  }
  if (s.center) pts[s.center as string] = pt(cx, cy);
  if (s.external_points) {
    for (const [lbl, coord] of Object.entries(s.external_points as Record<string,{x:number,y:number}>)) {
      pts[lbl] = pt(coord.x, coord.y);
    }
  }
  const segs: string[] = s.segments ?? [];
  const dashedSegs: string[] = s.dashed_segments ?? [];
  for (const seg of segs) {
    const p1 = pts[seg[0]], p2 = pts[seg[1]];
    if (p1 && p2) elems.push(line(p1.x, p1.y, p2.x, p2.y));
  }
  for (const seg of dashedSegs) {
    const p1 = pts[seg[0]], p2 = pts[seg[1]];
    if (p1 && p2) elems.push(line(p1.x, p1.y, p2.x, p2.y, GRAY, 1.5, DASH));
  }
  for (const [lbl, p] of Object.entries(pts)) {
    elems.push(dot(p.x, p.y, lbl === s.center ? GRAY : GOLD));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function renderScene(sceneJson: SceneJSON): string | null {
  try {
    const scene = sceneJson.scene as string;
    if (scene === "circle_tangent_parallel_chord" || scene === "circle_with_tangent_chord") {
      return render_circle_with_tangent_chord(sceneJson);
    }
    if (scene === "cyclic_quad_tangent_extension" || scene === "cyclic_quadrilateral_tangent") {
      return render_cyclic_quad_tangent_extension(sceneJson);
    }
    if (scene === "cyclic_quadrilateral") {
      return render_cyclic_quadrilateral(sceneJson);
    }
    if (scene === "circle_two_chords" || scene === "circle_intersecting_chords") {
      return render_circle_two_chords(sceneJson);
    }
    if (scene === "right_triangle_inscribed_circle" || scene === "right_triangle_tangent_circle") {
      return render_right_triangle_with_circle(sceneJson);
    }
    if (scene === "circle_diameter_points") {
      return render_circle_diameter_points(sceneJson);
    }
    if (scene === "generic_circle") {
      return render_generic_circle(sceneJson);
    }
    if (scene === "external_two_tangents" || scene === "tangent_two_points_external") {
      return render_external_tangent_two_points(sceneJson);
    }
    return null;
  } catch (e) {
    console.error("sceneRenderer error:", e);
    return null;
  }
}

function render_cyclic_quad_tangent_extension(s: SceneJSON): string {
  // Geometry: circle O, AB is diameter (horizontal).
  // D is on circle (tangent point). CD is tangent to circle at D (so OD ⊥ CD).
  // C is OUTSIDE the circle, on the tangent line at D.
  // E = intersection of line AD extended beyond D, and line BC extended beyond C.
  //
  // Key insight: for E to be outside the circle beyond D, D must be lower-right,
  // and C must be on the CCW tangent direction from D (going right and slightly down).
  // This makes lines AD-extended and BC-extended converge to the right of D.

  const cx = CX, cy = CY, r = R;
  const Ap = pt(cx - r, cy);  // A: left end of diameter
  const Bp = pt(cx + r, cy);  // B: right end of diameter

  // D on circle, lower-right by default (angle 55° from top = lower-right quadrant)
  const angle_D = (s.angle_D ?? 55);
  const Dp = circle_pt(cx, cy, r, angle_D);

  // Tangent at D: perpendicular to OD.
  // Use CCW rotation of OD vector for the tangent direction toward lower-right.
  const od_dx = Dp.x - cx, od_dy = Dp.y - cy;
  const tang_dx = -od_dy / r;   // CCW tangent direction
  const tang_dy =  od_dx / r;

  // C on tangent line at D, extended by t_c pixels in tangent direction
  const t_c = s.t_c ?? 55;
  const Cp = pt(Dp.x + t_c * tang_dx, Dp.y + t_c * tang_dy);

  // E = intersection of line (A→D extended beyond D) with line (B→C extended beyond C)
  function line_intersect(
    ax: number, ay: number, bx: number, by: number,
    cx2: number, cy2: number, dx2: number, dy2: number
  ): {x: number, y: number} {
    const denom = (ax-bx)*(cy2-dy2) - (ay-by)*(cx2-dx2);
    if (Math.abs(denom) < 0.001) return pt(cx + r*1.8, cy - r*0.8);
    const t = ((ax-cx2)*(cy2-dy2) - (ay-cy2)*(cx2-dx2)) / denom;
    return pt(ax + t*(bx-ax), ay + t*(by-ay));
  }
  const Ep = line_intersect(Ap.x, Ap.y, Dp.x, Dp.y, Bp.x, Bp.y, Cp.x, Cp.y);

  const elems: string[] = [];

  // Circle
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);

  // Diameter AB (dashed - it's the diameter reference)
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GRAY, 1.5, DASH));

  // Sides of quadrilateral: AB, BC, DA
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GOLD, 2.5));  // AB (diameter)
  elems.push(line(Dp.x, Dp.y, Ap.x, Ap.y, GOLD, 2.5));  // DA

  // CD is the tangent segment - draw it as solid (it's a side of the quad)
  elems.push(line(Cp.x, Cp.y, Dp.x, Dp.y, GOLD, 2.5));  // CD (tangent at D)

  // BC
  elems.push(line(Bp.x, Bp.y, Cp.x, Cp.y, GOLD, 2.5));  // BC

  // Show tangent line at D extending both ways slightly (to show it's tangent)
  elems.push(line(Dp.x - tang_dx*20, Dp.y - tang_dy*20,
                  Dp.x + tang_dx*80, Dp.y + tang_dy*80,
                  GRAY, 1.5, DASH));

  // Right angle mark at D (OD ⊥ CD)
  const sq = 8;
  const perp_x = -tang_dy * sq, perp_y = tang_dx * sq;
  const rax = Dp.x + perp_x, ray = Dp.y + perp_y;
  elems.push(`<polyline points="${(rax + tang_dx*sq).toFixed(1)},${(ray + tang_dy*sq).toFixed(1)} ${rax.toFixed(1)},${ray.toFixed(1)} ${(Dp.x + tang_dx*sq).toFixed(1)},${(Dp.y + tang_dy*sq).toFixed(1)}" fill="none" stroke="${GRAY}" stroke-width="1.2"/>`);

  // Extensions to E (dashed)
  elems.push(line(Dp.x, Dp.y, Ep.x, Ep.y, GOLD, 1.8, DASH));
  elems.push(line(Cp.x, Cp.y, Ep.x, Ep.y, GOLD, 1.8, DASH));

  // Center O
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx + 12, cy + 5, "O", "start"));

  // Points with labels offset outward from center
  const allPts: [{x:number,y:number}, string][] = [
    [Ap,"A"],[Bp,"B"],[Cp,"C"],[Dp,"D"],[Ep,"E"]
  ];
  for (const [p, lbl] of allPts) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }

  // Compute tight viewBox from all points
  const allX = allPts.map(([p]) => p.x);
  const allY = allPts.map(([p]) => p.y);
  const pad = 35;
  const vx = Math.min(...allX) - pad, vy = Math.min(...allY) - pad;
  const vw = Math.max(...allX) - Math.min(...allX) + pad*2;
  const vh = Math.max(...allY) - Math.min(...allY) + pad*2;

  return `<svg viewBox="${vx.toFixed(0)} ${vy.toFixed(0)} ${vw.toFixed(0)} ${vh.toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_external_tangent_two_points(s: SceneJSON): string {
  // P is external point above circle. PA and PB are tangents touching circle at A and B.
  // C is on minor arc AB. Tangent at C meets PA at D and PB at E.
  // Triangle PAB (or PDE) with circle inscribed-like configuration.
  
  // Layout: circle center O at (200, 260), radius R, P above at (200, 260-R-80)
  const r = 110;
  const ocx = 200, ocy = 265;
  // PA=PB by symmetry. Place A and B symmetric about vertical axis.
  // Tangent from P touches at A,B. If half-angle at O is theta, sin(theta) = r/OP
  // Choose angle_A (from top, clockwise) e.g. A at 50° right, B at -50° = 310° left
  const angle_A = s.angle_A ?? 50;   // A on right side of circle
  const angle_B = s.angle_B ?? -50;  // B on left side (symmetric)
  const angle_C = s.angle_C ?? 0;   // C at top = minor arc AB (short arc near P)

  function cp(deg: number) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: ocx + r * Math.cos(rad), y: ocy + r * Math.sin(rad) };
  }

  const Ap = cp(angle_A);
  const Bp = cp(angle_B < 0 ? angle_B + 360 : angle_B);
  const Cp = cp(angle_C);

  // Tangent at A is perpendicular to OA. Line from P is tangent to circle.
  // P = intersection of tangent-at-A and tangent-at-B
  // Tangent at A: direction perpendicular to OA
  function tangent_line_at(p: {x:number,y:number}): [number,number,number] {
    // ax + by = c where (a,b) = (px-ocx, py-ocy)/r
    const a = (p.x - ocx) / r, b = (p.y - ocy) / r;
    const c = a * p.x + b * p.y;
    return [a, b, c];
  }
  function intersect_lines(
    [a1,b1,c1]: [number,number,number],
    [a2,b2,c2]: [number,number,number]
  ): {x:number,y:number} {
    const det = a1*b2 - a2*b1;
    return { x: (c1*b2 - c2*b1)/det, y: (a1*c2 - a2*c1)/det };
  }

  const tA = tangent_line_at(Ap);
  const tB = tangent_line_at(Bp);
  const tC = tangent_line_at(Cp);
  const Pp = intersect_lines(tA, tB);
  const Dp = intersect_lines(tA, tC);  // tangent at C meets PA at D
  const Ep = intersect_lines(tB, tC);  // tangent at C meets PB at E

  const elems: string[] = [];
  // Viewbox will be computed to fit all points
  elems.push(`<circle cx="${ocx}" cy="${ocy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  // Main segments: PA, PB
  elems.push(line(Pp.x, Pp.y, Ap.x, Ap.y));
  elems.push(line(Pp.x, Pp.y, Bp.x, Bp.y));
  // Tangent at C: D to E
  elems.push(line(Dp.x, Dp.y, Ep.x, Ep.y));
  // OA, OB, OC dashed
  elems.push(line(ocx, ocy, Ap.x, Ap.y, GRAY, 1.5, DASH));
  elems.push(line(ocx, ocy, Bp.x, Bp.y, GRAY, 1.5, DASH));
  elems.push(line(ocx, ocy, Cp.x, Cp.y, GRAY, 1.5, DASH));

  // Points and labels
  const allPts: [typeof Pp, string][] = [
    [Pp,"P"],[Ap,"A"],[Bp,"B"],[Cp,"C"],[Dp,"D"],[Ep,"E"]
  ];
  for (const [p, lbl] of allPts) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, ocx, ocy, 18);
    const anchor = p.x < ocx - 10 ? "end" : p.x > ocx + 10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  elems.push(dot(ocx, ocy, GRAY));
  elems.push(text(ocx + 12, ocy + 5, "O", "start"));

  // Compute tight viewBox
  const allX = [Pp,Ap,Bp,Cp,Dp,Ep].map(p=>p.x);
  const allY = [Pp,Ap,Bp,Cp,Dp,Ep].map(p=>p.y);
  const minX = Math.min(...allX) - 30, maxX = Math.max(...allX) + 30;
  const minY = Math.min(...allY) - 30, maxY = Math.max(...allY) + 30;
  const vw = maxX - minX, vh = maxY - minY;

  return `<svg viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${vw.toFixed(0)} ${vh.toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}
