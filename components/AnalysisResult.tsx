import React, { useState } from 'react';
import { PolicyAnalysis } from '../types';
import FlashcardDeck from './FlashcardDeck';
import { BookOpen, Lightbulb, ListChecks, BrainCircuit, Quote, Link as LinkIcon } from 'lucide-react';

interface Props {
  data: PolicyAnalysis;
}

const AnalysisResult: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'memorize'>('overview');

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="w-full">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{data.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-slate-300 text-sm">
              <span className="bg-slate-800 px-3 py-1 rounded-full">{data.tone_and_intent}</span>
            </div>
            {data.sources && data.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <LinkIcon size={12} /> 参考来源 (Generated via Google Search)
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                    >
                      {source.title || 'Source link'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-4 text-center font-medium text-sm md:text-base transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'overview' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Lightbulb size={18} />
          深度解析
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex-1 py-4 text-center font-medium text-sm md:text-base transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'breakdown' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ListChecks size={18} />
          核心要点
        </button>
        <button
          onClick={() => setActiveTab('memorize')}
          className={`flex-1 py-4 text-center font-medium text-sm md:text-base transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'memorize' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BrainCircuit size={18} />
          记忆强化
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50/50">
        
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <section className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen className="text-brand-500" size={20} />
                Executive Summary (TL;DR)
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {data.summary_tldr}
              </p>
            </section>

            <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-900">
                  <Quote size={100} />
               </div>
              <h3 className="text-lg font-bold text-blue-900 mb-3 relative z-10">
                通俗解读 (ELI5)
              </h3>
              <p className="text-blue-800 leading-relaxed relative z-10">
                {data.eli5_explanation}
              </p>
            </section>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ListChecks className="text-emerald-500" size={20} />
                        关键概念
                    </h3>
                    <div className="space-y-3">
                        {data.core_concepts.map((concept, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <span className="block font-bold text-slate-900 mb-1">{concept.term}</span>
                            <span className="text-slate-600 text-sm">{concept.definition}</span>
                        </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ListChecks className="text-amber-500" size={20} />
                        行动清单 (Who & What)
                    </h3>
                    <div className="space-y-3">
                        {data.action_items.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
                             <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-800">{item.who}</span>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">{item.deadline || 'Ongoing'}</span>
                             </div>
                            <span className="text-slate-600 text-sm block">{item.what}</span>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'memorize' && (
          <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
            
            <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
                <h3 className="text-indigo-900 font-bold mb-2 uppercase tracking-wider text-sm">助记口诀</h3>
                <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 mb-3 tracking-wide">
                    "{data.mnemonic_device.phrase}"
                </div>
                <p className="text-indigo-800/80 text-sm">
                    {data.mnemonic_device.explanation}
                </p>
            </section>

            <div className="border-t border-slate-200 pt-8">
                <h3 className="text-center text-slate-500 font-medium mb-4">知识卡片测验</h3>
                <FlashcardDeck cards={data.flashcards} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;