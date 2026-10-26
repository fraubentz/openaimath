import React from 'react';
import { BookOpen, Code2, BrainCircuit, BarChart3, History, Search, ShieldAlert } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

interface HeaderProps {
  activeTab: 'catalogue' | 'challenges' | 'reasoning' | 'audit' | 'metrics' | 'history';
  setActiveTab: (tab: 'catalogue' | 'challenges' | 'reasoning' | 'audit' | 'metrics' | 'history') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalFamilies: number;
  totalChallenges: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  totalFamilies,
  totalChallenges,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0"
              aria-hidden="true"
            >
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center font-serif text-xl sm:text-2xl font-bold text-indigo-300">
                ∀
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  OpenAI Math Manuscripts & Lean Formalizations
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 whitespace-nowrap">
                  Lean 4 & Mathlib
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                719 manuscripts · {totalFamilies} result families · {totalChallenges} Lean comparator challenges · ~42% top-line verified
              </p>
            </div>
          </div>

          {/* Quick Search and Links */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative min-w-[220px] max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search families, theorems, axioms..."
                aria-label="Search all 372 families, 719 manuscripts, and 416 theorems"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all min-h-[42px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 min-h-[28px]"
                >
                  Clear
                </button>
              )}
            </div>

            <a
              href="https://github.com/fraubentz/openai-math-diarrhea/blob/main/overview.pdf"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/80 transition-colors whitespace-nowrap min-h-[42px]"
              title="Read official 40-page overview PDF on GitHub"
            >
              <span>Overview PDF</span>
            </a>

            <a
              href="https://github.com/fraubentz/openai-math-diarrhea"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-xs font-medium text-white shadow-sm shadow-indigo-600/30 transition-colors whitespace-nowrap min-h-[42px]"
              title="View original GitHub repository (133k files, 811MB)"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">GitHub (133k files)</span>
              <span className="sm:hidden">GitHub</span>
            </a>

            {/* Light / Dark / OLED Eco Mode Selector */}
            <ThemeSelector />
          </div>
        </div>

        {/* Navigation Tabs with ARIA accessibility */}
        <nav
          role="tablist"
          aria-label="Primary navigation tabs"
          className="flex items-center gap-1 border-t border-slate-800/80 overflow-x-auto scrollbar-none py-1.5 -mx-2 px-2"
        >
          <button
            role="tab"
            id="tab-catalogue"
            aria-selected={activeTab === 'catalogue'}
            aria-controls="panel-catalogue"
            onClick={() => setActiveTab('catalogue')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
              activeTab === 'catalogue'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Manuscript Catalogue</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'catalogue' ? 'bg-indigo-700/60 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalFamilies}
            </span>
          </button>

          <button
            role="tab"
            id="tab-challenges"
            aria-selected={activeTab === 'challenges'}
            aria-controls="panel-challenges"
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
              activeTab === 'challenges'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Lean 4 Challenges</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'challenges' ? 'bg-indigo-700/60 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalChallenges}
            </span>
          </button>

          <button
            role="tab"
            id="tab-reasoning"
            aria-selected={activeTab === 'reasoning'}
            aria-controls="panel-reasoning"
            onClick={() => setActiveTab('reasoning')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
              activeTab === 'reasoning'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BrainCircuit className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Reasoning Traces</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'reasoning' ? 'bg-indigo-700/60 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              10
            </span>
          </button>

          <button
            role="tab"
            id="tab-audit"
            aria-selected={activeTab === 'audit'}
            aria-controls="panel-audit"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
              activeTab === 'audit'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Language Audit</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === 'audit' ? 'bg-amber-700/60 text-amber-100' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Phase 1
            </span>
          </button>

          <button
            role="tab"
            id="tab-metrics"
            aria-selected={activeTab === 'metrics'}
            aria-controls="panel-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
              activeTab === 'metrics'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Metrics</span>
          </button>

          <button
            role="tab"
            id="tab-history"
            aria-selected={activeTab === 'history'}
            aria-controls="panel-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[38px] ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Revision Log</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" aria-label="Updated" />
          </button>
        </nav>
      </div>
    </header>
  );
};
