import React, { useState } from 'react';
import { Language } from '../../types';

const SimilarityRatio: React.FC<{ lang: Language }> = ({ lang }) => {
  const [ratio, setRatio] = useState(2);
  const zh = lang === 'zh';
  const areaRatio = +(ratio*ratio).toFixed(2);
  const volRatio  = +(ratio*ratio*ratio).toFixed(2);

  const W = 280, H = 220, PAD = 20;
  const baseSize = 40;
  const bigSize  = baseSize * ratio;
  // Keep big square within canvas
  const scaleDown = bigSize > (W/2-PAD-20) ? (W/2-PAD-20)/bigSize : 1;
  const S1 = baseSize * scaleDown;
  const S2 = bigSize  * scaleDown;

  const cx = W/2;
  const y  = H/2 + 10;

  return (
    <div style={{ background:'#1a1e2e', borderRadius:10, padding:16, color:'#e0e0e0', fontFamily:'sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ width:68, color:'#aaa', fontSize:12 }}>{zh?'相似比 k':'Ratio k'}</span>
        <input type="range" min={1} max={4} step={0.1} value={ratio}
          onChange={e=>setRatio(parseFloat(e.target.value))} style={{ flex:1, accentColor:'#5b8dd9' }} />
        <span style={{ width:32, textAlign:'right', fontWeight:600, fontSize:13 }}>{ratio.toFixed(1)}</span>
      </div>
      <div style={{ fontSize:12, color:'#bbb', margin:'6px 0 10px', lineHeight:1.9 }}>
        <div>{zh?'相似比':'Similarity ratio'} k = <strong style={{ color:'#7db3ff' }}>{ratio.toFixed(1)}</strong></div>
        <div>{zh?'面积比':'Area ratio'} = k² = <strong style={{ color:'#10b981' }}>{areaRatio}</strong></div>
        <div>{zh?'体积比':'Volume ratio'} = k³ = <strong style={{ color:'#f59e0b' }}>{volRatio}</strong></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', background:'#0f1422', borderRadius:8 }}>
        {/* Small square — centered on left half */}
        <rect x={cx/2-S1/2} y={y-S1/2} width={S1} height={S1}
          fill="rgba(80,140,220,0.6)" stroke="#5b8dd9" strokeWidth="1.5" />
        <text x={cx/2} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fill="#fff" fontFamily="sans-serif" fontWeight="bold">1</text>
        <text x={cx/2} y={y+S1/2+14} textAnchor="middle" fontSize="10" fill="#5b8dd9" fontFamily="sans-serif">{zh?'面积':'area'}=1</text>

        {/* Big square — centered on right half */}
        <rect x={cx+cx/2-S2/2} y={y-S2/2} width={S2} height={S2}
          fill="rgba(16,185,129,0.45)" stroke="#10b981" strokeWidth="1.5" />
        <text x={cx+cx/2} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fill="#fff" fontFamily="sans-serif" fontWeight="bold">k={ratio.toFixed(1)}</text>
        <text x={cx+cx/2} y={y+S2/2+14} textAnchor="middle" fontSize="10" fill="#10b981" fontFamily="sans-serif">{zh?'面积':'area'}={areaRatio}</text>

        {/* Arrow */}
        <line x1={cx/2+S1/2+6} y1={y} x2={cx+cx/2-S2/2-6} y2={y} stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arr2)" />
        <text x={cx} y={y-10} textAnchor="middle" fontSize="10" fill="#f59e0b" fontFamily="sans-serif">×{ratio.toFixed(1)}</text>
        <defs>
          <marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};
export default SimilarityRatio;
