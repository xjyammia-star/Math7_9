import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { Concept, Language, Curriculum, Message } from '../types';
import { startFeynmanSession, chatStep, guideExercise, guideExerciseStep } from '../services/geminiService';
import MathDiagram from './MathDiagram';
import { sanitizeMath } from '../utils/mathUtils';
import { extractEmbeddedDiagram } from '../utils/markdownDiagram';

interface LearningAgentProps {
  concept: Concept;
  lang: Language;
  curriculum?: Curriculum | null;
  initialMessage?: string;
  initialContext?: string;
  autoStart?: boolean;
  mode?: 'learn' | 'guide';
}

const LearningAgent: React.FC<LearningAgentProps> = ({
  concept,
  lang,
  curriculum = null,
  initialMessage,
  initialContext,
  autoStart,
  mode = 'learn',
}) => {
  const [history, setHistory]     = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [isStarted, setIsStarted] = useState(autoStart || !!initialMessage);
  const [error, setError]         = useState<string | null>(null);
  const scrollRef                 = useRef<HTMLDivElement>(null);

  const t = {
    zh: {
      placeholder: '在这里输入你的思考或提问...',
      error: '生成出错，请重试。',
      startBtn: '开始引导讲解',
      welcome: '已准备好讲解',
      readyPrompt: '点击下方按钮，开始针对该知识点的费曼引导式学习。',
    },
    en: {
      placeholder: 'Type your thoughts or questions here...',
      error: 'Error generating response, please try again.',
      startBtn: 'Start Discussion',
      welcome: 'Ready to Explain',
      readyPrompt: 'Click below to start your Feynman-method guided learning session.',
    }
  }[lang];

  // Init session
  useEffect(() => {
    if (!isStarted) return;
    if (initialMessage && history.length === 0) {
      setHistory([{ role: 'model', content: initialMessage }]);
      return;
    }
    if (history.length > 0) return;

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        let resp: string;
        if (mode === 'guide' && initialContext) {
          resp = await guideExercise(initialContext, concept, lang, curriculum);
        } else {
          const targetTitle = concept.specificFocus ? concept.specificFocus[lang] : concept.title[lang];
          resp = await startFeynmanSession(initialContext || targetTitle, concept, lang, curriculum);
        }
        setHistory([{ role: 'model', content: resp }]);
      } catch (err: any) {
        setError(err?.message === 'AI_INTERNAL_ERROR' ? t.error : 'Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept, lang, curriculum, initialMessage, isStarted]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setLoading(true);
    try {
      let resp: string;
      if (mode === 'guide' && initialContext) {
        resp = await guideExerciseStep(newHistory, initialContext, concept, lang, curriculum);
      } else {
        resp = await chatStep(newHistory, lang, curriculum);
      }
      setHistory([...newHistory, { role: 'model', content: resp }]);
    } catch (err: any) {
      setError(err?.message === 'AI_INTERNAL_ERROR' ? t.error : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Markdown renderer helpers ────────────────────────────────────────
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
         text.includes('"geometry"') || text.includes('"window"'))) ||
        text.trim().includes('\nrect ') || text.trim().includes('\nline ') ||
        text.trim().startsWith('rect ') || text.trim().startsWith('line ');

      if (isDiagramOnly) {
        try {
          const m = text.match(/(\{[\s\S]*\})/);
          return <MathDiagram data={m ? JSON.parse(m[1]) : text.trim()} />;
        } catch (e) {}
      }
      const embeddedDiagram = extractEmbeddedDiagram(text);
      if (embeddedDiagram) {
        return (
          <div className="mb-4 space-y-4">
            {embeddedDiagram.leadingText && <p className="mb-0">{embeddedDiagram.leadingText}</p>}
            <MathDiagram data={embeddedDiagram.diagramData} />
            {embeddedDiagram.trailingText && <p className="mb-0">{embeddedDiagram.trailingText}</p>}
          </div>
        );
      }
      return <p className="mb-4">{children}</p>;
    },
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const content = String(children).replace(/\n$/, '');
      const isDiagram = content.includes('"template"') || content.includes('"type"') ||
        content.includes('"geometry"') || content.includes('"window"') ||
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

  // ── Not started ──────────────────────────────────────────────────────
  if (!isStarted) {
    return (
      <div className="flex flex-col h-full bg-[var(--color-brand-bg)] max-w-6xl mx-auto items-center justify-center p-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-2xl bg-[var(--color-brand-accent)]/10 flex items-center justify-center mb-6"
        >
          <Sparkles className="w-10 h-10 text-[var(--color-brand-accent)]" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">{t.welcome}: {concept.title[lang]}</h3>

        {curriculum && concept.emphasis[curriculum] ? (
          <div className="mb-8 max-w-sm mx-auto space-y-1">
            <p className="text-slate-500 text-sm">{t.readyPrompt}</p>
            <div className="mt-3 px-4 py-2.5 rounded-xl border text-xs font-medium text-left flex items-start gap-2"
              style={{
                background: 'rgba(245,158,11,0.07)',
                borderColor: 'rgba(245,158,11,0.25)',
                color: '#fbbf24'
              }}
            >
              <span className="mt-0.5 flex-shrink-0">📌</span>
              <div>
                <span className="font-bold uppercase tracking-widest text-[10px] opacity-70 block mb-0.5">
                  {lang === 'zh' ? '本课程侧重点' : 'Curriculum Focus'}
                </span>
                {concept.emphasis[curriculum]![lang]}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">{t.readyPrompt}</p>
        )}
        <button
          onClick={() => setIsStarted(true)}
          className="gold-btn px-10 py-3 rounded-xl shadow-lg flex items-center gap-2 group"
        >
          {t.startBtn}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  // ── Chat UI ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[var(--color-brand-bg)] max-w-6xl mx-auto">
      <div className="p-4 bg-[var(--color-brand-card)] border-b border-[var(--color-brand-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-brand-accent)]" />
          <h2 className="text-sm font-bold text-slate-200">
            {mode === 'guide'
              ? (lang === 'zh' ? '解题引导模式' : 'Exercise Guide Mode')
              : (lang === 'zh' ? '费曼引导模式' : 'Feynman Guided Mode')}
          </h2>
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
          Step-by-step discovery
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {history.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={`${msg.role}-${idx}`}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user'
                ? 'bg-slate-800 text-slate-400'
                : 'bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] shadow-lg'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
              msg.role === 'user'
                ? 'bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] rounded-tr-none font-medium'
                : 'bg-[var(--color-brand-card)] text-slate-200 border border-[var(--color-brand-border)] rounded-tl-none'
            }`}>
              {msg.role === 'user' ? msg.content : (
                <div className="markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={mdComponents}
                  >
                    {sanitizeMath(msg.content)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl px-4 py-3 flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-[var(--color-brand-accent)] rounded-full animate-bounce [animation-duration:800ms]" />
              <div className="w-1.5 h-1.5 bg-[var(--color-brand-accent)]/60 rounded-full animate-bounce [animation-delay:200ms] [animation-duration:800ms]" />
              <div className="w-1.5 h-1.5 bg-[var(--color-brand-accent)]/30 rounded-full animate-bounce [animation-delay:400ms] [animation-duration:800ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
            <button
              onClick={history.length === 0 ? () => setIsStarted(true) : handleSend}
              className="px-3 py-1 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/30 transition-colors"
            >
              {lang === 'zh' ? '重试' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-card)]/30">
        <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder={t.placeholder}
            className="flex-1 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl px-5 py-4 pr-16 text-sm focus:ring-1 focus:ring-[var(--color-brand-accent)] focus:border-[var(--color-brand-accent)] outline-none transition-all placeholder:text-slate-600 text-slate-200"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 p-2.5 bg-[var(--color-brand-accent)] text-[var(--color-brand-bg)] rounded-xl hover:bg-[var(--color-brand-accent-hover)] active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-4 font-bold uppercase tracking-[0.2em]">
          AI Socratic Guide • Feynman Technique
        </p>
      </div>
    </div>
  );
};

export default LearningAgent;
