import React, { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="relative min-h-screen">
      <AppRoutes />
      
      {/* Floating Theme Toggle Switch */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-[9999] p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-amber-500 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer group"
        title="Toggle Light / Dark Mode"
      >
        <span className="text-xl transition-transform duration-300 group-hover:rotate-12">
          {theme === 'dark' ? '☀️' : '🌙'}
        </span>
      </button>
    </div>
  );
}

export default App;
