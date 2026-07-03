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

/**
 * ANGLE-SIDES / AUXILIARY CONNECTIONS ("connect" parameter)
 * Draws extra segments between NAMED points a scene has already computed.
 * Purpose (project iron rule): every angle ∠XYZ the problem text mentions
 * must have BOTH of its sides visible in the figure. When a scene does not
 * draw them by default (e.g. ∠DOE in external_two_tangents, where only the
 * radii OA/OB/OC are drawn), the AI passes the STRUCTURE only:
 *   "connect": [["O","D"],["O","E"]]
 * and the exact positions come from the scene's own computed geometry —
 * the AI never invents coordinates.
 * Entry forms:  ["O","D"]  or  {"from":"O","to":"D","dash":false}
 * Default style: dashed gray (auxiliary line). dash:false → solid gold.
 */
function render_connect_segments(
  s: SceneJSON,
  pts: Record<string, { x: number; y: number }>,
): string[] {
  const raw = (s as any).connect ?? null;
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const entry of raw) {
    let from = '', to = '', dash = true;
    if (Array.isArray(entry) && entry.length >= 2) {
      from = String(entry[0]); to = String(entry[1]);
    } else if (entry && typeof entry === 'object') {
      from = String((entry as any).from ?? '');
      to = String((entry as any).to ?? '');
      if ((entry as any).dash === false) dash = false;
    }
    const a = pts[from], b = pts[to];
    if (!a || !b || from === to) continue;
    out.push(dash
      ? line(a.x, a.y, b.x, b.y, GRAY, 1.5, DASH)
      : line(a.x, a.y, b.x, b.y));
  }
  return out;
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

  // ── Configurable segments: draw EXACTLY what the problem describes ──
  const ptsMap: Record<string, {x:number,y:number}> = { P: Pp, A: Ap, B: Bp, C: Cp, D: Dp };
  const DEFAULT_SEGS = ["AB", "AC", "BC", "BD", "CD"];
  let segs: string[] = Array.isArray(s.segments)
    ? (s.segments as any[])
        .map(x => String(x).toUpperCase())
        .filter(seg => seg.length === 2 && ptsMap[seg[0]] && ptsMap[seg[1]])
    : DEFAULT_SEGS;
  if (segs.length === 0) segs = DEFAULT_SEGS;

  // E = intersection of AD and BC, when requested or implied
  const wantsE = s.show_E === true ||
    (segs.includes("AD") && (segs.includes("BC") || segs.includes("CB")));
  let Ep: {x:number,y:number} | null = null;
  if (wantsE) {
    // BC is horizontal at y = Bp.y; AD runs from A (top) to D (bottom arc)
    const t = (Bp.y - Ap.y) / (Dp.y - Ap.y || 1);
    Ep = pt(Ap.x + t * (Dp.x - Ap.x), Bp.y);
    ptsMap.E = Ep;
  }

  const elems: string[] = [];
  // Circle
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  // Tangent line PA (dashed extension)
  elems.push(line(Pp.x, Pp.y, Ap.x + 60, Ap.y, GRAY, 1.5, DASH));
  // Segment PA (solid, always — it defines the scene)
  elems.push(line(Pp.x, Pp.y, Ap.x, Ap.y, GOLD, 2.5));
  // Problem-specific segments
  for (const seg of segs) {
    const p1 = ptsMap[seg[0]], p2 = ptsMap[seg[1]];
    elems.push(line(p1.x, p1.y, p2.x, p2.y, GOLD, 2.5));
  }
  // Center O
  elems.push(dot(cx, cy, GRAY));
  // Points: P and A always; B/C/D always (they define the scene); E if computed
  const labeled: [{x:number,y:number}, string][] = [
    [Pp, "P"], [Ap, "A"], [Bp, "B"], [Cp, "C"], [Dp, "D"],
  ];
  if (Ep) labeled.push([Ep, "E"]);
  for (const [p, lbl] of labeled) {
    elems.push(dot(p.x, p.y));
    if (lbl === "E") {
      // E is inside the circle — offset label up-right so it doesn't overlap BC
      elems.push(text(p.x + 10, p.y - 8, "E", "start"));
      continue;
    }
    const lo = label_offset(p.x, p.y, p === Pp ? Ap.x : cx, p === Pp ? Ap.y : cy);
    const anchor = p.x < cx - 10 ? "end" : p.x > cx + 10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
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
  // A = left end (270), B = right end (90).
  //
  // POSITIONING BY GIVEN INSCRIBED ANGLES (preferred):
  // The AI passes the problem's OWN given values and we place points EXACTLY
  // via the inscribed angle theorem (inscribed angle = half its arc):
  //   angle_CAB / angle_DAB : inscribed angle at vertex A → point measured from B
  //   angle_CBA / angle_DBA : inscribed angle at vertex B → point measured from A
  //   side_C / side_D       : "upper" (default) | "lower"
  // Fallback: raw positions angle_C / angle_D (degrees from top, cw).
  const cx = CX, cy = CY, r = R;
  const Ap = pt(cx - r, cy); // A left
  const Bp = pt(cx + r, cy); // B right

  const resolvePos = (
    givenAtA: unknown, givenAtB: unknown, raw: unknown, side: unknown, fallback: number
  ): { angle: number; explicit: boolean } => {
    const lower = String(side ?? 'upper').toLowerCase() === 'lower';
    const aA = Number(givenAtA), aB = Number(givenAtB), rw = Number(raw);
    if (Number.isFinite(aA) && aA > 0 && aA < 90) {
      // ∠?AB = aA at A subtends arc (point→B) of 2·aA
      const ang = lower ? 90 + 2 * aA : 90 - 2 * aA;
      return { angle: ((ang % 360) + 360) % 360, explicit: true };
    }
    if (Number.isFinite(aB) && aB > 0 && aB < 90) {
      // ∠?BA = aB at B subtends arc (A→point) of 2·aB
      const ang = lower ? 270 - 2 * aB : 270 + 2 * aB;
      return { angle: ((ang % 360) + 360) % 360, explicit: true };
    }
    if (Number.isFinite(rw)) return { angle: rw, explicit: true };
    return { angle: fallback, explicit: false };
  };

  const Cres = resolvePos(s.angle_CAB, s.angle_CBA, s.angle_C, s.side_C, -60);
  const Dres = resolvePos(s.angle_DAB, s.angle_DBA, s.angle_D, s.side_D, 60);
  // E = optional extra arc point (e.g. 点E在下半圆弧上). Same positioning rules.
  let Eres = resolvePos(s.angle_EAB, s.angle_EBA, s.angle_E, s.side_E ?? 'lower', 180);
  // "E_bisector_from_C": true → CE bisects ∠ACB ⇒ arc AE = arc EB ⇒ E is the
  // midpoint of the semicircle on the OPPOSITE side of C (computed exactly).
  if (s.E_bisector_from_C === true) {
    const cAng = ((Cres.angle % 360) + 360) % 360;
    const cIsUpper = cAng > 270 || cAng < 90;
    Eres = { angle: cIsUpper ? 180 : 0, explicit: true };
  }
  const Cp = circle_pt(cx, cy, r, Cres.angle);
  const Dp = circle_pt(cx, cy, r, Dres.angle);
  const Ep = circle_pt(cx, cy, r, Eres.angle);

  const elems: string[] = [];
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GRAY, 1.5, DASH));
  const pts: Record<string, {x:number,y:number}> = {A:Ap,B:Bp,C:Cp,D:Dp,E:Ep,O:pt(cx,cy)};
  const segs: string[] = (Array.isArray(s.segments) ? (s.segments as any[]).map(x => String(x).toUpperCase()) : ["AC","BC"])
    .filter(seg => seg.length === 2);

  // ── Optional tangent line at ANY named circle point ("tangent_at":"C") ──
  // The tangent is perpendicular to the radius at that point — computed
  // exactly. (Tangents at the diameter endpoints A/B come out vertical,
  // preserving the old behaviour.)
  const tKey = typeof s.tangent_at === 'string' ? (s.tangent_at as string).toUpperCase() : '';
  const Tp = (tKey && tKey !== 'O' && pts[tKey]) ? pts[tKey] : null;
  // unit outward normal (radius direction) and unit tangent direction
  const tN = Tp ? { x: (Tp.x - cx) / r, y: (Tp.y - cy) / r } : null;
  const tDir = tN ? { x: -tN.y, y: tN.x } : null;

  // ── Optional: extend the line through two named points until it meets the
  //    tangent line; the hit point gets a NAME (e.g. 连接BD并延长，交直线l于
  //    点E → "extend_to_tangent":{"line":"BD","label":"E"}).
  //    Legacy form kept: "D_from":"BE" (hit point named D).
  //    The intersection is solved exactly; the AI only names the points. ──
  let hit: {x:number,y:number} | null = null;
  let hitLabel = '';
  let extLine = '', extLabel = '';
  const ett = (s as any).extend_to_tangent;
  if (ett && typeof ett === 'object') {
    extLine = String((ett as any).line ?? '').toUpperCase();
    extLabel = String((ett as any).label ?? 'E').toUpperCase();
  } else if (typeof s.D_from === 'string') {
    extLine = (s.D_from as string).toUpperCase();
    extLabel = 'D';
  }
  if (Tp && tN && extLine.length === 2 && pts[extLine[0]] && pts[extLine[1]]) {
    const p1 = pts[extLine[0]], p2 = pts[extLine[1]];
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const denom = tN.x * dx + tN.y * dy;
    if (Math.abs(denom) > 1e-6) {
      const c0 = tN.x * Tp.x + tN.y * Tp.y;
      const t = (c0 - (tN.x * p1.x + tN.y * p1.y)) / denom;
      hit = pt(p1.x + t * dx, p1.y + t * dy);
      hitLabel = extLabel;
      pts[hitLabel] = hit; // now referencable from segments/connect
      // Draw the chord itself plus its extension to the hit point, always
      // covering all three points regardless of which side the hit lies on.
      elems.push(line(p1.x, p1.y, p2.x, p2.y, GOLD, 2.5));
      const anchor = t >= 0 ? p1 : p2;
      elems.push(line(anchor.x, anchor.y, hit.x, hit.y, GOLD, 2.5));
    }
  }

  // Draw the tangent line along its exact direction, long enough to cover
  // the circle and the hit point (if any), with the "l" label at one end.
  let tEnd1: {x:number,y:number} | null = null, tEnd2: {x:number,y:number} | null = null;
  if (Tp && tDir) {
    let sMin = -(r + 40), sMax = r + 40;
    if (hit) {
      const sH = (hit.x - Tp.x) * tDir.x + (hit.y - Tp.y) * tDir.y;
      sMin = Math.min(sMin, sH - 30);
      sMax = Math.max(sMax, sH + 30);
    }
    tEnd1 = pt(Tp.x + sMin * tDir.x, Tp.y + sMin * tDir.y);
    tEnd2 = pt(Tp.x + sMax * tDir.x, Tp.y + sMax * tDir.y);
    elems.push(line(tEnd1.x, tEnd1.y, tEnd2.x, tEnd2.y, GRAY, 1.5));
    const lbl = (s.tangent_label as string) || "l";
    const lref = tEnd1.y <= tEnd2.y ? tEnd1 : tEnd2; // label at the upper end
    elems.push(text(lref.x + 14 * (tN as any).x, lref.y + 14 * (tN as any).y, lbl, "middle"));
  }

  for (const seg of segs) {
    const p1 = pts[seg[0]], p2 = pts[seg[1]];
    if (p1 && p2) elems.push(line(p1.x, p1.y, p2.x, p2.y));
  }
  elems.push(...render_connect_segments(s, pts));

  // Visibility: an arc point is hidden when its name was taken by the
  // tangent intersection; otherwise shown when placed/referenced.
  const usesArcD = hitLabel !== 'D' && (Dres.explicit || segs.some(seg => seg.includes('D')) || extLine.includes('D'));
  const usesE = hitLabel !== 'E' && (Eres.explicit || segs.some(seg => seg.includes('E')) || extLine.includes('E'));
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx, cy+18, "O"));
  const shown: [string, {x:number,y:number}][] = [["A",Ap],["B",Bp],["C",Cp]];
  if (usesArcD) shown.push(["D", Dp]);
  if (usesE) shown.push(["E", Ep]);
  if (hit && hitLabel) shown.push([hitLabel, hit]);
  for (const [lbl, p] of shown) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }

  // Dynamic viewBox: expand to include the tangent line / intersection point
  let minX = 0, minY = 0, maxX = W, maxY = H;
  for (const [, p] of shown) {
    minX = Math.min(minX, p.x - 35); maxX = Math.max(maxX, p.x + 35);
    minY = Math.min(minY, p.y - 30); maxY = Math.max(maxY, p.y + 30);
  }
  for (const e of [tEnd1, tEnd2]) {
    if (e) {
      minX = Math.min(minX, e.x - 25); maxX = Math.max(maxX, e.x + 25);
      minY = Math.min(minY, e.y - 25); maxY = Math.max(maxY, e.y + 25);
    }
  }
  return `<svg viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
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
  // Optional: tangent line at a named circle point, e.g. "tangent_at":"C"
  // Drawn as a thin line through that point, perpendicular to the radius,
  // labeled with "tangent_label" (default "l").
  if (typeof s.tangent_at === 'string' && pts[s.tangent_at as string] && pointDefs[s.tangent_at as string] !== undefined) {
    const T = pts[s.tangent_at as string];
    const tdx = -(T.y - cy) / r, tdy = (T.x - cx) / r; // unit tangent direction
    const ext = 95;
    elems.push(line(T.x - ext * tdx, T.y - ext * tdy, T.x + ext * tdx, T.y + ext * tdy, GRAY, 1.5));
    const lbl = (s.tangent_label as string) || 'l';
    elems.push(text(T.x + (ext + 12) * tdx, T.y + (ext + 12) * tdy, lbl, "middle"));
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
  elems.push(...render_connect_segments(s, pts));
  for (const [lbl, p] of Object.entries(pts)) {
    elems.push(dot(p.x, p.y, lbl === s.center ? GRAY : GOLD));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx-10 ? "end" : p.x > cx+10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_circle_tangent_perpendicular(s: SceneJSON): string {
  // Classic configuration:
  //   AB is the diameter of circle O. Line l is tangent to the circle at C.
  //   From A, draw AD ⊥ l with foot D. Line AD meets the circle again at E.
  //   (Standard problem: ∠DAC = ∠CAB etc.)
  // All of l, D, E are computed EXACTLY:
  //   - tangent direction at C = perpendicular to radius OC
  //   - D = foot of perpendicular from A onto line l
  //   - E = second intersection of line AD with the circle
  const cx = CX, cy = CY, r = R;
  const Ap = pt(cx, cy + r);   // A at bottom
  const Bp = pt(cx, cy - r);   // B at top (AB vertical diameter)

  // C on the circle; clamp away from A and B so the construction stays valid
  let angC = Number(s.angle_C);
  if (!Number.isFinite(angC)) angC = 100;
  angC = ((angC % 360) + 360) % 360;
  // keep C at least 30° away from top (0) and bottom (180)
  if (angC < 30) angC = 30;
  if (angC > 330) angC = 330;
  if (Math.abs(angC - 180) < 30) angC = angC < 180 ? 150 : 210;
  const Cp = circle_pt(cx, cy, r, angC);

  // Unit tangent direction at C (perpendicular to OC)
  const tdx = -(Cp.y - cy) / r;
  const tdy = (Cp.x - cx) / r;

  // D = foot of perpendicular from A onto tangent line l
  const apcx = Ap.x - Cp.x, apcy = Ap.y - Cp.y;
  const proj = apcx * tdx + apcy * tdy;
  const Dp = pt(Cp.x + proj * tdx, Cp.y + proj * tdy);

  // E = second intersection of line A→D with the circle.
  // A is on the circle, so with unit direction d: s = -2 (A−O)·d
  const adLen = Math.hypot(Dp.x - Ap.x, Dp.y - Ap.y) || 1;
  const ddx = (Dp.x - Ap.x) / adLen, ddy = (Dp.y - Ap.y) / adLen;
  const sE = -2 * ((Ap.x - cx) * ddx + (Ap.y - cy) * ddy);
  const Ep = pt(Ap.x + sE * ddx, Ap.y + sE * ddy);

  const ptsMap: Record<string, {x:number,y:number}> = { A: Ap, B: Bp, C: Cp, D: Dp, E: Ep, O: pt(cx, cy) };

  const elems: string[] = [];
  // Circle
  elems.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GRAY}" stroke-width="1.5"/>`);
  // Tangent line l through C, extended in both directions far enough to include D
  const e1 = pt(Cp.x + (Math.max(proj, 0) + 45) * tdx, Cp.y + (Math.max(proj, 0) + 45) * tdy);
  const e2 = pt(Cp.x + (Math.min(proj, 0) - 45) * tdx, Cp.y + (Math.min(proj, 0) - 45) * tdy);
  elems.push(line(e1.x, e1.y, e2.x, e2.y, GRAY, 1.5));
  // Label "l" at the end of the tangent away from D
  const lEnd = Math.abs(proj) > 1 ? (proj > 0 ? e2 : e1) : e1;
  elems.push(text(lEnd.x + 8 * tdx, lEnd.y + 8 * tdy + 4, (s.tangent_label as string) || "l", "middle"));

  // Diameter AB (dashed, defines the setup)
  elems.push(line(Ap.x, Ap.y, Bp.x, Bp.y, GRAY, 1.5, DASH));
  // AD (solid — the perpendicular through E to foot D)
  elems.push(line(Ap.x, Ap.y, Dp.x, Dp.y, GOLD, 2.5));
  // Right-angle mark at D
  const m = 9;
  const ndx = (Ap.x - Dp.x) / adLen, ndy = (Ap.y - Dp.y) / adLen; // direction D→A
  const sgn = proj >= 0 ? -1 : 1;
  elems.push(`<path d="M ${Dp.x + sgn * m * tdx} ${Dp.y + sgn * m * tdy} L ${Dp.x + sgn * m * tdx + m * ndx} ${Dp.y + sgn * m * tdy + m * ndy} L ${Dp.x + m * ndx} ${Dp.y + m * ndy}" fill="none" stroke="${GRAY}" stroke-width="1.2"/>`);

  // Problem-specific segments (default: AC, CE, BC)
  const DEFAULT_SEGS = ["AC", "CE", "BC"];
  let segs: string[] = Array.isArray(s.segments)
    ? (s.segments as any[])
        .map(x => String(x).toUpperCase())
        .filter(seg => seg.length === 2 && ptsMap[seg[0]] && ptsMap[seg[1]])
    : DEFAULT_SEGS;
  if (segs.length === 0) segs = DEFAULT_SEGS;
  for (const seg of segs) {
    const p1 = ptsMap[seg[0]], p2 = ptsMap[seg[1]];
    const isRadius = seg.includes("O");
    elems.push(line(p1.x, p1.y, p2.x, p2.y, isRadius ? GRAY : GOLD, isRadius ? 1.5 : 2.5, isRadius ? DASH : undefined));
  }

  // Center + labels
  elems.push(dot(cx, cy, GRAY));
  elems.push(text(cx - 12, cy + 5, "O", "end"));
  for (const [lbl, p] of Object.entries({ A: Ap, B: Bp, C: Cp, D: Dp, E: Ep })) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, cx, cy);
    const anchor = p.x < cx - 10 ? "end" : p.x > cx + 10 ? "start" : "middle";
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
    if (scene === "circle_tangent_perpendicular" || scene === "tangent_perpendicular" || scene === "diameter_tangent_perpendicular") {
      return render_circle_tangent_perpendicular(sceneJson);
    }
    if (scene === "external_two_tangents" || scene === "tangent_two_points_external") {
      return render_external_tangent_two_points(sceneJson);
    }
    if (scene === "intersecting_lines_rays" || scene === "intersecting_lines" || scene === "angle_bisector_rays") {
      return render_intersecting_lines_rays(sceneJson);
    }
    if (scene === "parallelogram_general" || scene === "rhombus" || scene === "parallelogram_midpoints" || scene === "quadrilateral_midpoints") {
      return render_parallelogram_general(sceneJson);
    }
    return null;
  } catch (e) {
    console.error("sceneRenderer error:", e);
    return null;
  }
}

function render_intersecting_lines_rays(s: SceneJSON): string {
  // Two straight lines crossing at O, plus any number of extra rays from O.
  // The AI only declares the configuration; this renderer computes EVERY ray
  // direction exactly, so angle bisectors land in the geometrically correct spot.
  //
  // Inputs:
  //   "lines": [["A","B"],["C","D"]]   each pair = one straight line through O
  //                                    (its two endpoints are opposite rays, 180 apart)
  //   "base_angles": {"A":180,"B":0,"C":140,"D":-40}   OPTIONAL explicit ray
  //       directions in math degrees (0=right, CCW positive). A line's two
  //       endpoints are forced 180 apart automatically.
  //   "rays": [                          extra rays solved by the renderer:
  //       {"name":"E","bisects":["B","D"]},     OE bisects angle BOD
  //       {"name":"F","bisects":["C","E"]}      OF bisects angle COE (may depend on E)
  //       {"name":"P","angle":30}               OP at a fixed direction
  //     ]
  //   "center": "O"  (default "O")
  const cx = CX, cy = CY;
  const rayLen = 95;
  const center = (s.center as string) || "O";

  const dirs: Record<string, number> = {}; // ray name -> math-degrees (CCW, 0=right)

  // 1. Seed directions from explicit base_angles
  const base = (s.base_angles as Record<string, number>) || {};
  for (const [k, v] of Object.entries(base)) {
    if (Number.isFinite(Number(v))) dirs[k] = Number(v);
  }

  // 2. Lines: ensure each pair is 180 apart; supply defaults if missing
  const lines: string[][] = Array.isArray(s.lines) && s.lines.length
    ? (s.lines as any[]).map((l: any) => [String(l[0]), String(l[1])])
    : [["A", "B"], ["C", "D"]];
  const DEFAULT_LINE_DIRS = [
    [180, 0],
    [140, -40],
    [110, -70],
  ];
  lines.forEach((ln, i) => {
    const [p, q] = ln;
    const def = DEFAULT_LINE_DIRS[i] || [120 - i * 30, -60 - i * 30];
    if (dirs[p] === undefined && dirs[q] === undefined) {
      dirs[p] = def[0]; dirs[q] = def[1];
    } else if (dirs[p] === undefined) {
      dirs[p] = dirs[q] + 180;
    } else if (dirs[q] === undefined) {
      dirs[q] = dirs[p] + 180;
    } else {
      dirs[q] = dirs[p] + 180;
    }
  });

  // 3. Solve extra rays (bisectors may depend on earlier-solved rays)
  const bisect = (a: number, b: number): number => {
    const ax = Math.cos(a * Math.PI / 180), ay = Math.sin(a * Math.PI / 180);
    const bx = Math.cos(b * Math.PI / 180), by = Math.sin(b * Math.PI / 180);
    return Math.atan2(ay + by, ax + bx) * 180 / Math.PI;
  };
  const rayDefs: any[] = Array.isArray(s.rays) ? (s.rays as any[]) : [];
  for (let pass = 0; pass < 4; pass++) {
    for (const rd of rayDefs) {
      const name = String(rd.name);
      if (dirs[name] !== undefined) continue;
      if (Array.isArray(rd.bisects) && rd.bisects.length === 2) {
        const a = dirs[String(rd.bisects[0])], b = dirs[String(rd.bisects[1])];
        if (a !== undefined && b !== undefined) dirs[name] = bisect(a, b);
      } else if (Array.isArray(rd.in_angle) && rd.in_angle.length === 2) {
        // Place ray inside ∠(arm1 O arm2). Walk the SHORT way from arm1 to arm2
        // by a fraction (default 0.5 = roughly centred).
        const a = dirs[String(rd.in_angle[0])], b = dirs[String(rd.in_angle[1])];
        if (a !== undefined && b !== undefined) {
          let diff = ((b - a + 540) % 360) - 180; // signed shortest delta a→b
          const frac = Number.isFinite(Number(rd.frac)) ? Math.min(0.85, Math.max(0.15, Number(rd.frac))) : 0.5;
          dirs[name] = a + diff * frac;
        }
      } else if (Number.isFinite(Number(rd.angle))) {
        dirs[name] = Number(rd.angle);
      }
    }
  }

  // 4. Draw. Math angle -> SVG point (SVG y grows downward, so negate sine).
  const ptAt = (deg: number, len: number) =>
    pt(cx + len * Math.cos(deg * Math.PI / 180), cy - len * Math.sin(deg * Math.PI / 180));

  const elems: string[] = [];

  for (const ln of lines) {
    const [p, q] = ln;
    if (dirs[p] === undefined || dirs[q] === undefined) continue;
    const a = ptAt(dirs[p], rayLen);
    const b = ptAt(dirs[q], rayLen);
    elems.push(line(a.x, a.y, b.x, b.y, GOLD, 2.5));
  }

  const lineEndpoints = new Set(lines.flat());
  for (const rd of rayDefs) {
    const name = String(rd.name);
    if (dirs[name] === undefined || lineEndpoints.has(name)) continue;
    const e = ptAt(dirs[name], rayLen);
    elems.push(line(cx, cy, e.x, e.y, GOLD, 2.5));
  }

  elems.push(dot(cx, cy, GRAY));

  const allNames = new Set<string>([...lineEndpoints, ...rayDefs.map((r: any) => String(r.name))]);
  for (const name of allNames) {
    if (dirs[name] === undefined) continue;
    const e = ptAt(dirs[name], rayLen);
    elems.push(dot(e.x, e.y));
    const lp = ptAt(dirs[name], rayLen + 16);
    elems.push(text(lp.x, lp.y + 4, name, "middle"));
  }
  elems.push(text(cx - 13, cy - 9, center, "middle"));

  let minX = 0, minY = 0, maxX = W, maxY = H;
  for (const name of allNames) {
    if (dirs[name] === undefined) continue;
    const lp = ptAt(dirs[name], rayLen + 24);
    minX = Math.min(minX, lp.x); maxX = Math.max(maxX, lp.x);
    minY = Math.min(minY, lp.y); maxY = Math.max(maxY, lp.y);
  }
  const pad = 6;
  return `<svg viewBox="${(minX - pad).toFixed(0)} ${(minY - pad).toFixed(0)} ${(maxX - minX + 2 * pad).toFixed(0)} ${(maxY - minY + 2 * pad).toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
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
  // Extra named-point connections (e.g. sides of an asked angle)
  const cqPtMap: Record<string, { x: number; y: number }> = { O: { x: cx, y: cy } };
  for (const [p, lbl] of allPts) cqPtMap[lbl] = p;
  elems.push(...render_connect_segments(s, cqPtMap));
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
  // Optional GIVEN lengths: "PA" (tangent length) and "radius" — when both
  // are provided the tangent-point angle is computed EXACTLY from them
  // (tan∠AOP = PA/r), so the figure's proportions match the given data.
  // The numbers themselves are never printed (no answer/data leak).
  const paLen = Number((s as any).PA ?? (s as any).pa);
  const radLen = Number((s as any).radius ?? (s as any).r);
  let angle_A = Number(s.angle_A ?? 50);   // A on right side of circle
  let angle_B = Number(s.angle_B ?? -50);  // B on left side (symmetric)
  if (Number.isFinite(paLen) && Number.isFinite(radLen) && paLen > 0 && radLen > 0) {
    const a = Math.atan2(paLen, radLen) * 180 / Math.PI;
    angle_A = a;
    angle_B = -a;
  }
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
  // Which tangent-line intersections the TEXT actually names:
  // "show_D":false / "show_E":false hide the corresponding point entirely
  // (NO-EXTRAS rule: never draw a point the text does not mention).
  const showD = (s as any).show_D !== false;
  const showE = (s as any).show_E !== false;
  let tangentOverhang: { x: number; y: number } | null = null;
  // Tangent at C: full D–E when both ends are named; when only one end is
  // named, draw from that point through C with a short overhang past C
  // (the tangent line is still visible, but no unnamed point is invented).
  if (showD && showE) {
    elems.push(line(Dp.x, Dp.y, Ep.x, Ep.y));
  } else if (showD) {
    tangentOverhang = pt(Cp.x + 0.45 * (Cp.x - Dp.x), Cp.y + 0.45 * (Cp.y - Dp.y));
    elems.push(line(Dp.x, Dp.y, tangentOverhang.x, tangentOverhang.y));
  } else if (showE) {
    tangentOverhang = pt(Cp.x + 0.45 * (Cp.x - Ep.x), Cp.y + 0.45 * (Cp.y - Ep.y));
    elems.push(line(Ep.x, Ep.y, tangentOverhang.x, tangentOverhang.y));
  } else {
    const tdx = -(Cp.y - ocy) / r, tdy = (Cp.x - ocx) / r;
    elems.push(line(Cp.x - 0.7 * r * tdx, Cp.y - 0.7 * r * tdy,
                    Cp.x + 0.7 * r * tdx, Cp.y + 0.7 * r * tdy));
  }
  // OA, OB, OC dashed
  elems.push(line(ocx, ocy, Ap.x, Ap.y, GRAY, 1.5, DASH));
  elems.push(line(ocx, ocy, Bp.x, Bp.y, GRAY, 1.5, DASH));
  elems.push(line(ocx, ocy, Cp.x, Cp.y, GRAY, 1.5, DASH));

  // Extra named-point connections (e.g. the two sides OD, OE of an asked
  // angle ∠DOE): AI passes "connect":[["O","D"],["O","E"]], positions are
  // the exact ones computed above.
  const ptMap: Record<string, { x: number; y: number }> = {
    P: Pp, A: Ap, B: Bp, C: Cp, D: Dp, E: Ep, O: { x: ocx, y: ocy },
  };
  elems.push(...render_connect_segments(s, ptMap));

  // Points and labels (only the ones the text names)
  const allPts: [typeof Pp, string][] = [
    [Pp,"P"],[Ap,"A"],[Bp,"B"],[Cp,"C"]
  ];
  if (showD) allPts.push([Dp,"D"]);
  if (showE) allPts.push([Ep,"E"]);
  for (const [p, lbl] of allPts) {
    elems.push(dot(p.x, p.y));
    const lo = label_offset(p.x, p.y, ocx, ocy, 18);
    const anchor = p.x < ocx - 10 ? "end" : p.x > ocx + 10 ? "start" : "middle";
    elems.push(text(lo.x, lo.y, lbl, anchor));
  }
  elems.push(dot(ocx, ocy, GRAY));
  elems.push(text(ocx + 12, ocy + 5, "O", "start"));

  // Compute viewBox: must include ALL shown points, the tangent overhang,
  // AND THE FULL CIRCLE (previously the circle could get cropped away).
  const boundPts = allPts.map(([p]) => p);
  if (tangentOverhang) boundPts.push(tangentOverhang as typeof Pp);
  const allX = boundPts.map(p=>p.x).concat([ocx - r, ocx + r]);
  const allY = boundPts.map(p=>p.y).concat([ocy - r, ocy + r]);
  const minX = Math.min(...allX) - 30, maxX = Math.max(...allX) + 30;
  const minY = Math.min(...allY) - 30, maxY = Math.max(...allY) + 30;
  const vw = maxX - minX, vh = maxY - minY;

  return `<svg viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${vw.toFixed(0)} ${vh.toFixed(0)}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}

function render_parallelogram_general(s: SceneJSON): string {
  // Parallelogram / rhombus ABCD by side lengths + one interior angle, drawn
  // EXACTLY (so a rhombus is truly equilateral and the given angle is correct).
  // Vertices order A->B->C->D counter-clockwise, with A at bottom-left.
  //   "AB": length of side AB (bottom edge).            default 5
  //   "BC": length of side BC (slant edge).             default = AB (rhombus)
  //   "angle_B": interior angle at B (∠ABC) in degrees. default 60
  //   "rhombus": true forces BC = AB.
  // Optional construction extras:
  //   "midpoints": [{"name":"E","side":"BC"},{"name":"F","side":"CD"}]
  //       marks the midpoint of a side and labels it.
  //   "segments": [["A","E"],["B","F"]]  draws those segments (names may be
  //       vertices A/B/C/D or any midpoint defined above).
  //   "intersection": {"name":"G","of":[["A","E"],["B","F"]]}
  //       computes & marks the intersection of two of the drawn segments.
  const AB = Number.isFinite(Number(s.AB)) ? Number(s.AB) : 5;
  const rhombus = s.rhombus === true || s.scene === "rhombus";
  let BC = Number.isFinite(Number(s.BC)) ? Number(s.BC) : AB;
  if (rhombus) BC = AB;
  let angB = Number.isFinite(Number(s.angle_B)) ? Number(s.angle_B) : 60;
  // clamp to a sane drawable range
  angB = Math.min(150, Math.max(30, angB));

  // Build in math coordinates (y up). A at origin; B to the right along +x.
  // Interior angle at B is ∠ABC. The slant side BC rises from B.
  // A=(0,0), B=(AB,0). At B the interior turns by (180-angB) upward.
  const A0 = { x: 0, y: 0 };
  const B0 = { x: AB, y: 0 };
  const dirBC = Math.PI - (angB * Math.PI / 180); // direction from B to C
  const C0 = { x: B0.x + BC * Math.cos(dirBC), y: B0.y + BC * Math.sin(dirBC) };
  const D0 = { x: A0.x + (C0.x - B0.x), y: A0.y + (C0.y - B0.y) }; // D = A + (C-B)

  const verts: Record<string, { x: number; y: number }> = { A: A0, B: B0, C: C0, D: D0 };

  // Midpoints
  const mids: Record<string, { x: number; y: number }> = {};
  const midDefs: any[] = Array.isArray(s.midpoints) ? (s.midpoints as any[]) : [];
  for (const md of midDefs) {
    const side = String(md.side || "").toUpperCase();
    const p = verts[side[0]], q = verts[side[1]];
    if (p && q && md.name) {
      mids[String(md.name)] = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    }
  }
  const lookup = (name: string) => verts[name] || mids[name];

  // Segments to draw
  const segDefs: string[][] = Array.isArray(s.segments)
    ? (s.segments as any[]).map((seg) => [String(seg[0]), String(seg[1])])
    : [];

  // Intersection
  let inter: { name: string; pt: { x: number; y: number } } | null = null;
  const it: any = s.intersection;
  if (it && it.name && Array.isArray(it.of) && it.of.length === 2) {
    const [s1, s2] = it.of;
    const p1 = lookup(String(s1[0])), p2 = lookup(String(s1[1]));
    const p3 = lookup(String(s2[0])), p4 = lookup(String(s2[1]));
    if (p1 && p2 && p3 && p4) {
      const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
      const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
      const den = d1x * d2y - d1y * d2x;
      if (Math.abs(den) > 1e-9) {
        const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / den;
        inter = { name: String(it.name), pt: { x: p1.x + t * d1x, y: p1.y + t * d1y } };
      }
    }
  }

  // ── Map math coords → SVG viewbox with padding ──
  const allPts = [A0, B0, C0, D0, ...Object.values(mids), ...(inter ? [inter.pt] : [])];
  const xs = allPts.map((p) => p.x), ys = allPts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = maxX - minX || 1, spanY = maxY - minY || 1;
  const pad = 0.18 * Math.max(spanX, spanY);
  const scale = Math.min((W - 2 * 40) / (spanX + 2 * pad), (H - 2 * 40) / (spanY + 2 * pad));
  const ox = 40, oy = 40;
  const SX = (p: { x: number; y: number }) => ox + (p.x - minX + pad) * scale;
  const SY = (p: { x: number; y: number }) => H - (oy + (p.y - minY + pad) * scale); // flip y

  const elems: string[] = [];
  // Parallelogram outline A-B-C-D
  const poly = [A0, B0, C0, D0].map((p) => `${SX(p).toFixed(1)},${SY(p).toFixed(1)}`).join(" ");
  elems.push(`<polygon points="${poly}" fill="none" stroke="${GOLD}" stroke-width="2.5"/>`);

  // Extra segments
  for (const seg of segDefs) {
    const p = lookup(seg[0]), q = lookup(seg[1]);
    if (p && q) elems.push(line(SX(p), SY(p), SX(q), SY(q), GOLD, 2));
  }

  // Vertex dots + labels (outward offset)
  const cxAll = (minX + maxX) / 2, cyAll = (minY + maxY) / 2;
  const labelFor = (name: string, p: { x: number; y: number }) => {
    const sx = SX(p), sy = SY(p);
    const outX = p.x < cxAll ? -1 : 1;
    const outY = p.y < cyAll ? 1 : -1; // math-y; SVG flips, so + means downward label
    elems.push(dot(sx, sy));
    elems.push(text(sx + outX * 14, sy - outY * 12 + 4, name, outX < 0 ? "end" : "start"));
  };
  labelFor("A", A0); labelFor("B", B0); labelFor("C", C0); labelFor("D", D0);

  // Midpoint dots + labels
  for (const [name, p] of Object.entries(mids)) {
    const sx = SX(p), sy = SY(p);
    elems.push(dot(sx, sy));
    elems.push(text(sx + 12, sy - 8, name, "start"));
  }

  // Intersection dot + label
  if (inter) {
    const sx = SX(inter.pt), sy = SY(inter.pt);
    elems.push(dot(sx, sy));
    elems.push(text(sx - 12, sy - 8, inter.name, "end"));
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${elems.join("")}</svg>`;
}
