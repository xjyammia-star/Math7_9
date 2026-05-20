import React, { useState } from 'react';
import {
  ClipboardList,
  Settings2,
  RefreshCw,
  Eye,
  HelpCircle,
  Brain,
  ListOrdered,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { Concept, Language, Curriculum, Difficulty, Grade } from '../types';
import { generateExercises, solveExercises } from '../services/geminiService';
import LearningAgent from './LearningAgent';
import MathDiagram from './MathDiagram';

// ─── Curriculum labels ────────────────────────────────────────────────────
const CURRICULUM_LABELS: Record<Curriculum, { zh: string; en: string; flag: string; color: string }> = {
  CN: { zh: '中国课程（人教版）', en: 'Chinese Curriculum (PEP)', flag: '🇨🇳', color: '#ef4444' },
  US: { zh: '美国课程（Common Core）', en: 'US Curriculum (Common Core)', flag: '🇺🇸', color: '#3b82f6' },
  UK: { zh: '英国课程（National Curriculum）', en: 'UK Curriculum (NC)', flag: '🇬🇧', color: '#8b5cf6' },
  SG: { zh: '新加坡课程（MOE）', en: 'Singapore Curriculum (MOE)', flag: '🇸🇬', color: '#f59e0b' },
  IB: { zh: 'IB课程（MYP）', en: 'IB Curriculum (MYP)', flag: '🌐', color: '#10b981' },
};

// ─── sanitizeMath ─────────────────────────────────────────────────────────
// Fixes malformed LaTeX in AI output before KaTeX rendering.
// Handles all known failure patterns collected from real AI output.
function sanitizeMath(text: string): string {

  // ── Step 0: Fix escaped dollar signs ────────────────────────────────
  // \$ (AI sometimes writes \$ instead of $) → $
  text = text.replace(/\\\$/g, '$');

  // ── Step 1: Remove unsupported commands ──────────────────────────────
  // \parallelogram → plain text (AI-invented command, not real LaTeX)
  text = text.replace(/\\parallelogram/g, '平行四边形');
  // \backsim → \sim
  text = text.replace(/\\backsim/g, '\\sim');
  // \text{...} outside math — strip the wrapper, keep the content
  text = text.replace(/\\text\{([^}]*)\}/g, '$1');
  // \implies → \Rightarrow
  text = text.replace(/\\implies/g, '\\Rightarrow');
  // \because / \therefore → plain Chinese
  text = text.replace(/\\because/g, '因为');
  text = text.replace(/\\therefore/g, '所以');

  // ── Step 2: Fix double/triple-dollar at end of inline expression ─────
  // Pattern: $$$ → $ (three consecutive dollars, keep only one)
  text = text.replace(/\$\$\$+/g, '$');
  // Pattern: \cmd letters$$ → $\cmd letters$
  // e.g. "\triangle DFE$$" → "$\triangle DFE$"
  text = text.replace(/\\(triangle|angle|sim|cong|perp|parallel|odot)\s*([A-Za-z]{0,4})\$\$/g,
    (_, cmd, letters) => `$\\${cmd}${letters ? ' ' + letters : ''}$`);
  // Pattern: $expr$$ → $expr$  (one extra $ at end)
  text = text.replace(/(\$[^$\n]+)\$\$/g, '$1$');
  // Also: word$$ → word$ (bare $$ after non-math text followed by space/punctuation)
  text = text.replace(/([^$\n])\$\$(\s|;|。|，|）|\))/g, (_, before, after) => `${before}$${after}`);

  // ── Step 3: Wrap bare LaTeX commands that are outside $...$ ──────────
  // Order matters: longest/most specific patterns first.

  // \odot X  (circle notation)
  text = text.replace(/(?<!\$)(?<!\\)\\odot\s*([A-Za-z])/g, '$\\odot $1$');

  // \angle ABC (1–4 letters)
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\angle\s+([A-Za-z]{1,4})/g, '$\\angle $1$');
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\angle([A-Za-z]{1,4})/g, '$\\angle $1$');
  // Fix: $\angle XYZ missing closing $ before punctuation
  text = text.replace(/(\$\\angle\s+[A-Za-z]{1,4})([^$\w])/g,
    (_, expr, after) => `${expr}$${after}`);

  // \triangle ABC (2–4 letters), handles trailing Chinese punctuation
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\triangle\s+([A-Za-z]{2,4})/g, '$\\triangle $1$');
  text = text.replace(/(?<!\$)(?<!\\frac\{)\\triangle([A-Za-z]{2,4})/g, '$\\triangle $1$');
  // Fix: $\triangle XYZ missing closing $ before punctuation
  // Use function replacement to avoid $1/$2 capture group conflicts
  text = text.replace(/(\$\\triangle\s+[A-Za-z]{2,4})([^$\w])/g,
    (_, expr, after) => `${expr}$${after}`);

  // \parallel (standalone or before letters)
  text = text.replace(/(?<!\$)(?<!\\)\\parallel\s+([A-Za-z]{1,4})/g, '$\\parallel $1$');
  text = text.replace(/(?<!\$)(?<!\\)\\parallel(?![}\s]*[A-Za-z])/g, '$\\parallel$');

  // \perp (standalone or between identifiers)
  // e.g. "CF\perp BE" → "$CF \perp BE$"
  text = text.replace(/([A-Za-z]{1,4})\s*\\perp\s*([A-Za-z]{1,4})/g, '$$$1 \\perp $2$$');
  // remaining bare \perp
  text = text.replace(/(?<!\$)(?<!\\)\\perp(?!\})/g, '$\\perp$');

  // \sim (similarity) standalone
  text = text.replace(/(?<!\$)(?<!\\)\\sim(?![a-z])/g, '$\\sim$');

  // \cong (congruence) standalone
  text = text.replace(/(?<!\$)(?<!\\)\\cong(?![a-z])/g, '$\\cong$');

  // \overset{\frown}{AB} arc notation
  text = text.replace(/(?<!\$)\\overset\{\\frown\}\{([A-Za-z]{2})\}/g, '$\\overset{\\frown}{$1}$');

  // ── Step 4: Fix mismatched $ signs ───────────────────────────────────
  // Pattern: word$\cmd  (missing opening $)
  // e.g. "CF$\perp BE$" → "$CF \perp BE$"
  // We catch: non-$ char immediately before $ that starts a LaTeX cmd
  text = text.replace(/([A-Za-z0-9])\$\\([a-zA-Z]+)/g, '$$$$1 \\$2');

  // ── Step 5: Fix plain-text math symbols written without $ ────────────
  // "odot X" (missing backslash and dollar)
  text = text.replace(/\bodot\s+([A-Z])/g, '$\\odot $1$');
  // "perp" as plain word
  text = text.replace(/\bperp\b/g, '$\\perp$');
  // "parallel" as plain word before letters
  text = text.replace(/\bparallel\s*([A-Z]{1,3})/g, '$\\parallel $1$');

  // ── Step 6: Clean up doubled $$ that may have been introduced ────────
  // $$ inside inline context (not at start of line = display math)
  // Only collapse mid-line $$expr$$ that should be $expr$
  text = text.replace(/(?<!^)\$\$([^$\n]{1,80})\$\$(?!\n)/gm, '$$$1$$');

  // ── Step 7: Remove \left( \right) wrappers (KaTeX chokes on these) ───
  text = text.replace(/\\left\(/g, '(');
  text = text.replace(/\\right\)/g, ')');
  text = text.replace(/\\left\[/g, '[');
  text = text.replace(/\\right\]/g, ']');

  return text;
}


interface PracticeCenterProps {
  concept: Concept | null;
  lang: Language;
  curriculum?: Curriculum | null;
  searchQuery?: string;
  onSelectTopic?: (query: string) => Promise<void>;
}

const PracticeCenter: React.FC<PracticeCenterProps> = ({
  concept,
  lang,
  curriculum = null,
  searchQuery,
  onSelectTopic
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [grade, setGrade]           = useState<Grade>('8');
  const [count, setCount]           = useState(1);
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading]       = useState(false);
  const [solving, setSolving]       = useState(false);
  const [exercises, setExercises]   = useState<string | null>(null);
  const [solution, setSolution]     = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isGuiding, setIsGuiding]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleReset = () => {
    setExercises(null); setSolution(null); setShowSolution(false);
    setIsGuiding(false); setError(null);
    setDifficulty('Medium'); setGrade('8'); setCount(1); setRequirement('');
  };

  const t = {
    zh: {
      settings: '练习设置',
      diffLabel: '难度系数',
      gradeLabel: '适合年级',
      countLabel: '题目数量',
      reqLabel: '特定要求（可选）',
      reqPlaceholder: '输入关键词，如：折叠、实际应用、最短路径...',
      generateBtn: '开启题目训练',
      guideBtn: '引导解题',
      showAnswer: '参考答案',
      hideAnswer: '显示题目',
      desc: '请在左侧选择或输入你想练习的知识点。AI 将根据选定的难度和年级为你设计习题。',
      guidingTitle: '解题引导',
      selectPrompt: '准备进入训练 - 请先在左侧选择具体知识点',
      reset: '重置',
      curriculumActive: '已启用课程体系',
    },
    en: {
      settings: 'Practice Settings',
      diffLabel: 'Difficulty',
      gradeLabel: 'Grade Level',
      countLabel: 'Quantity',
      reqLabel: 'Requirement (Optional)',
      reqPlaceholder: 'e.g., folding, word problems, coordinates...',
      generateBtn: 'Generate Exercises',
      guideBtn: 'Guide Me',
      showAnswer: 'Show Answer',
      hideAnswer: 'Show Problems',
      desc: 'Select or enter a topic on the left. AI will design exercises for your difficulty and grade.',
      guidingTitle: 'Solution Guide',
      selectPrompt: 'Ready to Train - Please select a topic from the sidebar first',
      reset: 'Reset',
      curriculumActive: 'Curriculum active',
    }
  }[lang];

  const handleGenerate = async () => {
    let activeConcept = concept;

    if (!activeConcept && searchQuery && onSelectTopic) {
      setLoading(true);
      try { await onSelectTopic(searchQuery); } catch (e) {}
      setLoading(false);
      return;
    }
    if (!activeConcept) return;

    setLoading(true);
    setExercises(null); setSolution(null); setShowSolution(false); setIsGuiding(false); setError(null);
    try {
      const specificTitle = activeConcept.specificFocus ? activeConcept.specificFocus[lang] : activeConcept.title[lang];
      const promptContext = `${specificTitle}${requirement ? ` (Special focus: ${requirement})` : ' (Ensure maximum variety of problem types, randomize sub-scenarios)'}`;
      const result = await generateExercises(
        promptContext,
        activeConcept.description[lang],
        grade, difficulty, count, lang,
        curriculum
      );
      setExercises(result);
    } catch (err: any) {
      setError(err?.message === 'AI_INTERNAL_ERROR'
        ? (lang === 'zh' ? '生成出错，请稍后重试。' : 'Evaluation error, please try again.')
        : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnswer = async () => {
    if (showSolution) { setShowSolution(false); return; }
    if (solution) { setShowSolution(true); return; }
    if (!exercises) return;
    setSolving(true);
    try {
      const result = await solveExercises(exercises, lang);
      setSolution(result);
      setShowSolution(true);
    } catch (err) { console.error(err); }
    finally { setSolving(false); }
  };

  // ── Markdown components ────────────────────────────────────────────────
  const mdComponents = {
    p({ node, children }: any) {
      const textSource = Array.isArray(children) ? children : [children];
      const text = textSource.map((child: any) => {
        if (typeof child === 'string') return child;
        if (child?.props?.children) return String(child.props.children);
        return '';
      }).join('');
      const isDiagramOnly = (text.trim().startsWith('{') && text.trim().endsWith('}') &&
        (text.includes('"template"') || text.includes('"type"') ||
         text.includes('"geometry"') || text.includes('"window"') || text.includes('"points"'))) ||
        text.trim().includes('\nrect ') || text.trim().includes('\nline ') ||
        text.trim().startsWith('rect ') || text.trim().startsWith('line ');
      if (isDiagramOnly) {
        try {
          const m = text.match(/(\{[\s\S]*\})/);
          return <MathDiagram data={m ? JSON.parse(m[1]) : text.trim()} />;
        } catch (e) {}
      }
      return <p className="mb-4">{children}</p>;
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const content = String(children).replace(/\n$/, '');
      const isDiagram = content.includes('"template"') || content.includes('"type"') ||
        content.includes('"geometry"') || content.includes('"window"') ||
        content.includes('"points"') ||
        content.includes('\nrect ') || content.includes('\nline ') ||
        content.startsWith('rect ') || content.startsWith('line ');
      if (!inline && ((match && match[1] === 'math-diagram') || isDiagram)) {
        try {
          const m = content.match(/(\{[\s\S]*\})/);
          return <MathDiagram data={m ? JSON.parse(m[1]) : content.trim()} />;
        } catch (e) {}
      }
      return <code className={className} {...props}>{children}</code>;
    }
  };

  const currInfo = curriculum ? CURRICULUM_LABELS[curriculum] : null;

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-brand-bg)]">
      <div className="max-w-6xl mx-auto p-8 md:p-12 space-y-8">

        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-[var(--color-brand-accent)]" />
              {lang === 'zh' ? '专项习题训练' : 'Practice Forge'}
            </h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-xl">{t.desc}</p>
          </div>

          {currInfo && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border flex-shrink-0"
              style={{ color: currInfo.color, borderColor: `${currInfo.color}50`, background: `${currInfo.color}12` }}
            >
              <span className="text-base">{currInfo.flag}</span>
              <div>
                <div className="text-[9px] opacity-60 uppercase tracking-widest mb-0.5">{t.curriculumActive}</div>
                <div>{currInfo[lang]}</div>
              </div>
            </div>
          )}
        </header>

        {/* Settings card */}
        <section className="p-8 dark-card rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
                <Settings2 className="w-3 h-3 text-[var(--color-brand-accent)]" />
                {t.diffLabel}
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
              >
                <option value="Easy">{lang === 'zh' ? '入门' : 'Easy'}</option>
                <option value="Medium">{lang === 'zh' ? '进阶' : 'Medium'}</option>
                <option value="Hard">{lang === 'zh' ? '挑战' : 'Hard'}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
                <RefreshCw className="w-3 h-3 text-[var(--color-brand-accent)]" />
                {t.gradeLabel}
              </label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value as Grade)}
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
              >
                {(['6', '7', '8', '9'] as Grade[]).map(g => (
                  <option key={g} value={g}>{lang === 'zh' ? `${g}年级` : `Grade ${g}`}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
                <ListOrdered className="w-3 h-3 text-[var(--color-brand-accent)]" />
                {t.countLabel}
              </label>
              <input
                type="number" min="1" max="10"
                value={count}
                onChange={e => setCount(parseInt(e.target.value))}
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1">
                <HelpCircle className="w-3 h-3 text-[var(--color-brand-accent)]" />
                {t.reqLabel}
              </label>
              <input
                type="text"
                value={requirement}
                onChange={e => setRequirement(e.target.value)}
                placeholder={t.reqPlaceholder}
                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 h-[42px] gold-btn rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                  <><RefreshCw className="w-4 h-4" />{t.generateBtn}</>
                )}
              </button>
              {(exercises || error || count !== 1 || difficulty !== 'Medium' || requirement) && (
                <button
                  onClick={handleReset}
                  className="h-[42px] px-4 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2 border border-slate-700"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t.reset}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-900/10 border border-red-900/30 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
              <button onClick={handleGenerate} className="px-3 py-1 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/30 transition-colors">
                {lang === 'zh' ? '重试' : 'Retry'}
              </button>
            </motion.div>
          )}

          {exercises ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="dark-card rounded-3xl p-10 overflow-hidden relative">
                <div className="markdown-body prose prose-invert max-w-none prose-sm prose-p:leading-relaxed relative z-10">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={mdComponents}
                  >
                    {sanitizeMath(showSolution ? (solution || '') : exercises)}
                  </ReactMarkdown>
                </div>

                {isGuiding && concept && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-10 border-t border-[var(--color-brand-border)] pt-8"
                  >
                    <div className="bg-slate-900/40 rounded-2xl border border-[var(--color-brand-accent)]/20 overflow-hidden">
                      <div className="px-6 py-3 bg-[var(--color-brand-accent)]/5 border-b border-[var(--color-brand-accent)]/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-[var(--color-brand-accent)]" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.guidingTitle}</span>
                        </div>
                        <button onClick={() => setIsGuiding(false)} className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">CLOSE</button>
                      </div>
                      <div className="h-[700px]">
                        <LearningAgent
                          concept={concept}
                          lang={lang}
                          curriculum={curriculum}
                          autoStart={true}
                          mode="guide"
                          initialContext={exercises}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-16 flex flex-wrap gap-4 border-t border-[var(--color-brand-border)] pt-8">
                  <button
                    onClick={() => setIsGuiding(!isGuiding)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all border uppercase tracking-widest ${
                      isGuiding
                        ? 'bg-[var(--color-brand-accent)] text-white border-[var(--color-brand-accent)] shadow-lg'
                        : 'bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] border-[var(--color-brand-accent)]/30 hover:bg-[var(--color-brand-accent)]/20'
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    {t.guideBtn}
                  </button>
                  <button
                    onClick={handleShowAnswer}
                    disabled={solving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold border transition-all uppercase tracking-widest ${
                      showSolution
                        ? 'bg-slate-700 text-slate-100 border-slate-600'
                        : 'bg-emerald-900/10 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20'
                    }`}
                  >
                    {solving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    {showSolution ? t.hideAnswer : t.showAnswer}
                  </button>
                </div>
              </div>

              <div className="bg-amber-900/10 p-8 rounded-3xl border border-amber-900/20 flex gap-6 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-[var(--color-brand-accent)]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-[var(--color-brand-accent)] uppercase tracking-[0.2em] text-xs">
                    {showSolution
                      ? (lang === 'zh' ? '参考答案已开启' : 'Reference Active')
                      : (lang === 'zh' ? '解题引导方针' : 'Guideline for Solving')}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {showSolution
                      ? (lang === 'zh'
                        ? '如果你对答案有疑问，请点击"引导解题"开始交互学习。'
                        : 'If you have questions about the answer, click "Guide Me" to start.')
                      : (lang === 'zh'
                        ? '本工具支持直接查看答案，也支持通过"引导解题"进行深度思考。建议先独立思考再核对。'
                        : 'Try solving independently before checking. Use "Guide Me" for deeper understanding.')}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center px-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 text-slate-600">
                <Brain className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">
                {concept ? concept.title[lang] : t.selectPrompt}
              </h3>
              <p className="text-slate-600 max-w-xs text-sm">
                {concept
                  ? (lang === 'zh' ? '设置好参数后点击上方按钮即可生成习题。' : 'Click the button above to generate exercises.')
                  : t.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && !exercises && (
          <div className="py-24 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-[3px] border-slate-800 border-t-[var(--color-brand-accent)] rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] animate-pulse">Curating Challenges</p>
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Constructing the forge...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCenter;
