"use client";
import React from "react";
import { Sun, Moon, CircleArrowRight, CircleArrowLeft } from "lucide-react";

function UIMode() {
  const [colorMode, setColorMode] = React.useState("light");

  React.useEffect(() => {
    const mode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setColorMode(mode);
  }, []);

  const toggleMode = () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newMode);
    document.body.classList.toggle("dark", newMode === "dark");
  };

  React.useEffect(() => {
    document.body.classList.toggle("dark", colorMode === "dark");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setColorMode(e.matches ? "dark" : "light");
      document.body.classList.toggle("dark", e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorMode]);

  return (
    <button
      className="group btn-pure ring-1 py-1 px-2 ring-foreHeader flex items-center 
      justify-between"
      onClick={toggleMode}
    >
      <div
        className={`group-hover:opacity-0 transition-opacity duration-700 ${
          colorMode === "light" ? "translate-x-0" : "translate-x-6"
        }`}
      >
        {colorMode === "light" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </div>
      <div
        className={`transform transition-transform duration-200 ${
          colorMode === "light" ? "translate-x-0" : "-translate-x-full "
        }`}
      >
        {colorMode === "light" ? (
          <CircleArrowLeft className="size-4 ml-2" />
        ) : (
          <CircleArrowRight className="size-4 ml-2" />
        )}
      </div>
    </button>
  );
}

export default UIMode;
