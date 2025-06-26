
import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onTryAgain?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onTryAgain }) => {
  return (
    <div className="bg-red-900/30 border-2 border-red-500 text-red-300 px-6 py-8 rounded-lg shadow-xl w-full max-w-lg text-center">
      <div className="flex justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-red-200 mb-3">Oops! Something went wrong.</h2>
      <p className="text-red-300 whitespace-pre-wrap">{message}</p>
      {onTryAgain && (
        <button
          onClick={onTryAgain}
          className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
