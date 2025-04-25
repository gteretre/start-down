'use client';
import React from 'react';
import { Sun, Moon, CircleArrowRight, CircleArrowLeft } from 'lucide-react';

function UIMode() {
  const [colorMode, setColorMode] = React.useState('light');
  const [mounted, setMounted] = React.useState(false);

  // On mount, get theme from localStorage or system
  React.useEffect(() => {
    let mode = localStorage.getItem('colorMode');
    if (!mode) {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setColorMode(mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    setMounted(true);
  }, []);

  // Toggle and persist theme
  const toggleMode = () => {
    document.documentElement.classList.add('disable-transitions');
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('colorMode', newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
    setTimeout(() => {
      document.documentElement.classList.remove('disable-transitions');
    }, 100);
  };

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('colorMode')) {
        setColorMode(e.matches ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!mounted) return null;

  return (
    <button
      className="btn-pure group flex items-center justify-between px-2 py-1 ring-1 ring-foreHeader"
      onClick={toggleMode}
    >
      <div
        className={`transition-opacity duration-700 group-hover:opacity-0 ${colorMode === 'light' ? 'translate-x-0' : 'translate-x-6'}`}
      >
        {colorMode === 'light' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </div>
      <div
        className={`transform transition-transform duration-200 ${colorMode === 'light' ? 'translate-x-0' : '-translate-x-full'}`}
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
