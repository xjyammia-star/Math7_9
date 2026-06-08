import React, { useState } from 'react';
import { Language } from '../../types';

const MeanMedian: React.FC<{ lang: Language }> = ({ lang }) => {
  const [data, setData] = useState([2,4,4,6,8,12,14]);
  const zh = lang === 'zh';
  const sorted = [...data].sort((a,b)=>a-b);
  const mean   = +(data.reduce((s,v)=>s+v,0)/data.length).toFixed(2);
  const n      = sorted.length;
  const median = n%2===1?sorted[Math.floor(n/2)]:+((sorted[n/2-1]+sorted[n/2])/2).toFixed(1);
  const W = 280, H = 160, PAD = 28;
  const minV = Math.min(...data)-2, maxV = Math.max(...data)+2;
  const range = maxV-minV||1;
  const toX = (v: number) => PAD+((v-minV)/range)*(W-PAD*2);

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ fontSize:11, color:'#bbb', marginBottom:8 }}>
        {zh?'点击 +/− 调整各数据点：':'Click +/− to adjust data points:'}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
        {data.map((v,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:2 }}>
            <button onClick={()=>{const d=[...data];d[i]=Math.max(0,d[i]-1);setData(d);}}
              style={{ width:18,height:18,borderRadius:4,border:'1px solid #445',background:'transparent',color:'#aab',cursor:'pointer',fontSize:12,lineHeight:1 }}>−</button>
            <span style={{ width:24,textAlign:'center',fontSize:13,fontWeight:600,color:'#7db3ff' }}>{v}</span>
            <button onClick={()=>{const d=[...data];d[i]++;setData(d);}}
              style={{ width:18,height:18,borderRadius:4,border:'1px solid #445',background:'transparent',color:'#aab',cursor:'pointer',fontSize:12,lineHeight:1 }}>+</button>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:'#bbb', marginBottom:10, lineHeight:1.8 }}>
        <span style={{ marginRight:12 }}>{zh?'均值':'Mean'} x̄ = <strong style={{ color:'#f59e0b' }}>{mean}</strong></span>
        <span>{zh?'中位数':'Median'} = <strong style={{ color:'#10b981' }}>{median}</strong></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        <line x1={PAD} y1={H*0.55} x2={W-PAD} y2={H*0.55} stroke="#ffffff25" strokeWidth="1" />
        {data.map((v,i)=>(
          <circle key={i} cx={toX(v)} cy={H*0.55} r="6" fill="rgba(80,140,220,0.8)" stroke="#5b8dd9" strokeWidth="1" />
        ))}
        <line x1={toX(mean)} y1={H*0.2} x2={toX(mean)} y2={H*0.72} stroke="#f59e0b" strokeWidth="2.5" />
        <text x={toX(mean)} y={H*0.14} textAnchor="middle" fontSize="11" fill="#f59e0b" fontFamily="sans-serif" fontWeight="bold">{zh?'均值':'Mean'}</text>
        <text x={toX(mean)} y={H*0.84} textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="sans-serif">{mean}</text>
        <line x1={toX(median)} y1={H*0.25} x2={toX(median)} y2={H*0.72} stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 2" />
        <text x={toX(median)} y={H*0.19} textAnchor="middle" fontSize="11" fill="#10b981" fontFamily="sans-serif" fontWeight="bold">{zh?'中位':'Median'}</text>
        <text x={toX(median)} y={H*0.92} textAnchor="middle" fontSize="10" fill="#10b981" fontFamily="sans-serif">{median}</text>
      </svg>
    </div>
  );
};
export default MeanMedian;
