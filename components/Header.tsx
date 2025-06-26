import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="w-full py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-2xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-sky-400 to-blue-500 p-3 rounded-full shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              {title}
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mx-auto mt-2 opacity-60"></div>
          </div>
        </div>
      </div>
    </header>
  );
};