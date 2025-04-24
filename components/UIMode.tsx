'use client';
import React from 'react';
import { Sun, Moon, CircleArrowRight, CircleArrowLeft } from 'lucide-react';

function UIMode() {
  const [colorMode, setColorMode] = React.useState('light');

  React.useEffect(() => {
    const mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setColorMode(mode);
  }, []);

  const toggleMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    document.body.classList.toggle('dark', newMode === 'dark');
  };

  React.useEffect(() => {
    document.body.classList.toggle('dark', colorMode === 'dark');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setColorMode(e.matches ? 'dark' : 'light');
      document.body.classList.toggle('dark', e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorMode]);

  return (
    <button
      className="btn-pure group flex items-center justify-between px-2 py-1 ring-1 ring-foreHeader"
      onClick={toggleMode}
    >
      <div
        className={`transition-opacity duration-700 group-hover:opacity-0 ${
          colorMode === 'light' ? 'translate-x-0' : 'translate-x-6'
        }`}
      >
        {colorMode === 'light' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </div>
      <div
        className={`transform transition-transform duration-200 ${
          colorMode === 'light' ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {colorMode === 'light' ? (
          <CircleArrowLeft className="ml-2 size-4" />
        ) : (
          <CircleArrowRight className="ml-2 size-4" />
        )}
      </div>
    </button>
  );
}

export default UIMode;
