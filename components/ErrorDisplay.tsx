import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onTryAgain?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onTryAgain }) => {
  return (
    <div className="bg-red-900/20 backdrop-blur-xl border-2 border-red-500/50 text-red-300 px-8 py-10 rounded-2xl shadow-2xl w-full max-w-lg text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-red-200">Something went wrong</h2>
        <p className="text-red-300 whitespace-pre-wrap leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>
      
      {onTryAgain && (
        <button
          onClick={onTryAgain}
          className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400/50 transform hover:scale-105"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Try Again</span>
          </div>
        </button>
      )}
    </div>
  );
};