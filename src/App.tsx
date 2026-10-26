import React, { useState, useMemo, useEffect, useCallback } from 'react';
import initialFamiliesData from './data/families.json';
import challengesData from './data/challenges.json';
import statsData from './data/stats.json';
import { Family, Challenge, Stats } from './types';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { FamilyCard } from './components/FamilyCard';
import { FamilyModal } from './components/FamilyModal';
import { ChallengeViewer } from './components/ChallengeViewer';
import { ReasoningView } from './components/ReasoningView';
import { MetricsView } from './components/MetricsView';
import { HistoryView } from './components/HistoryView';
import { AuditView } from './components/AuditView';
import {
  getCachedSyncedFamilies,
  getCachedSyncMeta,
  syncWithUpstream,
  SyncStatus,
} from './services/upstreamSync';
import { Filter, Layers, CheckCircle2, BrainCircuit, AlertTriangle, ChevronLeft, ChevronRight, GitFork, ExternalLink } from 'lucide-react';

const baselineFamilies = initialFamiliesData as Family[];
const challenges = challengesData as Challenge[];
const stats = statsData as Stats;

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'challenges' | 'reasoning' | 'audit' | 'metrics' | 'history'>('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [formalFilter, setFormalFilter] = useState<'all' | 'formalized' | 'trace' | 'withdrawn'>('all');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedChallengeName, setSelectedChallengeName] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 24;

  // Live upstream synchronization state
  const cachedMeta = getCachedSyncMeta();
  const [families, setFamilies] = useState<Family[]>(() => {
    return getCachedSyncedFamilies() || baselineFamilies;
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastChecked: cachedMeta.lastChecked || 'Baseline',
    commitSha: cachedMeta.commitSha || 'main',
    isSyncing: false,
    status: cachedMeta.lastChecked ? 'synced' : 'idle',
    message: cachedMeta.lastChecked ? `Synced with upstream (${cachedMeta.commitSha || 'main'})` : 'Auto-sync active',
  });

  const handleTriggerSync = useCallback(() => {
    syncWithUpstream(baselineFamilies, setSyncStatus).then((updated) => {
      if (updated && updated.length > 0) {
        setFamilies(updated);
      }
    });
  }, []);

  // Automatic background sync on mount
  useEffect(() => {
    // Slight delay to avoid competing with initial render
    const timer = setTimeout(() => {
      handleTriggerSync();
    }, 1200);
    return () => clearTimeout(timer);
  }, [handleTriggerSync]);

  // Disciplines list with counts
  const disciplines = useMemo(() => {
    const list = Object.keys(stats.disciplines).sort();
    return ['all', ...list];
  }, []);

  // Filtered families
  const filteredFamilies = useMemo(() => {
    return families.filter((f) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = f.title.toLowerCase().includes(q);
        const matchId = f.id.includes(q);
        const matchSummary = f.summary.toLowerCase().includes(q);
        const matchPaper = f.papers.some((p) => p.title.toLowerCase().includes(q) || p.abstract.toLowerCase().includes(q));
        const matchChallenge = f.challenges.some((c) => c.toLowerCase().includes(q));
        if (!matchTitle && !matchId && !matchSummary && !matchPaper && !matchChallenge) {
          return false;
        }
      }

      if (selectedDiscipline !== 'all' && f.discipline !== selectedDiscipline) {
        return false;
      }

      if (formalFilter === 'formalized' && !(f.hasLeanDoc || f.challenges.length > 0)) {
        return false;
      }
      if (formalFilter === 'trace' && !f.reasoningTrace) {
        return false;
      }
      if (formalFilter === 'withdrawn' && f.status !== 'withdrawn') {
        return false;
      }

      return true;
    });
  }, [families, searchQuery, selectedDiscipline, formalFilter]);

  const paginatedFamilies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredFamilies.slice(start, start + pageSize);
  }, [filteredFamilies, page]);

  const totalPages = Math.ceil(filteredFamilies.length / pageSize) || 1;

  const handleSelectChallenge = (name: string) => {
    setSelectedChallengeName(name);
    setActiveTab('challenges');
  };

  const handleOpenFamily = (familyId: string) => {
    const found = families.find((f) => f.id === familyId);
    if (found) {
      setSelectedFamily(found);
      setActiveTab('catalogue');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Fork Disclaimer & Upstream Sync Banner */}
      <DisclaimerBanner
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
      />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        totalFamilies={families.length}
        totalChallenges={challenges.length}
      />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {activeTab === 'catalogue' && (
          <section
            role="tabpanel"
            id="panel-catalogue"
            aria-labelledby="tab-catalogue"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6"
          >
            {/* Filter Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs -mx-1 px-1">
                  <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" aria-hidden="true" /> Filter:
                  </span>
                  <button
                    onClick={() => {
                      setFormalFilter('all');
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all min-h-[36px] ${
                      formalFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }`}
                  >
                    All Results ({families.length})
                  </button>
                  <button
                    onClick={() => {
                      setFormalFilter('formalized');
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all min-h-[36px] ${
                      formalFilter === 'formalized'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-emerald-400/80 hover:text-emerald-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Lean 4 Formalized ({stats.formalizedFamiliesCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      setFormalFilter('trace');
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all min-h-[36px] ${
                      formalFilter === 'trace'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-purple-300 hover:text-purple-200 hover:bg-slate-700/60'
                    }`}
                  >
                    <BrainCircuit className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Reasoning Traces (10)</span>
                  </button>
                  <button
                    onClick={() => {
                      setFormalFilter('withdrawn');
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all min-h-[36px] ${
                      formalFilter === 'withdrawn'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-rose-300 hover:text-rose-200 hover:bg-slate-700/60'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Withdrawn (3)</span>
                  </button>
                </div>

                {/* Counter indicator */}
                <div className="text-xs text-slate-400 shrink-0" aria-live="polite">
                  Showing <span className="font-semibold text-slate-200">{filteredFamilies.length}</span> of {families.length} families
                </div>
              </div>

              {/* Disciplines Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none text-xs -mx-1 px-1">
                <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" /> Discipline:
                </span>
                {disciplines.map((d) => {
                  const isSelected = selectedDiscipline === d;
                  const count = d === 'all' ? families.length : stats.disciplines[d] || 0;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDiscipline(d);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-md text-[11px] whitespace-nowrap transition-all min-h-[32px] ${
                        isSelected
                          ? 'bg-slate-700 text-white font-medium border border-slate-600'
                          : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {d === 'all' ? 'All Disciplines' : d} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Families Grid */}
            {filteredFamilies.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 p-6">
                <p className="text-slate-400 text-sm">No mathematical families matched your current search and filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDiscipline('all');
                    setFormalFilter('all');
                  }}
                  className="text-xs px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors min-h-[40px]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedFamilies.map((family) => (
                  <FamilyCard
                    key={family.id}
                    family={family}
                    onSelect={setSelectedFamily}
                  />
                ))}
              </div>
            )}

            {/* Accessible Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Manuscript pagination" className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
                <div>
                  Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
                  <span className="font-semibold text-slate-200">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </section>
        )}

        {activeTab === 'challenges' && (
          <section role="tabpanel" id="panel-challenges" aria-labelledby="tab-challenges">
            <ChallengeViewer
              challenges={challenges}
              selectedChallengeName={selectedChallengeName}
              onSelectChallenge={setSelectedChallengeName}
              onOpenFamily={handleOpenFamily}
              families={families}
            />
          </section>
        )}

        {activeTab === 'reasoning' && (
          <section role="tabpanel" id="panel-reasoning" aria-labelledby="tab-reasoning">
            <ReasoningView
              families={families}
              onOpenFamily={handleOpenFamily}
            />
          </section>
        )}

        {activeTab === 'audit' && (
          <section role="tabpanel" id="panel-audit" aria-labelledby="tab-audit">
            <AuditView />
          </section>
        )}

        {activeTab === 'metrics' && (
          <section role="tabpanel" id="panel-metrics" aria-labelledby="tab-metrics">
            <MetricsView stats={stats} />
          </section>
        )}

        {activeTab === 'history' && (
          <section role="tabpanel" id="panel-history" aria-labelledby="tab-history">
            <HistoryView />
          </section>
        )}
      </main>

      {/* Selected Family Detail Modal */}
      <FamilyModal
        family={selectedFamily}
        onClose={() => setSelectedFamily(null)}
        onSelectChallenge={handleSelectChallenge}
        allChallenges={challenges}
      />

      {/* Accessible Footer with Fork Notice & PY Maintainer Attribution */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 space-y-3" role="contentinfo">
        <div className="flex flex-wrap items-center justify-center gap-2 text-slate-400">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <GitFork className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Open-Source Fork & Research Explorer</span>
          </span>
          <span>·</span>
          <span>© {new Date().getFullYear()}</span>
          <span>·</span>
          <span className="font-semibold text-slate-200">Maintained by PY</span>
          <span>·</span>
          <a
            href="https://github.com/fraubentz"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline font-medium inline-flex items-center gap-0.5"
          >
            <span>@fraubentz</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <span>·</span>
          <a
            href="https://github.com/fraubentz/openai-math-diarrhea"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-0.5"
          >
            <span>Original GitHub Repository</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
        <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Disclaimer: This web application is an independent fork and viewer designed for academic exploration. It is not affiliated with, sponsored by, or endorsed by OpenAI. All papers and theorem statements are property of their respective creators.
        </p>
        <p className="text-[11px] text-slate-600">
          719 Manuscripts · 372 Result Families · 416 Lean 4 Comparator Verification Specifications · Maintained by PY (Updated {new Date().getFullYear()})
        </p>
      </footer>
    </div>
  );
};

export default App;
