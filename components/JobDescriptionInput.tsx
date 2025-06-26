
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
    <div className={`w-full p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl space-y-6 transition-all duration-300 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <h2 className="text-2xl md:text-3xl font-semibold text-sky-400 mb-2 text-center">Enter Job Description</h2>
      <p className="text-slate-300 text-center mb-6">
        Paste the job description below. Our AI will generate tailored interview questions for you.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-slate-300 mb-1">
            Job Description
          </label>
          <textarea
            id="job-description"
            rows={10} // Adjusted rows
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow placeholder-slate-400"
            placeholder="Paste job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="num-questions" className="block text-sm font-medium text-slate-300 mb-1">
            Number of Questions
          </label>
          <select
            id="num-questions"
            value={selectedNumQuestions}
            onChange={(e) => onNumQuestionsChange(parseInt(e.target.value, 10))}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
          >
            {numQuestionsOptions.map(num => (
              <option key={num} value={num}>
                {num} Questions
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
          <button
            type="button"
            onClick={() => setShowPlaceholderInfo(true)}
            className="w-full sm:w-auto px-6 py-3 bg-slate-600 hover:bg-slate-500 text-sky-300 font-semibold rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75"
          >
            Use Sample JD
          </button>
          <button
            type="submit"
            disabled={!jd.trim()}
            className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            <span>Start Interview</span>
          </button>
        </div>
      </form>

      {showPlaceholderInfo && (
        <div 
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out ${placeholderModalMounted ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setShowPlaceholderInfo(false)}
        >
          <div 
            className={`bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ease-out ${placeholderModalMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Use Sample Job Description?</h3>
            <p className="text-slate-300 mb-6">
              Would you like to populate the form with a sample Senior Frontend Engineer job description to quickly test the application?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPlaceholderInfo(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={usePlaceholder}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors"
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