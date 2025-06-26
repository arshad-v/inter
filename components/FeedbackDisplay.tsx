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

// Basic markdown-to-HTML converter
const FeedbackContent: React.FC<{ content: string }> = ({ content }) => {
  
  const processLine = (line: string, isInsideOverallSection: boolean = false): React.ReactNode => {
    if (line.startsWith("### ") && !isInsideOverallSection) { 
      return <h3 className="text-xl font-semibold text-sky-400 mt-6 mb-2">{line.substring(4)}</h3>;
    }
    if (line.startsWith("## ")) {
      return <h2 className="text-2xl font-bold text-sky-300 mt-8 mb-3">{line.substring(3)}</h2>;
    }
    if (line.startsWith("# ")) {
      return <h1 className="text-3xl font-extrabold text-sky-200 mt-10 mb-4">{line.substring(2)}</h1>;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return <li className="text-slate-300">{line.substring(2)}</li>;
    }
    if (line.trim() === "---") {
        return <hr className="my-6 border-slate-600" />;
    }
    return <p className={`${isInsideOverallSection ? 'text-slate-100' : 'text-slate-200'} leading-relaxed mb-2 last:mb-0`}>{line}</p>;
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
            <div key={index} className="mb-6 bg-gradient-to-br from-sky-800/40 via-slate-700/50 to-slate-800/60 p-4 sm:p-5 rounded-lg shadow-xl border border-sky-700/50">
              <h3 className="text-xl font-semibold text-sky-300 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-2.5 text-sky-400">
                  <path d="M11.9998 9C10.7998 9 9.7498 10.05 9.7498 11.25C9.7498 12.45 10.7998 13.5 11.9998 13.5C13.1998 13.5 14.2498 12.45 14.2498 11.25C14.2498 10.05 13.1998 9 11.9998 9Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.0002 4.49902C17.7902 4.49902 21.8202 9.19902 22.4002 11.539C22.4802 11.809 22.4802 12.189 22.4002 12.459C21.8202 14.799 17.7902 19.499 12.0002 19.499C6.21018 19.499 2.18018 14.799 1.60018 12.459C1.52018 12.189 1.52018 11.809 1.60018 11.539C2.18018 9.19902 6.21018 4.49902 12.0002 4.49902ZM12.0002 6.49902C7.94018 6.49902 4.60018 10.169 3.88018 11.999C4.60018 13.829 7.94018 17.499 12.0002 17.499C16.0602 17.499 19.4002 13.829 20.1202 11.999C19.4002 10.169 16.0602 6.49902 12.0002 6.49902Z" />
                </svg>
                {headingText || "Overall Impression"}
              </h3>
              <div className="space-y-2">
                {contentLines.map((line, lineIdx) => (
                    <div key={lineIdx}>{processLine(line, true)}</div>
                ))}
              </div>
            </div>
          );
        }
        
        const isListBlock = lines.every(line => line.startsWith("- ") || line.startsWith("* ") || line.trim() === '');
        if (isListBlock && lines.some(line => line.startsWith("- ") || line.startsWith("* "))) {
          return <ul key={index} className="mb-4 ml-5 list-disc space-y-1">{lines.filter(line => line.startsWith("- ") || line.startsWith("* ")).map((line, lineIdx) => processLine(line))}</ul>;
        }
        
        return <div key={index} className="mb-4">{lines.map((line, lineIdx) => <div key={lineIdx}>{processLine(line)}</div>)}</div>;
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
  // \*\*Score Breakdown:\*\*(?:\r\n|\r|\n)((?:-\s*\*\*(.*?):\*\*\s*(\d+)\/(\d+)(?:\r\n|\r|\n|\s)*)+)
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
  const percentage = score.max > 0 ? (score.value / score.max) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // 2 * pi * radius (radius is 45 for a 100x100 viewBox with 5 stroke)
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = 'text-green-400';
  if (percentage < 70) colorClass = 'text-yellow-400';
  if (percentage < 50) colorClass = 'text-red-400';

  return (
    <div className="flex flex-col items-center p-4 bg-slate-700/30 rounded-lg shadow-md">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-slate-600"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className={colorClass}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${colorClass}`}>
          <span className="text-3xl font-bold">{score.value}</span>
          <span className="text-xs text-slate-400">/ {score.max}</span>
        </div>
      </div>
      <p className={`mt-2 text-lg font-semibold ${colorClass}`}>Overall Score</p>
    </div>
  );
};

const SubScoreItem: React.FC<{ subScore: SubScore }> = ({ subScore }) => {
    const percentage = subScore.max > 0 ? (subScore.value / subScore.max) * 100 : 0;
    let barColor = 'bg-green-500';
    if (percentage < 70) barColor = 'bg-yellow-500';
    if (percentage < 40) barColor = 'bg-red-500';

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="text-slate-300 font-medium">{subScore.category}</span>
                <span className="text-slate-400">{subScore.value}/{subScore.max}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2.5">
                <div 
                    className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};


export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback, onStartNewInterview }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  const { overallScore, subScores, remainingFeedback } = useMemo(() => parseScores(feedback), [feedback]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`w-full p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl space-y-6 transition-all duration-500 ease-out ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <h2 className="text-2xl md:text-3xl font-semibold text-green-400 mb-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 inline-block mr-2 text-green-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        Your Interview Feedback
      </h2>

      {overallScore && <OverallScoreDisplay score={overallScore} />}

      {subScores.length > 0 && (
        <div className="mt-6 p-4 bg-slate-700/40 rounded-lg">
          <h3 className="text-lg font-semibold text-sky-300 mb-3 text-center">Score Breakdown</h3>
          {subScores.map(ss => <SubScoreItem key={ss.category} subScore={ss} />)}
        </div>
      )}
      
      <div className="p-4 sm:p-6 bg-slate-700/50 rounded-lg max-h-[60vh] overflow-y-auto custom-scrollbar">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(51, 65, 85, 0.5); /* slate-700/50 */
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(30, 144, 255, 0.6); /* sky-500/60 */
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(30, 144, 255, 0.8); /* sky-500/80 */
          }
        `}</style>
        <FeedbackContent content={remainingFeedback} />
      </div>

      <button
        onClick={onStartNewInterview}
        className="w-full px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 flex items-center justify-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        <span>Start New Interview</span>
      </button>
    </div>
  );
};