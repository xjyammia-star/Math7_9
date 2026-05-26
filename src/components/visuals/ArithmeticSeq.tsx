import React, { useState } from 'react';
import { Language } from '../../types';

const ArithmeticSeq: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a1, setA1] = useState(2);
  const [d, setD]   = useState(3);
  const N = 8;
  const terms = Array.from({length:N}, (_,i) => +(a1+i*d).toFixed(1));
  const W = 280, H = 180, PAD = 20;
  const maxAbs = Math.max(...terms.map(Math.abs), 1);
  const barW   = (W-PAD*2)/N - 5;
  const maxBarH = (H-PAD*2)*0.72;
  const zh = lang === 'zh';

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([[zh?'首项 a₁':'1st term a₁', a1, setA1, -5, 10, 0.5], [zh?'公差 d':'common d', d, setD, -5, 8, 0.5]] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ width:72, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(1)}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.8 }}>
        <div>aₙ = {a1} + (n−1)×{d}</div>
        <div style={{ fontSize:11 }}>{zh?'前8项':'First 8 terms'}: {terms.join(', ')}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke="#ffffff20" strokeWidth="1" />
        {terms.map((val,i) => {
          const bh = (Math.abs(val)/maxAbs)*maxBarH;
          const x  = PAD + i*((W-PAD*2)/N) + 2;
          const isPos = val>=0;
          const y = isPos ? H/2-bh : H/2;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh}
                fill={isPos?'rgba(80,140,220,0.7)':'rgba(220,100,100,0.7)'}
                stroke={isPos?'#5b8dd9':'#e44'} strokeWidth="0.5" rx="2" />
              <text x={x+barW/2} y={isPos?y-4:y+bh+11} textAnchor="middle" fontSize="9" fill="#aab" fontFamily="sans-serif">{val}</text>
              <text x={x+barW/2} y={H-4} textAnchor="middle" fontSize="8" fill="#555" fontFamily="sans-serif">n={i+1}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
export default ArithmeticSeq;
