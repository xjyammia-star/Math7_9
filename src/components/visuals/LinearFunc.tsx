import React, { useState } from 'react';
import { Language } from '../../types';

const LinearFunc: React.FC<{ lang: Language }> = ({ lang }) => {
  const [k, setK] = useState(1);
  const [b, setB] = useState(0);

  const W = 240, H = 200, PAD = 30;
  const cx = W / 2, cy = H / 2;
  const SCALE = 20;

  const toSvg = (x: number, y: number) => [cx + x * SCALE, cy - y * SCALE];

  const xMin = -(cx - PAD) / SCALE, xMax = (cx - PAD) / SCALE;
  const p1 = toSvg(xMin, k * xMin + b);
  const p2 = toSvg(xMax, k * xMax + b);

  const xInt = k !== 0 ? -b / k : null;
  const yInt = b;

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {[['k (斜率)', k, setK, -4, 4, 0.5], ['b (截距)', b, setB, -5, 5, 0.5]].map(([lbl, val, setter, mn, mx, step]: any) => (
        <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 60, color: '#aaa', fontSize: 12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e => setter(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#5b8dd9' }} />
          <span style={{ width: 36, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#bbb', margin: '6px 0 10px', lineHeight: 1.8 }}>
        <div>y = <strong style={{ color: '#7db3ff' }}>{k}x {b >= 0 ? '+' : ''}{b}</strong></div>
        {xInt !== null && <div style={{ fontSize: 11 }}>x轴交点: ({xInt.toFixed(2)}, 0) &nbsp;|&nbsp; y轴交点: (0, {yInt})</div>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 260, background: '#0f1422', borderRadius: 8 }}>
        {/* Grid */}
        {[-4,-3,-2,-1,0,1,2,3,4].map(x => (
          <line key={`gx${x}`} x1={cx + x*SCALE} y1={PAD} x2={cx + x*SCALE} y2={H-PAD} stroke="#ffffff0a" strokeWidth="1" />
        ))}
        {[-4,-3,-2,-1,0,1,2,3,4].map(y => (
          <line key={`gy${y}`} x1={PAD} y1={cy - y*SCALE} x2={W-PAD} y2={cy - y*SCALE} stroke="#ffffff0a" strokeWidth="1" />
        ))}
        {/* Axes */}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff30" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff30" strokeWidth="1.5" />
        <text x={W-PAD+4} y={cy+4} fontSize="10" fill="#666" fontFamily="sans-serif">x</text>
        <text x={cx+4} y={PAD-2} fontSize="10" fill="#666" fontFamily="sans-serif">y</text>
        {/* Line */}
        <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke="#5b8dd9" strokeWidth="2.5" strokeLinecap="round" />
        {/* Y-intercept dot */}
        {Math.abs(yInt) <= 4.5 && (
          <circle cx={cx} cy={cy - yInt * SCALE} r="4" fill="#f59e0b" />
        )}
        {/* X-intercept dot */}
        {xInt !== null && Math.abs(xInt) <= 5 && (
          <circle cx={cx + xInt * SCALE} cy={cy} r="4" fill="#10b981" />
        )}
        {/* Slope arrow */}
        <text x={10} y={16} fontSize="10" fill="#7db3ff" fontFamily="sans-serif">
          k={k} {k > 0 ? '↗' : k < 0 ? '↘' : '→'}
        </text>
      </svg>
    </div>
  );
};
export default LinearFunc;
