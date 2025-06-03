'use client';
import React from 'react';
import { Sun, Moon, CircleArrowRight, CircleArrowLeft } from 'lucide-react';

function getInitialMode() {
  if (typeof window === 'undefined') return 'light';
  let mode = localStorage.getItem('colorMode');
  if (!mode) {
    mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function UIMode() {
  const [colorMode, setColorMode] = React.useState(getInitialMode);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    localStorage.setItem('colorMode', newMode);
    // Reload to apply theme before hydration (robust, no mismatch)
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <button
      className="btn-pure group flex items-center justify-between rounded-3xl px-2 py-1 ring-1 ring-foreHeader"
      onClick={toggleMode}
      aria-label="Toggle theme"
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
