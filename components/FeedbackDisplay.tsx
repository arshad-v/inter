import React, { useState, useEffect, useMemo } from 'react';

interface FeedbackDisplayProps {
  feedback: string;
  onStartNewInterview: () => void;
}

interface Score {
  value: number;
  max: number;
}

interface SubScore extends Score {
  category: string;
}

// Enhanced markdown-to-HTML converter with modern styling
const FeedbackContent: React.FC<{ content: string }> = ({ content }) => {
  
  const processLine = (line: string, isInsideOverallSection: boolean = false): React.ReactNode => {
    if (line.startsWith("### ") && !isInsideOverallSection) { 
      return (
        <h3 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mt-8 mb-4 flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
          {line.substring(4)}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent mt-10 mb-5 flex items-center">
          <div className="w-2 h-8 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-4"></div>
          {line.substring(3)}
        </h2>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-200 to-blue-200 bg-clip-text text-transparent mt-12 mb-6 flex items-center">
          <div className="w-3 h-10 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-4"></div>
          {line.substring(2)}
        </h1>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li className="text-slate-300 flex items-start space-x-3 py-1">
          <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
          <span className="leading-relaxed">{line.substring(2)}</span>
        </li>
      );
    }
    if (line.trim() === "---") {
      return <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />;
    }
    return (
      <p className={`${isInsideOverallSection ? 'text-slate-100' : 'text-slate-200'} leading-relaxed mb-3 last:mb-0`}>
        {line}
      </p>
    );
  };

  const blocks = content.split('\n\n');
  
  return (
    <div className="prose prose-sm sm:prose-base max-w-none text-slate-200">
      {blocks.map((block, index) => {
        const lines = block.split('\n');
        const firstLineOfBlock = lines[0] || '';
        
        if (firstLineOfBlock.startsWith("### Overall Impression")) {
          const headingText = firstLineOfBlock.substring(19).trim(); 
          const contentLines = lines.slice(1);

          return (
            <div key={index} className="mb-8 bg-gradient-to-br from-sky-900/30 via-slate-800/50 to-slate-900/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-sky-700/30 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent mb-4 flex items-center">
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-sky-500 to-blue-600 p-3 rounded-xl shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" />
                      </svg>
                    </div>
                  </div>
                  {headingText || "Overall Impression"}
                </h3>
                <div className="space-y-3 pl-2">
                  {contentLines.map((line, lineIdx) => (
                    <div key={lineIdx}>{processLine(line, true)}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        
        const isListBlock = lines.every(line => line.startsWith("- ") || line.startsWith("* ") || line.trim() === '');
        if (isListBlock && lines.some(line => line.startsWith("- ") || line.startsWith("* "))) {
          return (
            <ul key={index} className="mb-6 space-y-2 pl-2">
              {lines.filter(line => line.startsWith("- ") || line.startsWith("* ")).map((line, lineIdx) => (
                <div key={lineIdx}>{processLine(line)}</div>
              ))}
            </ul>
          );
        }
        
        return (
          <div key={index} className="mb-6">
            {lines.map((line, lineIdx) => (
              <div key={lineIdx}>{processLine(line)}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const parseScores = (feedbackText: string): { overallScore: Score | null; subScores: SubScore[]; remainingFeedback: string } => {
  let overallScore: Score | null = null;
  const subScores: SubScore[] = [];
  let remainingFeedback = feedbackText;

  // Regex to find overall score: **Overall Score:** 82/100
  const overallScoreRegex = /\*\*Overall Score:\*\*\s*(\d+)\/(\d+)/;
  const overallMatch = feedbackText.match(overallScoreRegex);
  if (overallMatch) {
    overallScore = { value: parseInt(overallMatch[1], 10), max: parseInt(overallMatch[2], 10) };
    remainingFeedback = remainingFeedback.replace(overallScoreRegex, '').trim();
  }

  // Regex for Score Breakdown section and individual sub-scores
  const scoreBreakdownSectionRegex = /\*\*Score Breakdown:\*\*(?:\r\n|\r|\n)((?:-\s*\*\*(.*?):\*\*\s*(\d+)\/(\d+)(?:\r\n|\r|\n?))+)/;
  const breakdownMatch = remainingFeedback.match(scoreBreakdownSectionRegex);

  if (breakdownMatch) {
    const subScoreBlock = breakdownMatch[1];
    remainingFeedback = remainingFeedback.replace(scoreBreakdownSectionRegex, '').trim();
    
    // Regex for each sub-score line: - **Category:** 8/10
    const subScoreLineRegex = /-\s*\*\*(.*?):\*\*\s*(\d+)\/(\d+)/g;
    let match;
    while ((match = subScoreLineRegex.exec(subScoreBlock)) !== null) {
      subScores.push({
        category: match[1].trim(),
        value: parseInt(match[2], 10),
        max: parseInt(match[3], 10)
      });
    }
  }
  
  // Clean up any empty lines that might be left after removing score sections
  remainingFeedback = remainingFeedback.replace(/^\s*[\r\n]/gm, '');

  return { overallScore, subScores, remainingFeedback };
};

const OverallScoreDisplay: React.FC<{ score: Score }> = ({ score }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = score.max > 0 ? (score.value / score.max) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(score.value);
    }, 500);
    return () => clearTimeout(timer);
  }, [score.value]);

  let colorClass = 'text-green-400';
  let bgGradient = 'from-green-500/20 to-emerald-500/20';
  let ringGradient = 'from-green-400 to-emerald-500';
  
  if (percentage < 70) {
    colorClass = 'text-yellow-400';
    bgGradient = 'from-yellow-500/20 to-orange-500/20';
    ringGradient = 'from-yellow-400 to-orange-500';
  }
  if (percentage < 50) {
    colorClass = 'text-red-400';
    bgGradient = 'from-red-500/20 to-pink-500/20';
    ringGradient = 'from-red-400 to-pink-500';
  }

  return (
    <div className={`flex flex-col items-center p-8 bg-gradient-to-br ${bgGradient} backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden`}>
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-30 blur-xl`}></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-40 h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-slate-700/50"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            {/* Progress circle with gradient */}
            <defs>
              <linearGradient id={`gradient-${score.value}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={colorClass.replace('text-', 'stop-')} />
                <stop offset="100%" className={colorClass.replace('text-', 'stop-').replace('400', '600')} />
              </linearGradient>
            </defs>
            <circle
              className="transition-all duration-1000 ease-out"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={`url(#gradient-${score.value})`}
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              style={{
                filter: 'drop-shadow(0 0 8px currentColor)',
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${colorClass}`}>
            <span className="text-4xl font-bold transition-all duration-1000 ease-out">
              {animatedValue}
            </span>
            <span className="text-sm text-slate-400 font-medium">/ {score.max}</span>
          </div>
          
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${ringGradient} opacity-20 blur-2xl animate-pulse`}></div>
        </div>
        
        <div className="text-center">
          <p className={`text-xl font-bold ${colorClass} mb-1`}>Overall Score</p>
          <p className="text-sm text-slate-400">
            {percentage >= 80 ? 'Excellent Performance' : 
             percentage >= 70 ? 'Good Performance' : 
             percentage >= 50 ? 'Fair Performance' : 'Needs Improvement'}
          </p>
        </div>
      </div>
    </div>
  );
};

const SubScoreItem: React.FC<{ subScore: SubScore; index: number }> = ({ subScore, index }) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const percentage = subScore.max > 0 ? (subScore.value / subScore.max) * 100 : 0;
  
  let barColor = 'from-green-500 to-emerald-600';
  let bgColor = 'bg-green-500/10';
  let textColor = 'text-green-400';
  
  if (percentage < 70) {
    barColor = 'from-yellow-500 to-orange-600';
    bgColor = 'bg-yellow-500/10';
    textColor = 'text-yellow-400';
  }
  if (percentage < 40) {
    barColor = 'from-red-500 to-pink-600';
    bgColor = 'bg-red-500/10';
    textColor = 'text-red-400';
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 200 + index * 100);
    return () => clearTimeout(timer);
  }, [percentage, index]);

  return (
    <div className={`p-4 rounded-xl ${bgColor} backdrop-blur-sm border border-slate-700/30 transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-slate-200 font-semibold text-sm">{subScore.category}</span>
        <div className="flex items-center space-x-2">
          <span className={`${textColor} font-bold text-sm`}>{subScore.value}</span>
          <span className="text-slate-500 text-sm">/ {subScore.max}</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
            style={{ width: `${animatedWidth}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        
        {/* Percentage indicator */}
        <div className="absolute -top-8 right-0">
          <span className={`text-xs ${textColor} font-medium`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, onStartNewInterview }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);
  
  const { overallScore, subScores, remainingFeedback } = useMemo(() => parseScores(feedback), [feedback]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full space-y-8 transition-all duration-700 ease-out ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Header Section */}
      <div className="text-center space-y-4 p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-sky-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent mb-3">
            Your Interview Feedback
          </h2>
          
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Comprehensive analysis of your interview performance with actionable insights for improvement.
          </p>
        </div>
      </div>

      {/* Score Section */}
      {(overallScore || subScores.length > 0) && (
        <div className={`space-y-6 transition-all duration-500 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {overallScore && <OverallScoreDisplay score={overallScore} />}

          {subScores.length > 0 && (
            <div className="p-6 sm:p-8 bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-6 text-center flex items-center justify-center">
                <div className="w-2 h-8 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
                Score Breakdown
              </h3>
              <div className="grid gap-4 sm:gap-6">
                {subScores.map((ss, index) => (
                  <SubScoreItem key={ss.category} subScore={ss} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Feedback Content */}
      <div className={`transition-all duration-500 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="p-6 sm:p-8 bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500"></div>
          
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(51, 65, 85, 0.3);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #0ea5e9, #3b82f6);
                border-radius: 10px;
                border: 1px solid rgba(51, 65, 85, 0.5);
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(135deg, #0284c7, #2563eb);
              }
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .animate-shimmer {
                animation: shimmer 2s infinite;
              }
            `}</style>
            <FeedbackContent content={remainingFeedback} />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className={`text-center transition-all duration-500 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={onStartNewInterview}
          className="group px-12 py-5 bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 hover:from-sky-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transform hover:scale-105 relative overflow-hidden"
        >
          {/* Button shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-shimmer"></div>
          
          <div className="relative flex items-center justify-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:rotate-180 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span className="text-lg">Start New Interview</span>
          </div>
        </button>
      </div>
    </div>
  );
};