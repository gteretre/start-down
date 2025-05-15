'use client';
import React, { useState, useEffect } from 'react';

const WORDS = ['delete', 'remove', 'confirm', 'erase', 'destroy', 'proceed'];

export default function Confirmation({
  open,
  onConfirmAction,
  onCancelAction,
  title = 'Are you sure?',
  message = 'This action cannot be undone. To confirm, type the word below:',
}: {
  open: boolean;
  onConfirmAction: () => void;
  onCancelAction: () => void;
  title?: string;
  message?: string;
}) {
  const [word, setWord] = useState(WORDS[0]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (open) {
      setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
      setInput('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="animate-fadeInDown w-full max-w-sm rounded-xl bg-card p-8 shadow-lg ring-1 ring-border lg:max-w-md">
        <h2 className="mb-2 text-xl font-bold text-foreground">{title}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{message}</p>
        <div className="mb-4 flex items-center gap-4">
          <span className="select-none rounded bg-muted px-2 py-1 font-mono text-base font-semibold text-primary ring-1 ring-inset ring-primary/20">
            {word}
          </span>
          <input
            className="rounded-md border-2 border-border bg-transparent px-3 py-2 text-sm text-muted-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
            placeholder="Type here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="btn-normal bg-gray-500 text-white ring-1 ring-ring hover:bg-gray-400"
            onClick={onCancelAction}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`btn-danger ${input === word ? '' : 'cursor-not-allowed opacity-60'}`}
            onClick={() => input === word && onConfirmAction()}
            type="button"
            disabled={input !== word}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
