import React, { useState } from 'react';
import { Scale, Sparkles, FileText, Loader2, Search, Globe } from 'lucide-react';
import { analyzePolicyByName } from './services/geminiService';
import { PolicyAnalysis, AnalysisStatus } from './types';
import AnalysisResult from './components/AnalysisResult';

const App: React.FC = () => {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [policyName, setPolicyName] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<PolicyAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = {
    zh: {
      subtitle: "智能政策法规分析助手",
      heroTitlePrefix: "读懂政策，",
      heroTitleSuffix: "只需一步",
      heroDesc: "无需繁琐搜索全文，只需输入政策法规名称。AI 自动检索 gov.cn，整理历史版本、最新核心要点，并重点标注对产品系统设计的影响。",
      placeholder: "请输入政策法规名称 (如: 劳动法)",
      analyzeBtn: "开始分析",
      analyzingBtn: "深度分析中",
      trySample: "试一试",
      loadingText: (name: string) => `AI 正在检索 "${name}" 的历史版本与最新条款，并分析系统设计影响...`,
      loadingSub: "内容较多，可能需要一分钟，请耐心等待。",
      errorMsg: "无法找到或分析该政策。请检查名称是否正确，或稍后再试。",
      analyzeAnother: "查阅其他政策",
      samplePolicy: "中华人民共和国个人信息保护法"
    },
    en: {
      subtitle: "Smart Policy Analysis Assistant",
      heroTitlePrefix: "Understand Policies, ",
      heroTitleSuffix: "One Step Away",
      heroDesc: "Input a policy name. AI searches gov.cn, organizes history, summarizes core points, and highlights system design implications for Product Managers.",
      placeholder: "Enter policy name (e.g., GDPR)",
      analyzeBtn: "Analyze",
      analyzingBtn: "Analyzing",
      trySample: "Try Example",
      loadingText: (name: string) => `AI is searching history and latest clauses for "${name}", analyzing system impacts...`,
      loadingSub: "Detailed analysis may take a minute, please wait.",
      errorMsg: "Could not find or analyze this policy. Please check the name or try again later.",
      analyzeAnother: "Analyze Another Policy",
      samplePolicy: "General Data Protection Regulation (GDPR)"
    }
  }[language];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!policyName.trim()) return;
    
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await analyzePolicyByName(policyName, language);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(t.errorMsg);
    }
  };

  const handleSample = () => {
    setPolicyName(t.samplePolicy);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setPolicyName('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <Scale size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">PolicyEase</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden md:block border-r border-slate-200 pr-4">
              {t.subtitle}
            </div>
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-1.5 rounded-full border border-slate-200 hover:border-brand-200 hover:bg-slate-50 transition-all"
            >
              <Globe size={14} />
              {language === 'zh' ? 'English' : '中文'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro Section */}
        {status === AnalysisStatus.IDLE && (
          <div className="text-center mb-12 max-w-2xl mx-auto animate-fadeIn">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
              {t.heroTitlePrefix}<span className="text-brand-600">{t.heroTitleSuffix}</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              {t.heroDesc}
            </p>
          </div>
        )}

        {/* Search Input Area */}
        <div className={`transition-all duration-500 ease-in-out ${status === AnalysisStatus.SUCCESS ? 'mb-8' : 'mb-0'}`}>
           <div className="max-w-3xl mx-auto">
             <form onSubmit={handleAnalyze} className="relative">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className={`text-slate-400 ${status === AnalysisStatus.ANALYZING ? 'opacity-0' : 'opacity-100'}`} size={24} />
                  </div>
                  
                  {status === AnalysisStatus.ANALYZING && (
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <Loader2 className="animate-spin text-brand-600" size={24} />
                    </div>
                  )}

                  <input
                    type="text"
                    className="w-full h-16 pl-16 pr-32 rounded-full border-2 border-slate-200 shadow-lg text-lg focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder={t.placeholder}
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                    disabled={status === AnalysisStatus.ANALYZING}
                  />

                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                      type="submit"
                      disabled={!policyName.trim() || status === AnalysisStatus.ANALYZING}
                      className={`h-12 px-6 rounded-full font-semibold transition-all flex items-center gap-2 ${
                        !policyName.trim() || status === AnalysisStatus.ANALYZING
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg active:scale-95'
                      }`}
                    >
                      {status === AnalysisStatus.ANALYZING ? t.analyzingBtn : t.analyzeBtn}
                      {!status && <Sparkles size={16} />}
                    </button>
                  </div>
                </div>
             </form>

             {/* Suggestions / Sample */}
             {status === AnalysisStatus.IDLE && (
               <div className="mt-4 flex justify-center gap-2 text-sm text-slate-500">
                 <span>{t.trySample}:</span>
                 <button onClick={handleSample} className="text-brand-600 hover:text-brand-800 hover:underline">
                   {t.samplePolicy}
                 </button>
               </div>
             )}
           </div>
        </div>

        {/* Loading State Detail */}
        {status === AnalysisStatus.ANALYZING && (
          <div className="max-w-2xl mx-auto mt-8 text-center animate-fade-in-up">
             <p className="text-brand-600 font-medium animate-pulse">
               {t.loadingText(policyName)}
             </p>
             <p className="text-slate-400 text-sm mt-2">
               {t.loadingSub}
             </p>
          </div>
        )}

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center justify-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             {errorMsg}
          </div>
        )}

        {/* Results */}
        {status === AnalysisStatus.SUCCESS && result && (
          <div className="animate-slideUp mt-8">
             <AnalysisResult data={result} lang={language} />
             
             <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    setStatus(AnalysisStatus.IDLE);
                    setPolicyName('');
                    setResult(null);
                  }}
                  className="text-slate-500 hover:text-brand-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <FileText size={16} />
                  {t.analyzeAnother}
                </button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;