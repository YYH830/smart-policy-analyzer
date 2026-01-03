import React, { useState } from 'react';
import { Scale, Sparkles, Send, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { analyzePolicyText } from './services/geminiService';
import { PolicyAnalysis, AnalysisStatus } from './types';
import AnalysisResult from './components/AnalysisResult';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<PolicyAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await analyzePolicyText(inputText);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg("分析过程中出现问题。请稍后再试或检查输入内容。");
    }
  };

  const handleSample = () => {
    const sample = `《互联网信息服务管理办法》
第四条 国家对经营性互联网信息服务实行许可制度；对非经营性互联网信息服务实行备案制度。
未取得许可或者未履行备案手续的，不得从事互联网信息服务。

第五条 从事新闻、出版、教育、医疗保健、药品和医疗器械等互联网信息服务，依照法律、行政法规以及国家有关规定须经有关主管部门审核同意的，在申请经营许可或者履行备案手续前，应当依法经有关主管部门审核同意。

第十五条 互联网信息服务提供者不得制作、复制、发布、传播含有下列内容的信息：
(一)反对宪法所确定的基本原则的；
(二)危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；
(三)损害国家荣誉和利益的；
(四)煽动民族仇恨、民族歧视，破坏民族团结的；
(五)破坏国家宗教政策，宣扬邪教和封建迷信的；
(六)散布谣言，扰乱社会秩序，破坏社会稳定的；
(七)散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；
(八)侮辱或者诽谤他人，侵害他人合法权益的；
(九)含有法律、行政法规禁止的其他内容的。`;
    setInputText(sample);
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
          <div className="text-sm text-slate-500 hidden md:block">
            智能政策法规分析助手
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro Section */}
        {status === AnalysisStatus.IDLE && (
          <div className="text-center mb-12 max-w-2xl mx-auto animate-fadeIn">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
              读懂政策，<span className="text-brand-600">只需一键</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              枯燥的法规条文记不住？粘贴在这里，AI 帮您提炼核心、生成图解和记忆卡片，让学习更高效。
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className={`transition-all duration-500 ease-in-out ${status === AnalysisStatus.SUCCESS ? 'mb-8' : 'mb-0'}`}>
           <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
             <div className="p-1 bg-slate-100 border-b border-slate-200 flex justify-between items-center px-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Source Text</span>
                {status === AnalysisStatus.IDLE && (
                  <button onClick={handleSample} className="text-xs text-brand-600 hover:text-brand-700 font-medium py-2 px-3 rounded hover:bg-slate-200 transition-colors">
                    试一试样例
                  </button>
                )}
             </div>
             <textarea
                className="w-full h-64 p-6 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 font-mono text-sm leading-relaxed"
                placeholder="在此粘贴政策、法规或合同文本..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={status === AnalysisStatus.ANALYZING}
              />
              <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-100">
                <div className="text-xs text-slate-400">
                   {inputText.length} characters
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!inputText.trim() || status === AnalysisStatus.ANALYZING}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all transform active:scale-95 ${
                    !inputText.trim() || status === AnalysisStatus.ANALYZING
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/30'
                  }`}
                >
                  {status === AnalysisStatus.ANALYZING ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      正在深度分析...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      开始智能分析
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>

        {/* Loading State Display (Optional visual interest during wait) */}
        {status === AnalysisStatus.ANALYZING && (
          <div className="max-w-2xl mx-auto mt-12 text-center space-y-4 animate-pulse">
             <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
             <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
             <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
             <p className="text-slate-500 text-sm mt-4">AI 正在阅读条款并构建知识图谱...</p>
          </div>
        )}

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             {errorMsg}
          </div>
        )}

        {/* Results */}
        {status === AnalysisStatus.SUCCESS && result && (
          <div className="animate-slideUp">
             <AnalysisResult data={result} />
             
             <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    setStatus(AnalysisStatus.IDLE);
                    setInputText('');
                    setResult(null);
                  }}
                  className="text-slate-500 hover:text-brand-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <FileText size={16} />
                  分析另一篇文档
                </button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;