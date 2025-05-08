"use client";
import { useState, useEffect } from "react";

const themes = [
  { name: "system", icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 19h8"/></svg>
  ) },
  { name: "dark", icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"/></svg>
  ) },
  { name: "light", icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 6.07-1.42-1.42M6.34 6.34 4.93 4.93m12.73 0-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
  ) },
];

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeSwitcherProps {
  className?: string;
}

export default function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    let applied = theme;
    if (theme === "system") {
      applied = getSystemTheme();
      const listener = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
        document.documentElement.classList.toggle("light", !e.matches);
      };
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", listener);
      document.documentElement.classList.toggle("dark", applied === "dark");
      document.documentElement.classList.toggle("light", applied === "light");
      return () => mq.removeEventListener("change", listener);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.classList.toggle("light", theme === "light");
    }
  }, [theme]);

  return (
    <div className={`flex gap-0.5 bg-muted/60 rounded-md px-0.5 py-0.5 border border-border ${className}`}>
      {themes.map((t) => (
        <button
          key={t.name}
          aria-label={t.name}
          onClick={() => setTheme(t.name)}
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors outline-none
            ${theme === t.name ? "bg-muted text-foreground" : "hover:bg-muted/40 text-muted-foreground"}`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
} 