import React, { useState } from 'react';
import { PolicyAnalysis } from '../types';
import FlashcardDeck from './FlashcardDeck';
import { BookOpen, Lightbulb, ListChecks, BrainCircuit, History, AlertTriangle, Link as LinkIcon, Cpu } from 'lucide-react';

interface Props {
  data: PolicyAnalysis;
  lang: 'zh' | 'en';
}

const AnalysisResult: React.FC<Props> = ({ data, lang }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'core' | 'articles' | 'memorize'>('articles');

  const t = {
    zh: {
      tabs: {
        history: "历史版本",
        core: "核心要点",
        articles: "条款 & PM设计重点",
        memorize: "记忆卡片"
      },
      headers: {
        tldr: "最新版本核心摘要",
        concepts: "关键概念定义",
        history_timeline: "政策沿革",
        article_list: "详细条款与系统设计要点",
        sources: "参考来源 (gov.cn优先)"
      },
      pm_alert: "产品经理/系统设计注意",
      priority: {
        high: "高优先级",
        medium: "中优先级",
        low: "低优先级"
      }
    },
    en: {
      tabs: {
        history: "History",
        core: "Core Points",
        articles: "Clauses & Design",
        memorize: "Flashcards"
      },
      headers: {
        tldr: "Latest Version Summary",
        concepts: "Key Concepts",
        history_timeline: "Version History",
        article_list: "Detailed Clauses & System Implications",
        sources: "Sources (gov.cn prioritized)"
      },
      pm_alert: "PM / System Design Note",
      priority: {
        high: "High Priority",
        medium: "Medium Priority",
        low: "Low Priority"
      }
    }
  }[lang];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{data.title}</h2>
        <div className="flex flex-wrap items-center gap-2 text-slate-300 text-sm">
           <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">{data.tone_and_intent}</span>
        </div>
        
        {data.sources && data.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <LinkIcon size={12} /> {t.headers.sources}
            </p>
            <div className="flex flex-wrap gap-2">
              {data.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 px-2 py-1 rounded transition-colors truncate max-w-[250px]"
                >
                  {source.title || 'Source'}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[100px] py-4 text-center font-medium text-sm md:text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'history' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <History size={18} />
          {t.tabs.history}
        </button>
        <button
          onClick={() => setActiveTab('core')}
          className={`flex-1 min-w-[100px] py-4 text-center font-medium text-sm md:text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'core' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Lightbulb size={18} />
          {t.tabs.core}
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex-1 min-w-[150px] py-4 text-center font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'articles' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ListChecks size={18} />
          {t.tabs.articles}
        </button>
        <button
          onClick={() => setActiveTab('memorize')}
          className={`flex-1 min-w-[100px] py-4 text-center font-medium text-sm md:text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'memorize' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BrainCircuit size={18} />
          {t.tabs.memorize}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50/50">
        
        {/* Tab 1: History */}
        {activeTab === 'history' && (
          <div className="animate-fadeIn max-w-3xl mx-auto">
             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <History className="text-brand-500" /> {t.headers.history_timeline}
             </h3>
             <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                {data.history.map((item, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-brand-500"></div>
                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                        <span className="text-brand-700 font-bold text-lg">{item.version_name}</span>
                        <span className="text-slate-400 text-sm font-mono bg-slate-100 px-2 py-1 rounded">{item.date}</span>
                      </div>
                      <p className="text-slate-600">{item.change_summary}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Tab 2: Core Points */}
        {activeTab === 'core' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <section className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen className="text-brand-500" size={20} />
                {t.headers.tldr}
              </h3>
              <p className="text-slate-700 leading-relaxed text-lg">
                {data.summary_tldr}
              </p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="text-amber-500" size={20} />
                    {t.headers.concepts}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {data.core_concepts.map((concept, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <span className="block font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">{concept.term}</span>
                        <span className="text-slate-600 text-sm leading-relaxed">{concept.definition}</span>
                    </div>
                    ))}
                </div>
            </section>
          </div>
        )}

        {/* Tab 3: Detailed Articles & PM Highlights (Main Feature) */}
        {activeTab === 'articles' && (
          <div className="animate-fadeIn max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <ListChecks className="text-brand-500" /> {t.headers.article_list}
                </h3>
                <div className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                    带 <Cpu size={12} className="inline text-amber-500" /> 图标为涉及系统设计条款
                </div>
            </div>
            
            {data.articles.map((article, idx) => {
                const hasDesignImplication = article.design_priority !== 'none' && article.system_design_implication;
                const priorityColor = article.design_priority === 'high' ? 'text-red-600 bg-red-50 border-red-200' : 
                                      article.design_priority === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-200';

                return (
                    <div key={idx} className={`bg-white rounded-xl border ${hasDesignImplication ? 'border-amber-300 shadow-md ring-1 ring-amber-100' : 'border-slate-200 shadow-sm'} overflow-hidden transition-all`}>
                        {/* Article Header */}
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700">{article.article_number} {article.chapter && <span className="text-slate-400 font-normal text-sm ml-2">- {article.chapter}</span>}</span>
                            {hasDesignImplication && (
                                <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${priorityColor}`}>
                                    {t.priority[article.design_priority as 'high'|'medium'|'low']}
                                </span>
                            )}
                        </div>

                        {/* Article Content */}
                        <div className="p-6">
                            <p className="text-slate-700 mb-4 leading-relaxed">{article.content}</p>

                            {/* PM Highlight Box */}
                            {hasDesignImplication && (
                                <div className="mt-4 bg-amber-50/50 rounded-lg border border-amber-100 p-4 flex gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        <AlertTriangle size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-800 mb-1 flex items-center gap-1">
                                            {t.pm_alert}
                                        </h4>
                                        <p className="text-sm text-amber-900/80 leading-relaxed">
                                            {article.system_design_implication}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
          </div>
        )}

        {/* Tab 4: Flashcards */}
        {activeTab === 'memorize' && (
          <div className="animate-fadeIn pt-4">
             <FlashcardDeck cards={data.flashcards} lang={lang} />
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalysisResult;