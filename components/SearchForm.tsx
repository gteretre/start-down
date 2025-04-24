'use client';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';

import SearchFormReset from '@/components/SearchFormReset';
import { Search } from 'lucide-react';
import Tooltip from './Tooltip';

const sanitizeSearchQuery = (query: string): string => {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '');
};

function SearchForm({ query }: { query?: string }) {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawQuery = formData.get('query')?.toString() || '';
    const searchQuery = sanitizeSearchQuery(rawQuery);
    if (searchQuery.trim()) {
      router.push(`?query=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form" autoComplete="off">
      {' '}
      <input
        name="query"
        defaultValue={query}
        className="search-input"
        placeholder="Search Startups"
        autoComplete="off"
      />
      <div className="flex gap-2">{query && <SearchFormReset />}</div>
      <Tooltip text="Search">
        <button type="submit" className="search-btn mr-5">
          <Search className="size-5" />
        </button>
      </Tooltip>
    </form>
  );
}

export default SearchForm;
