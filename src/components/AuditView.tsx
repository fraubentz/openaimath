import React, { useState } from 'react';
import initialAuditData from '../data/audit-candidates.json';
import { Search, Filter, ShieldAlert, Terminal, Download, FileText, CheckCircle2, AlertOctagon, HelpCircle, BookOpen } from 'lucide-react';

interface Candidate {
  term: string;
  count: number;
  n_manuscripts: number;
  categories: string[];
  unverified_quotes: number;
  sample_quotes: string[];
  manuscripts: string[];
}

export const AuditView: React.FC = () => {
  const [candidates] = useState<Candidate[]>(initialAuditData);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'NONSTANDARD_TERM',
    'POSSIBLE_MISUSE',
    'NOTATION_ISSUE',
    'UNDEFINED_SHORTHAND',
  ];

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.term.toLowerCase().includes(search.toLowerCase()) ||
      c.manuscripts.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
      c.sample_quotes.some((q) => q.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || c.categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleDownloadScript = () => {
    fetch('/phase1_audit.py')
      .then((res) => res.text())
      .then((text) => {
        const blob = new Blob([text], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'phase1_audit.py';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => console.error('Failed to download script', e));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Phase 1 Mathematical Language Audit
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  Observation-Only · Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Automated auditing of LaTeX preprints for nonstandard terms, notation inconsistencies, and potentially misleading mathematical phrasing.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadScript}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto min-h-[40px]"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download phase1_audit.py</span>
          </button>
        </div>

        {/* Audit categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
            <span className="text-xs font-bold text-amber-300 font-mono">1. NONSTANDARD_TERM</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Terms or phrases that are not conventional mathematical vocabulary, or appear invented by the author.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
            <span className="text-xs font-bold text-rose-300 font-mono">2. POSSIBLE_MISUSE</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Conventional terminology used with a meaning different from its standard definition.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
            <span className="text-xs font-bold text-purple-300 font-mono">3. NOTATION_ISSUE</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Symbols that are undefined, reused for different objects, or used inconsistently across lemmas.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
            <span className="text-xs font-bold text-blue-300 font-mono">4. UNDEFINED_SHORTHAND</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Abbreviations, labels, or nicknames for objects or proof steps used without formal definition.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative min-w-[260px] max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search terms, sample quotes, manuscripts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Flagged Mathematical Term Candidates ({filtered.length})</span>
          <span>Ranked by frequency and manuscript occurrence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-mono text-sm sm:text-base font-bold text-white">
                    "{item.term}"
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.count} hits
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                      {item.n_manuscripts} {item.n_manuscripts === 1 ? 'paper' : 'papers'}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1">
                  {item.categories.map((c) => (
                    <span
                      key={c}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        c === 'NONSTANDARD_TERM'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : c === 'POSSIBLE_MISUSE'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                          : c === 'NOTATION_ISSUE'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    verbatim verified
                  </span>
                </div>

                {/* Sample Quotes */}
                {item.sample_quotes.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                      Verbatim In-Context Excerpt:
                    </span>
                    {item.sample_quotes.map((q, qIdx) => (
                      <p
                        key={qIdx}
                        className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 pl-3 border-l-2 border-l-amber-500/40"
                      >
                        "{q}"
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Affected Manuscripts */}
              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-400">Observed in:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                  {item.manuscripts.map((m, mIdx) => (
                    <li key={mIdx} className="truncate">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Running the Phase 1 Batch Auditor Locally</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The <code className="font-mono text-indigo-300">phase1_audit.py</code> script performs automated, multi-threaded chunked auditing using the Gemini API over LaTeX manuscripts in <code className="font-mono text-indigo-300">preprints/</code>.
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 space-y-2 overflow-x-auto">
          <div className="text-slate-500"># 1. Install prerequisites</div>
          <div>pip install google-genai</div>
          <div className="text-slate-500 mt-2"># 2. Configure Gemini API key from AI Studio</div>
          <div>export GEMINI_API_KEY="your-gemini-api-key"</div>
          <div className="text-slate-500 mt-2"># 3. Dry run to verify chunk counts and token estimates (zero API cost)</div>
          <div className="text-emerald-400">python phase1_audit.py preprints --dry-run</div>
          <div className="text-slate-500 mt-2"># 4. Pilot run on first 3 manuscripts</div>
          <div className="text-emerald-400">python phase1_audit.py preprints --limit 3</div>
          <div className="text-slate-500 mt-2"># 5. Targeted audit on manuscripts matching a keyword</div>
          <div className="text-emerald-400">python phase1_audit.py preprints --only Hodge</div>
          <div className="text-slate-500 mt-2"># 6. Full batch audit (resumable with raw_results.jsonl checkpointing)</div>
          <div className="text-emerald-400">python phase1_audit.py preprints</div>
        </div>
      </div>
    </div>
  );
};
