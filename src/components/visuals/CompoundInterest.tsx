import React, { useState } from 'react';
import { Language } from '../../types';

const CompoundInterest: React.FC<{ lang: Language }> = ({ lang }) => {
  const [P, setP] = useState(1000);
  const [r, setR] = useState(8);
  const [n, setN] = useState(10);
  const zh = lang === 'zh';
  const A = +(P * Math.pow(1 + r/100, n)).toFixed(2);
  const simple = +(P * (1 + r/100 * n)).toFixed(2);
  const years = Array.from({length:n+1}, (_,i) => ({ year:i, compound:+(P*Math.pow(1+r/100,i)).toFixed(0), simple:+(P*(1+r/100*i)).toFixed(0) }));

  const W = 280, H = 180, PAD = 28;
  const maxVal = Math.max(...years.map(y=>y.compound));
  const toX = (i:number) => PAD + (i/n)*(W-PAD*2);
  const toY = (v:number) => H-PAD - (v/maxVal)*(H-PAD*2)*0.88;

  const cPts = years.map(y=>`${toX(y.year)},${toY(y.compound)}`).join(' ');
  const sPts = years.map(y=>`${toX(y.year)},${toY(y.simple)}`).join(' ');

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([
        [zh?'本金 P':'Principal P', P, setP, 100, 5000, 100],
        [zh?'年利率 r%':'Rate r%',   r, setR, 1, 20, 0.5],
        [zh?'年数 n':'Years n',      n, setN, 1, 20, 1],
      ] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ width:76, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:40, textAlign:'right', fontWeight:600, fontSize:12 }}>{(+val).toFixed(step<1?1:0)}</span>
        </div>
      ))}
      <div style={{ fontSize:11, color:'#bbb', margin:'6px 0 8px', lineHeight:1.9 }}>
        <div>A = P(1+r)ⁿ = {P}×(1+{r}%)^{n} = <strong style={{ color:'#10b981' }}>{A}</strong></div>
        <div>{zh?'单利':'Simple'}: {P}×(1+{r}%×{n}) = <strong style={{ color:'#f59e0b' }}>{simple}</strong></div>
        <div style={{ color:'#10b981' }}>{zh?`复利多赚: ${+(A-simple).toFixed(0)}`:`Compound earns extra: ${+(A-simple).toFixed(0)}`}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="#ffffff20" strokeWidth="1" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H-PAD} stroke="#ffffff20" strokeWidth="1" />
        {/* Simple interest line */}
        <polyline points={sPts} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
        {/* Compound curve */}
        <polyline points={cPts} fill="none" stroke="#10b981" strokeWidth="2.5" />
        {/* Dots at final year */}
        <circle cx={toX(n)} cy={toY(years[n].compound)} r="5" fill="#10b981" />
        <circle cx={toX(n)} cy={toY(years[n].simple)} r="4" fill="#f59e0b" />
        {/* Legend */}
        <line x1={W-PAD-50} y1={22} x2={W-PAD-36} y2={22} stroke="#10b981" strokeWidth="2" />
        <text x={W-PAD-32} y={25} fontSize="9" fill="#10b981" fontFamily="sans-serif">{zh?'复利':'Compound'}</text>
        <line x1={W-PAD-50} y1={34} x2={W-PAD-36} y2={34} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={W-PAD-32} y={37} fontSize="9" fill="#f59e0b" fontFamily="sans-serif">{zh?'单利':'Simple'}</text>
      </svg>
    </div>
  );
};
export default CompoundInterest;
