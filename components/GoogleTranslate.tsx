'use client';
import React, { useEffect, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-translate-script';

export default function GoogleTranslateToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Prevent loading the script multiple times
    if (document.getElementById(GOOGLE_SCRIPT_ID)) return;

    // Create script element
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      // Handle script load error (e.g., offline)
      alert('Google Translate could not be loaded (offline?)');
    };
    document.body.appendChild(script);

    // Define the callback
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en' },
        'google_translate_element'
      );
    };

    // Cleanup on disable
    return () => {
      // Remove widget and script
      const widget = document.getElementById('google_translate_element');
      if (widget) widget.innerHTML = '';
      const s = document.getElementById(GOOGLE_SCRIPT_ID);
      if (s) s.remove();
      delete window.googleTranslateElementInit;
    };
  }, [enabled]);

  return (
    <div className="google-translate-container" style={{ display: 'inline-block', marginLeft: 16 }}>
      <button
        className="btn-pure"
        onClick={() => setEnabled((e) => !e)}
        title={enabled ? 'Disable Translation' : 'Enable Translation'}
      >
        🌐
      </button>
      {enabled && <div id="google_translate_element" />}
    </div>
  );
}
