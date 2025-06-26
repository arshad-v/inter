import React, { useState, useEffect } from 'react';
import { PLACEHOLDER_JOB_DESCRIPTION } from '../constants';

interface JobDescriptionInputProps {
  onStartInterview: (jobDescription: string, numQuestions: number) => void;
  selectedNumQuestions: number;
  onNumQuestionsChange: (num: number) => void;
  numQuestionsOptions: number[];
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ 
  onStartInterview,
  selectedNumQuestions,
  onNumQuestionsChange,
  numQuestionsOptions 
}) => {
  const [jd, setJd] = useState<string>('');
  const [showPlaceholderInfo, setShowPlaceholderInfo] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [placeholderModalMounted, setPlaceholderModalMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (showPlaceholderInfo) {
      setPlaceholderModalMounted(false); 
      const timer = setTimeout(() => {
        setPlaceholderModalMounted(true); 
      }, 10); 
      return () => clearTimeout(timer);
    } else {
      setPlaceholderModalMounted(false);
    }
  }, [showPlaceholderInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jd.trim()) {
      onStartInterview(jd.trim(), selectedNumQuestions);
    }
  };

  const usePlaceholder = () => {
    setJd(PLACEHOLDER_JOB_DESCRIPTION);
    setShowPlaceholderInfo(false);
  };

  return (
    <div className={`w-full p-8 md:p-10 bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 space-y-8 transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
          Enter Job Description
        </h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
          Paste the job description below and our AI will generate tailored interview questions to help you practice and excel.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label htmlFor="job-description" className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Job Description
          </label>
          <div className="relative">
            <textarea
              id="job-description"
              rows={12}
              className="w-full p-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-300 placeholder-slate-400 resize-none shadow-inner"
              placeholder="Paste the complete job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              required
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-500">
              {jd.length} characters
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="num-questions" className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Number of Questions
          </label>
          <div className="relative">
            <select
              id="num-questions"
              value={selectedNumQuestions}
              onChange={(e) => onNumQuestionsChange(parseInt(e.target.value, 10))}
              className="w-full p-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl text-slate-100 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-300 appearance-none cursor-pointer shadow-inner"
            >
              {numQuestionsOptions.map(num => (
                <option key={num} value={num} className="bg-slate-700">
                  {num} Questions
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
          <button
            type="button"
            onClick={() => setShowPlaceholderInfo(true)}
            className="group w-full sm:w-auto px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-sky-300 font-semibold rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
              <span>Use Sample JD</span>
            </div>
          </button>
          
          <button
            type="submit"
            disabled={!jd.trim()}
            className="group w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-sky-600 disabled:hover:to-blue-600 transform hover:scale-105 disabled:hover:scale-100"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
              <span>Start Interview</span>
            </div>
          </button>
        </div>
      </form>

      {showPlaceholderInfo && (
        <div 
          className={`fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 transition-all duration-300 ease-out ${placeholderModalMounted ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setShowPlaceholderInfo(false)}
        >
          <div 
            className={`bg-slate-800/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700/50 transform transition-all duration-300 ease-out ${placeholderModalMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-sky-400 mb-2">Use Sample Job Description?</h3>
            </div>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Would you like to populate the form with a sample Senior Frontend Engineer job description to quickly test the application?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPlaceholderInfo(false)}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={usePlaceholder}
                className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
              >
                Yes, Use Sample
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};