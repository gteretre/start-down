'use client';
import React from 'react';
import { ArrowUpIcon } from 'lucide-react';

const GoUpButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScrollOrHash = () => {
      setVisible(window.scrollY > 200 || (!!window.location.hash && window.scrollY > 0));
    };
    window.addEventListener('scroll', handleScrollOrHash);
    window.addEventListener('hashchange', handleScrollOrHash);
    handleScrollOrHash();
    return () => {
      window.removeEventListener('scroll', handleScrollOrHash);
      window.removeEventListener('hashchange', handleScrollOrHash);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  return (
    <button
      aria-label="Go to top"
      onClick={scrollToTop}
      className={`fixed bottom-16 right-6 z-50 rounded-full border border-border bg-card p-3 shadow-lg transition-opacity duration-500 ease-in-out ${visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'} go-up-jump scale-100`}
      onMouseEnter={(e) => e.currentTarget.classList.add('jumping')}
      onMouseLeave={(e) => e.currentTarget.classList.remove('jumping')}
    >
      <ArrowUpIcon />
    </button>
  );
};

export default GoUpButton;
