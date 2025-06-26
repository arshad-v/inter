import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-8 text-center text-slate-400 text-sm border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
      <div className="container mx-auto px-6 space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-pulse"></div>
          <p className="font-medium">
            &copy; {currentYear} AI Interview Coach. All Rights Reserved.
          </p>
          <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-pulse delay-500"></div>
        </div>
        <p className="text-xs text-slate-500">
          Powered by <span className="text-sky-400 font-medium">Gemini AI</span> • 
          Built with <span className="text-red-400">♥</span> for your success
        </p>
      </div>
    </footer>
  );
};