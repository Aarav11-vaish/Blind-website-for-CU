"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Set state AFTER DOM is updated — but using requestAnimationFrame avoids the warning
    requestAnimationFrame(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
      window.dispatchEvent(new Event("theme-change"));
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
      window.dispatchEvent(new Event("theme-change"));
    }
  };

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="rounded-full p-2 bg-muted hover:bg-accent border border-border transition-colors shadow text-xl"
      style={{ lineHeight: 0 }}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  );
}
