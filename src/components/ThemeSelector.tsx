import React, { useEffect, useState } from 'react';
import { Sun, Moon, Zap } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'oled';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('openai_math_theme') as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'oled') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'dark';
  });

  const applyTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('openai_math_theme', newTheme);
    } catch {
      // ignore
    }

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-oled');
    root.classList.add(`theme-${newTheme}`);

    // Update meta theme-color for mobile address bars
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (newTheme === 'light') {
        metaThemeColor.setAttribute('content', '#f8fafc');
      } else if (newTheme === 'oled') {
        metaThemeColor.setAttribute('content', '#000000');
      } else {
        metaThemeColor.setAttribute('content', '#030712');
      }
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  return (
    <div
      role="group"
      aria-label="Display theme selection"
      className={`inline-flex items-center p-0.5 rounded-lg bg-slate-950/80 border border-slate-800 ${className}`}
    >
      <button
        type="button"
        onClick={() => applyTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="Light mode"
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
          theme === 'light'
            ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Light Mode (Academic Paper)"
      >
        <Sun className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => applyTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Dark mode"
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
          theme === 'dark'
            ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40 shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Dark Mode (Slate)"
      >
        <Moon className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => applyTheme('oled')}
        aria-pressed={theme === 'oled'}
        aria-label="Eco OLED mode (True pitch black)"
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
          theme === 'oled'
            ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Eco-friendly OLED Mode (Pure #000000 black, shuts off pixels to save battery)"
      >
        <Zap className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
        <span className="hidden sm:inline">OLED Eco</span>
        <span className="sm:hidden">OLED</span>
      </button>
    </div>
  );
};
