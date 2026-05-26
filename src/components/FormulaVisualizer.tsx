// src/components/FormulaVisualizer.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { FORMULA_CATEGORIES, FormulaItem } from '../data/formulaVisuals';

// ── Visual components ────────────────────────────────────────────────────────
import SquareDiff    from './visuals/SquareDiff';
import SquareSum     from './visuals/SquareSum';
import DiffSquares   from './visuals/DiffSquares';
import LinearFunc    from './visuals/LinearFunc';
import QuadraticFunc from './visuals/QuadraticFunc';
import InverseFunc   from './visuals/InverseFunc';
import Pythagorean   from './visuals/Pythagorean';
import TriangleArea  from './visuals/TriangleArea';
import CircleArea    from './visuals/CircleArea';
import SectorArea    from './visuals/SectorArea';
import CylinderVolume from './visuals/CylinderVolume';
import ConeVolume    from './visuals/ConeVolume';
import TrigBasic     from './visuals/TrigBasic';
import UnitCircle    from './visuals/UnitCircle';
import ArithmeticSeq from './visuals/ArithmeticSeq';
import GeometricSeq  from './visuals/GeometricSeq';
import MeanMedian    from './visuals/MeanMedian';

const VISUAL_MAP: Record<string, React.FC<{ lang: Language }>> = {
  SquareDiff,
  SquareSum,
  DiffSquares,
  LinearFunc,
  QuadraticFunc,
  InverseFunc,
  Pythagorean,
  TriangleArea,
  CircleArea,
  SectorArea,
  CylinderVolume,
  ConeVolume,
  TrigBasic,
  UnitCircle,
  ArithmeticSeq,
  GeometricSeq,
  MeanMedian,
};

const DIFF_LABELS: Record<number, { zh: string; en: string; color: string }> = {
  1: { zh: '基础', en: 'Basic',    color: '#10b981' },
  2: { zh: '中等', en: 'Medium',   color: '#f59e0b' },
  3: { zh: '进阶', en: 'Advanced', color: '#ef4444' },
};

// ── Simple inline KaTeX-style formula renderer (uses span styling) ────────────
// We render LaTeX display using a small SVG text trick since KaTeX is already loaded in the app.
const FormulaDisplay: React.FC<{ latex: string }> = ({ latex }) => {
  return (
    <span
      className="font-mono text-[var(--color-brand-accent)] text-sm tracking-wide"
      dangerouslySetInnerHTML={{
        __html: latex
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<sup>$1</sup>/<sub>$2</sub>')
          .replace(/\^2/g, '²').replace(/\^3/g, '³')
          .replace(/\\pi/g, 'π').replace(/\\theta/g, 'θ')
          .replace(/\\cdot/g, '·').replace(/\\times/g, '×')
          .replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan')
          .replace(/\\bar\{x\}/g, 'x̄').replace(/\\sum/g, 'Σ')
          .replace(/\\_\{([^}]+)\}/g, '<sub>$1</sub>')
          .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
          .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
          .replace(/\{|\}/g, ''),
      }}
    />
  );
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface FormulaVisualizerProps {
  lang: Language;
}

// ── Component ─────────────────────────────────────────────────────────────────
const FormulaVisualizer: React.FC<FormulaVisualizerProps> = ({ lang }) => {
  const [selectedFormula, setSelectedFormula] = useState<FormulaItem | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('algebra-identity');

  const VisualComponent = selectedFormula ? VISUAL_MAP[selectedFormula.componentKey] : null;

  const totalCount = FORMULA_CATEGORIES.reduce((sum, cat) => sum + cat.formulas.length, 0);

  // ── Detail View ──────────────────────────────────────────────────────────────
  if (selectedFormula && VisualComponent) {
    const diff = DIFF_LABELS[selectedFormula.difficulty];
    return (
      <motion.div
        key="detail"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="h-full flex flex-col bg-[var(--color-brand-bg)]"
      >
        {/* Detail header */}
        <div className="px-6 py-4 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-card)]/40 flex items-center gap-4">
          <button
            onClick={() => setSelectedFormula(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {lang === 'zh' ? '返回公式库' : 'Back'}
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-white">{selectedFormula.name[lang]}</h2>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${diff.color}20`, color: diff.color, border: `1px solid ${diff.color}40` }}
              >
                {diff[lang]}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{selectedFormula.description[lang]}</p>
          </div>
        </div>

        {/* Detail body: visual left, explanation right */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-0 h-full">

            {/* Visual area */}
            <div className="lg:flex-1 flex items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]">
              <div className="w-full max-w-lg">
                <VisualComponent lang={lang} />
              </div>
            </div>

            {/* Explanation panel */}
            <div className="lg:w-80 p-6 flex flex-col gap-6 shrink-0">

              {/* Formula display */}
              <div className="p-4 rounded-xl bg-[var(--color-brand-card)] border border-[var(--color-brand-border)]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  {lang === 'zh' ? '公式' : 'Formula'}
                </div>
                <div className="text-center py-2">
                  <FormulaDisplay latex={selectedFormula.latex} />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--color-brand-accent)]" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {lang === 'zh' ? '几何直觉' : 'Geometric Intuition'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedFormula.explanation[lang]}
                </p>
              </div>

              {/* Tips */}
              <div className="p-3 rounded-xl bg-amber-900/10 border border-amber-500/20">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">
                  💡 {lang === 'zh' ? '操作提示' : 'How to use'}
                </div>
                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                  {lang === 'zh'
                    ? '拖动滑块改变参数值，右侧图形会实时同步变化。点击步骤按钮可以分步理解公式推导过程。'
                    : 'Drag the sliders to change parameter values and watch the diagram update in real time. Use the step buttons to walk through the derivation step by step.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── List View ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col bg-[var(--color-brand-bg)] overflow-y-auto"
    >
      {/* Page header */}
      <div className="px-8 pt-8 pb-6 border-b border-[var(--color-brand-border)]">
        <div className="flex items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
              {lang === 'zh' ? '可视化公式图' : 'Formula Visualizer'}
            </h1>
            <p className="text-sm text-slate-500">
              {lang === 'zh'
                ? `${totalCount} 个公式 · 拖动滑块，直观理解数学原理`
                : `${totalCount} formulas · Drag sliders to build geometric intuition`}
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            {Object.entries(DIFF_LABELS).map(([k, v]) => (
              <span
                key={k}
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: `${v.color}15`, color: v.color, border: `1px solid ${v.color}30` }}
              >
                {v[lang]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 px-8 py-6 space-y-4">
        {FORMULA_CATEGORIES.map(cat => {
          const isOpen = expandedCategory === cat.id;
          return (
            <div key={cat.id} className="border border-[var(--color-brand-border)] rounded-2xl overflow-hidden">

              {/* Category header */}
              <button
                onClick={() => setExpandedCategory(isOpen ? null : cat.id)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[var(--color-brand-card)]/60 hover:bg-[var(--color-brand-card)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{cat.name[lang]}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {cat.formulas.length} {lang === 'zh' ? '个公式' : 'formulas'}
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500 rotate-180" />
                </motion.div>
              </button>

              {/* Formula cards grid */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-[var(--color-brand-bg)]/40">
                      {cat.formulas.map(formula => {
                        const diff = DIFF_LABELS[formula.difficulty];
                        return (
                          <motion.button
                            key={formula.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedFormula(formula)}
                            className="text-left p-4 rounded-xl bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:border-[var(--color-brand-accent)]/40 hover:bg-[var(--color-brand-card)]/80 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-bold text-white group-hover:text-[var(--color-brand-accent)] transition-colors line-clamp-1 flex-1">
                                {formula.name[lang]}
                              </span>
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0"
                                style={{ background: `${diff.color}20`, color: diff.color }}
                              >
                                {diff[lang]}
                              </span>
                            </div>
                            <div className="font-mono text-[11px] text-[var(--color-brand-accent)]/80 mb-2 truncate">
                              <FormulaDisplay latex={formula.latex} />
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {formula.description[lang]}
                            </p>
                            <div className="mt-3 text-[10px] font-bold text-slate-600 group-hover:text-[var(--color-brand-accent)] transition-colors flex items-center gap-1">
                              {lang === 'zh' ? '点击查看动态图' : 'Click to explore'}
                              <ChevronLeft className="w-3 h-3 rotate-180" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FormulaVisualizer;
