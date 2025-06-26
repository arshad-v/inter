
import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-6 text-center text-slate-400 text-sm">
      <p>&copy; {currentYear} AI Interview Coach. All Rights Reserved.</p>
      <p className="mt-1">Powered by Gemini API</p>
    </footer>
  );
};
