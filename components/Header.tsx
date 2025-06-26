
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="w-full py-6 bg-slate-900/50 backdrop-blur-md shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-sky-400 tracking-tight">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 inline-block mr-3 mb-1 text-sky-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-6.75 3h9m-9 3H12Zm0 0h.375c.621 0 1.125-.504 1.125-1.125V15m0 0V9SupportedContent" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 .75.75Z" />
          </svg>
          {title}
        </h1>
      </div>
    </header>
  );
};
