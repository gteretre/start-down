"use client";

import Link from "next/link";
import { X } from "lucide-react";

function SearchFormReset() {
  const reset = () => {
    const form = document.querySelector(".search-form") as HTMLFormElement;
    if (form) form.reset();
  };

  return (
    <button type="reset" className="search-btn" onClick={reset}>
      <Link href="/">
        <X className="size-5" />
      </Link>
    </button>
  );
}

export default SearchFormReset;
