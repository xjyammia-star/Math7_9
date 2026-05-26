import React, { useState } from 'react';
import { Language } from '../../types';

const Variance: React.FC<{ lang: Language }> = ({ lang }) => {
  const [data, setData] = useState([2, 4, 4, 4, 5, 5, 7, 9]);
  const zh = lang === 'zh';
  const mean = +(data.reduce((s,v)=>s+v,0)/data.length).toFixed(2);
  const variance = +(data.reduce((s,v)=>s+(v-+mean)**2,0)/data.length).toFixed(2);
  const std = +Math.sqrt(variance).toFixed(2);

  const W = 280, H = 190, PAD = 24;
  const minV = Math.min(...data)-1, maxV = Math.max(...data)+1;
  const range = maxV-minV||1;
  const toX = (v:number) => PAD+((v-minV)/range)*(W-PAD*2);
  const meanX = toX(+mean);

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ fontSize:11, color:'#bbb', marginBottom:8 }}>
        {zh?'点击 +/− 调整数据点：':'Click +/− to adjust data:'}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
        {data.map((v,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:2 }}>
            <button onClick={()=>{const d=[...data];d[i]=Math.max(1,d[i]-1);setData(d);}}
              style={{ width:16,height:16,borderRadius:3,border:'1px solid #445',background:'transparent',color:'#aab',cursor:'pointer',fontSize:11 }}>−</button>
            <span style={{ width:20,textAlign:'center',fontSize:12,fontWeight:600,color:'#7db3ff' }}>{v}</span>
            <button onClick={()=>{const d=[...data];d[i]++;setData(d);}}
              style={{ width:16,height:16,borderRadius:3,border:'1px solid #445',background:'transparent',color:'#aab',cursor:'pointer',fontSize:11 }}>+</button>
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:'#bbb', margin:'4px 0 8px', lineHeight:1.9 }}>
        <div>x̄ = {mean} &nbsp;|&nbsp; σ² = Σ(xᵢ−x̄)²/n = <strong style={{ color:'#7db3ff' }}>{variance}</strong></div>
        <div>σ = √{variance} = <strong style={{ color:'#10b981' }}>{std}</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <line x1={PAD} y1={H*0.52} x2={W-PAD} y2={H*0.52} stroke="#ffffff20" strokeWidth="1" />
        {/* Deviation lines */}
        {data.map((v,i)=>{
          const x = toX(v);
          const dev = Math.abs(v-+mean);
          const col = v>+mean?'rgba(80,140,220,0.5)':'rgba(220,100,100,0.5)';
          return <line key={i} x1={meanX} y1={H*0.52} x2={x} y2={H*0.52} stroke={col} strokeWidth={dev*2+1} />;
        })}
        {/* Data points */}
        {data.map((v,i)=>(
          <g key={i}>
            <circle cx={toX(v)} cy={H*0.52} r="5" fill="rgba(80,140,220,0.85)" stroke="#5b8dd9" strokeWidth="1" />
            <text x={toX(v)} y={H*0.52+17} textAnchor="middle" fontSize="9" fill="#aab" fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        {/* Mean */}
        <line x1={meanX} y1={H*0.28} x2={meanX} y2={H*0.7} stroke="#f59e0b" strokeWidth="2.5" />
        <text x={meanX} y={H*0.22} textAnchor="middle" fontSize="11" fill="#f59e0b" fontFamily="sans-serif" fontWeight="bold">x̄={mean}</text>
        {/* Std dev bands */}
        <rect x={toX(+mean-std)} y={H*0.38} width={toX(+mean+std)-toX(+mean-std)} height={H*0.28}
          fill="rgba(16,185,129,0.08)" stroke="#10b98140" strokeWidth="1" />
        <text x={W/2} y={H-6} textAnchor="middle" fontSize="10" fill="#10b981" fontFamily="sans-serif">±σ = ±{std}</text>
      </svg>
    </div>
  );
};
export default Variance;
