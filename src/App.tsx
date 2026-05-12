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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KNOWLEDGE_GRAPH } from './data/knowledgeGraph';
import { Concept, Language, Curriculum, Difficulty, Grade } from './types';
import { identifyTopic } from './services/geminiService';
import LearningAgent from './components/LearningAgent';
import PracticeCenter from './components/PracticeCenter';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [activeTab, setActiveTab] = useState<'learn' | 'practice'>('learn');
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResult, setAiResult] = useState<{
    refinedTitle: { zh: string; en: string };
    description: { zh: string; en: string };
    existingId: string | null;
    matchedModule: string;
    level: number;
  } | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (moduleId: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setAiResult(null);
      setIsAiSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiSearching(true);
      setQuotaExceeded(false);
      try {
        const result = await identifyTopic(searchQuery, lang);
        if (result) {
          setAiResult(result);
        }
      } catch (err: any) {
        console.error(err);
        if (err?.message === 'QUOTA_EXHAUSTED') {
          setQuotaExceeded(true);
        }
      } finally {
        setIsAiSearching(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchQuery, lang]);

  const handleAiSearch = async (query?: string) => {
    const effectiveQuery = query || searchQuery;
    if (!effectiveQuery.trim()) return;
    
    // Check if we already have a selected concept that matches the intent to avoid flickering/reset
    const currentTarget = aiResult?.refinedTitle || { zh: effectiveQuery, en: effectiveQuery };
    if (selectedConcept && (selectedConcept.specificFocus?.zh === currentTarget.zh)) {
      // Already correctly focused, don't reset unless user explicitly wants to
      return;
    }

    if (aiResult) {
      if (aiResult.existingId) {
        for (const module of KNOWLEDGE_GRAPH) {
          const found = module.concepts.find(c => c.id === aiResult.existingId);
          if (found) {
            setSelectedConcept({
              ...found,
              specificFocus: aiResult.refinedTitle
            });
            return;
          }
        }
      }
      
      const dynamicConcept: Concept = {
        id: `dynamic-${aiResult.matchedModule}-${lang}-${Math.random().toString(36).substr(2, 5)}`,
        title: aiResult.refinedTitle,
        module: aiResult.matchedModule,
        level: aiResult.level,
        description: aiResult.description,
        skills: [{ zh: 'AI 匹配', en: 'AI Matched' }],
        emphasis: {},
        relatedNodes: [],
        specificFocus: aiResult.refinedTitle
      };
      setSelectedConcept(dynamicConcept);
    } else {
      const dynamicConcept: Concept = {
        id: `dynamic-raw-${effectiveQuery}-${lang}-${Math.random().toString(36).substr(2, 5)}`,
        title: { zh: effectiveQuery, en: effectiveQuery },
        module: lang === 'zh' ? '自主探索' : 'Self-Discovery',
        level: 3,
        description: { 
          zh: `正在围绕“${effectiveQuery}”进行针对性匹配与讲解...`, 
          en: `Matching and explaining specifically for "${effectiveQuery}"...` 
        },
        skills: [{ zh: '即时匹配', en: 'Direct Match' }],
        emphasis: {},
        relatedNodes: [],
        specificFocus: { zh: effectiveQuery, en: effectiveQuery }
      };
      setSelectedConcept(dynamicConcept);
    }
  };

  const t = {
    zh: {
      title: '中数智绘 EduGraph',
      subtitle: '全体系初中数学 AI 学习工具',
      searchPlaceholder: '输入想要学习的知识点...',
      learnTab: '知识讲解',
      practiceTab: '习题练习',
      exploration: '知识探究',
      selectToStart: '请在侧边栏选择一个知识点开始学习',
      curriculum: '课程体系',
      related: '相关知识点'
    },
    en: {
      title: 'EduGraph Math',
      subtitle: 'AI Math Knowledge Graph Tool',
      searchPlaceholder: 'Search for a concept...',
      learnTab: 'Learning',
      practiceTab: 'Practice',
      exploration: 'Exploration',
      selectToStart: 'Select a concept from the sidebar to start',
      curriculum: 'Curriculum',
      related: 'Related Nodes'
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
    })).filter(module => module.concepts.length > 0);
  }, [searchQuery]);

  const getModuleIcon = (id: string) => {
    switch(id) {
      case 'algebra': return <Binary className="w-5 h-5" />;
      case 'geometry': return <Shapes className="w-5 h-5" />;
      case 'statistics': return <BarChart3 className="w-5 h-5" />;
      case 'modeling': return <Dna className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-brand-bg)] text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] flex flex-col">
        <div className="p-6 border-b border-[var(--color-brand-border)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[var(--color-brand-accent)] rounded-lg text-brand-bg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">{t.title}</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{t.subtitle}</p>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-12 py-2 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-xl text-sm focus:ring-1 focus:ring-[var(--color-brand-accent)] transition-all text-slate-200 placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
            />
          </div>

          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <button
                  onClick={() => handleAiSearch()}
                  className="w-full text-left p-3 rounded-xl bg-indigo-900/30 border border-indigo-500/30 shadow-lg group transition-all hover:bg-indigo-800/40"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isAiSearching ? 'bg-indigo-500/20' : 'bg-indigo-500/10'} group-hover:bg-indigo-500/20 transition-colors`}>
                      {isAiSearching ? (
                        <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
                        {isAiSearching ? (lang === 'zh' ? '正在智能识别...' : 'AI Identifying...') : (lang === 'zh' ? '智能匹配推荐' : 'AI Best Match')}
                      </div>
                      <div className="text-sm font-bold text-white mb-0.5 truncate">
                        {aiResult?.refinedTitle[lang] || searchQuery}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 italic">
                        {quotaExceeded 
                          ? (lang === 'zh' ? 'API 额度暂用完，建议尝试内置知识点' : 'Quota exceeded, try built-in topics')
                          : aiResult 
                            ? aiResult.description[lang] 
                            : (lang === 'zh' ? '正在为你深度匹配知识点' : 'Deep matching for you...')}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-6 scrollbar-hide">
          {filteredGraph.map((module) => {
            const isCollapsed = collapsedModules[module.id] && !searchQuery;
            return (
              <div key={module.id} className="space-y-2">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-slate-400 font-semibold text-xs uppercase tracking-wider group hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getModuleIcon(module.id)}
                    <span>{module.name[lang]}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
                </button>
                
                {!isCollapsed && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1 overflow-hidden"
                  >
                    {module.concepts.map((concept, idx) => (
                      <button
                        key={`${module.id}-${concept.id}-${idx}`}
                        onClick={() => {
                          const focus = aiResult?.refinedTitle || (searchQuery.trim() ? { zh: searchQuery.trim(), en: searchQuery.trim() } : undefined);
                          
                          // Avoid reset if already logically same
                          const currentFocusZh = selectedConcept?.specificFocus?.zh?.toLowerCase()?.trim();
                          const newFocusZh = focus?.zh?.toLowerCase()?.trim();

                          if (selectedConcept?.id === concept.id && 
                              ((!newFocusZh && !currentFocusZh) || 
                               (newFocusZh === currentFocusZh))) {
                            return;
                          }

                          if (searchQuery) {
                            setSelectedConcept({
                              ...concept,
                              specificFocus: focus
                            });
                          } else {
                            setSelectedConcept(concept);
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${
                          selectedConcept?.id === concept.id 
                          ? 'bg-[var(--color-brand-card)] text-[var(--color-brand-accent)] border border-[var(--color-brand-border)] shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <span className="line-clamp-1">{concept.title[lang]}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all ${
                          selectedConcept?.id === concept.id ? 'opacity-100 translate-x-0' : '-translate-x-1'
                        }`} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-[var(--color-brand-border)]">
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-2 px-3 py-2 w-full justify-center rounded-lg bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-300"
          >
            <Languages className="w-4 h-4" />
            {lang === 'zh' ? 'ENGLISH' : '切换中文'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--color-brand-bg)]">
        {/* Header Tabs */}
        <header className="px-8 py-4 flex items-center justify-between border-b border-[var(--color-brand-border)] bg-[var(--color-brand-bg)]/80 backdrop-blur-md z-10">
          <div className="flex gap-2 p-1 bg-[var(--color-brand-card)] rounded-xl border border-[var(--color-brand-border)]">
            <button 
              onClick={() => setActiveTab('learn')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'learn' 
                ? 'bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {t.learnTab}
            </button>
            <button 
              onClick={() => setActiveTab('practice')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'practice' 
                ? 'bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] shadow-lg' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              {t.practiceTab}
            </button>
          </div>

          {selectedConcept && (
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] px-4 py-2 rounded-full uppercase tracking-widest">
              <span className="flex items-center gap-1.5 line-clamp-1">
                <Settings2 className="w-3 h-3 flex-shrink-0 text-[var(--color-brand-accent)]" /> 
                {lang === 'zh' ? '知识难度' : 'Progression'} Lv.{selectedConcept.level}
              </span>
              <span className="w-px h-3 bg-slate-700 flex-shrink-0" />
              <span className="line-clamp-1 text-slate-400">{selectedConcept.module}</span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'learn' ? (
              !selectedConcept ? (
                <motion.div 
                  key="learn-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-28 h-28 rounded-3xl flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0 dark-card">
                    <BrainCircuit className="w-14 h-14 text-[var(--color-brand-accent)]" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    {t.learnTab}
                  </h2>
                  <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-8">
                    {lang === 'zh' 
                      ? '请在左侧选择或者输入你想学习的知识点。' 
                      : 'Please select or enter the knowledge point you want to learn on the left.'}
                  </p>
                  {searchQuery && (
                    <button 
                      onClick={() => handleAiSearch()}
                      disabled={isAiSearching}
                      className="gold-btn px-8 py-3 rounded-xl flex items-center gap-2"
                    >
                      {isAiSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {lang === 'zh' ? '基于搜索项开始讲解' : 'Start Explaining from Search'}
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key={selectedConcept.id + (selectedConcept.specificFocus?.zh || '')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <LearningAgent concept={selectedConcept} lang={lang} />
                </motion.div>
              )
            ) : (
              <motion.div 
                key="practice-active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <PracticeCenter 
                  concept={selectedConcept} 
                  lang={lang} 
                  searchQuery={searchQuery}
                  onSelectTopic={handleAiSearch}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
