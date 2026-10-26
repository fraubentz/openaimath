import React from 'react';
import { History, AlertTriangle, Wrench, PlusCircle, CheckCircle2 } from 'lucide-react';

export const HistoryView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-amber-400" />
          <span>Release History & Revisions</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          OpenAI public release history, errata notices, manuscript withdrawals, and formalization changelog.
        </p>
      </div>

      {/* October 7, 2026 Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-400"></span>
            <h3 className="text-lg font-bold text-white">October 7, 2026 Update</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
            Repository Update v1.2
          </span>
        </div>

        {/* 1. Withdrawals */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Withdrawals (Sign Error in Split Abelian Eightfolds)</span>
          </div>
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 text-xs text-rose-200/90 leading-relaxed space-y-2">
            <p>
              In <span className="font-semibold text-rose-200">“Algebraicity of Weil classes on split abelian eightfolds”</span> a sign error invalidates a stabilization-trace cancellation argument and the construction used by two dependent papers. As a result, the following three manuscripts have been withdrawn with notices explaining the gap:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-rose-300">
              <li>Algebraicity of Weil classes on split abelian eightfolds</li>
              <li>Algebraicity of Kuga–Satake Correspondences for K3 Surfaces</li>
              <li>The rational Hodge conjecture for products of K3 surfaces</li>
            </ul>
          </div>
        </div>

        {/* 2. Fixes & Proof Repairs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Wrench className="w-4 h-4 shrink-0" />
            <span>Proof Repairs & Revisions (14 Manuscripts)</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-3">
            <p className="text-slate-400">
              Revised 14 manuscripts with corrected statements, clearer hypotheses and dependencies, and updated citations:
            </p>
            <ul className="space-y-2 divide-y divide-slate-800/80">
              <li className="pt-1">
                <span className="font-semibold text-slate-200">Lipschitz heights and Ashkin–Teller currents (4 manuscripts):</span> Repaired crossing, boundary-attachment, conditioning, and convergence arguments, including additional work on the real-Lipschitz interface proof.
              </li>
              <li className="pt-2">
                <span className="font-semibold text-slate-200">Kähler minimal model programs and abundance (6 manuscripts):</span> Expanded positivity and contraction arguments and clarified which results are used as inputs, with their required hypotheses.
              </li>
              <li className="pt-2">
                <span className="font-semibold text-slate-200">Taming and hypersymplectic deformation (2 manuscripts):</span> Corrected the cone-equality claim in <i>Taming implies compatibility</i>, added a strict-inclusion example, and removed an unnecessary cone-comparison dependency.
              </li>
              <li className="pt-2">
                <span className="font-semibold text-slate-200">Incompressible Box Transport and Finite Computation:</span> Revised the torus-projection and common-clock estimates.
              </li>
              <li className="pt-2">
                <span className="font-semibold text-slate-200">Exact Birch–Swinnerton-Dyer Formula from Low Selmer Corank:</span> Removed an obsolete introductory citation to a removed supporting manuscript.
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Additional Formalizations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Additional Formalizations in Lean 4</span>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 text-xs text-emerald-200/90 leading-relaxed">
            <p>
              Added an additional 6 formalizations and 5 other additions covering supporting results. This brings the total percentage of top-line results formalized to <span className="font-bold text-white">300 / 719 = ~42%</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Methodology policy note */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          <span>Versioning and Corrections Policy</span>
        </h4>
        <p className="leading-relaxed">
          The public release history of this collection is permanently preserved. Corrections and revisions are recorded as new versions, with previously released versions remaining accessible. For any withdrawn papers, notices explain the gap and link to the archived manuscripts.
        </p>
      </div>
    </div>
  );
};
