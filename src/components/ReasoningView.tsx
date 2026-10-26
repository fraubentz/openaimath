import React from 'react';
import { Family } from '../types';
import { MathText } from './MathText';
import { BrainCircuit, Cpu, Clock, ExternalLink, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface ReasoningViewProps {
  families: Family[];
  onOpenFamily: (familyId: string) => void;
}

export const ReasoningView: React.FC<ReasoningViewProps> = ({ families, onOpenFamily }) => {
  const reasoningFamilies = families.filter((f) => f.reasoningTrace !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero explanation */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Abridged Model Reasoning Traces
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/80">
              Internal OpenAI model evaluations across 4,000 open mathematical problems
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          The vast majority of results in this repository were obtained with a uniform procedure using an unreleased internal OpenAI model. On average, each result consumed <span className="text-purple-300 font-semibold">three hours of ChatGPT Pro thinking compute</span>. Abridged summaries of the model’s mathematical reasoning traces were released for 10 landmark results across number theory, operator algebras, geometry, and complexity.
        </p>

        {/* Compute Specs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-base font-bold text-white font-mono">~3 Hours</div>
              <div className="text-[11px] text-slate-400">Pro Thinking Compute / Result</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-base font-bold text-white font-mono">~4,000</div>
              <div className="text-[11px] text-slate-400">Open Research Problems Posed</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-base font-bold text-white font-mono">10 Curated</div>
              <div className="text-[11px] text-slate-400">Publicly Published Traces</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 10 Reasoning Traces */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Published Traces Catalog</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
            10 results
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reasoningFamilies.map((fam) => {
            const trace = fam.reasoningTrace!;
            return (
              <div
                key={fam.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 rounded-xl p-5 space-y-4 transition-all flex flex-col justify-between shadow-sm group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Family #{fam.id}
                    </span>
                    <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      {fam.discipline}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-slate-100 group-hover:text-purple-200 transition-colors">
                    {trace.subject}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    <MathText text={fam.summary} />
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
                  <button
                    onClick={() => onOpenFamily(fam.id)}
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Family & Papers</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </button>

                  <a
                    href={`https://github.com/fraubentz/openai-math-diarrhea/blob/main/${trace.pdf}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-medium shadow-sm transition-colors"
                  >
                    <span>Read Trace PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
