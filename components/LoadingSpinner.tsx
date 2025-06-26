import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 space-y-8">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-20 h-20 border-4 border-slate-600/30 rounded-full animate-spin">
          <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 border-r-blue-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
          {message}
        </h3>
        <p className="text-slate-400 max-w-md leading-relaxed">
          Please wait while we process your request with advanced AI technology.
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 pt-4">
          <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};