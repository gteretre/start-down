'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import Confirmation from '@/components/common/Confirmation';
import { Author } from '@/lib/models';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'sv', label: 'Swedish' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'el', label: 'Greek' },
  { value: 'cs', label: 'Czech' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'ro', label: 'Romanian' },
  { value: 'bg', label: 'Bulgarian' },
  { value: 'hr', label: 'Croatian' },
  { value: 'sk', label: 'Slovak' },
  { value: 'sl', label: 'Slovenian' },
  { value: 'et', label: 'Estonian' },
  { value: 'lv', label: 'Latvian' },
  { value: 'lt', label: 'Lithuanian' },
];

export default function AccountForm({ user }: { user: Author }) {
  const [languageInput, setLanguageInput] = useState(
    LANGUAGES.find((l) => l.value === (user.location?.language || ''))?.label || ''
  );
  const [originalLanguage] = useState(user.location?.language || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const router = useRouter();

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.label.toLowerCase().includes(languageInput.toLowerCase())
  );

  const selectedLang = LANGUAGES.find(
    (lang) => lang.label.toLowerCase() === languageInput.toLowerCase()
  );
  const isUnchanged = (selectedLang?.value || '') === originalLanguage;
  const isValidLanguage = !!selectedLang;

  const handleApply = async () => {
    if (!isValidLanguage) return;
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: selectedLang.value }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || data?.error) {
        setError(data.error || 'Failed to update language');
      } else {
        setStatus('Language updated!');
        setLanguageInput(selectedLang.label);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Failed to update language');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || 'Failed to delete account');
      } else {
        setStatus('Account deleted. Redirecting...');
        setTimeout(() => router.push('/'), 1500);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Failed to delete account');
    }
  };

  return (
    <section className="ms-auto">
      <form className="form-container" onSubmit={(e) => e.preventDefault()}>
        <div className="mx-10 grid items-center gap-8">
          <div>
            <label className="form-label">Region</label>
            <input
              name="region"
              value={user.location?.region || 'Not set'}
              disabled
              className="form-input"
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">
              You cannot set your region at this time. This field is managed by the system.
            </p>
          </div>
          <div className="relative">
            <label className="form-label" htmlFor="language-input">
              Language
            </label>
            <div className="relative">
              <input
                id="language-input"
                className="form-input pr-24"
                type="text"
                autoComplete="off"
                value={languageInput}
                onChange={(e) => {
                  setLanguageInput(e.target.value);
                  setStatus(null);
                  setError(null);
                  setShowOptions(true);
                }}
                onFocus={() => setShowOptions(true)}
                onBlur={() => setTimeout(() => setShowOptions(false), 150)}
                disabled={loading}
                placeholder="Type to search language..."
              />
              {showOptions && filteredLanguages.length > 0 && (
                <ul className="bordershadow-lg absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-secondary">
                  {filteredLanguages.map((lang) => (
                    <li
                      key={lang.value}
                      className="cursor-pointer px-4 py-2 hover:bg-blue-400"
                      onMouseDown={() => {
                        setLanguageInput(lang.label);
                        setShowOptions(false);
                        setStatus(null);
                        setError(null);
                      }}
                    >
                      {lang.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {error && <div className="mt-1 text-sm font-medium text-red-500">{error}</div>}
            {status && <div className="mt-1 text-sm font-medium text-green-600">{status}</div>}
          </div>
          <div className="flex items-center justify-end gap-4 border-t pt-4">
            <button
              type="button"
              className="btn-danger rounded px-4 py-2 font-semibold"
              onClick={() => setShowConfirm(true)}
              disabled={loading}
            >
              Delete Account
            </button>
            <button
              type="button"
              className={`btn-normal px-4 py-2 text-white ring-1 ring-ring ${loading || isUnchanged || !isValidLanguage ? 'cursor-not-allowed bg-gray-700' : 'bg-green-700 hover:bg-green-600'}`}
              disabled={loading || isUnchanged || !isValidLanguage}
              onClick={handleApply}
            >
              {loading ? (
                <>
                  <div className="mr-1 inline-block h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                  Applying...
                </>
              ) : (
                <>Apply</>
              )}
            </button>
          </div>
          <span className="text-sm text-gray-500">
            Account deletion is irreversible. This action will delete all your data.
          </span>
          <Confirmation
            open={showConfirm}
            onConfirmAction={handleDelete}
            onCancelAction={() => setShowConfirm(false)}
            title="Delete Account"
            message="This action is irreversible. To confirm, type the word below:"
          />
        </div>
      </form>
    </section>
  );
}
