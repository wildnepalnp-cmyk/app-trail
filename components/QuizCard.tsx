import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Button } from './Button';
import { CheckCircle2, XCircle, BrainCircuit, ArrowRight, AlertCircle } from 'lucide-react';
import { explainAnswer } from '../services/geminiService';
import confetti from 'canvas-confetti';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (optionIndex: number, isCorrect: boolean) => void;
  onNext: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowExplanation(false);
    setExplanationText('');
    setLoadingExplanation(false);
  }, [question.id]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    
    setSelectedOption(index);
    const isCorrect = index === question.correctAnswer;
    
    // Reward effect for correct answer
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b']
      });
    }

    onAnswer(index, isCorrect);
  };

  const handleExplain = async () => {
    if (explanationText) {
      setShowExplanation(!showExplanation);
      return;
    }
    
    setLoadingExplanation(true);
    setShowExplanation(true);
    const text = await explainAnswer(question);
    setExplanationText(text);
    setLoadingExplanation(false);
  };

  const getOptionStyle = (index: number) => {
    // Base style for all options
    const base = "option-card relative p-5 rounded-2xl border-2 text-left flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md";

    if (selectedOption === null) {
      return `${base} border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 bg-white text-gray-700`;
    }

    // If this option is the Correct one
    if (index === question.correctAnswer) {
      return `${base} border-green-500 bg-green-50 text-green-800 shadow-green-100 ring-2 ring-green-500/20`;
    }

    // If this option was selected but is WRONG
    if (selectedOption === index && index !== question.correctAnswer) {
      return `${base} border-red-500 bg-red-50 text-red-800`;
    }

    // Other unselected options
    return `${base} border-gray-100 bg-gray-50 opacity-50 grayscale`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-pop-in">
      {/* Top Bar info */}
      <div className="flex justify-between items-center mb-6">
         <span className="text-sm font-bold text-gray-400 tracking-wider uppercase">
            Question {questionNumber} <span className="text-gray-300">/</span> {totalQuestions}
         </span>
         <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
             question.isTricky ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
         }`}>
           {question.isTricky ? 'Tricky' : (question.category || 'General')}
         </span>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-6 md:p-10 mb-8 border border-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-indigo-50 rounded-full blur-xl opacity-50"></div>
        
        <h2 className="relative text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={selectedOption !== null}
            className={getOptionStyle(index)}
          >
            <div className="flex items-center gap-4">
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                    ${selectedOption === null 
                        ? 'bg-gray-100 text-gray-500 group-hover:bg-blue-200 group-hover:text-blue-700' 
                        : (index === question.correctAnswer ? 'bg-green-200 text-green-700' : (selectedOption === index ? 'bg-red-200 text-red-700' : 'bg-gray-200'))
                    }
                `}>
                    {['क', 'ख', 'ग', 'घ'][index]}
                </div>
                <span className="font-medium text-lg">{option}</span>
            </div>

            {selectedOption !== null && index === question.correctAnswer && (
              <div className="bg-green-100 p-1 rounded-full animate-bounce">
                 <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            )}
            {selectedOption === index && index !== question.correctAnswer && (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </button>
        ))}
      </div>

      {/* Action Area */}
      {selectedOption !== null && (
        <div className="animate-slide-up bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100">
           
           {/* Feedback Message */}
           <div className={`mb-4 flex items-center gap-3 text-lg font-bold ${
               selectedOption === question.correctAnswer ? 'text-green-600' : 'text-red-500'
           }`}>
               {selectedOption === question.correctAnswer ? (
                   <>🎉 एकदम सही जवाफ! (Correct)</>
               ) : (
                   <>❌ मिलेन! सही उत्तर "{question.options[question.correctAnswer]}" हो।</>
               )}
           </div>

           {/* Buttons */}
           <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleExplain} 
                variant="outline" 
                className="flex-1" 
                disabled={loadingExplanation}
              >
                <BrainCircuit className="w-5 h-5" />
                {loadingExplanation ? 'सोच्दै छु...' : 'किन? (AI व्याख्या)'}
              </Button>
              <Button onClick={onNext} variant="primary" className="flex-1 group">
                अर्को प्रश्न <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
            
            {/* AI Explanation Content */}
            {showExplanation && (
              <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 text-gray-800 animate-slide-up">
                 <h4 className="font-bold mb-2 flex items-center gap-2 text-blue-700 text-sm uppercase tracking-wide">
                   <BrainCircuit className="w-4 h-4"/>
                   AI स्पष्टीकरण (Explanation)
                 </h4>
                 <p className="leading-relaxed text-lg text-gray-700">
                   {explanationText || "..."}
                 </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};