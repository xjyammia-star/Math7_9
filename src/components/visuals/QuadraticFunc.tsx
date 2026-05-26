import React, { useState } from 'react';
import { Language } from '../../types';

const QuadraticFunc: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const W = 260, H = 220, PAD = 30;
  const cx = W / 2, cy = H / 2 + 10;
  const SCALE = 18;

  const toSvg = (x: number, y: number) => [cx + x * SCALE, cy - y * SCALE];

  const vx = a !== 0 ? -b / (2 * a) : 0;
  const vy = a !== 0 ? c - b * b / (4 * a) : c;
  const delta = b * b - 4 * a * c;

  const points: string[] = [];
  for (let px = -6; px <= 6; px += 0.1) {
    const py = a * px * px + b * px + c;
    const [sx, sy] = toSvg(px, py);
    if (sy > PAD && sy < H - PAD + 20) points.push(`${sx},${sy}`);
  }

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['a', a, setA, -3, 3, 0.5], ['b', b, setB, -4, 4, 0.5], ['c', c, setC, -4, 4, 0.5]].map(([lbl, val, setter, mn, mx, step]: any) => (
        <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{ width: 12, color: '#aaa', fontSize: 13 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 36, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: '#bbb', margin: '6px 0 8px', lineHeight: 1.7 }}>
        <div>y = <strong style={{ color: '#7db3ff' }}>{a}x² {b >= 0 ? '+' : ''}{b}x {c >= 0 ? '+' : ''}{c}</strong></div>
        <div>顶点: ({vx.toFixed(2)}, {vy.toFixed(2)}) &nbsp;|&nbsp; Δ={delta.toFixed(1)} ({delta > 0 ? '2交点' : delta === 0 ? '1交点' : '无交点'})</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 280, background: '#0f1422', borderRadius: 8 }}>
        {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(x => (
          <line key={`gx${x}`} x1={cx+x*SCALE} y1={PAD} x2={cx+x*SCALE} y2={H-PAD} stroke="#ffffff08" strokeWidth="1" />
        ))}
        {[-4,-3,-2,-1,0,1,2,3,4].map(y => (
          <line key={`gy${y}`} x1={PAD} y1={cy-y*SCALE} x2={W-PAD} y2={cy-y*SCALE} stroke="#ffffff08" strokeWidth="1" />
        ))}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff30" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff30" strokeWidth="1.5" />
        {/* Axis of symmetry */}
        {a !== 0 && <line x1={cx + vx*SCALE} y1={PAD} x2={cx + vx*SCALE} y2={H-PAD} stroke="#f59e0b40" strokeWidth="1" strokeDasharray="4 3" />}
        {points.length > 1 && <polyline points={points.join(' ')} fill="none" stroke="#5b8dd9" strokeWidth="2.5" strokeLinejoin="round" />}
        {/* Vertex */}
        {a !== 0 && vy > -6 && vy < 6 && (
          <circle cx={cx + vx*SCALE} cy={cy - vy*SCALE} r="4.5" fill="#f59e0b" />
        )}
        {/* Y-intercept */}
        {Math.abs(c) <= 5 && <circle cx={cx} cy={cy - c*SCALE} r="3.5" fill="#10b981" />}
        <text x={8} y={16} fontSize="9" fill="#7db3ff" fontFamily="sans-serif">
          {a > 0 ? '开口向上 ∪' : a < 0 ? '开口向下 ∩' : '直线'}
        </text>
      </svg>
    </div>
  );
};
export default QuadraticFunc;
