"use client";

import Link from "next/link";
import { X } from "lucide-react";

import Tooltip from "./Tooltip";

function SearchFormReset() {
  const reset = () => {
    const form = document.querySelector(".search-form") as HTMLFormElement;
    if (form) form.reset();
  };

  return (
    <Tooltip text="Clear">
      <button type="reset" className="search-btn" onClick={reset}>
        <Link href="/">
          <X className="size-5" />
        </Link>
      </button>
    </Tooltip>
  );
}

export default SearchFormReset;
