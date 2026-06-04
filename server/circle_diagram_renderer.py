#!/usr/bin/env python3
import html
import json
import math
import sys
from typing import Any, Dict, List, Optional, Tuple

W = 480
H = 360
CX = W / 2
CY = H / 2
DEFAULT_RADIUS_PX = 100.0

GOLD = "#f59e0b"
GREY = "#94a3b8"
DIM = "#64748b"
WHITE = "#f8fafc"
BG = "rgba(0,0,0,0)"
FILL = "rgba(245,158,11,0.08)"


def esc(value: Any) -> str:
  text = str(value)
  text = "".join(ch for ch in text if not 0xD800 <= ord(ch) <= 0xDFFF)
  return html.escape(text, quote=True)


def clean_text(value: Any) -> str:
  if value is None:
    return ""
  text = str(value)
  text = "".join(ch for ch in text if not 0xD800 <= ord(ch) <= 0xDFFF).strip()
  if not text:
    return ""
  if "?" in text:
    return ""
  return text


def fmt_number(value: Any, digits: int = 2) -> str:
  try:
    n = float(value)
  except Exception:
    return ""
  if abs(n - round(n)) < 1e-9:
    return str(int(round(n)))
  text = f"{n:.{digits}f}".rstrip("0").rstrip(".")
  return text


def num(value: Any, default: float) -> float:
  try:
    n = float(value)
  except Exception:
    return default
  return n if math.isfinite(n) else default


def point_on_circle(radius: float, degrees: float) -> Tuple[float, float]:
  rad = math.radians(degrees)
  return (radius * math.cos(rad), radius * math.sin(rad))


class Renderer:
  def __init__(self, data: Dict[str, Any]):
    self.data = data or {}
    self.template = str(self.data.get("template") or self.data.get("type") or "circle").strip()
    self.radius_value = self._radius_value()
    self.scale = DEFAULT_RADIUS_PX / max(self.radius_value, 0.001)
    self.body: List[str] = []

  def _radius_value(self) -> float:
    for key in ("radius", "r", "outer_radius", "label_radius", "label_outer_radius"):
      value = self.data.get(key)
      if value is not None:
        try:
          n = float(value)
          if n > 0:
            return n
        except Exception:
          continue
    return 5.0

  def sx(self, x: float) -> float:
    return CX + x * self.scale

  def sy(self, y: float) -> float:
    return CY - y * self.scale

  def pt(self, x: float, y: float) -> Tuple[float, float]:
    return self.sx(x), self.sy(y)

  def add(self, s: str) -> None:
    self.body.append(s)

  def text(self, x: float, y: float, value: Any, *, fill: str = WHITE, size: int = 12, anchor: str = "middle", weight: str = "700", dx: float = 0, dy: float = 0) -> None:
    text = clean_text(value)
    if not text:
      return
    sx, sy = self.pt(x, y)
    self.add(
      f'<text x="{sx + dx}" y="{sy + dy}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" dominant-baseline="middle" '
      f'fill="none" stroke="#020617" stroke-width="3.5" stroke-linejoin="round">{esc(text)}</text>'
    )
    self.add(
      f'<text x="{sx + dx}" y="{sy + dy}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" dominant-baseline="middle" '
      f'fill="{fill}">{esc(text)}</text>'
    )

  def dot(self, x: float, y: float, label: Any = "", *, fill: str = GOLD, dx: float = 8, dy: float = -10, size: int = 13) -> None:
    sx, sy = self.pt(x, y)
    self.add(f'<circle cx="{sx}" cy="{sy}" r="4" fill="{fill}" />')
    text = clean_text(label)
    if text:
      self.add(
        f'<text x="{sx + dx}" y="{sy + dy}" font-size="{size}" font-weight="700" fill="none" stroke="#020617" stroke-width="4" stroke-linejoin="round">{esc(text)}</text>'
      )
      self.add(
        f'<text x="{sx + dx}" y="{sy + dy}" font-size="{size}" font-weight="700" fill="{WHITE}">{esc(text)}</text>'
      )

  def line(self, a: Tuple[float, float], b: Tuple[float, float], *, stroke: str = GOLD, sw: float = 2.5, dash: str = "") -> None:
    x1, y1 = self.pt(*a)
    x2, y2 = self.pt(*b)
    dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
    self.add(
      f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round"{dash_attr} />'
    )

  def poly(self, pts: List[Tuple[float, float]], *, stroke: str = GOLD, sw: float = 2.5, fill: str = "none") -> None:
    if not pts:
      return
    d = []
    for i, p in enumerate(pts):
      x, y = self.pt(*p)
      d.append(("M" if i == 0 else "L") + f"{x},{y}")
    d.append("Z")
    self.add(f'<path d="{" ".join(d)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" />')

  def arc_path(self, center: Tuple[float, float], radius: float, start_deg: float, end_deg: float, *, large_arc: int = 0, sweep: int = 1) -> str:
    sx, sy = self.pt(*(point_on_circle(center[0] + radius, start_deg)))  # dummy
    # Use direct math conversion to keep coordinates correct.
    start = (center[0] + radius * math.cos(math.radians(start_deg)), center[1] + radius * math.sin(math.radians(start_deg)))
    end = (center[0] + radius * math.cos(math.radians(end_deg)), center[1] + radius * math.sin(math.radians(end_deg)))
    x1, y1 = self.pt(*start)
    x2, y2 = self.pt(*end)
    r_px = radius * self.scale
    return f"M{x1},{y1} A{r_px},{r_px} 0 {large_arc} {sweep} {x2},{y2}"

  def angle_mark(self, v: Tuple[float, float], a: Tuple[float, float], b: Tuple[float, float], *, r: float = 18, label: Any = "", fill: str = DIM) -> None:
    vx, vy = v
    ax, ay = a
    bx, by = b
    va = math.atan2(ay - vy, ax - vx)
    vb = math.atan2(by - vy, bx - vx)
    diff = vb - va
    while diff < 0:
      diff += 2 * math.pi
    sweep = 1 if diff < math.pi else 0
    if diff >= math.pi:
      diff = diff - 2 * math.pi
    mid = va + diff / 2
    x1, y1 = self.pt(vx + r * math.cos(va), vy + r * math.sin(va))
    x2, y2 = self.pt(vx + r * math.cos(vb), vy + r * math.sin(vb))
    x3, y3 = self.pt(vx + (r + 14) * math.cos(mid), vy + (r + 14) * math.sin(mid))
    r_px = r * self.scale
    self.add(f'<path d="M{x1},{y1} A{r_px},{r_px} 0 0 {sweep} {x2},{y2}" fill="none" stroke="{fill}" stroke-width="1.8" />')
    text = clean_text(label)
    if text:
      self.add(
        f'<text x="{x3}" y="{y3}" font-size="11" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="{fill}">{esc(text)}</text>'
      )

  def right_angle_mark(self, v: Tuple[float, float], a: Tuple[float, float], b: Tuple[float, float], *, size: float = 10, fill: str = GREY) -> None:
    vx, vy = v
    ax, ay = a
    bx, by = b
    ua = normalize((ax - vx, ay - vy))
    ub = normalize((bx - vx, by - vy))
    p1 = (vx + ua[0] * size, vy + ua[1] * size)
    p2 = (p1[0] + ub[0] * size, p1[1] + ub[1] * size)
    p3 = (vx + ub[0] * size, vy + ub[1] * size)
    x1, y1 = self.pt(*p1)
    x2, y2 = self.pt(*p2)
    x3, y3 = self.pt(*p3)
    self.add(f'<polyline points="{x1},{y1} {x2},{y2} {x3},{y3}" fill="none" stroke="{fill}" stroke-width="1.8" />')

  def seg_label(self, a: Tuple[float, float], b: Tuple[float, float], label: Any, *, fill: str = DIM) -> None:
    text = clean_text(label)
    if not text:
      return
    ax, ay = a
    bx, by = b
    mx, my = (ax + bx) / 2, (ay + by) / 2
    dx, dy = bx - ax, by - ay
    length = math.hypot(dx, dy) or 1.0
    nx = -dy / length * 14
    ny = dx / length * 14
    x, y = self.pt(mx + nx / self.scale, my + ny / self.scale)
    self.add(
      f'<text x="{x}" y="{y}" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="none" stroke="#020617" stroke-width="3.5" stroke-linejoin="round">{esc(text)}</text>'
    )
    self.add(
      f'<text x="{x}" y="{y}" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="{fill}">{esc(text)}</text>'
    )

  def circle(self, radius: float, *, stroke: str = GREY, fill: str = "none", sw: float = 2.0, opacity: float = 0.65) -> None:
    cx, cy = self.pt(0, 0)
    r_px = radius * self.scale
    self.add(f'<circle cx="{cx}" cy="{cy}" r="{r_px}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-opacity="{opacity}" />')

  def render_explicit_circle_scene(self, scene: dict, explicit_points, relations, givens) -> None:
    xs = [x for _, x, _, _ in explicit_points]
    ys = [y for _, _, y, _ in explicit_points]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    width = max(max_x - min_x, 1.0)
    height = max(max_y - min_y, 1.0)
    margin = 1.2
    scale = min((W - 80) / (width + margin * 2), (H - 80) / (height + margin * 2))

    def project(pt):
      x, y = pt
      px = 40 + (x - min_x + margin) * scale
      py = H - (40 + (y - min_y + margin) * scale)
      return (px, py)

    def draw_line_px(a_px, b_px, stroke=GOLD, sw=2.2, dash=""):
      dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
      self.add(
        f'<line x1="{a_px[0]}" y1="{a_px[1]}" x2="{b_px[0]}" y2="{b_px[1]}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round"{dash_attr} />'
      )

    point_map = {}
    point_meta = {}
    for name, x, y, raw in explicit_points:
      point_map[name] = project((x, y))
      point_meta[name] = raw

    def point_name(value):
      return str(value or "").strip().upper()

    def dot_px(pt_px, label, *, fill=GOLD, dx=8, dy=-10):
      self.add(f'<circle cx="{pt_px[0]}" cy="{pt_px[1]}" r="4" fill="{fill}" />')
      text = clean_text(label)
      if text:
        self.add(
          f'<text x="{pt_px[0] + dx}" y="{pt_px[1] + dy}" font-size="13" font-weight="700" fill="none" stroke="#020617" stroke-width="4" stroke-linejoin="round">{esc(text)}</text>'
        )
        self.add(
          f'<text x="{pt_px[0] + dx}" y="{pt_px[1] + dy}" font-size="13" font-weight="700" fill="{WHITE}">{esc(text)}</text>'
        )

    def seg_label_px(a_name, b_name, text, *, fill=GOLD):
      if not text:
        return
      a_px = point_map.get(point_name(a_name))
      b_px = point_map.get(point_name(b_name))
      if not a_px or not b_px:
        return
      ax, ay = a_px
      bx, by = b_px
      mx, my = (ax + bx) / 2, (ay + by) / 2
      dx, dy = bx - ax, by - ay
      length = math.hypot(dx, dy) or 1.0
      nx = -dy / length * 14
      ny = dx / length * 14
      self.add(
        f'<text x="{mx + nx}" y="{my + ny}" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="none" stroke="#020617" stroke-width="3.5" stroke-linejoin="round">{esc(clean_text(text))}</text>'
      )
      self.add(
        f'<text x="{mx + nx}" y="{my + ny}" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="{fill}">{esc(clean_text(text))}</text>'
      )

    for rel in relations:
      if not isinstance(rel, dict):
        continue
      rel_type = str(rel.get("type") or "").strip()
      if rel_type == "circle":
        center_name = point_name(rel.get("center"))
        center_px = point_map.get(center_name)
        radius = num(rel.get("radius"), None)
        if center_px and radius is not None:
          self.add(f'<circle cx="{center_px[0]}" cy="{center_px[1]}" r="{radius * scale}" fill="none" stroke="{GREY}" stroke-width="2.0" stroke-opacity="0.65" />')

    for rel in relations:
      if not isinstance(rel, dict):
        continue
      rel_type = str(rel.get("type") or "").strip()
      if rel_type == "segment":
        pts = rel.get("points") if isinstance(rel.get("points"), list) else []
        if len(pts) == 2:
          a_px = point_map.get(point_name(pts[0]))
          b_px = point_map.get(point_name(pts[1]))
          if a_px and b_px:
            draw_line_px(a_px, b_px)
      elif rel_type == "right_angle":
        pts = rel.get("points") if isinstance(rel.get("points"), list) else []
        if len(pts) == 3:
          a = point_meta.get(point_name(pts[0]))
          v = point_meta.get(point_name(pts[1]))
          b = point_meta.get(point_name(pts[2]))
          if a and v and b:
            vx, vy = float(v.get("x")), float(v.get("y"))
            ax, ay = float(a.get("x")), float(a.get("y"))
            bx, by = float(b.get("x")), float(b.get("y"))
            ua = normalize((ax - vx, ay - vy))
            ub = normalize((bx - vx, by - vy))
            size = 0.35
            p1 = project((vx + ua[0] * size, vy + ua[1] * size))
            p2 = project((vx + ua[0] * size + ub[0] * size, vy + ua[1] * size + ub[1] * size))
            p3 = project((vx + ub[0] * size, vy + ub[1] * size))
            self.add(f'<polyline points="{p1[0]},{p1[1]} {p2[0]},{p2[1]} {p3[0]},{p3[1]}" fill="none" stroke="{GREY}" stroke-width="1.8" />')
      elif rel_type == "arc":
        center = point_meta.get(point_name(rel.get("center")))
        start = point_meta.get(point_name(rel.get("start")))
        end = point_meta.get(point_name(rel.get("end")))
        radius = num(rel.get("radius"), None)
        if center and start and end and radius is not None:
          cx, cy = float(center.get("x")), float(center.get("y"))
          sx, sy = float(start.get("x")), float(start.get("y"))
          ex, ey = float(end.get("x")), float(end.get("y"))
          start_deg = math.degrees(math.atan2(sy - cy, sx - cx))
          end_deg = math.degrees(math.atan2(ey - cy, ex - cx))
          sweep = (end_deg - start_deg) % 360
          large_arc = 1 if sweep > 180 else 0
          start_px = project((sx, sy))
          end_px = project((ex, ey))
          r_px = radius * scale
          self.add(f'<path d="M {start_px[0]:.2f} {start_px[1]:.2f} A {r_px:.2f} {r_px:.2f} 0 {large_arc} 0 {end_px[0]:.2f} {end_px[1]:.2f}" fill="none" stroke="{GOLD}" stroke-width="2.2" />')
          label = clean_text(rel.get("label"))
          if label:
            mid_deg = math.radians(start_deg + sweep / 2)
            label_pt = project((cx + math.cos(mid_deg) * radius * 1.15, cy + math.sin(mid_deg) * radius * 1.15))
            self.add(
              f'<text x="{label_pt[0]}" y="{label_pt[1]}" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="none" stroke="#020617" stroke-width="3.5" stroke-linejoin="round">{esc(label)}</text>'
            )
            self.add(
              f'<text x="{label_pt[0]}" y="{label_pt[1]}" font-size="12" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="{GOLD}">{esc(label)}</text>'
            )

    for given in givens:
      if not isinstance(given, dict):
        continue
      pts = given.get("points") if isinstance(given.get("points"), list) else []
      if str(given.get("type") or "").strip().lower() == "length" and len(pts) == 2:
        seg_label_px(pts[0], pts[1], fmt_number(given.get("value")))

    center_name = str(scene.get("center") or "O").strip().upper()
    for name, pt_px in point_map.items():
      label = str(point_meta.get(name, {}).get("label") or name).strip()
      if name == center_name:
        dot_px(pt_px, label, fill=WHITE, dx=8, dy=12)
      else:
        dot_px(pt_px, label)

  def render(self) -> str:
    tmpl = self.template
    self.add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="{BG}" />')
    if tmpl == "circle_annulus":
      self.render_annulus()
    elif tmpl == "circle_chord":
      self.render_chord()
    elif tmpl == "circle_sector":
      self.render_sector()
    elif tmpl == "circle_tangent":
      self.render_tangent()
    elif tmpl == "circle_chord_tangent":
      self.render_chord_tangent()
    elif tmpl == "circle_tangent_chord_dual_points":
      self.render_chord_tangent(dual_points=True)
    elif tmpl == "circle_cyclic_quadrilateral":
      self.render_cyclic_quadrilateral()
    elif tmpl == "circle_three_points":
      self.render_three_points()
    elif tmpl == "circle_diameter_points":
      self.render_diameter_points()
    elif tmpl == "circle_intersecting_chords":
      self.render_intersecting_chords()
    elif tmpl == "circle_diameter_chords":
      self.render_diameter_chords()
    elif tmpl == "circle_diameter_tangent_chord":
      self.render_diameter_tangent_chord()
    elif tmpl == "circle_scene":
      self.render_circle_scene()
    else:
      self.render_basic_circle()
    return (
      f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="100%" '
      f'preserveAspectRatio="xMidYMid meet" role="img" aria-label="circle diagram">'
      + "".join(self.body)
      + "</svg>"
    )

  def render_basic_circle(self) -> None:
    r = self.radius_value
    self.circle(r)
    self.line((0, 0), (r, 0), stroke=GREY, sw=1.6, dash="4,3")
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=-16, dy=10)
    self.dot(r, 0, self.data.get("label_A"), fill=GOLD, dx=10, dy=0)
    self.seg_label((0, 0), (r, 0), self.data.get("label_radius"), fill=GREY)

  def render_annulus(self) -> None:
    outer = num(self.data.get("outer_radius"), self.radius_value)
    inner = num(self.data.get("inner_radius"), max(outer * 0.5, 0.5))
    self.circle(outer, stroke=GREY, fill="rgba(248,250,252,0.03)", sw=2.2, opacity=0.75)
    self.circle(inner, stroke=GREY, fill="none", sw=1.6, opacity=0.8)
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=-16, dy=10)
    self.seg_label((0, 0), (outer, 0), self.data.get("label_outer_radius"), fill=GREY)
    self.seg_label((0, 0), (inner, 0), self.data.get("label_inner_radius"), fill=DIM)

  def render_sector(self) -> None:
    r = self.radius_value
    angle = num(self.data.get("angle") or self.data.get("angle_deg") or self.data.get("label_angle"), 60)
    start = num(self.data.get("start_angle"), 90)
    end = start - angle
    a = point_on_circle(r, start)
    b = point_on_circle(r, end)
    large_arc = 1 if angle > 180 else 0
    r_px = r * self.scale
    ax, ay = self.pt(*a)
    bx, by = self.pt(*b)
    cx, cy = self.pt(0, 0)
    self.circle(r)
    self.add(f'<path d="M{cx},{cy} L{ax},{ay} A{r_px},{r_px} 0 {large_arc} 1 {bx},{by} Z" fill="rgba(245,158,11,0.08)" stroke="none" />')
    self.line((0, 0), a, stroke=GREY, sw=1.6, dash="4,3")
    self.line((0, 0), b, stroke=GREY, sw=1.6, dash="4,3")
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=-16, dy=10)
    self.dot(*a, self.data.get("label_A"), fill=GOLD, dx=-18, dy=-8)
    self.dot(*b, self.data.get("label_B"), fill=GOLD, dx=10, dy=-8)
    self.seg_label((0, 0), a, self.data.get("label_radius"), fill=GREY)
    self.seg_label((0, 0), b, None)
    self.text(*point_on_circle(r * 0.62, start - angle / 2), self.data.get("label_arc") or "")
    self.angle_mark((0, 0), a, b, r=22, label=self.data.get("label_angle"), fill=GOLD)

  def render_chord(self) -> None:
    r = self.radius_value
    depth = self.data.get("water_depth", self.data.get("depth"))
    chord_half = self.data.get("chord_half")
    if depth is not None:
      chord_y = num(depth, r / 2) - r
      chord_half = math.sqrt(max(0.0, r * r - chord_y * chord_y))
    else:
      chord_half = num(chord_half, r * 0.6)
      chord_y = math.sqrt(max(0.0, r * r - chord_half * chord_half))
    show_perp = self.data.get("show_perpendicular", True)
    show_oc = show_perp or self.data.get("show_oc") is True or self.data.get("label_oc") is not None
    a = (-chord_half, chord_y)
    b = (chord_half, chord_y)
    c = (0, chord_y)
    self.circle(r)
    self.line(a, b, stroke=GOLD, sw=2.5)
    self.line((0, 0), a, stroke=GREY, sw=1.5, dash="4,3")
    self.line((0, 0), b, stroke=GREY, sw=1.5, dash="4,3")
    if show_oc:
      self.line((0, 0), c, stroke=GOLD, sw=2.0, dash="5,4")
      if show_perp:
        self.right_angle_mark(c, a, (0, 0), size=8)
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=-16, dy=10)
    self.dot(*a, self.data.get("label_A"), fill=GOLD, dx=-18, dy=0)
    self.dot(*b, self.data.get("label_B"), fill=GOLD, dx=10, dy=0)
    self.dot(*c, self.data.get("label_C"), fill=GREY, dx=6, dy=-14)
    self.seg_label((0, 0), a, self.data.get("label_radius"), fill=GREY)
    self.seg_label((0, 0), c, self.data.get("label_oc") or "")
    self.seg_label(a, b, self.data.get("label_chord") or "")
    if depth is not None:
      self.seg_label((r * 0.82, -r), (r * 0.82, chord_y), self.data.get("label_depth"), fill=GOLD)

  def render_tangent(self) -> None:
    r = self.radius_value
    op = num(self.data.get("op_dist"), 0.0)
    tangent_length = self.data.get("tangent_length")
    angle_apb = self.data.get("angle_apb", self.data.get("angle"))
    half_angle = None
    if angle_apb is not None:
      try:
        half_angle = math.radians(float(angle_apb) / 2.0)
      except Exception:
        half_angle = None
    if op <= 0:
      if tangent_length is not None and half_angle is not None:
        op = num(tangent_length, 0.0) / max(math.cos(half_angle), 0.001)
      elif tangent_length is not None:
        op = math.sqrt(r * r + num(tangent_length, 0.0) ** 2)
      else:
        op = r * 2.6
    pa = math.sqrt(max(0.0, op * op - r * r))
    alpha = math.asin(min(0.999, r / op))
    a = (r * math.cos(math.pi / 2 - alpha), r * math.sin(math.pi / 2 - alpha))
    b = (a[0], -a[1])
    p = (op, 0)
    show_oc = self.data.get("show_oc") is True or self.data.get("label_oc") is not None or self.data.get("label_angle_aoc") is not None or self.data.get("show_arc_tangent") is True or self.data.get("show_tangent_at_C") is True
    c_angle = math.radians(num(self.data.get("c_angle"), 110))
    c = (r * math.cos(c_angle), r * math.sin(c_angle))
    tangent_dir = (-math.sin(c_angle), math.cos(c_angle))
    d = (c[0] - tangent_dir[0] * op, c[1] - tangent_dir[1] * op)
    e = (c[0] + tangent_dir[0] * op, c[1] + tangent_dir[1] * op)
    self.circle(r)
    self.line(p, a, stroke=GOLD, sw=2.5)
    self.line(p, b, stroke=GOLD, sw=2.5)
    self.line((0, 0), a, stroke=GREY, sw=1.5, dash="4,3")
    self.line((0, 0), b, stroke=GREY, sw=1.5, dash="4,3")
    self.line((0, 0), p, stroke=GREY, sw=1.2, dash="4,3")
    if show_oc:
      self.line((0, 0), c, stroke=GREY, sw=1.4, dash="4,3")
    self.right_angle_mark(a, (0, 0), p, size=8)
    self.right_angle_mark(b, (0, 0), p, size=8)
    self.line(a, b, stroke=GREY, sw=1.5, dash="4,3")
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=-16, dy=10)
    self.dot(*p, self.data.get("label_P"), fill=GOLD, dx=10, dy=0)
    self.dot(*a, self.data.get("label_A"), fill=GOLD, dx=-8, dy=-14)
    self.dot(*b, self.data.get("label_B"), fill=GOLD, dx=-8, dy=12)
    if show_oc:
      self.dot(*c, self.data.get("label_C"), fill=GOLD, dx=10, dy=-10)
    self.seg_label((0, 0), a, self.data.get("label_radius"), fill=GREY)
    self.seg_label(p, a, self.data.get("label_pa"), fill=GOLD)
    if self.data.get("label_op") is not None:
      self.seg_label((0, 0), p, self.data.get("label_op"), fill=GREY)
    if show_oc and self.data.get("label_oc") is not None:
      self.seg_label((0, 0), c, self.data.get("label_oc"), fill=GREY)
    if self.data.get("label_angle_apb") is not None or angle_apb is not None:
      self.angle_mark(p, a, b, r=24, label=self.data.get("label_angle_apb"), fill=GOLD)
    if self.data.get("label_angle_aoc") is not None and show_oc:
      self.angle_mark((0, 0), a, c, r=24, label=self.data.get("label_angle_aoc"), fill=GOLD)
    if self.data.get("show_arc_tangent") is True:
      self.line(d, e, stroke=GOLD, sw=2.2)
      self.dot(*d, self.data.get("label_D"), fill=GOLD, dx=-18, dy=-10)
      self.dot(*e, self.data.get("label_E"), fill=GOLD, dx=-18, dy=14)
      self.right_angle_mark(c, (0, 0), d, size=8)

  def render_chord_tangent(self, dual_points: bool = False) -> None:
    r = self.radius_value
    angle = num(self.data.get("angle") or self.data.get("angle_pab"), 42)
    theta = math.radians(90 - angle)
    a = (-r, 0)
    chord_len = 2 * r * math.cos(theta)
    b = (a[0] + chord_len * math.cos(theta), a[1] + chord_len * math.sin(theta))
    p = (-r, r * 1.25)
    q = (-r, -r * 1.25)
    angle_a = math.atan2(a[1], a[0])
    angle_b = math.atan2(b[1], b[0])
    sweep = angle_b - angle_a
    while sweep < 0:
      sweep += 2 * math.pi
    if sweep > math.pi:
      sweep -= 2 * math.pi
    if dual_points:
      major = sweep - math.copysign(2 * math.pi, sweep or 1)
      c_angle = angle_a + sweep * 0.28
      d_angle = angle_a + major * 0.72
      c = (r * math.cos(c_angle), r * math.sin(c_angle))
      d = (r * math.cos(d_angle), r * math.sin(d_angle))
    else:
      arc_type = str(self.data.get("arc_type", "")).lower()
      c_angle = angle_a + (sweep * 0.55 if "minor" in arc_type else sweep - math.copysign(math.pi * 0.9, sweep or 1))
      c = (r * math.cos(c_angle), r * math.sin(c_angle))
      d = None
    self.circle(r)
    self.line(p, q, stroke=GOLD, sw=2.5)
    self.line(a, b, stroke=GOLD, sw=2.5)
    self.line(a, c, stroke=GREY, sw=1.4, dash="4,3")
    self.line(b, c, stroke=GREY, sw=1.4, dash="4,3")
    self.line((0, 0), a, stroke=GREY, sw=1.4, dash="4,3")
    self.right_angle_mark(a, (0, 0), p, size=8)
    self.angle_mark(a, p, b, r=24, label=self.data.get("label_angle_apb"), fill=GOLD)
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=8, dy=12)
    self.dot(*p, self.data.get("label_P"), fill=GOLD, dx=-18, dy=-8)
    self.dot(*q, self.data.get("label_Q"), fill=GOLD, dx=-18, dy=14)
    self.dot(*a, self.data.get("label_A"), fill=GOLD, dx=-20, dy=4)
    self.dot(*b, self.data.get("label_B"), fill=GOLD, dx=10, dy=-10)
    self.dot(*c, self.data.get("label_C"), fill=GOLD, dx=10, dy=14)
    if d is not None:
      self.dot(*d, self.data.get("label_D"), fill=GOLD, dx=10, dy=-12)
    if self.data.get("label_angle_adb") is not None:
      self.angle_mark(c, a, b, r=24, label=self.data.get("label_angle_adb"), fill=GOLD)
    if dual_points and d is not None:
      self.line(a, d, stroke=GREY, sw=1.4, dash="4,3")
      self.line(b, d, stroke=GREY, sw=1.4, dash="4,3")

  def render_cyclic_quadrilateral(self) -> None:
    r = self.radius_value
    labels = self.data.get("labels") if isinstance(self.data.get("labels"), list) else []
    angles = self.data.get("angles") or self.data.get("point_angles") or [126, 24, 72, 286]
    pts = [point_on_circle(r, float(a)) for a in angles[:4]]
    angle_labels = [
      self.data.get("label_A"),
      self.data.get("label_B"),
      self.data.get("label_C"),
      self.data.get("label_D"),
    ]
    self.circle(r)
    self.poly(pts, stroke=GOLD, sw=2.4, fill="none")
    if self.data.get("show_center_rays") is True or self.data.get("show_radii") is True or self.data.get("label_oc") is not None or self.data.get("label_angle_aob") is not None:
      for p in pts:
        self.line((0, 0), p, stroke=GREY, sw=1.4, dash="4,3")
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=8, dy=12)
    for idx, p in enumerate(pts):
      self.dot(*p, labels[idx] if idx < len(labels) else "", fill=GOLD, dx=8 if idx != 2 else -18, dy=-10 if idx in (0, 1) else 14)
      angle_text = clean_text(angle_labels[idx] if idx < len(angle_labels) else "")
      if angle_text:
        dx = 16 if idx < 2 else -22
        dy = 16 if idx == 0 else -12
        self.text(p[0], p[1], angle_text, fill=GOLD, size=11, dx=dx, dy=dy)
    if self.data.get("label_E") is not None:
      e = (pts[3][0] + (pts[3][0] - pts[2][0]) * 0.92, pts[3][1] + (pts[3][1] - pts[2][1]) * 0.92)
      self.line(pts[3], e, stroke=GREY, sw=1.5, dash="4,3")
      self.line(pts[0], e, stroke=GOLD, sw=2.2)
      self.dot(*e, self.data.get("label_E"), fill=GOLD, dx=10, dy=10)
    if self.data.get("label_angle_aob") is not None:
      self.angle_mark((0, 0), pts[0], pts[1], r=24, label=self.data.get("label_angle_aob"), fill=GOLD)
    elif self.data.get("label_angle_aoc") is not None:
      self.angle_mark((0, 0), pts[0], pts[2], r=24, label=self.data.get("label_angle_aoc"), fill=GOLD)
    if self.data.get("label_angle_ade") is not None and self.data.get("label_E") is not None:
      e = (pts[3][0] + (pts[3][0] - pts[2][0]) * 0.92, pts[3][1] + (pts[3][1] - pts[2][1]) * 0.92)
      self.angle_mark(pts[3], pts[0], e, r=24, label=self.data.get("label_angle_ade"), fill=GOLD)
    if self.data.get("label_oc") is not None:
      self.seg_label((0, 0), pts[2], self.data.get("label_oc"), fill=GREY)

  def render_three_points(self) -> None:
    r = self.radius_value
    labels = self.data.get("labels") if isinstance(self.data.get("labels"), list) else []
    angles = self.data.get("angles") or self.data.get("point_angles") or [120, 20, -80]
    pts = [point_on_circle(r, float(a)) for a in angles[:3]]
    angle_labels = [self.data.get("label_A"), self.data.get("label_B"), self.data.get("label_C")]
    self.circle(r)
    for p in pts:
      self.line((0, 0), p, stroke=GREY, sw=1.4, dash="4,3")
    self.poly(pts, stroke=GOLD, sw=2.2, fill="none")
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=8, dy=12)
    for idx, p in enumerate(pts):
      self.dot(*p, labels[idx] if idx < len(labels) else "", fill=GOLD, dx=-20 if idx == 0 else 10, dy=-12 if idx != 2 else 14)
      angle_text = clean_text(angle_labels[idx] if idx < len(angle_labels) else "")
      if angle_text:
        self.text(p[0], p[1], angle_text, fill=GOLD, size=11, dx=14 if idx != 2 else -18, dy=-12 if idx != 2 else 14)
    if self.data.get("label_angle_aob") is not None:
      self.angle_mark((0, 0), pts[0], pts[1], r=24, label=self.data.get("label_angle_aob"), fill=GOLD)
    if self.data.get("label_angle_acb") is not None:
      self.angle_mark(pts[2], pts[0], pts[1], r=24, label=self.data.get("label_angle_acb"), fill=GOLD)
    if self.data.get("label_sum") is not None:
      x, y = self.pt(0, r + 0.5)
      self.add(f'<text x="{x}" y="{y}" font-size="12" text-anchor="middle" fill="{GOLD}" font-weight="700">{esc(self.data.get("label_sum"))}</text>')

  def render_diameter_points(self) -> None:
    r = self.radius_value
    side = -1 if str(self.data.get("arc_side", "above")).lower() == "below" else 1
    c_deg = num(self.data.get("c_angle"), 38)
    d_deg = num(self.data.get("d_angle"), 116)
    a = (-r, 0)
    b = (r, 0)
    def arc_point(deg: float) -> Tuple[float, float]:
      rad = math.radians(deg)
      return (r * math.cos(rad), side * r * math.sin(rad))
    c = arc_point(c_deg)
    d = arc_point(d_deg)
    self.circle(r)
    self.line(a, b, stroke=GOLD, sw=2.6)
    self.line(a, c, stroke=GREY, sw=1.5, dash="4,3")
    self.line(b, c, stroke=GREY, sw=1.5, dash="4,3")
    self.line(a, d, stroke=GOLD, sw=2.2)
    self.line(d, c, stroke=GOLD, sw=2.2)
    self.line(c, b, stroke=GOLD, sw=2.2)
    if self.data.get("show_oc") is True or self.data.get("label_oc") is not None or self.data.get("label_angle_aoc") is not None:
      self.line((0, 0), c, stroke=GREY, sw=1.5, dash="4,3")
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=8, dy=12)
    self.dot(*a, self.data.get("label_A"), fill=GOLD, dx=-20, dy=0)
    self.dot(*b, self.data.get("label_B"), fill=GOLD, dx=10, dy=0)
    self.dot(*c, self.data.get("label_C"), fill=GOLD, dx=10, dy=10)
    self.dot(*d, self.data.get("label_D"), fill=GOLD, dx=8, dy=-12)
    for point, label, dx, dy in [
      (a, self.data.get("label_A"), -24, 14),
      (b, self.data.get("label_B"), 12, 14),
      (c, self.data.get("label_C"), 12, -12),
      (d, self.data.get("label_D"), 12, 14),
    ]:
      angle_text = clean_text(label)
      if angle_text:
        self.text(point[0], point[1], angle_text, fill=GOLD, size=11, dx=dx, dy=dy)
    if self.data.get("label_ab") is not None:
      self.seg_label(a, b, self.data.get("label_ab"), fill=GOLD)
    if self.data.get("label_oc") is not None:
      self.seg_label((0, 0), c, self.data.get("label_oc"), fill=GREY)
    if self.data.get("label_angle_bcd") is not None:
      self.angle_mark(c, b, d, r=20, label=self.data.get("label_angle_bcd"), fill=GOLD)
    if self.data.get("label_angle_abd") is not None:
      self.angle_mark(b, a, d, r=20, label=self.data.get("label_angle_abd"), fill=GOLD)
    if self.data.get("label_angle_cad") is not None:
      self.angle_mark(a, c, d, r=24, label=self.data.get("label_angle_cad"), fill=GOLD)
    if self.data.get("label_angle_aoc") is not None:
      self.angle_mark((0, 0), a, c, r=24, label=self.data.get("label_angle_aoc"), fill=GOLD)

  def render_intersecting_chords(self) -> None:
    ap = num(self.data.get("ap"), 4)
    pb = num(self.data.get("pb"), 6)
    cp = self.data.get("cp")
    cd = self.data.get("cd")
    cp_ratio = self.data.get("cp_pd_ratio", self.data.get("ratio_cp_pd", self.data.get("cp_to_pd", self.data.get("ratio"))))
    cp_diff = self.data.get("cp_minus_pd", self.data.get("cp_pd_diff", self.data.get("cp_gt_pd_by", self.data.get("difference"))))
    angle = num(self.data.get("angle"), 62)
    product = ap * pb
    if cp is not None:
      cp = num(cp, 3)
      pd = product / max(cp, 0.001)
    elif cp_ratio is not None:
      ratio = num(cp_ratio, 1.0)
      cp = math.sqrt(max(0.001, product * ratio))
      pd = product / max(cp, 0.001)
    elif cp_diff is not None:
      diff = num(cp_diff, 0.0)
      pd = (-diff + math.sqrt(diff * diff + 4 * product)) / 2.0
      cp = pd + diff
    elif cd is not None:
      cd_val = num(cd, 10.0)
      cp = cd_val * 0.35
      pd = max(0.5, cd_val - cp)
    else:
      cp = 3.0
      pd = product / cp
    a = (-ap, 0)
    b = (pb, 0)
    c = (-cp * math.cos(math.radians(angle)), cp * math.sin(math.radians(angle)))
    d = (pd * math.cos(math.radians(angle)), -pd * math.sin(math.radians(angle)))
    # Try to fit a circle through A, B, C
    circle = circumcircle(a, b, c)
    if circle:
      self.circle(circle[2], stroke=GREY, fill="none", sw=2.0, opacity=0.65)
    else:
      self.circle(max(ap, pb, cp, pd), stroke=GREY, fill="none", sw=2.0, opacity=0.65)
    self.line(a, b, stroke=GOLD, sw=2.5)
    self.line(c, d, stroke=GOLD, sw=2.5)
    self.line(a, c, stroke=GREY, sw=1.4, dash="4,3")
    self.line(b, c, stroke=GREY, sw=1.4, dash="4,3")
    self.line(a, d, stroke=GREY, sw=1.4, dash="4,3")
    self.line(b, d, stroke=GREY, sw=1.4, dash="4,3")
    self.dot(0, 0, self.data.get("label_P"), fill=WHITE, dx=8, dy=-10)
    self.dot(*a, self.data.get("label_A"), fill=GOLD, dx=-16, dy=-10)
    self.dot(*b, self.data.get("label_B"), fill=GOLD, dx=10, dy=-10)
    self.dot(*c, self.data.get("label_C"), fill=GOLD, dx=-12, dy=-12)
    self.dot(*d, self.data.get("label_D"), fill=GOLD, dx=8, dy=14)
    self.seg_label(a, (0, 0), self.data.get("label_ap"), fill=GOLD)
    self.seg_label((0, 0), b, self.data.get("label_pb"), fill=GOLD)
    if self.data.get("label_cp") is not None:
      self.seg_label(c, (0, 0), self.data.get("label_cp"), fill=GOLD)
    if self.data.get("label_pd") is not None:
      self.seg_label((0, 0), d, self.data.get("label_pd"), fill=GOLD)
    if self.data.get("label_cd") is not None or cd is not None:
      self.seg_label(c, d, self.data.get("label_cd"), fill=GOLD)
    if self.data.get("label_ratio") is not None:
      self.text((c[0] + d[0]) / 2, (c[1] + d[1]) / 2, self.data.get("label_ratio"), fill=GOLD, dx=12, dy=0)
    if self.data.get("label_difference") is not None:
      self.text((c[0] + d[0]) / 2, (c[1] + d[1]) / 2 - 18, self.data.get("label_difference"), fill=GOLD, dx=12, dy=0)

  def render_diameter_chords(self) -> None:
    r = num(self.data.get("radius"), 5.0)
    c_deg = num(self.data.get("c_angle"), 58.0)
    d_deg = num(self.data.get("d_angle"), 302.0)
    show_right_angle = bool(self.data.get("show_right_angle") or self.data.get("show_perpendicular"))

    a = (-r, 0)
    b = (r, 0)
    c = point_on_circle(r, c_deg)
    d = point_on_circle(r, d_deg)
    e = line_intersection(a, c, b, d) or (0.0, 0.0)
    self.circle(r, stroke=GREY, fill="none", sw=2.0, opacity=0.65)
    self.line(a, b, stroke=GOLD, sw=2.5)
    self.line(a, c, stroke=GOLD, sw=2.2)
    self.line(b, d, stroke=GOLD, sw=2.2)
    self.dot(*e, self.data.get("label_E"), fill=WHITE, dx=8, dy=-10)
    self.dot(*a, self.data.get("label_A"), fill=GOLD, dx=-16, dy=0)
    self.dot(*b, self.data.get("label_B"), fill=GOLD, dx=10, dy=0)
    self.dot(*c, self.data.get("label_C"), fill=GOLD, dx=10, dy=-12)
    self.dot(*d, self.data.get("label_D"), fill=GOLD, dx=10, dy=14)
    self.dot(0, 0, self.data.get("label_O"), fill=WHITE, dx=8, dy=12)
    if show_right_angle:
      self.right_angle_mark(e, a, b, size=9, fill=GREY)
    if self.data.get("label_ab") is not None:
      self.seg_label(a, b, self.data.get("label_ab"), fill=GOLD)
    if self.data.get("label_ac") is not None:
      self.seg_label(a, c, self.data.get("label_ac"), fill=GOLD)
    if self.data.get("label_bd") is not None:
      self.seg_label(b, d, self.data.get("label_bd"), fill=GOLD)
    if self.data.get("label_ae") is not None:
      self.seg_label(a, e, self.data.get("label_ae"), fill=GREY)
    if self.data.get("label_be") is not None:
      self.seg_label(b, e, self.data.get("label_be"), fill=GREY)

  def render_diameter_tangent_chord(self) -> None:
    r = num(self.data.get("radius"), 5.0)
    c_deg = num(self.data.get("c_angle"), 58.0)
    d_deg = num(self.data.get("d_angle"), 310.0)

    a = (-r, 0)
    b = (r, 0)
    c = point_on_circle(r, c_deg)
    d = point_on_circle(r, d_deg)
    e = line_intersection(a, b, c, d) or (0.0, 0.0)
    p = (r / max(math.cos(math.radians(c_deg)), 1e-6), 0.0)
    tangent_dir = normalize((p[0] - c[0], p[1] - c[1]))
    tangent_a = (c[0] - tangent_dir[0] * math.hypot(p[0] - c[0], p[1] - c[1]) * 0.55, c[1] - tangent_dir[1] * math.hypot(p[0] - c[0], p[1] - c[1]) * 0.55)

    self.circle(r, stroke=GREY, fill="none", sw=2.0, opacity=0.65)
    self.line(a, b, stroke=GOLD, sw=2.5)
    self.line(a, c, stroke=GOLD, sw=2.2)
    self.line(a, d, stroke=GOLD, sw=2.2)
    self.line(c, d, stroke=GOLD, sw=2.2)
    self.line(c, p, stroke=GREY, sw=1.8, dash="4,3")
    self.dot(*a, self.data.get("label_A", "A"), fill=GOLD, dx=-16, dy=0)
    self.dot(*b, self.data.get("label_B", "B"), fill=GOLD, dx=10, dy=0)
    self.dot(*c, self.data.get("label_C", "C"), fill=GOLD, dx=10, dy=-12)
    self.dot(*d, self.data.get("label_D", "D"), fill=GOLD, dx=10, dy=14)
    self.dot(*e, self.data.get("label_E", "E"), fill=WHITE, dx=8, dy=-10)
    self.dot(*p, self.data.get("label_P", "P"), fill=WHITE, dx=10, dy=0)
    self.dot(0, 0, self.data.get("label_O", "O"), fill=WHITE, dx=8, dy=12)
    self.right_angle_mark(c, (0, 0), p, size=9, fill=GREY)
    if self.data.get("label_ab") is not None:
      self.seg_label(a, b, self.data.get("label_ab"), fill=GOLD)
    if self.data.get("label_ac") is not None:
      self.seg_label(a, c, self.data.get("label_ac"), fill=GOLD)
    if self.data.get("label_bc") is not None:
      self.seg_label(b, c, self.data.get("label_bc"), fill=GOLD)
    if self.data.get("label_ad") is not None:
      self.seg_label(a, d, self.data.get("label_ad"), fill=GOLD)
    if self.data.get("label_cp") is not None:
      self.seg_label(c, p, self.data.get("label_cp"), fill=GOLD)
    if self.data.get("label_ae") is not None:
      self.seg_label(a, e, self.data.get("label_ae"), fill=GREY)
    if self.data.get("label_ed") is not None:
      self.seg_label(e, d, self.data.get("label_ed"), fill=GREY)

  def render_circle_scene(self) -> None:
    scene = self.data.get("scene") if isinstance(self.data.get("scene"), dict) else self.data
    if not isinstance(scene, dict):
      scene = {}

    points = scene.get("points") if isinstance(scene.get("points"), list) else []
    relations = scene.get("relations") if isinstance(scene.get("relations"), list) else []
    givens = scene.get("givens") if isinstance(scene.get("givens"), list) else []
    display = scene.get("display") if isinstance(scene.get("display"), dict) else {}

    explicit_points = []
    for point in points:
      if not isinstance(point, dict):
        continue
      x = num(point.get("x"), None)
      y = num(point.get("y"), None)
      name = str(point.get("name") or point.get("label") or point.get("id") or "").strip().upper()
      if x is None or y is None or not name:
        continue
      explicit_points.append((name, x, y, point))

    if explicit_points and any(isinstance(rel, dict) and str(rel.get("type") or "").strip() in {"segment", "circle", "right_angle", "arc"} for rel in relations):
      self.render_explicit_circle_scene(scene, explicit_points, relations, givens)
      return

    r = num(scene.get("radius"), num(self.data.get("radius"), 5.0))
    angle_apb = None
    for given in givens:
      if not isinstance(given, dict):
        continue
      given_name = str(given.get("name") or given.get("label") or given.get("key") or "").strip().lower()
      if given_name in {"angle_apb", "anglepab", "angle_apb_deg"}:
        angle_value = num(given.get("value"), None)
        if angle_value is not None:
          angle_apb = angle_value
        break
    if angle_apb is not None and 0 < angle_apb < 179:
      p_dist = r / max(math.cos(math.radians(angle_apb / 2)), 0.18)
    else:
      p_dist = max(r * 1.8, r + 1.5)

    o = (0.0, 0.0)
    p = (p_dist, 0.0)
    tangent_x = num(scene.get("tangentX"), r)

    # Canonical placements for the trial: external point P to the right,
    # tangent points A/B from P, and arc point C on the chosen arc side.
    chord_x = (r * r) / max(p_dist, 1e-6)
    chord_y = math.sqrt(max(r * r - chord_x * chord_x, 0.0))
    a = (chord_x, chord_y)
    b = (chord_x, -chord_y)

    arc_point_counts = {"minor": 0, "major": 0}
    named_points: dict[str, tuple[float, float]] = {"O": o, "P": p, "A": a, "B": b}

    def arc_point_angle(arc_side: str, index: int) -> float:
      if arc_side == "major":
        choices = [180.0, 165.0, 195.0, 150.0, 210.0]
      else:
        choices = [0.0, 15.0, -15.0, 30.0, -30.0]
      return choices[min(index, len(choices) - 1)]

    for point in points:
      if not isinstance(point, dict):
        continue
      name = str(point.get("name") or point.get("label") or point.get("point") or "").strip().upper()
      role = str(point.get("role") or point.get("kind") or "").strip().lower()
      arc_side = str(point.get("arcSide") or point.get("arc_side") or "minor").strip().lower()

      if not name:
        continue
      if name in named_points:
        continue

      if role == "external_point":
        named_points[name] = (p_dist * 1.15, 0.0)
      elif role == "tangent_point":
        named_points[name] = a if name == "A" else b if name == "B" else (chord_x, 0.0)
      elif role == "arc_point":
        idx = arc_point_counts[arc_side] if arc_side in arc_point_counts else 0
        arc_point_counts[arc_side] = idx + 1
        deg = arc_point_angle(arc_side, idx)
        named_points[name] = point_on_circle(r, deg)
      elif role == "foot_point":
        named_points[name] = (chord_x, 0.0)
      else:
        named_points[name] = (0.0, 0.0)

    c = named_points.get("C", point_on_circle(r, 0.0))
    named_points["C"] = c
    c_tangent_dir = normalize((-c[1], c[0]))
    tangent_span = max(r * 1.9, 6.0)
    t1 = (c[0] - c_tangent_dir[0] * tangent_span, c[1] - c_tangent_dir[1] * tangent_span)
    t2 = (c[0] + c_tangent_dir[0] * tangent_span, c[1] + c_tangent_dir[1] * tangent_span)

    ab = line_intersection(a, b, o, c)
    d = line_intersection(a, p, t1, t2) or (c[0] + 0.8, c[1] + 0.8)
    e = line_intersection(b, p, t1, t2) or (c[0] + 0.8, c[1] - 0.8)
    f = line_intersection(o, c, a, b) or (0.0, 0.0)

    named_points.setdefault("D", d)
    named_points.setdefault("E", e)
    named_points.setdefault("F", f)

    self.circle(r, stroke=GREY, fill="none", sw=2.0, opacity=0.65)

    if display.get("showABChord") or any(
      isinstance(rel, dict)
      and str(rel.get("type") or "").strip() == "intersection"
      and set(map(str.upper, map(str, rel.get("of") or []))) == {"OC", "AB"}
      for rel in relations
    ):
      self.line(a, b, stroke=GREY, sw=1.8, dash="4,3")

    self.line(a, p, stroke=GOLD, sw=2.5)
    self.line(b, p, stroke=GOLD, sw=2.5)

    if display.get("showOC", True):
      self.line(o, c, stroke=GREY, sw=1.8, dash="4,3")

    if display.get("showTangentAtC", True):
      self.line(t1, t2, stroke=GOLD, sw=2.2)

    self.dot(*o, scene.get("center", "O"), fill=WHITE, dx=8, dy=12)
    self.dot(*p, "P", fill=WHITE, dx=10, dy=0)

    for name in [point.get("name") for point in points if isinstance(point, dict)]:
      if not isinstance(name, str):
        continue
      pt = named_points.get(name.upper())
      if not pt:
        continue
      role = next((str(point.get("role") or "").strip().lower() for point in points if isinstance(point, dict) and str(point.get("name") or "").strip().upper() == name.upper()), "")
      if name.upper() == "O":
        continue
      if role == "arc_point":
        self.dot(*pt, name.upper(), fill=GOLD, dx=10, dy=-12)
      elif role == "intersection_point":
        offset = {"D": (10, -12), "E": (10, 12), "F": (-12, 14)}.get(name.upper(), (10, -10))
        self.dot(*pt, name.upper(), fill=GOLD, dx=offset[0], dy=offset[1])
      elif role == "foot_point":
        self.dot(*pt, name.upper(), fill=WHITE, dx=-12, dy=14)
      elif role == "tangent_point":
        offset = {"A": (-16, 0), "B": (10, 0)}.get(name.upper(), (10, -10))
        self.dot(*pt, name.upper(), fill=GOLD, dx=offset[0], dy=offset[1])
      elif role == "external_point":
        self.dot(*pt, name.upper(), fill=WHITE, dx=10, dy=0)

    for given in givens:
      if not isinstance(given, dict):
        continue
      given_name = str(given.get("name") or given.get("label") or given.get("key") or "").strip().upper()
      given_value = given.get("value")
      label_text = fmt_number(given_value)
      if not label_text:
        continue
      if given_name == "PA":
        self.seg_label(p, a, label_text, fill=GOLD)
      elif given_name == "PB":
        self.seg_label(p, b, label_text, fill=GOLD)
      elif given_name == "OC":
        self.seg_label(o, c, label_text, fill=GREY)
      elif given_name == "AB":
        self.seg_label(a, b, label_text, fill=GREY)

    if angle_apb is not None:
      self.angle_mark(p, a, b, r=18, label=f"{fmt_number(angle_apb)}°", fill=GOLD)


def normalize(v: Tuple[float, float]) -> Tuple[float, float]:
  x, y = v
  length = math.hypot(x, y) or 1.0
  return (x / length, y / length)


def line_intersection(a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float], d: Tuple[float, float]) -> Optional[Tuple[float, float]]:
  x1, y1 = a
  x2, y2 = b
  x3, y3 = c
  x4, y4 = d
  den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if abs(den) < 1e-9:
    return None
  px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den
  py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den
  return (px, py)


def circumcircle(a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> Optional[Tuple[float, float, float]]:
  ax, ay = a
  bx, by = b
  cx, cy = c
  d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
  if abs(d) < 1e-9:
    return None
  ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d
  uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d
  r = math.hypot(ax - ux, ay - uy)
  return ux, uy, r


def main() -> int:
  raw = sys.stdin.read()
  try:
    payload = json.loads(raw or "{}")
  except Exception as exc:
    sys.stderr.write(f"invalid json: {exc}\n")
    return 1
  renderer = Renderer(payload if isinstance(payload, dict) else {})
  svg = renderer.render()
  sys.stdout.buffer.write(svg.encode("utf-8"))
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
