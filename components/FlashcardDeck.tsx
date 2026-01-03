import React, { useState } from 'react';
import { QuizCard } from '../types';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface FlashcardDeckProps {
  cards: QuizCard[];
  lang: 'zh' | 'en';
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const t = {
    zh: {
      count: (curr: number, total: number) => `第 ${curr} 张 / 共 ${total} 张`,
      flip: "点击翻转",
      question: "问题",
      answer: "答案",
      empty: "暂无记忆卡片"
    },
    en: {
      count: (curr: number, total: number) => `Card ${curr} of ${total}`,
      flip: "Click to Flip",
      question: "Question",
      answer: "Answer",
      empty: "No flashcards available"
    }
  }[lang];

  const currentCard = cards[currentIndex];

  if (!cards || cards.length === 0) return <div className="text-gray-500 italic">{t.empty}</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto py-8">
      <div className="w-full flex justify-between items-center mb-4 text-slate-500 text-sm font-medium">
        <span>{t.count(currentIndex + 1, cards.length)}</span>
        <span className="flex items-center gap-1"><RotateCw size={14}/> {t.flip}</span>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full h-64 cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute w-full h-full bg-white border-2 border-brand-100 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center backface-hidden">
            <span className="absolute top-4 left-4 text-xs font-bold text-brand-500 tracking-wider uppercase">{t.question}</span>
            <p className="text-lg font-semibold text-slate-800">{currentCard.question}</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-brand-50 border-2 border-brand-500 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden">
             <span className="absolute top-4 left-4 text-xs font-bold text-brand-700 tracking-wider uppercase">{t.answer}</span>
            <p className="text-lg font-medium text-brand-900">{currentCard.answer}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-8">
        <button 
          onClick={handlePrev}
          className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors shadow-sm"
          aria-label="Previous card"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleNext}
          className="p-3 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-md hover:shadow-lg"
          aria-label="Next card"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardDeck;