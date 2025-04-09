"use client";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

import SearchFormReset from "@/components/SearchFormReset";
import { Search } from "lucide-react";
import Tooltip from "./Tooltip";

// Sanitize search query to prevent regex errors
const sanitizeSearchQuery = (query: string): string => {
  // Remove regex special characters and escape sequences
  return query.replace(/[.*+?^${}()|[\]\\]/g, "");
};
function SearchForm({ query }: { query?: string }) {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawQuery = formData.get("query")?.toString() || "";

    // Sanitize the query to prevent regex errors
    const searchQuery = sanitizeSearchQuery(rawQuery);

    if (searchQuery.trim()) {
      // Update to search for users instead of startups
      router.push(`/users?query=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/users");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form" autoComplete="off">
      {" "}
      <input
        name="query"
        defaultValue={query}
        className="search-input"
        placeholder="Search Users"
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
