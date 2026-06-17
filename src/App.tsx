import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Search, 
  Settings2, 
  Languages, 
  ChevronRight, 
  BrainCircuit,
  Binary,
  Shapes,
  BarChart3,
  Dna,
  RefreshCw,
  Sparkles,
  FlaskConical,
  LineChart,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KNOWLEDGE_GRAPH } from './data/knowledgeGraph';
import { Concept, Language, Curriculum } from './types';
import { identifyTopic } from './services/geminiService';
import LearningAgent from './components/LearningAgent';
import PracticeCenter from './components/PracticeCenter';
import FormulaVisualizer from './components/FormulaVisualizer';

// ─── Curriculum config ────────────────────────────────────────────────────
const CURRICULA: {
  id: Curriculum;
  flag: string;
  label: { zh: string; en: string };
  shortLabel: string;
  color: string;
}[] = [
  { id: 'CN', flag: 'cn', label: { zh: '中国',    en: 'China' },     shortLabel: 'CN', color: '#ef4444' },
  { id: 'US', flag: 'us', label: { zh: '美国',    en: 'US' },        shortLabel: 'US', color: '#3b82f6' },
  { id: 'UK', flag: 'gb', label: { zh: '英国',    en: 'UK' },        shortLabel: 'UK', color: '#8b5cf6' },
  { id: 'SG', flag: 'sg', label: { zh: '新加坡',  en: 'Singapore' }, shortLabel: 'SG', color: '#f59e0b' },
  { id: 'IB', flag: '',   label: { zh: 'IB课程',  en: 'IB' },        shortLabel: 'IB', color: '#10b981' },
];

const CurriculumFlag: React.FC<{ code: string; size?: number }> = ({ code, size = 22 }) => {
  if (!code) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
        <circle cx="12" cy="12" r="10"/>
        <ellipse cx="12" cy="12" rx="4" ry="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      width={size + 4}
      height={size}
      alt={code.toUpperCase()}
      className="rounded-sm object-cover"
      style={{ width: size + 4, height: Math.round(size * 0.67) }}
    />
  );
};

const getModuleIcon = (id: string) => {
  switch (id) {
    case 'algebra':    return <Binary className="w-4 h-4" />;
    case 'geometry':   return <Shapes className="w-4 h-4" />;
    case 'statistics': return <BarChart3 className="w-4 h-4" />;
    case 'modeling':   return <Dna className="w-4 h-4" />;
    case 'reasoning':  return <FlaskConical className="w-4 h-4" />;
    default:           return <BookOpen className="w-4 h-4" />;
  }
};

const DEFAULT_COLLAPSED: Record<string, boolean> = {
  algebra: true, geometry: true, statistics: true, modeling: true, reasoning: true,
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [lang, setLang]                       = useState<Language>('zh');
  const [activeTab, setActiveTab]             = useState<'learn' | 'practice'>('learn');
  const [activeView, setActiveView]           = useState<'knowledge' | 'formula'>('knowledge'); // ← NEW
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [isAiSearching, setIsAiSearching]     = useState(false);
  const [aiResult, setAiResult]               = useState<{
    refinedTitle: { zh: string; en: string };
    description: { zh: string; en: string };
    existingId: string | null;
    matchedModule: string;
    level: number;
  } | null>(null);
  const [quotaExceeded, setQuotaExceeded]     = useState(false);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>(DEFAULT_COLLAPSED);
  const [curriculum, setCurriculum]           = useState<Curriculum | null>(null);
  const [mobileNavOpen, setMobileNavOpen]     = useState(false);

  const toggleModule = (moduleId: string) => {
    setCollapsedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  React.useEffect(() => {
    if (!searchQuery.trim()) { setAiResult(null); setIsAiSearching(false); return; }
    const timer = setTimeout(async () => {
      setIsAiSearching(true);
      setQuotaExceeded(false);
      try {
        const result = await identifyTopic(searchQuery, lang);
        if (result) setAiResult(result);
      } catch (err: any) {
        console.error(err);
        if (err?.message === 'QUOTA_EXHAUSTED') setQuotaExceeded(true);
      } finally {
        setIsAiSearching(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [searchQuery, lang]);

  const handleAiSearch = async (query?: string) => {
    const effectiveQuery = query || searchQuery;
    if (!effectiveQuery.trim()) return;

    const currentTarget = aiResult?.refinedTitle || { zh: effectiveQuery, en: effectiveQuery };
    if (selectedConcept && selectedConcept.specificFocus?.zh === currentTarget.zh) return;

    if (aiResult) {
      if (aiResult.existingId) {
        for (const module of KNOWLEDGE_GRAPH) {
          const found = module.concepts.find(c => c.id === aiResult.existingId);
          if (found) { setSelectedConcept({ ...found, specificFocus: aiResult.refinedTitle }); return; }
        }
      }
      setSelectedConcept({
        id: `dynamic-${aiResult.matchedModule}-${lang}-${Math.random().toString(36).substr(2, 5)}`,
        title: aiResult.refinedTitle,
        module: aiResult.matchedModule,
        level: aiResult.level,
        description: aiResult.description,
        skills: [{ zh: 'AI 匹配', en: 'AI Matched' }],
        emphasis: {},
        relatedNodes: [],
        specificFocus: aiResult.refinedTitle
      });
    } else {
      setSelectedConcept({
        id: `dynamic-raw-${effectiveQuery}-${lang}-${Math.random().toString(36).substr(2, 5)}`,
        title: { zh: effectiveQuery, en: effectiveQuery },
        module: lang === 'zh' ? '自主探索' : 'Self-Discovery',
        level: 3,
        description: { zh: `正在围绕"${effectiveQuery}"进行讲解...`, en: `Explaining "${effectiveQuery}"...` },
        skills: [{ zh: '即时匹配', en: 'Direct Match' }],
        emphasis: {},
        relatedNodes: [],
        specificFocus: { zh: effectiveQuery, en: effectiveQuery }
      });
    }
  };

  const t = {
    zh: {
      title: '智能数学（初中版）',
      subtitle: '全体系初中数学 AI 学习工具',
      searchPlaceholder: '输入想要学习的知识点...',
      learnTab: '知识讲解',
      practiceTab: '习题练习',
      curriculumLabel: '课程体系',
      curriculumAll: '通用模式',
      formulaBtn: '可视化公式图',
    },
    en: {
      title: 'Smart Math (Middle School)',
      subtitle: 'AI Math Knowledge Graph Tool',
      searchPlaceholder: 'Search for a concept...',
      learnTab: 'Learning',
      practiceTab: 'Practice',
      curriculumLabel: 'Curriculum',
      curriculumAll: 'Universal',
      formulaBtn: 'Formula Visuals',
    }
  }[lang];

  const filteredGraph = useMemo(() => {
    if (!searchQuery) return KNOWLEDGE_GRAPH;
    const query = searchQuery.toLowerCase();
    return KNOWLEDGE_GRAPH.map(module => ({
      ...module,
      concepts: module.concepts.filter(c =>
        c.title.zh.toLowerCase().includes(query) ||
        c.title.en.toLowerCase().includes(query) ||
        c.description.zh.toLowerCase().includes(query) ||
        c.description.en.toLowerCase().includes(query)
      )
    })).filter(m => m.concepts.length > 0);
  }, [searchQuery]);

  const activeCurriculum = curriculum ? CURRICULA.find(c => c.id === curriculum) : null;

  return (
    <div className="flex h-screen h-[100dvh] bg-[var(--color-brand-bg)] text-slate-100 font-sans overflow-hidden">

      {/* ── Mobile overlay (tap to close drawer) ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──
          Mobile (<md): fixed off-canvas drawer, slides in from the left, full height.
          Tablet/Desktop (md+): normal in-flow, always visible, fixed width. */}
      <aside className={`
          fixed md:static inset-y-0 left-0 z-40
          w-[85vw] max-w-[320px] md:w-72
          border-r border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]
          flex flex-col shrink-0 transition-transform duration-300 ease-out
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}>

        {/* Header */}
        <div className="p-5 border-b border-[var(--color-brand-border)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 bg-[var(--color-brand-accent)] rounded-lg text-brand-bg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">{t.title}</h1>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.18em]">{t.subtitle}</p>
          </div>
          {/* Close button — mobile drawer only */}
          <button onClick={() => setMobileNavOpen(false)}
            className="md:hidden -mr-1 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Curriculum Selector */}
        <div className="px-4 pt-4 pb-2 border-b border-[var(--color-brand-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">
              {t.curriculumLabel}
            </span>
            {curriculum && (
              <button onClick={() => setCurriculum(null)}
                className="text-[10px] text-slate-600 hover:text-slate-300 transition-colors font-bold">
                {t.curriculumAll}
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
            {CURRICULA.map(c => {
              const isActive = curriculum === c.id;
              return (
                <button key={c.id} onClick={() => setCurriculum(isActive ? null : c.id)}
                  title={c.label[lang]}
                  className={`relative flex flex-col items-center gap-1 py-2 rounded-xl border transition-all
                    ${isActive
                      ? 'border-[var(--color-brand-accent)] bg-[var(--color-brand-accent)]/10 shadow-sm'
                      : 'border-[var(--color-brand-border)] bg-[var(--color-brand-card)] hover:border-slate-600 hover:bg-slate-800/60'}`}
                >
                  <CurriculumFlag code={c.flag} size={20} />
                  <span className={`text-[9px] font-bold leading-none tracking-wide ${isActive ? 'text-[var(--color-brand-accent)]' : 'text-slate-500'}`}>
                    {c.shortLabel}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: c.color }} />
                  )}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {activeCurriculum && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-2.5 px-3 py-2 rounded-xl text-[10px] font-bold tracking-wide flex items-center gap-2"
                  style={{ background: `${activeCurriculum.color}18`, border: `1px solid ${activeCurriculum.color}40`, color: activeCurriculum.color }}>
                  <CurriculumFlag code={activeCurriculum.flag} size={16} />
                  <span>{activeCurriculum.label[lang]}</span>
                  <span className="ml-auto opacity-60">✓</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input type="text" placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-xl text-xs focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all text-slate-200 placeholder:text-slate-600"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
            />
          </div>
          <AnimatePresence>
            {searchQuery && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-2">
                <button onClick={() => handleAiSearch()}
                  className="w-full text-left p-2.5 rounded-xl bg-indigo-900/30 border border-indigo-500/30 group transition-all hover:bg-indigo-800/40">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isAiSearching ? 'bg-indigo-500/20' : 'bg-indigo-500/10'} group-hover:bg-indigo-500/20 transition-colors flex-shrink-0`}>
                      {isAiSearching ? <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" /> : <Sparkles className="w-3 h-3 text-indigo-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
                        {isAiSearching ? (lang === 'zh' ? '识别中...' : 'Identifying...') : (lang === 'zh' ? 'AI 智能匹配' : 'AI Best Match')}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{aiResult?.refinedTitle[lang] || searchQuery}</div>
                      <div className="text-[9px] text-slate-400 line-clamp-1 italic mt-0.5">
                        {quotaExceeded ? (lang === 'zh' ? 'API 额度暂用完' : 'Quota exceeded')
                          : aiResult ? aiResult.description[lang]
                          : (lang === 'zh' ? '正在深度匹配...' : 'Deep matching...')}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Knowledge tree */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-3 pb-2 scrollbar-hide">
          {filteredGraph.map(module => {
            const isCollapsed = searchQuery ? false : (collapsedModules[module.id] ?? true);
            return (
              <div key={module.id} className="space-y-0.5">
                <button onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between px-2 py-2 text-slate-200 font-bold text-sm group hover:text-white transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-brand-accent)]">{getModuleIcon(module.id)}</span>
                    <span>{module.name[lang]}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-500 ${isCollapsed ? '' : 'rotate-90'}`} />
                </button>
                {!isCollapsed && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-0.5 overflow-hidden pl-1">
                    {module.concepts.map((concept, idx) => (
                      <button key={`${module.id}-${concept.id}-${idx}`}
                        onClick={() => {
                          const focus = aiResult?.refinedTitle || (searchQuery.trim() ? { zh: searchQuery.trim(), en: searchQuery.trim() } : undefined);
                          const currentFocusZh = selectedConcept?.specificFocus?.zh?.toLowerCase()?.trim();
                          const newFocusZh = focus?.zh?.toLowerCase()?.trim();
                          if (selectedConcept?.id === concept.id && ((!newFocusZh && !currentFocusZh) || newFocusZh === currentFocusZh)) return;
                          setSelectedConcept(searchQuery ? { ...concept, specificFocus: focus } : concept);
                          setActiveView('knowledge'); // ← switch back to knowledge view when clicking a concept
                          setMobileNavOpen(false); // ← auto-close drawer on mobile after selection
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                          selectedConcept?.id === concept.id && activeView === 'knowledge'
                            ? 'bg-[var(--color-brand-card)] text-[var(--color-brand-accent)] border border-[var(--color-brand-border)] shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}>
                        <span className="line-clamp-1">{concept.title[lang]}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {curriculum && concept.emphasis[curriculum] && (
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: CURRICULA.find(c => c.id === curriculum)?.color }}
                              title={concept.emphasis[curriculum]![lang]} />
                          )}
                          <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-all ${selectedConcept?.id === concept.id ? 'opacity-100' : '-translate-x-1'}`} />
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Formula Visualizer entry ── */}
        <div className="px-3 py-2 border-t border-[var(--color-brand-border)]">
          <button
            onClick={() => setActiveView(activeView === 'formula' ? 'knowledge' : 'formula')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border
              ${activeView === 'formula'
                ? 'bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] border-[var(--color-brand-accent)]/40'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent hover:border-slate-700'}`}
          >
            <LineChart className="w-4 h-4 flex-shrink-0" />
            <span>{t.formulaBtn}</span>
            {activeView === 'formula' && <span className="ml-auto text-[9px] opacity-60">✓</span>}
          </button>
        </div>

        {/* Language toggle */}
        <div className="p-3 border-t border-[var(--color-brand-border)]">
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-2 px-3 py-2 w-full justify-center rounded-lg bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:bg-slate-800 transition-colors text-xs font-bold text-slate-300">
            <Languages className="w-3.5 h-3.5" />
            {lang === 'zh' ? 'ENGLISH' : '切换中文'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--color-brand-bg)] min-w-0">

        {/* Tabs + meta bar */}
        <header className="px-3 sm:px-6 py-3 flex items-center justify-between border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/80 backdrop-blur-md z-10 gap-2 sm:gap-4">
          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileNavOpen(true)}
            className="md:hidden flex-shrink-0 p-2 -ml-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex gap-1 sm:gap-1.5 p-1 bg-[var(--color-brand-card)] rounded-xl border border-[var(--color-brand-border)] overflow-x-auto scrollbar-hide">
            <button onClick={() => { setActiveTab('learn'); setActiveView('knowledge'); }}
              className={`px-3 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'learn' && activeView === 'knowledge'
                  ? 'bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'}`}>
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">{t.learnTab}</span>
            </button>
            <button onClick={() => { setActiveTab('practice'); setActiveView('knowledge'); }}
              className={`px-3 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'practice' && activeView === 'knowledge'
                  ? 'bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'}`}>
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">{t.practiceTab}</span>
            </button>
            <button onClick={() => setActiveView('formula')}
              className={`px-3 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                activeView === 'formula'
                  ? 'bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'}`}>
              <LineChart className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">{t.formulaBtn}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
            {activeCurriculum && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border flex-shrink-0"
                style={{ color: activeCurriculum.color, borderColor: `${activeCurriculum.color}50`, background: `${activeCurriculum.color}12` }}>
                <span>{activeCurriculum.flag}</span>
                <span>{activeCurriculum.label[lang]}</span>
              </div>
            )}
            {selectedConcept && activeView === 'knowledge' && (
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] font-bold text-slate-500 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] px-2.5 sm:px-4 py-1.5 rounded-full uppercase tracking-widest min-w-0 overflow-hidden">
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Settings2 className="w-3 h-3 text-[var(--color-brand-accent)]" />
                  Lv.{selectedConcept.level}
                </span>
                <span className="w-px h-3 bg-slate-700 flex-shrink-0 hidden sm:inline-block" />
                <span className="truncate text-slate-400 hidden sm:inline">{selectedConcept.title[lang]}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ── Formula Visualizer view ── */}
            {activeView === 'formula' ? (
              <motion.div key="formula-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <FormulaVisualizer lang={lang} />
              </motion.div>

            ) : activeTab === 'learn' ? (
              !selectedConcept ? (
                <motion.div key="learn-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 rotate-3 transition-transform hover:rotate-0 dark-card">
                    <BrainCircuit className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-brand-accent)]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">{t.learnTab}</h2>
                  <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-8">
                    {lang === 'zh' ? '请点击左上角菜单选择课程体系和知识点开始学习。' : 'Tap the menu in the top-left to pick a curriculum and concept.'}
                  </p>
                  {searchQuery && (
                    <button onClick={() => handleAiSearch()} disabled={isAiSearching}
                      className="gold-btn px-8 py-3 rounded-xl flex items-center gap-2">
                      {isAiSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {lang === 'zh' ? '基于搜索项开始讲解' : 'Start from Search'}
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div key={selectedConcept.id + (selectedConcept.specificFocus?.zh || '') + (curriculum || '')}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                  <LearningAgent concept={selectedConcept} lang={lang} curriculum={curriculum} />
                </motion.div>
              )
            ) : (
              <motion.div key="practice-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <PracticeCenter concept={selectedConcept} lang={lang} curriculum={curriculum} searchQuery={searchQuery} onSelectTopic={handleAiSearch} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
