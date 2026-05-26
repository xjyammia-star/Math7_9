import React, { useState } from 'react';
import { Language } from '../../types';

const ClassicalProbability: React.FC<{ lang: Language }> = ({ lang }) => {
  const [total, setTotal] = useState(6);
  const [favorable, setFavorable] = useState(2);
  const zh = lang === 'zh';
  const safeFav = Math.min(favorable, total);
  const prob = +(safeFav/total).toFixed(4);
  const pct  = +(prob*100).toFixed(1);

  const W = 280, H = 200, PAD = 20;
  const cols = Math.min(total, 10);
  const rows = Math.ceil(total/cols);
  const cellW = (W-PAD*2)/cols;
  const cellH = Math.min(cellW, (H-PAD*2-40)/rows);

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      {([
        [zh?'总数 n':'Total n',       total,    setTotal,    1, 20, 1],
        [zh?'有利数 m':'Favorable m', safeFav,  (v:number)=>setFavorable(Math.min(v,total)), 0, total, 1],
      ] as any[]).map(([lbl,val,setter,mn,mx,step]: any) => (
        <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <span style={{ width:72, color:'#aaa', fontSize:12 }}>{lbl}</span>
          <input type="range" min={mn} max={mx} step={step} value={val}
            onChange={e=>setter(parseInt(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
          <span style={{ width:28, textAlign:'right', fontWeight:600, fontSize:13 }}>{val}</span>
        </div>
      ))}
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.9 }}>
        <div>P = m/n = {safeFav}/{total} = <strong style={{ color:'#7db3ff' }}>{prob}</strong> = <strong style={{ color:'#10b981' }}>{pct}%</strong></div>
        <div style={{ fontSize:11 }}>{zh?'蓝色=有利结果，灰色=不利结果':'Blue = favorable, gray = unfavorable'}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {/* Probability bar */}
        <rect x={PAD} y={PAD} width={W-PAD*2} height={16} fill="rgba(255,255,255,0.06)" rx="4" />
        <rect x={PAD} y={PAD} width={(W-PAD*2)*prob} height={16} fill="rgba(80,140,220,0.75)" rx="4" />
        <text x={PAD+(W-PAD*2)*prob/2} y={PAD+11} textAnchor="middle" fontSize="10" fill="#fff" fontFamily="sans-serif" fontWeight="bold">{pct}%</text>

        {/* Grid of outcomes */}
        {Array.from({length:total}, (_,i) => {
          const col = i % cols, row = Math.floor(i/cols);
          const x = PAD + col*cellW + cellW*0.1;
          const y = PAD + 24 + row*cellH + cellH*0.1;
          const w = cellW*0.8, h = cellH*0.8;
          const isFav = i < safeFav;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h}
                fill={isFav?'rgba(80,140,220,0.75)':'rgba(255,255,255,0.08)'}
                stroke={isFav?'#5b8dd9':'#333'} strokeWidth="0.5" rx="4" />
              <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
                fontSize={Math.min(cellW*0.4,14)} fill={isFav?'#fff':'#444'} fontFamily="sans-serif" fontWeight="bold">{i+1}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
export default ClassicalProbability;
