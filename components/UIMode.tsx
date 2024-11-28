"use client";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";

function UIMode() {
  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    document.body.classList.toggle("dark", newMode === "dark");
  };

  return (
    <button className="search-btn" onClick={toggleMode}>
      {mode === "light" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}

export default UIMode;
