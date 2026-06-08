import React, { useState } from 'react';
import { Language } from '../../types';

const CircleArea: React.FC<{ lang: Language }> = ({ lang }) => {
  const [r, setR] = useState(4);
  const area = +(Math.PI*r*r).toFixed(2);
  const zh = lang === 'zh';
  const W = 280, H = 240;
  const cx = W/2, cy = H/2 + 8;
  const R  = Math.min(W,H)*0.38;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ width:12, color:'#aaa', fontSize:13 }}>r</span>
        <input type="range" min={1} max={6} step={0.5} value={r}
          onChange={e=>setR(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
        <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{r}</span>
      </div>
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.8 }}>
        <div>S = πr² = π × {r}² = <strong style={{ color:'#7db3ff' }}>{area}</strong></div>
        <div style={{ fontSize:11 }}>{zh?`r×2 → 面积×`:`r×2 → area×`}<strong style={{ color:'#f59e0b' }}>4</strong>{zh?'（不是 ×2！）':' (not ×2!)'}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {[0.33, 0.66].map(frac => (
          <circle key={frac} cx={cx} cy={cy} r={R*frac} fill="none" stroke="#ffffff08" strokeWidth="1" />
        ))}
        <circle cx={cx} cy={cy} r={R} fill="rgba(80,140,220,0.3)" stroke="#5b8dd9" strokeWidth="2" />
        <line x1={cx} y1={cy} x2={cx+R} y2={cy} stroke="#f59e0b" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="4" fill="#f59e0b" />
        <text x={cx+R/2} y={cy-10} textAnchor="middle" fontSize="13" fill="#f59e0b" fontFamily="sans-serif">r = {r}</text>
        <text x={cx} y={cy+R/2} textAnchor="middle" fontSize="14" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">S = {area}</text>
        <text x={cx} y={H-10} textAnchor="middle" fontSize="10" fill="#555" fontFamily="sans-serif">r² = {r*r} → S = {area}</text>
      </svg>
    </div>
  );
};
export default CircleArea;
