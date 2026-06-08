import React, { useState } from 'react';
import { Language } from '../../types';

const InverseFunc: React.FC<{ lang: Language }> = ({ lang }) => {
  const [k, setK] = useState(4);
  const zh = lang === 'zh';

  const W = 280, H = 200, PAD = 28;  // 降低H
  const cx = W/2, cy = H/2;
  const SCALE = Math.min((W/2-PAD)/5, (H/2-PAD)/5);

  const buildCurve = (xStart: number, xEnd: number) => {
    const pts: string[] = [];
    for (let x = xStart; x <= xEnd; x += 0.04) {
      if (Math.abs(x) < 0.12) continue;
      const y = k / x;
      const sy = cy - y * SCALE;
      if (sy < PAD || sy > H - PAD) continue;
      pts.push(`${cx + x * SCALE},${sy}`);
    }
    return pts;
  };

  const q1 = buildCurve(0.15, 5.5);
  const q3 = buildCurve(-5.5, -0.15);

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {/* Slider */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
        <span style={{ width:12, color:'#aaa', fontSize:13 }}>k</span>
        <input type="range" min={-8} max={8} step={0.5} value={k}
          onChange={e => setK(parseFloat(e.target.value))}
          style={{ flex:1, accentColor:'#5b8dd9' }} />
        <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{k}</span>
      </div>

      {/* Formula text */}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 8px', lineHeight:1.8 }}>
        <div>y = <strong style={{ color:'#7db3ff' }}>{k}/x</strong></div>
        <div style={{ fontSize:11 }}>
          {k > 0
            ? (zh ? '第一、三象限' : 'Quadrants 1 & 3')
            : k < 0
            ? (zh ? '第二、四象限' : 'Quadrants 2 & 4')
            : '—'}
        </div>
      </div>

      {/* SVG — smaller height */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%"
        style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <defs>
          <clipPath id="invClip">
            <rect x={PAD} y={PAD} width={W-PAD*2} height={H-PAD*2} />
          </clipPath>
        </defs>
        {[-5,-4,-3,-2,-1,1,2,3,4,5].map(x => (
          <line key={`gx${x}`} x1={cx+x*SCALE} y1={PAD} x2={cx+x*SCALE} y2={H-PAD} stroke="#ffffff08" strokeWidth="1" />
        ))}
        {[-4,-3,-2,-1,1,2,3,4].map(y => (
          <line key={`gy${y}`} x1={PAD} y1={cy-y*SCALE} x2={W-PAD} y2={cy-y*SCALE} stroke="#ffffff08" strokeWidth="1" />
        ))}
        <line x1={PAD} y1={cy} x2={W-PAD} y2={cy} stroke="#ffffff30" strokeWidth="1.5" />
        <line x1={cx} y1={PAD} x2={cx} y2={H-PAD} stroke="#ffffff30" strokeWidth="1.5" />
        {k !== 0 && q1.length > 1 && (
          <polyline points={q1.join(' ')} fill="none" stroke="#5b8dd9" strokeWidth="2.5" clipPath="url(#invClip)" />
        )}
        {k !== 0 && q3.length > 1 && (
          <polyline points={q3.join(' ')} fill="none" stroke="#5b8dd9" strokeWidth="2.5" clipPath="url(#invClip)" />
        )}
        <text x={10} y={16} fontSize="10" fill="#7db3ff" fontFamily="sans-serif">k={k}</text>
      </svg>
    </div>
  );
};
export default InverseFunc;
