import React, { useState } from 'react';
import { Language } from '../../types';

const ArithmeticSum: React.FC<{ lang: Language }> = ({ lang }) => {
  const [a1, setA1] = useState(1);
  const [d, setD]   = useState(2);
  const [n, setN]   = useState(6);
  const zh = lang === 'zh';
  const an  = a1 + (n-1)*d;
  const sum = n * (a1 + an) / 2;
  const terms = Array.from({length:n}, (_,i) => a1+i*d);

  const W = 280, H = 180, PAD = 20;
  const maxVal = Math.max(...terms, 1);
  const barW   = (W-PAD*2)/n - 4;
  const maxBarH = (H-PAD*2)*0.72;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([
        [zh?'首项 a₁':'1st term a₁', a1, setA1, 1, 10, 0.5],
        [zh?'公差 d':'common d',     d,  setD,  1, 5,  0.5],
        [zh?'项数 n':'terms n',      n,  setN,  2, 12, 1],
      ] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ width:76, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:28, textAlign:'right', fontWeight:600, fontSize:13 }}>{(+val).toFixed(0)}</span>
        </div>
      ))}
      <div style={{ fontSize:11, color:'#bbb', margin:'6px 0 8px', lineHeight:1.9 }}>
        <div>Sₙ = n(a₁+aₙ)/2 = {n}×({a1}+{an})/2 = <strong style={{ color:'#7db3ff' }}>{sum}</strong></div>
        <div style={{ fontSize:10 }}>{zh?'梯形面积模型：底之和×高÷2':'Trapezoid model: (sum of bases)×height÷2'}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {/* Baseline */}
        <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="#ffffff20" strokeWidth="1" />
        {/* Trapezoid outline */}
        <line x1={PAD} y1={H-PAD-(terms[0]/maxVal)*maxBarH}
              x2={PAD+n*((W-PAD*2)/n)} y2={H-PAD-(terms[n-1]/maxVal)*maxBarH}
              stroke="#f59e0b40" strokeWidth="1" strokeDasharray="4 2" />
        {terms.map((val,i) => {
          const bh = (val/maxVal)*maxBarH;
          const x  = PAD + i*((W-PAD*2)/n) + 2;
          return (
            <g key={i}>
              <rect x={x} y={H-PAD-bh} width={barW} height={bh}
                fill="rgba(80,140,220,0.65)" stroke="#5b8dd9" strokeWidth="0.5" rx="2" />
              <text x={x+barW/2} y={H-PAD-bh-4} textAnchor="middle" fontSize="9" fill="#aab" fontFamily="sans-serif">{val}</text>
              <text x={x+barW/2} y={H-6} textAnchor="middle" fontSize="8" fill="#555" fontFamily="sans-serif">{i+1}</text>
            </g>
          );
        })}
        <text x={W/2} y={PAD+2} textAnchor="middle" fontSize="11" fill="#7db3ff" fontFamily="sans-serif" fontWeight="bold">Sₙ = {sum}</text>
      </svg>
    </div>
  );
};
export default ArithmeticSum;
