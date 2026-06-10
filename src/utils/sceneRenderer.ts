// src/utils/sceneRenderer.ts
// Converts AI-generated Scene JSON into precise SVG strings
// This replaces asking AI to compute SVG coordinates directly

export interface SceneJSON {
  scene: string;
  [key: string]: any;
}

const W = 400, H = 400, CX = 200, CY = 200;
const R = 130; // default circle radius in pixels
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
  // Geometric fact: if BC ∥ PA (tangent), arc AB = arc AC
  const cx = CX, cy = CY, r = R;
  const A = circle_pt(cx, cy, r, 0);   // top of circle
  const B = circle_pt(cx, cy, r, 120); // lower-left
  const C = circle_pt(cx, cy, r, 240-120); // = 120 symmetric → lower-right at -120° from top = 240°? 
  // Actually: PA tangent at A (A at top), BC ∥ PA means BC is horizontal
  // A at top (0°), tangent PA is horizontal. BC ∥ PA → B and C at same height
  // B at 120°, C at 60° (symmetric about vertical axis through A)
  const Ap = circle_pt(cx, cy, r, 0);   // A at top
  const Bp = circle_pt(cx, cy, r, 130); // B lower-left  
  const Cp = circle_pt(cx, cy, r, -130 + 360); // C lower-right = 230°
  // D on minor arc BC (bottom)
  const Dp = circle_pt(cx, cy, r, 180); // D at bottom
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
  const angles = (s.angles as number[]) || [200, 290, 20, 110];
  const labels = (s.labels as string[]) || ["A","B","C","D"];
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
  const cx = CX, cy = CY, r = R;
  const Ap = pt(cx - r, cy); // A left
  const Bp = pt(cx + r, cy); // B right
  const angle_C = s.angle_C ?? -60; // C on upper arc
  const angle_D = s.angle_D ?? -120;
  const Cp = circle_pt(cx, cy, r, angle_C + 90);
  const Dp = circle_pt(cx, cy, r, angle_D + 90);
  const elems: string[] = [];
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GRAY, 1.5, DASH));
  // Connect points per s.segments
  const pts: Record<string, {x:number,y:number}> = {A:Ap,B:Bp,C:Cp,D:Dp};
  const segs: string[] = s.segments ?? ["AC","BC","AD","BD"];
  for (const seg of segs) {
    const p1 = pts[seg[0]], p2 = pts[seg[1]];
    if (p1 && p2) elems.push(line(p1.x, p1.y, p2.x, p2.y));
  }
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx, cy+18, "O"));
  for (const [key, lbl] of [["A","A"],["B","B"],["C","C"],["D","D"]] as [string,string][]) {
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
    return null;
  } catch (e) {
    console.error("sceneRenderer error:", e);
    return null;
  }
}

function render_cyclic_quad_tangent_extension(s: SceneJSON): string {
  // ABCD inscribed in circle, AB is diameter, CD tangent at D,
  // extensions of AD and BC meet at E outside the circle
  const cx = CX, cy = CY, r = R;
  const Ap = pt(cx - r, cy);   // A: left end of diameter
  const Bp = pt(cx + r, cy);   // B: right end of diameter
  const angle_C = s.angle_C ?? -50;  // C upper-right
  const angle_D = s.angle_D ?? 60;   // D lower-right (tangent point)
  const Cp = circle_pt(cx, cy, r, angle_C);
  const Dp = circle_pt(cx, cy, r, angle_D);

  // E = intersection of line AD extended beyond D, and line BC extended beyond C
  function line_intersect(
    ax: number, ay: number, bx: number, by: number,
    cx2: number, cy2: number, dx2: number, dy2: number
  ): {x:number,y:number} {
    const denom = (ax-bx)*(cy2-dy2) - (ay-by)*(cx2-dx2);
    if (Math.abs(denom) < 0.001) return pt(cx+r*1.4, cy+r*0.9);
    const t = ((ax-cx2)*(cy2-dy2) - (ay-cy2)*(cx2-dx2)) / denom;
    return pt(ax + t*(bx-ax), ay + t*(by-ay));
  }
  const Ep = line_intersect(Ap.x, Ap.y, Dp.x, Dp.y, Bp.x, Bp.y, Cp.x, Cp.y);

  const elems: string[] = [];
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  // Quadrilateral sides ABCD
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GOLD, 2.5));
  elems.push(line(Bp.x, Bp.y, Cp.x, Cp.y, GOLD, 2.5));
  elems.push(line(Cp.x, Cp.y, Dp.x, Dp.y, GOLD, 2.5));
  elems.push(line(Dp.x, Dp.y, Ap.x, Ap.y, GOLD, 2.5));
  // Diagonals (dashed)
  elems.push(line(Ap.x, Ap.y, Cp.x, Cp.y, GRAY, 1.5, DASH));
  elems.push(line(Bp.x, Bp.y, Dp.x, Dp.y, GRAY, 1.5, DASH));
  // Extensions to E
  elems.push(line(Dp.x, Dp.y, Ep.x, Ep.y, GOLD, 2));
  elems.push(line(Cp.x, Cp.y, Ep.x, Ep.y, GOLD, 2));
  // Tangent at D
  const od_angle = Math.atan2(Dp.y - cy, Dp.x - cx);
  const tx = -Math.sin(od_angle)*45, ty = Math.cos(od_angle)*45;
  elems.push(line(Dp.x-tx, Dp.y-ty, Dp.x+tx, Dp.y+ty, GRAY, 1.5, DASH));
  // Center O
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx+12, cy+6, "O", "start"));
  // All points
  for (const [p, lbl] of [
    [Ap,"A"],[Bp,"B"],[Cp,"C"],[Dp,"D"],[Ep,"E"]
  ] as [{x:number,y:number}, string][]) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}
