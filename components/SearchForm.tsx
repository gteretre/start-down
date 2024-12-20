"use client";
import Form from "next/form";

import SearchFormReset from "@/components/SearchFormReset";
import { Search } from "lucide-react";
import Tooltip from "./Tooltip";

function SearchForm({ query }: { query?: string }) {
  return (
    <Form action="/" scroll={false} className="search-form" autoComplete="off">
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
    </Form>
  );
}

export default SearchForm;
