import React from 'react';
import { Stats } from '../types';
import { CheckCircle2, ShieldCheck, Layers, Award, Terminal, Code2, BarChart2 } from 'lucide-react';

interface MetricsViewProps {
  stats: Stats;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ stats }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-indigo-400" />
          <span>Formalization Metrics & Architecture</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Quantitative breakdown of formal verification progress, mathematical disciplines, and axiom hygiene.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Formalization Rate</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats.topLineFormalizationPercent}%
          </div>
          <p className="text-xs text-slate-400">
            {stats.topLineFormalizedCount} of {stats.totalPapers} top-line results formally verified in Lean 4
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${stats.topLineFormalizationPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Comparator Challenges</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 font-mono">
            {stats.totalChallenges}
          </div>
          <p className="text-xs text-slate-400">
            Independent proof specifications with isolated namespace checking
          </p>
          <div className="text-[11px] text-emerald-400 font-medium pt-1">
            +116 supporting lemmas & bridges
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Result Families</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats.totalFamilies}
          </div>
          <p className="text-xs text-slate-400">
            Cohesive mathematical research programs grouping 719 papers
          </p>
          <div className="text-[11px] text-purple-400 font-medium pt-1">
            {stats.formalizedFamiliesCount} families with Lean artifacts
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Evaluation Scope</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            ~4,000
          </div>
          <p className="text-xs text-slate-400">
            Open mathematical problems evaluated across post-saturation benchmarks
          </p>
          <div className="text-[11px] text-blue-400 font-medium pt-1">
            ~3 hours Pro thinking compute each
          </div>
        </div>
      </div>

      {/* Disciplines and Axiom breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disciplines */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Families by Mathematical Discipline</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.disciplines)
              .sort((a, b) => b[1] - a[1])
              .map(([discipline, count]) => {
                const percent = Math.round((count / stats.totalFamilies) * 100);
                return (
                  <div key={discipline} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{discipline}</span>
                      <span className="font-mono text-slate-400">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Permitted Axioms Hygiene */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lean 4 Permitted Axiom Hygiene</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Comparator framework tests proofs for strictly allowed standard axioms from the Lean 4 foundation. No custom axioms or contradictory assumptions are permitted.
          </p>

          <div className="space-y-3 pt-2">
            {Object.entries(stats.axioms)
              .sort((a, b) => b[1] - a[1])
              .map(([axiom, count]) => {
                const percent = Math.round((count / stats.totalChallenges) * 100);
                return (
                  <div key={axiom} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-emerald-300">
                        {axiom}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {count} / {stats.totalChallenges} challenges ({percent}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {axiom === 'propext' && 'Propositional extensionality (equivalent propositions are equal).'}
                      {axiom === 'Quot.sound' && 'Quotient soundness for constructing quotient types.'}
                      {axiom === 'Classical.choice' && 'Axiom of Choice for classical non-constructive reasoning.'}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Full Repository Scope & Anatomy (133k Files) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Full Repository Scope & Anatomy (133,956 Files Total)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of the complete 811 MB upstream GitHub repository (<code className="text-indigo-300">fraubentz/openai-math-diarrhea</code>)
            </p>
          </div>
          <a
            href="https://github.com/fraubentz/openai-math-diarrhea"
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium self-start sm:self-auto transition-colors inline-flex items-center gap-1"
          >
            <span>View on GitHub</span>
            <span>↗</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Formal Proof Files</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">62,353</div>
            <p className="text-[11px] text-slate-400">Lean 4 lemma & theorem files in <code className="text-slate-300">lean/OAI/</code></p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Paper Preprints</span>
            <div className="text-xl font-bold text-indigo-400 font-mono">749 folders</div>
            <p className="text-[11px] text-slate-400">Preprint packages with PDFs and LaTeX in <code className="text-slate-300">preprints/</code></p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Comparator Specs</span>
            <div className="text-xl font-bold text-purple-400 font-mono">416 challenges</div>
            <p className="text-[11px] text-slate-400">Isolated JSON specs & Lean challenges (bundled in this app)</p>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Reasoning Traces</span>
            <div className="text-xl font-bold text-amber-400 font-mono">10 trace PDFs</div>
            <p className="text-[11px] text-slate-400">ChatGPT Pro 3-hour thinking traces in <code className="text-slate-300">reasoning_traces/</code></p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-1">
          <strong className="text-slate-300">Architecture Note:</strong> The cloud web app bundles the complete index of 372 families, 719 paper abstracts, and all 416 Comparator verification specifications for instant sub-second searching and inspection. All 749 preprint PDFs and reasoning traces stream directly from GitHub via the embedded links.
        </p>
      </div>

      {/* Architecture & Verification Command Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>Lean 4 Verification Protocol Instructions</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          To run verification locally on the Lean formalizations using the official comparator tool:
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 space-y-2 overflow-x-auto">
          <div className="text-slate-500"># 1. Clone the complete 811MB repository with all 62k proofs and preprints</div>
          <div>git clone https://github.com/fraubentz/openai-math-diarrhea.git</div>
          <div className="text-slate-500 mt-2"># 2. Install comparator and Lean 4 export dependencies</div>
          <div>export PATH=$PATH:~/.elan/bin:~/.cargo/bin</div>
          <div className="text-slate-500 mt-2"># 3. Update Lake dependencies and fetch mathlib cache</div>
          <div>cd openai-math-diarrhea/lean/</div>
          <div>lake update && lake exe cache get</div>
          <div className="text-slate-500 mt-2"># 4. Verify a challenge against comparator specification</div>
          <div className="text-emerald-400">lake env comparator ComparatorChallenges/QuasiRiemannHypothesis.json</div>
        </div>
      </div>
    </div>
  );
};
