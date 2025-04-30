'use client';
import React, { useEffect, useState } from 'react';
import Tooltip from './Tooltip';
import { LanguagesIcon } from 'lucide-react';

const GOOGLE_SCRIPT_ID = 'google-translate-script';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    google?: unknown;
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslateToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError('');

    if (document.getElementById(GOOGLE_SCRIPT_ID)) {
      setLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      setError('Google Translate could not be loaded (offline?)');
      setLoading(false);
    };
    document.body.appendChild(script);

    window.googleTranslateElementInit = function () {
      type TranslateType = {
        TranslateElement: {
          new (options: { pageLanguage: string; layout: unknown }, id: string): void;
          InlineLayout: { SIMPLE: unknown; VERTICAL: unknown };
        };
      };
      const g = window.google as Record<string, unknown>;
      if (
        g &&
        typeof g === 'object' &&
        'translate' in g &&
        typeof g.translate === 'object' &&
        g.translate &&
        'TranslateElement' in (g.translate as Record<string, unknown>)
      ) {
        const translate = g.translate as TranslateType;
        new translate.TranslateElement(
          { pageLanguage: 'en', layout: translate.TranslateElement.InlineLayout.VERTICAL },
          'google_translate_element'
        );
        // Inject custom styles for the widget
        const style = document.createElement('style');
        style.innerHTML = `
          #google_translate_element select {
            background: hsl(var(--background));
            color: hsl(var(--foreground));
            border-radius: 0.5rem;
            padding: 0.25rem 0.5rem;
          }
         
        `;
        document.head.appendChild(style);

        // Hide selector after language selection
        const observer = new MutationObserver(() => {
          const frame = document.querySelector('iframe.goog-te-menu-frame');
          if (frame) {
            frame.addEventListener('load', () => {
              try {
                const frameDoc = (frame as HTMLIFrameElement).contentDocument;
                if (frameDoc) {
                  // Listen for menu item click (language selection)
                  const menu = frameDoc.querySelector('.goog-te-menu2');
                  if (menu) {
                    menu.addEventListener('click', () => {
                      setTimeout(() => setEnabled(false), 100);
                    });
                  }
                }
              } catch (e) {
                console.error('Error accessing iframe in Google Translate:', e);
              }
            });
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setLoading(false);
      }
    };

    return () => {
      const widget = document.getElementById('google_translate_element');
      if (widget) widget.innerHTML = '';
      const s = document.getElementById(GOOGLE_SCRIPT_ID);
      if (s) s.remove();
      delete window.googleTranslateElementInit;
      setLoading(false);
      setError('');
    };
  }, [enabled]);

  return (
    <div className="relative flex items-center" style={{ marginLeft: 16 }}>
      <div className="nav-element">
        <Tooltip text={enabled ? 'Disable Translation' : 'Enable Translation'} position="right">
          <button
            className={`btn-pure`}
            aria-pressed={enabled}
            aria-label={enabled ? 'Disable Translation' : 'Enable Translation'}
            onClick={() => setEnabled((e) => !e)}
            disabled={loading}
            type="button"
          >
            <LanguagesIcon />
          </button>
        </Tooltip>
      </div>
      {enabled && (
        <div
          id="google_translate_element"
          className="absolute left-1/2 top-full z-50 mt-2 min-w-[180px] -translate-x-1/2 rounded-lg bg-card px-4 py-2 shadow-lg ring-1 ring-ring"
        />
      )}
      {loading && <span className="ml-2 animate-pulse text-sm text-gray-400">Loading…</span>}
      {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
    </div>
  );
}
