import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface DiagramElement {
  type: 'point' | 'line' | 'circle' | 'polygon' | 'text' | 'axis' | 'ellipse';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  radius?: number;
  rx?: number; // For ellipses
  ry?: number; // For ellipses
  points?: [number, number][];
  label?: string;
  color?: string;
  strokeWidth?: number;
  dash?: string;
  opacity?: number;
  importance?: 'primary' | 'secondary' | 'helper';
  text?: string;
  fontSize?: number;
}

export interface DiagramConfig {
  viewport?: [number, number, number, number]; // [xMin, yMin, xMax, yMax]
  grid?: boolean;
  axes?: boolean;
}

interface MathDiagramProps {
  data: {
    config?: DiagramConfig;
    elements: DiagramElement[];
  } | string;
}

const normalizeData = (data: any): { config: DiagramConfig; elements: DiagramElement[] } => {
  const pts: Record<string, { x: number; y: number }> = {};
  const elements: DiagramElement[] = [];
  const coords: [number, number][] = [];

  const trackPt = (x: number, y: number) => {
    if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
      coords.push([x, y]);
    }
  };

  const regPt = (name: string, x: number, y: number) => {
    pts[name] = { x, y };
    trackPt(x, y);
    elements.push({ type: 'point', x, y, label: name });
  };

  // If it's already in the canonical format
  if (data.elements && Array.isArray(data.elements)) {
    const rawElements = data.elements as DiagramElement[];
    rawElements.forEach(el => {
      if (el.x !== undefined && el.y !== undefined) trackPt(el.x, el.y);
      if (el.x1 !== undefined && el.y1 !== undefined) trackPt(el.x1, el.y1);
      if (el.x2 !== undefined && el.y2 !== undefined) trackPt(el.x2, el.y2);
      if (el.points) el.points.forEach(p => trackPt(p[0], p[1]));
    });

    const viewport = data.config?.viewport || (data.window ? [
      (data.window?.xmin ?? data.window?.xMin ?? -10),
      (data.window?.ymin ?? data.window?.yMin ?? -10),
      (data.window?.xmax ?? data.window?.xMax ?? 10),
      (data.window?.ymax ?? data.window?.yMax ?? 10)
    ] : null);

    if (viewport) {
      return {
        config: {
          viewport: viewport as [number, number, number, number],
          grid: data.config?.grid ?? data.showGrid ?? false,
          axes: data.config?.axes ?? data.showAxes ?? false
        },
        elements: rawElements
      };
    }
    // No viewport? We'll calculate it below
    elements.push(...rawElements);
  }
  
  // Handle format: { points: [{x, y, label}], lines: [{start, end}] }
  if (data.points && Array.isArray(data.points)) {
    data.points.forEach((p: any) => {
      const x = Number(p.x ?? 0);
      const y = Number(p.y ?? 0);
      const label = p.label || p.id || 'P';
      regPt(label, x, y);
    });
  }

  if (data.lines && Array.isArray(data.lines)) {
    data.lines.forEach((line: any) => {
      const p1 = pts[line.start || line.from];
      const p2 = pts[line.end || line.to];
      if (p1 && p2) {
        elements.push({ type: 'line', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, importance: 'primary' });
      }
    });
  }

  const config = {
    viewport: data.config?.viewport || (data.window ? [
      (data.window?.xmin ?? data.window?.xMin ?? -2),
      (data.window?.ymin ?? data.window?.yMin ?? -2),
      (data.window?.xmax ?? data.window?.xMax ?? 12),
      (data.window?.ymax ?? data.window?.yMax ?? 10)
    ] : null),
    grid: data.config?.grid ?? data.showGrid ?? false,
    axes: data.config?.axes ?? data.showAxes ?? false
  };

  // Helper for distance
  const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) => 
    Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

  // Helper for reflection
  const reflect = (p: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-9) return p;
    const t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq;
    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;
    return { x: 2 * projX - p.x, y: 2 * projY - p.y };
  };

  // Handle "objects" or "elements" array
  const objList = data.objects || data.elements || [];
  if (Array.isArray(objList)) {
    objList.forEach((obj: any) => {
      const type = obj.type || obj.kind;
      if (type === 'polygon' && Array.isArray(obj.points)) {
        const mapped = obj.points.map((p: any) => {
          const px = Number(Array.isArray(p) ? p[0] : (p.x ?? 0));
          const py = Number(Array.isArray(p) ? p[1] : (p.y ?? 0));
          trackPt(px, py);
          return [px, py] as [number, number];
        });
        elements.push({ 
          type: 'polygon', 
          points: mapped, 
          color: obj.color,
          opacity: obj.opacity,
          importance: obj.importance || obj.role
        });
        if (obj.label && typeof obj.label === 'string') {
          const lbls = obj.label.split('');
          mapped.forEach((p, i) => { if (lbls[i]) regPt(lbls[i], p[0], p[1]); });
        }
      } else if ((type === 'line' || type === 'segment') && Array.isArray(obj.points)) {
        const [p1, p2] = obj.points;
        const x1 = Number(Array.isArray(p1) ? p1[0] : (p1.x ?? 0));
        const y1 = Number(Array.isArray(p1) ? p1[1] : (p1.y ?? 0));
        const x2 = Number(Array.isArray(p2) ? p2[0] : (p2.x ?? 0));
        const y2 = Number(Array.isArray(p2) ? p2[1] : (p2.y ?? 0));
        trackPt(x1, y1); trackPt(x2, y2);
        elements.push({ 
          type: 'line', 
          x1, y1, x2, y2, 
          dash: obj.style === 'dashed' ? '5,5' : obj.dash, 
          label: obj.label,
          color: obj.color,
          strokeWidth: obj.strokeWidth,
          opacity: obj.opacity,
          importance: obj.importance || obj.role
        });
      }
    });
  }

  // If we have geometry_desc
  if (data.type === 'geometry_desc' && Array.isArray(data.shapes)) {
    data.shapes.forEach((s: any) => {
      const kind = s.kind || s.type;

      if (kind === 'rectangle' || kind === 'square') {
        const w = s.width || s.side || 10;
        const h = s.height || s.side || 8;
        const labelStr = s.label || 'ABCD';
        const labels = labelStr.split('');
        
        // Mapping: A(TL), B(BL), C(BR), D(TR) -> AB is vertical, BC is horizontal
        const rectPts = [
          { x: 0, y: h, name: labels[0] || 'A' },
          { x: 0, y: 0, name: labels[1] || 'B' },
          { x: w, y: 0, name: labels[2] || 'C' },
          { x: w, y: h, name: labels[3] || 'D' }
        ];
        
        rectPts.forEach((p) => {
          regPt(p.name, p.x, p.y);
        });
        
        elements.push({
          type: 'polygon',
          points: rectPts.map(p => [p.x, p.y]),
          color: s.color || 'rgba(0,180,255,0.1)'
        });
        // Connect points for lines
        rectPts.forEach((p, i) => {
          const next = rectPts[(i + 1) % 4];
          elements.push({ type: 'line', x1: p.x, y1: p.y, x2: next.x, y2: next.y });
        });
      }
      else if (kind === 'cylinder') {
        const r = s.radius || 4;
        const h = s.height || 10;
        const cx = s.cx || 0;
        const cy = s.cy || 0;
        
        // Bottom ellipse
        elements.push({ type: 'ellipse', x: cx, y: cy, rx: r, ry: r * 0.3, importance: 'primary' });
        // Top ellipse
        elements.push({ type: 'ellipse', x: cx, y: cy + h, rx: r, ry: r * 0.3, importance: 'primary' });
        // Side lines
        elements.push({ type: 'line', x1: cx - r, y1: cy, x2: cx - r, y2: cy + h, importance: 'primary' });
        elements.push({ type: 'line', x1: cx + r, y1: cy, x2: cx + r, y2: cy + h, importance: 'primary' });
        
        trackPt(cx - r, cy - r * 0.3);
        trackPt(cx + r, cy + h + r * 0.3);
      }
      else if (kind === 'cube' || kind === 'box') {
        const s_ = s.side || 6;
        const w = s.width || s_;
        const h = s.height || s_;
        const d = s.depth || s_ * 0.6;
        const x = s.x || 0;
        const y = s.y || 0;
        
        // Front face
        const front = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as [number, number][];
        // Back face (offset)
        const ox = d * 0.7;
        const oy = d * 0.4;
        const back = [[x + ox, y + oy], [x + w + ox, y + oy], [x + w + ox, y + h + oy], [x + ox, y + h + oy]] as [number, number][];
        
        elements.push({ type: 'polygon', points: front, color: 'rgba(255,255,255,0.05)' });
        elements.push({ type: 'polygon', points: back, color: 'rgba(255,255,255,0.05)', dash: '2,2' });
        
        // Connect corners
        for (let i = 0; i < 4; i++) {
          elements.push({ type: 'line', x1: front[i][0], y1: front[i][1], x2: back[i][0], y2: back[i][1], importance: (i === 0 ? 'secondary' : 'primary') });
          const next = (i + 1) % 4;
          elements.push({ type: 'line', x1: front[i][0], y1: front[i][1], x2: front[next][0], y2: front[next][1], importance: 'primary' });
          elements.push({ type: 'line', x1: back[i][0], y1: back[i][1], x2: back[next][0], y2: back[next][1], importance: 'primary' });
        }
        
        trackPt(x, y);
        trackPt(x + w + ox, y + h + oy);
      }
      else if (kind === 'triangle') {
        const labels = (s.label || 'ABC').split('');
        let triPts: { x: number; y: number }[] = [];

        if (s.right_angle) {
          const a = s.leg1 || 6;
          const b = s.leg2 || 8;
          triPts = [{ x: 0, y: b }, { x: 0, y: 0 }, { x: a, y: 0 }];
        } else if (s.sides) {
          const [sa, sb, sc] = s.sides;
          const cosB = (sb**2 + sa**2 - sc**2) / (2 * sb * sa);
          const sinB = Math.sqrt(Math.max(0, 1 - cosB**2));
          triPts = [{ x: sb * cosB, y: sb * sinB }, { x: 0, y: 0 }, { x: sa, y: 0 }];
        } else if (s.points) {
          triPts = s.points.map((p: any) => ({ x: Number(Array.isArray(p) ? p[0] : p.x), y: Number(Array.isArray(p) ? p[1] : p.y) }));
        } else {
          triPts = [{ x: 0, y: 8 }, { x: 0, y: 0 }, { x: 6, y: 0 }];
        }

        triPts.forEach((p, i) => {
          if (labels[i]) regPt(labels[i], p.x, p.y);
        });
        
        elements.push({
          type: 'polygon',
          points: triPts.map(p => [p.x, p.y]),
          color: s.color || 'rgba(0,180,255,0.1)'
        });
      }
      else if (kind === 'circle') {
        const r = s.radius || 5;
        const cx = s.cx || 0;
        const cy = s.cy || 0;
        if (s.center) regPt(s.center, cx, cy);
        trackPt(cx - r, cy - r);
        trackPt(cx + r, cy + r);
        elements.push({ type: 'circle', x: cx, y: cy, radius: r, label: s.radiusLabel });
      }
      else if (kind === 'point_on_side') {
        const p1 = pts[s.from];
        const p2 = pts[s.to];
        if (p1 && p2) {
          const total = dist(p1, p2);
          const val = s.value || (total * (s.ratio || 0.5));
          const t = val / total;
          const px = p1.x + (p2.x - p1.x) * t;
          const py = p1.y + (p2.y - p1.y) * t;
          regPt(s.label, px, py);
        }
      }
      else if (kind === 'point_on_extension') {
        const p1 = pts[s.from];
        const p2 = pts[s.to];
        if (p1 && p2) {
          const d = dist(p1, p2);
          const ext = s.distance || (d * 0.5);
          const px = p2.x + (p2.x - p1.x) * (ext / d);
          const py = p2.y + (p2.y - p1.y) * (ext / d);
          regPt(s.label, px, py);
        }
      }
      else if (kind === 'segment' || kind === 'line') {
        const p1 = pts[s.from];
        const p2 = pts[s.to];
        if (p1 && p2) {
          elements.push({ type: 'line', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, dash: s.dash ? '5,5' : undefined });
        }
      }
      else if (kind === 'dimension') {
        const p1 = pts[s.from];
        const p2 = pts[s.to];
        if (p1 && p2) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          elements.push({ type: 'text', x: mx, y: my, label: s.text });
        }
      }
      else if (kind === 'reflection' || kind === 'mirror') {
        const targetPt = pts[s.point];
        const lineP1 = pts[s.from || (s.line && s.line[0])];
        const lineP2 = pts[s.to || (s.line && s.line[1])];
        if (targetPt && lineP1 && lineP2) {
          const reflected = reflect(targetPt, lineP1, lineP2);
          regPt(s.label, reflected.x, reflected.y);
        }
      }
      else if (kind === 'point') {
        const px = s.x ?? (s.pos ? s.pos[0] : 0);
        const py = s.y ?? (s.pos ? s.pos[1] : 0);
        regPt(s.label, px, py);
      }
    });
  }

  // Handle generic "geometry" or "objects" list (seen in some model outputs)
  const genericList = data.geometry || data.objects || data.elements || [];
  if (Array.isArray(genericList)) {
    genericList.forEach((obj: any) => {
      const type = obj.type || obj.kind;
      if (type === 'polygon' && Array.isArray(obj.points)) {
        const mapped = obj.points.map((p: any) => {
          const px = Number(Array.isArray(p) ? p[0] : (p.x ?? 0));
          const py = Number(Array.isArray(p) ? p[1] : (p.y ?? 0));
          trackPt(px, py);
          return [px, py] as [number, number];
        });
        elements.push({ type: 'polygon', points: mapped, color: obj.color || 'rgba(0,180,255,0.1)' });
      } else if (type === 'point') {
        const px = Number(obj.x ?? (obj.pos ? obj.pos[0] : 0));
        const py = Number(obj.y ?? (obj.pos ? obj.pos[1] : 0));
        regPt(obj.label || 'P', px, py);
      } else if (type === 'line' || type === 'segment') {
        const pts_ = obj.points || [[obj.x1, obj.y1], [obj.x2, obj.y2]];
        if (pts_.length >= 2) {
          const p1 = pts_[0], p2 = pts_[1];
          const x1 = Number(Array.isArray(p1) ? p1[0] : (p1.x ?? 0));
          const y1 = Number(Array.isArray(p1) ? p1[1] : (p1.y ?? 0));
          const x2 = Number(Array.isArray(p2) ? p2[0] : (p2.x ?? 0));
          const y2 = Number(Array.isArray(p2) ? p2[1] : (p2.y ?? 0));
          trackPt(x1, y1); trackPt(x2, y2);
          elements.push({ type: 'line', x1, y1, x2, y2, dash: obj.style === 'dashed' ? '5,5' : undefined });
        }
      }
    });
  }

  // Fallback for older formats
  const rawPoints = data.points || data.nodes || {};
  const entries = Object.entries(rawPoints);
  const isNumericLabels = entries.every(([id]) => !isNaN(Number(id)));
  
  entries.forEach(([id, coord]: [string, any], index) => {
    if (pts[id]) return;
    let x: number | undefined, y: number | undefined;
    if (Array.isArray(coord)) { x = coord[0]; y = coord[1]; }
    else if (coord && typeof coord === 'object') { x = coord.x; y = coord.y; }
    
    if (x !== undefined && y !== undefined) {
      // If labels are just indices, map to A, B, C...
      const label = isNumericLabels ? String.fromCharCode(65 + index) : id;
      regPt(label, x, y);
    }
  });

  // Fallback lines
  const rawLines = data.lines || data.links || data.edges || [];
  if (Array.isArray(rawLines)) {
    rawLines.forEach((line: any) => {
      let p1, p2;
      if (Array.isArray(line) && line.length >= 2) {
        const id1 = String(line[0]);
        const id2 = String(line[1]);
        p1 = isNumericLabels ? pts[String.fromCharCode(65 + Number(id1))] : pts[id1];
        p2 = isNumericLabels ? pts[String.fromCharCode(65 + Number(id2))] : pts[id2];
      } else if (typeof line === 'object') {
        p1 = pts[line.from || line.source];
        p2 = pts[line.to || line.target];
      }
      if (p1 && p2) {
        elements.push({ type: 'line', x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
      }
    });
  }

  // Handle raw command-based format (e.g., rect x y w h)
  if (typeof data === 'string' || (!data.type && !data.geometry && !data.shapes)) {
    const raw = typeof data === 'string' ? data : JSON.stringify(data);
    const lines = raw.split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const cmd = parts[0]?.toLowerCase();
      if (cmd === 'rect' && parts.length >= 5) {
        const [x, y, w, h] = parts.slice(1, 5).map(Number);
        trackPt(x, y); trackPt(x+w, y+h);
        elements.push({ type: 'polygon', points: [[x, y], [x+w, y], [x+w, y+h], [x, y+h]], color: 'rgba(0,180,255,0.1)' });
      } else if (cmd === 'line' && parts.length >= 5) {
        const [x1, y1, x2, y2] = parts.slice(1, 5).map(Number);
        trackPt(x1, y1); trackPt(x2, y2);
        elements.push({ type: 'line', x1, y1, x2, y2 });
      } else if (cmd === 'text' && parts.length >= 4) {
        const x = Number(parts[1]);
        const y = Number(parts[2]);
        const label = parts.slice(3).join(' ').replace(/"/g, '');
        regPt(label, x, y);
      } else if (cmd === 'fill' && parts.length >= 5) {
        const [x, y, w, h] = parts.slice(1, 5).map(Number);
        const opacity = Number(parts[5] || 0.1);
        elements.push({ type: 'polygon', points: [[x, y], [x+w, y], [x+w, y+h], [x, y+h]], color: `rgba(255,255,255,${opacity})` });
      }
    });
  }

  // Calculate Viewport
  let xMin = -2, yMin = -2, xMax = 12, yMax = 10;

  if (coords.length > 0) {
    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    xMin = Math.min(...xs, xMin);
    xMax = Math.max(...xs, xMax);
    yMin = Math.min(...ys, yMin);
    yMax = Math.max(...ys, yMax);
  }

  if (data.window) {
    xMin = Number(data.window.xmin ?? data.window.xMin ?? -2);
    xMax = Number(data.window.xmax ?? data.window.xMax ?? 16);
    yMin = Number(data.window.ymin ?? data.window.yMin ?? -2);
    yMax = Number(data.window.ymax ?? data.window.yMax ?? 10);
  } else if (data.config && (data.config.xRange || data.config.min !== undefined)) {
    const xr = data.config.xRange || [data.config.min, data.config.max];
    const yr = data.config.yRange || [-2, 10];
    xMin = Number(xr[0]) - 1; xMax = Number(xr[1]) + 1;
    yMin = Number(yr[0]) - 1; yMax = Number(yr[1]) + 1;
  }

  // 4. Handle number lines
  if (data.type === 'numberline' || data.type === 'number-line') {
    const config = data.config || {};
    const range = data.range || [config.min ?? -10, config.max ?? 10];
    xMin = range[0] - 1; xMax = range[1] + 1;
    yMin = -2; yMax = 2;

    // Add axis
    elements.push({ type: 'line', x1: range[0], y1: 0, x2: range[1], y2: 0 });
    
    // Add ticks
    const ticks = data.ticks || [];
    if (ticks.length === 0) {
      const minVal = Math.ceil(range[0]);
      const maxVal = Math.floor(range[1]);
      const span = maxVal - minVal;
      
      // Determine a reasonable step if scale is too small
      let step = config.scale || 1;
      if (span / step > 15) {
        step = span > 50 ? 10 : (span > 30 ? 5 : 2);
      }
      
      for (let i = minVal; i <= maxVal; i += step) {
        ticks.push(i);
      }
    }

    // Determine label frequency based on density
    const labelStep = ticks.length > 12 ? (ticks.length > 20 ? 5 : 2) : 1;

    ticks.forEach((v: number, idx: number) => {
      elements.push({ type: 'line', x1: v, y1: -0.2, x2: v, y2: 0.2 });
      if (idx % labelStep === 0 || v === 0) {
        elements.push({ type: 'text', x: v, y: -0.6, label: String(v) });
      }
    });

    // Add points/arrows from elements or points array
    const ptsList = data.points || data.elements || [];
    if (Array.isArray(ptsList)) {
      ptsList.forEach((p: any) => {
        if (p.type === 'point' || p.value !== undefined) {
          regPt(p.label || String(p.value), p.value, 0);
        } else if (p.type === 'arrow') {
          const xStart = p.start;
          const xEnd = p.direction === 'right' ? xStart + 2 : xStart - 2;
          elements.push({ type: 'line', x1: xStart, y1: 0.5, x2: xEnd, y2: 0.5 });
          // Simple arrowhead
          const dx = (xEnd - xStart) * 0.2;
          elements.push({ type: 'line', x1: xEnd, y1: 0.5, x2: xEnd - dx, y2: 0.7 });
          elements.push({ type: 'line', x1: xEnd, y1: 0.5, x2: xEnd - dx, y2: 0.3 });
          if (p.label) elements.push({ type: 'text', x: (xStart + xEnd)/2, y: 1, label: p.label });
        }
      });
    }
  }

  if (coords.length > 0 && !config.viewport) {
    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    const rangeX = (Math.max(...xs) - Math.min(...xs)) || 10;
    const rangeY = (Math.max(...ys) - Math.min(...ys)) || 10;
    const paddingVal = Math.max(rangeX, rangeY) * 0.3;
    config.viewport = [
      Math.min(...xs) - paddingVal,
      Math.min(...ys) - paddingVal,
      Math.max(...xs) + paddingVal,
      Math.max(...ys) + paddingVal
    ];
  }

  return {
    config: {
      viewport: config.viewport || [-2, -2, 12, 10],
      grid: config.grid,
      axes: config.axes
    },
    elements
  };
};

const MathDiagram: React.FC<MathDiagramProps> = ({ data: rawData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const data = normalizeData(rawData);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const padding = 40;

    const config = data.config || {};
    let [xMin, yMin, xMax, yMax] = config.viewport || [-2, -2, 12, 10];

    // Force aspect ratio to be stable for geometry
    const availableWidth = width - 2 * padding;
    const availableHeight = height - 2 * padding;
    const dataWidth = xMax - xMin;
    const dataHeight = yMax - yMin;

    const scaleX = availableWidth / dataWidth;
    const scaleY = availableHeight / dataHeight;
    const scale = Math.min(scaleX, scaleY);

    // Re-center if needed
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const halfWidth = availableWidth / (2 * scale);
    const halfHeight = availableHeight / (2 * scale);

    xMin = centerX - halfWidth;
    xMax = centerX + halfWidth;
    yMin = centerY - halfHeight;
    yMax = centerY + halfHeight;

    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([padding, width - padding]);

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height - padding, padding]);

    // Grid
    if (config.grid && config.axes !== false) {
      const xTicks = xScale.ticks(10);
      const yTicks = yScale.ticks(10);

      svg.append('g')
        .attr('class', 'grid')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-opacity', 0.2)
        .selectAll('line')
        .data(xTicks)
        .enter().append('line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', padding)
        .attr('y2', height - padding);

      svg.append('g')
        .attr('class', 'grid')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-opacity', 0.2)
        .selectAll('line')
        .data(yTicks)
        .enter().append('line')
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('x1', padding)
        .attr('x2', width - padding);
    }

    // Axes
    if (config.axes !== false) {
      // Find axes positions or use 0
      const xPos = (yMin <= 0 && yMax >= 0) ? yScale(0) : height - padding;
      const yPos = (xMin <= 0 && xMax >= 0) ? xScale(0) : padding;

      const xAxis = d3.axisBottom(xScale).ticks(5);
      const yAxis = d3.axisLeft(yScale).ticks(5);

      svg.append('g')
        .attr('transform', `translate(0, ${xPos})`)
        .call(xAxis)
        .attr('color', '#94a3b8');

      svg.append('g')
        .attr('transform', `translate(${yPos}, 0)`)
        .call(yAxis)
        .attr('color', '#94a3b8');
    }

    // Elements
    data.elements.forEach((el) => {
      let color = el.color || '#f8fafc';
      let strokeWidth = el.strokeWidth || 2;
      let opacity = el.opacity ?? 1;

      if (el.importance === 'helper') {
        opacity = el.opacity ?? 0.5;
        strokeWidth = el.strokeWidth ?? 1.5;
        if (!el.color) color = '#94a3b8';
      } else if (el.importance === 'primary' || el.type === 'line') {
        strokeWidth = el.strokeWidth ?? 4;
        if (!el.color) color = '#f59e0b';
      }

      try {
        if (el.type === 'line') {
          if (el.x1 !== undefined && el.y1 !== undefined && el.x2 !== undefined && el.y2 !== undefined) {
            svg.append('line')
              .attr('x1', xScale(el.x1))
              .attr('y1', yScale(el.y1))
              .attr('x2', xScale(el.x2))
              .attr('y2', yScale(el.y2))
              .attr('stroke', color)
              .attr('stroke-width', strokeWidth)
              .attr('stroke-opacity', opacity)
              .attr('stroke-dasharray', el.dash || (el.importance === 'helper' ? '2,2' : ''));
          } else if (el.points && el.points.length >= 2) {
            const lineGenerator = d3.line()
              .x(d => xScale(d[0]))
              .y(d => yScale(d[1]));
            
            svg.append('path')
              .attr('d', lineGenerator(el.points as [number, number][]))
              .attr('fill', 'none')
              .attr('stroke', color)
              .attr('stroke-width', strokeWidth)
              .attr('stroke-opacity', opacity)
              .attr('stroke-dasharray', el.dash || (el.importance === 'helper' ? '2,2' : ''));
          }
        } else if ((el.type === 'circle' || el.type === 'ellipse') && el.x !== undefined && el.y !== undefined) {
          const rx = el.rx !== undefined ? Math.abs(xScale(el.x + el.rx) - xScale(el.x)) : 
                    (el.radius !== undefined ? Math.abs(xScale(el.x + el.radius) - xScale(el.x)) : 5);
          const ry = el.ry !== undefined ? Math.abs(yScale(el.y + el.ry) - yScale(el.y)) : 
                    (el.radius !== undefined ? Math.abs(yScale(el.y + el.radius) - yScale(el.y)) : 5);
          
          svg.append('ellipse')
            .attr('cx', xScale(el.x))
            .attr('cy', yScale(el.y))
            .attr('rx', rx)
            .attr('ry', ry)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-opacity', opacity);
        } else if (el.type === 'polygon' && el.points) {
          const pointsStr = el.points.map(p => `${xScale(p[0])},${yScale(p[1])}`).join(' ');
          svg.append('polygon')
            .attr('points', pointsStr)
            .attr('fill', color)
            .attr('fill-opacity', el.importance === 'helper' ? 0.05 : 0.15)
            .attr('stroke', color)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-opacity', opacity);
        } else if (el.type === 'point' && el.x !== undefined && el.y !== undefined) {
          svg.append('circle')
            .attr('cx', xScale(el.x))
            .attr('cy', yScale(el.y))
            .attr('r', el.importance === 'helper' ? 2 : 4)
            .attr('fill', color)
            .attr('fill-opacity', opacity);
          
          if (el.label) {
            svg.append('text')
              .attr('x', xScale(el.x))
              .attr('y', yScale(el.y))
              .attr('dx', 8)
              .attr('dy', -8)
              .attr('fill', color)
              .attr('font-size', '14px')
              .attr('font-weight', 'bold')
              .text(el.label);
          }
        } else if (el.type === 'text' && el.x !== undefined && el.y !== undefined && el.text) {
          svg.append('text')
            .attr('x', xScale(el.x))
            .attr('y', yScale(el.y))
            .attr('fill', color)
            .attr('font-size', el.fontSize ? `${el.fontSize}px` : '14px')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .text(el.text);
        }
      } catch (err) {
        console.warn('Error rendering diagram element:', el, err);
      }
    });

    // Labels
    const viewWidth = xMax - xMin;
    const viewHeight = yMax - yMin;
    const labelOffset = Math.min(viewWidth, viewHeight) * 0.03; // Relative offset

    data.elements.forEach((el) => {
      let x: number | undefined;
      let y: number | undefined;
      let offset = labelOffset * 40; // Screen pixels roughly
      let fontSize = '13px';

      if ((el.type === 'point' || el.type === 'text') && el.x !== undefined && el.y !== undefined) {
        x = xScale(el.x);
        y = yScale(el.y);
        if (el.type === 'text') {
          offset = 0;
          fontSize = '14px';
        }
      } else if (el.type === 'line') {
        if (el.x1 !== undefined && el.y1 !== undefined && el.x2 !== undefined && el.y2 !== undefined) {
          x = xScale((el.x1 + el.x2) / 2);
          y = yScale((el.y1 + el.y2) / 2);
        } else if (el.points && el.points.length >= 2) {
          x = xScale((el.points[0][0] + el.points[1][0]) / 2);
          y = yScale((el.points[0][1] + el.points[1][1]) / 2);
        }
      }

      if (x !== undefined && y !== undefined && el.label) {
        const isCenterText = el.type === 'text';
        const lx = x + (isCenterText ? 0 : 8);
        const ly = y - (isCenterText ? 0 : 8);
        
        svg.append('text')
          .attr('x', lx)
          .attr('y', ly)
          .text(el.label)
          .attr('text-anchor', isCenterText ? 'middle' : 'start')
          .attr('dominant-baseline', isCenterText ? 'middle' : 'auto')
          .attr('fill', 'none')
          .attr('stroke', '#020617')
          .attr('stroke-width', 4)
          .attr('stroke-linejoin', 'round')
          .attr('font-size', isCenterText ? '14px' : '12px')
          .attr('font-weight', '700')
          .style('pointer-events', 'none');

        svg.append('text')
          .attr('x', lx)
          .attr('y', ly)
          .text(el.label)
          .attr('text-anchor', isCenterText ? 'middle' : 'start')
          .attr('dominant-baseline', isCenterText ? 'middle' : 'auto')
          .attr('fill', '#f8fafc')
          .attr('font-size', isCenterText ? '14px' : '12px')
          .attr('font-weight', '700')
          .style('pointer-events', 'none');
      }
    });

  }, [data]);

  return (
    <div className="my-6 flex justify-center bg-slate-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
      <svg
        ref={svgRef}
        viewBox="0 0 400 300"
        className="max-w-full h-auto drop-shadow-2xl"
        style={{ overflow: 'visible' }}
      />
    </div>
  );
};

export default MathDiagram;
