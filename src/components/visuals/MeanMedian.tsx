import React, { useState } from 'react';
import { Language } from '../../types';

const MeanMedian: React.FC<{ lang: Language }> = ({ lang }) => {
  const [data, setData] = useState([2, 4, 4, 6, 8, 12, 14]);

  const sorted   = [...data].sort((a, b) => a - b);
  const mean     = +(data.reduce((s, v) => s + v, 0) / data.length).toFixed(2);
  const n        = sorted.length;
  const median   = n % 2 === 1 ? sorted[Math.floor(n/2)] : +((sorted[n/2-1]+sorted[n/2])/2).toFixed(1);
  const mode     = (() => {
    const freq: Record<number,number> = {};
    data.forEach(v => freq[v] = (freq[v]||0)+1);
    const max = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(k => freq[+k]===max).map(Number);
    return modes.length === data.length ? '无' : modes.join(',');
  })();

  const W = 280, H = 130, PAD = 30;
  const minV = Math.min(...data) - 1;
  const maxV = Math.max(...data) + 1;
  const range = maxV - minV || 1;
  const toX = (v: number) => PAD + ((v - minV) / range) * (W - PAD*2);

  return (
    <div style={{ background: '#1a1e2e', borderRadius: 10, padding: 16, color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 11, color: '#bbb', marginBottom: 8 }}>
        {lang === 'zh' ? '拖动数字调整数据点（点击加/减）：' : 'Adjust data points (click +/−):'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {data.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={() => { const d=[...data]; d[i]=Math.max(0,d[i]-1); setData(d); }}
              style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #445', background: 'transparent', color: '#aab', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>−</button>
            <span style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#7db3ff' }}>{v}</span>
            <button onClick={() => { const d=[...data]; d[i]=d[i]+1; setData(d); }}
              style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #445', background: 'transparent', color: '#aab', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>+</button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#bbb', marginBottom: 10, lineHeight: 1.8 }}>
        <span style={{ marginRight: 12 }}>均值 x̄ = <strong style={{ color: '#f59e0b' }}>{mean}</strong></span>
        <span style={{ marginRight: 12 }}>中位数 = <strong style={{ color: '#10b981' }}>{median}</strong></span>
        <span>众数 = <strong style={{ color: '#a78bfa' }}>{mode}</strong></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 300, background: '#0f1422', borderRadius: 8 }}>
        {/* Axis */}
        <line x1={PAD} y1={H*0.6} x2={W-PAD} y2={H*0.6} stroke="#ffffff25" strokeWidth="1" />
        {/* Data points */}
        {data.map((v, i) => (
          <circle key={i} cx={toX(v)} cy={H*0.6} r="5" fill="rgba(80,140,220,0.8)" stroke="#5b8dd9" strokeWidth="1" />
        ))}
        {/* Mean line */}
        <line x1={toX(mean)} y1={H*0.25} x2={toX(mean)} y2={H*0.75} stroke="#f59e0b" strokeWidth="2" />
        <text x={toX(mean)} y={H*0.2} textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="sans-serif">均值</text>
        {/* Median line */}
        <line x1={toX(median)} y1={H*0.3} x2={toX(median)} y2={H*0.75} stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
        <text x={toX(median)} y={H*0.88} textAnchor="middle" fontSize="10" fill="#10b981" fontFamily="sans-serif">中位</text>
        {/* Axis ticks */}
        {sorted.filter((v,i,arr)=>arr.indexOf(v)===i).map(v => (
          <text key={v} x={toX(v)} y={H*0.72} textAnchor="middle" fontSize="9" fill="#555" fontFamily="sans-serif">{v}</text>
        ))}
      </svg>
    </div>
  );
};
export default MeanMedian;
