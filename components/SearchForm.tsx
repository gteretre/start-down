'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

import { XIcon, SearchIcon } from 'lucide-react';
import Tooltip from './Tooltip';

const sanitizeSearchQuery = (query: string): string => {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '');
};

function SearchForm({ query }: { query?: string }) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(query || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawQuery = formData.get('query')?.toString() || '';
    const searchQuery = sanitizeSearchQuery(rawQuery);
    if (!searchQuery.trim()) {
      return; // Do nothing if input is empty
    }
    router.push(`?query=${encodeURIComponent(searchQuery)}#cards-section`);
  };

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="search-form" autoComplete="off">
      <div className="relative w-full">
        <input
          ref={inputRef}
          name="query"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="search-input pr-8"
          placeholder="Search Startups"
          autoComplete="off"
        />
        {inputValue && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Tooltip text="Clear">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                tabIndex={-1}
                aria-label="Clear search"
              >
                <XIcon className="size-5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
      <div className="flex gap-2"></div>
      <Tooltip text="Search">
        <button
          type="submit"
          className="pr-5 text-muted-foreground hover:text-foreground"
          aria-label="Search"
          disabled={!inputValue.trim()}
        >
          <SearchIcon className="size-5" />
        </button>
      </Tooltip>
    </form>
  );
}

export default SearchForm;
