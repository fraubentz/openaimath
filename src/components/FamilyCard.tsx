import React from 'react';
import { Family } from '../types';
import { MathText } from './MathText';
import { FileText, CheckCircle2, ChevronRight, BrainCircuit, AlertTriangle } from 'lucide-react';

interface FamilyCardProps {
  family: Family;
  onSelect: (family: Family) => void;
}

export const FamilyCard: React.FC<FamilyCardProps> = ({ family, onSelect }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(family);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Family ${family.id}: ${family.title}. Click to view manuscripts and verification details.`}
      onClick={() => onSelect(family)}
      onKeyDown={handleKeyDown}
      className="group relative bg-slate-900/60 hover:bg-slate-900 active:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-indigo-500/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              #{family.id}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {family.discipline}
            </span>
            {family.status === 'withdrawn' && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                Withdrawn
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {(family.hasLeanDoc || family.challenges.length > 0) && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1"
                title="Formalized in Lean 4"
              >
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                <span>Lean 4</span>
                {family.challenges.length > 0 && (
                  <span className="text-[10px] opacity-75 font-mono">({family.challenges.length})</span>
                )}
              </span>
            )}
            {family.reasoningTrace && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-purple-500/10 border border-slate-300 dark:border-purple-500/20 text-slate-700 dark:text-purple-300 flex items-center gap-1"
                title="Reasoning trace published"
              >
                <BrainCircuit className="w-3 h-3 text-slate-500 dark:text-purple-400" aria-hidden="true" />
                <span>Trace</span>
              </span>
            )}
          </div>
        </div>

        {/* Title: Strong commanding black text */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-indigo-200 transition-colors line-clamp-2">
          <MathText text={family.title} />
        </h3>

        {/* Summary: High-contrast crisp text */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          <MathText text={family.summary} />
        </p>
      </div>

      {/* Footer */}
      <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{family.papers.length} {family.papers.length === 1 ? 'manuscript' : 'manuscripts'}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-indigo-400 group-hover:translate-x-0.5 transition-transform text-xs font-medium">
          <span>Explore</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
};
