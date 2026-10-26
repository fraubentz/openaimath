import React, { useState, useEffect } from 'react';
import { Family, Challenge } from '../types';
import { MathText } from './MathText';
import { X, FileText, CheckCircle2, AlertTriangle, ExternalLink, Copy, Check, Code2, BookOpen } from 'lucide-react';

interface FamilyModalProps {
  family: Family | null;
  onClose: () => void;
  onSelectChallenge: (challengeName: string) => void;
  allChallenges: Challenge[];
}

export const FamilyModal: React.FC<FamilyModalProps> = ({
  family,
  onClose,
  onSelectChallenge,
  allChallenges,
}) => {
  const [copiedBibtex, setCopiedBibtex] = useState<string | null>(null);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!family) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [family, onClose]);

  if (!family) return null;

  const handleCopyBibtex = (paperTitle: string, index: number) => {
    const bibId = `openai2026_${family.id}_${index + 1}`;
    const bibtex = `@article{${bibId},
  title = {${paperTitle.replace(/[$`]/g, '')}},
  author = {{OpenAI}},
  journal = {OpenAI Mathematical Manuscript Collection},
  year = {2026},
  family = {${family.id}},
  note = {Result family: ${family.title.replace(/[$`]/g, '')}}
}`;
    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(bibId);
    setTimeout(() => setCopiedBibtex(null), 2500);
  };

  const matchedChallengeObjs = allChallenges.filter((ch) =>
    family.challenges.includes(ch.name)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="family-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Family #{family.id}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {family.discipline}
              </span>
              {family.hasLeanDoc && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Lean 4 Formalized
                </span>
              )}
              {family.reasoningTrace && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                  ★ Reasoning Trace Available
                </span>
              )}
              {family.status === 'withdrawn' && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  Withdrawn in Oct 7 Update
                </span>
              )}
            </div>
            <h2 id="family-modal-title" className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              <MathText text={family.title} />
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close manuscript details"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Summary / Result Description */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Result Statement & Summary
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              <MathText text={family.summary} />
            </p>
          </div>

          {/* Reasoning trace callout if available */}
          {family.reasoningTrace && (
            <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-purple-200">
                  Model Reasoning Trace Published
                </h4>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  {family.reasoningTrace.subject} (~3 hours ChatGPT Pro compute)
                </p>
              </div>
              <a
                href={`https://github.com/fraubentz/openai-math-diarrhea/blob/main/${family.reasoningTrace.pdf}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white transition-colors whitespace-nowrap self-start sm:self-auto min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <span>View Trace PDF</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          )}

          {/* Linked Lean 4 Challenges */}
          {matchedChallengeObjs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Lean 4 Comparator Verification Challenges ({matchedChallengeObjs.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchedChallengeObjs.map((ch) => (
                  <button
                    key={ch.name}
                    onClick={() => {
                      onClose();
                      onSelectChallenge(ch.name);
                    }}
                    className="flex flex-col text-left p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 active:bg-emerald-950/20 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                        {ch.name}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-emerald-300 flex items-center gap-1">
                        View Code & Spec →
                      </span>
                    </div>
                    {ch.theorems.length > 0 && (
                      <p className="font-mono text-[11px] text-slate-400 truncate mt-1">
                        {ch.theorems[0]}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ch.permittedAxioms.slice(0, 3).map((ax) => (
                        <span key={ax} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {ax}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Papers */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <span>Constituent Manuscripts ({family.papers.length})</span>
            </h3>

            {family.papers.map((paper, idx) => {
              const bibId = `openai2026_${family.id}_${idx + 1}`;
              return (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-100 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" aria-hidden="true" />
                      <span><MathText text={paper.title} /></span>
                    </h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyBibtex(paper.title, idx)}
                        aria-label={`Copy BibTeX citation for ${paper.title}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700/80 active:bg-slate-700 transition-colors min-h-[36px]"
                      >
                        {copiedBibtex === bibId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>BibTeX</span>
                          </>
                        )}
                      </button>
                      <a
                        href={`https://github.com/fraubentz/openai-math-diarrhea/blob/main/${paper.pdf}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View PDF Preprint on GitHub for ${paper.title}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200 px-3 py-1.5 rounded-md bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900/40 active:bg-indigo-900/60 transition-colors min-h-[36px]"
                      >
                        <span>PDF Preprint</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  {paper.abstract ? (
                    <div className="text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-indigo-500/20">
                      <MathText text={paper.abstract} />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pl-6">
                      (No separate abstract text recorded in map; refer to result summary above)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>OpenAI Automated Mathematical Research Evaluation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-200 font-medium transition-colors min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
