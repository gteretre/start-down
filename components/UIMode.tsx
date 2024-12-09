"use client";
import { useState } from "react";
import { Sun, Moon, CircleArrowRight, CircleArrowLeft } from "lucide-react";

function UIMode() {
  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    document.body.classList.toggle("dark", newMode === "dark");
  };

  return (
    <button
      className="group btn-pure ring-1 py-1 px-2 ring-foreHeader flex items-center 
      justify-between"
      onClick={toggleMode}
    >
      <div
        className={`group-hover:opacity-0 transition-opacity duration-700 ${
          mode === "light" ? "translate-x-0" : "translate-x-6"
        }`}
      >
        {mode === "light" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </div>
      <div
        className={`transform transition-transform duration-200 ${
          mode === "light" ? "translate-x-0" : "-translate-x-full "
        }`}
      >
        {mode === "light" ? (
          <CircleArrowLeft className="size-4 ml-2" />
        ) : (
          <CircleArrowRight className="size-4 ml-2" />
        )}
      </div>
    </button>
  );
}

export default UIMode;
