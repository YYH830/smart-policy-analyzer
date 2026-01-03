import React, { useState, useRef } from 'react';
import { Scale, Sparkles, FileText, Loader2, UploadCloud, Globe, X, FileCheck } from 'lucide-react';
import { analyzeUploadedPolicy } from './services/geminiService';
import { PolicyAnalysis, AnalysisStatus } from './types';
import AnalysisResult from './components/AnalysisResult';

const App: React.FC = () => {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<PolicyAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    zh: {
      subtitle: "智能政策文件分析助手",
      heroTitlePrefix: "上传政策，",
      heroTitleSuffix: "智能解析",
      heroDesc: "无需手动阅读冗长的政策文档。上传 PDF 或 文本文件，AI 自动提取历史版本、核心要点，并重点标注对产品系统设计的影响。",
      uploadTitle: "点击或拖拽上传政策文件",
      uploadSubtitle: "支持 PDF, TXT (最大 10MB)",
      analyzeBtn: "开始智能分析",
      analyzingBtn: "正在解析文档...",
      reupload: "重新上传",
      loadingText: (name: string) => `AI 正在深度阅读文档 "${name}"，提取条款并分析系统影响...`,
      loadingSub: "文档越长，分析时间可能越久 (通常 30-60 秒)。",
      errorMsg: "文件解析失败，请确保文件格式正确且未损坏，或稍后再试。",
      analyzeAnother: "分析另一个文件",
      fileTypeErr: "不支持的文件格式，请上传 PDF 或 TXT。",
      fileSizeErr: "文件大小超过 10MB，请上传较小的文件。"
    },
    en: {
      subtitle: "Smart Policy Document Analyzer",
      heroTitlePrefix: "Upload Policy, ",
      heroTitleSuffix: "Smart Analysis",
      heroDesc: "Skip the long read. Upload a PDF or text file. AI extracts history, core points, and highlights system design implications for Product Managers.",
      uploadTitle: "Click or Drag to Upload Policy File",
      uploadSubtitle: "Supports PDF, TXT (Max 10MB)",
      analyzeBtn: "Start Analysis",
      analyzingBtn: "Analyzing Document...",
      reupload: "Change File",
      loadingText: (name: string) => `AI is reading "${name}", extracting clauses and analyzing system impact...`,
      loadingSub: "Longer documents may take 30-60 seconds.",
      errorMsg: "Analysis failed. Please check the file format or try again.",
      analyzeAnother: "Analyze Another File",
      fileTypeErr: "Unsupported format. Please use PDF or TXT.",
      fileSizeErr: "File too large (>10MB)."
    }
  }[language];

  const validateFile = (file: File): string | null => {
    const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.md')) { // Basic check
       return t.fileTypeErr;
    }
    if (file.size > 10 * 1024 * 1024) {
      return t.fileSizeErr;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const error = validateFile(selectedFile);
      if (error) {
        alert(error);
        return;
      }
      setFile(selectedFile);
      setStatus(AnalysisStatus.IDLE);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      const error = validateFile(selectedFile);
      if (error) {
        alert(error);
        return;
      }
      setFile(selectedFile);
      setStatus(AnalysisStatus.IDLE);
      setResult(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setStatus(AnalysisStatus.ANALYZING);
    setErrorMsg(null);
    setResult(null);

    try {
      const base64Data = await fileToBase64(file);
      const data = await analyzeUploadedPolicy(base64Data, file.type, language);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(t.errorMsg);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
    // We don't clear the file on language switch, but we might clear result if it was in the other language
    if (result) {
        setResult(null);
        setStatus(AnalysisStatus.IDLE);
    }
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
        {status === AnalysisStatus.IDLE && !file && (
          <div className="text-center mb-10 max-w-2xl mx-auto animate-fadeIn">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
              {t.heroTitlePrefix}<span className="text-brand-600">{t.heroTitleSuffix}</span>
            </h1>
            <p className="text-lg text-slate-600">
              {t.heroDesc}
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div className={`transition-all duration-500 ease-in-out ${status === AnalysisStatus.SUCCESS ? 'mb-8' : 'mb-0'}`}>
           <div className="max-w-3xl mx-auto">
             
             {!file || status === AnalysisStatus.SUCCESS ? (
                // Upload Zone (Show if no file or if result is shown to allow another upload)
                status !== AnalysisStatus.SUCCESS && (
                  <div 
                    className={`
                        relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
                        ${isDragging 
                            ? 'border-brand-500 bg-brand-50' 
                            : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                        }
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.txt,.md"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-full shadow-sm">
                            <UploadCloud className="text-brand-500" size={40} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{t.uploadTitle}</h3>
                            <p className="text-slate-500 mt-2">{t.uploadSubtitle}</p>
                        </div>
                    </div>
                  </div>
                )
             ) : (
                // File Selected State
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
                    <div className="flex items-center gap-4 w-full">
                        <div className="bg-brand-100 p-4 rounded-xl">
                            <FileCheck className="text-brand-600" size={32} />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-lg text-slate-900 truncate">{file.name}</h3>
                            <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                         <button 
                            onClick={() => setFile(null)}
                            disabled={status === AnalysisStatus.ANALYZING}
                            className="flex-1 md:flex-none px-4 py-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={handleAnalyze}
                            disabled={status === AnalysisStatus.ANALYZING}
                            className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed min-w-[180px]"
                        >
                            {status === AnalysisStatus.ANALYZING ? (
                                <><Loader2 className="animate-spin" size={20} /> {t.analyzingBtn}</>
                            ) : (
                                <><Sparkles size={20} /> {t.analyzeBtn}</>
                            )}
                        </button>
                    </div>
                </div>
             )}
           </div>
        </div>

        {/* Loading State Detail */}
        {status === AnalysisStatus.ANALYZING && file && (
          <div className="max-w-2xl mx-auto mt-8 text-center animate-fade-in-up">
             <p className="text-brand-600 font-medium animate-pulse">
               {t.loadingText(file.name)}
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
                    setFile(null);
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