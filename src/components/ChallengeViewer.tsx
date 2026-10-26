import React, { useState, useEffect } from 'react';
import { Challenge, Family } from '../types';
import { Search, Code2, Play, CheckCircle, Copy, Check, Download, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

interface ChallengeViewerProps {
  challenges: Challenge[];
  selectedChallengeName?: string | null;
  onSelectChallenge: (name: string) => void;
  onOpenFamily?: (familyId: string) => void;
  families: Family[];
}

export const ChallengeViewer: React.FC<ChallengeViewerProps> = ({
  challenges,
  selectedChallengeName,
  onSelectChallenge,
  onOpenFamily,
  families,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAxiom, setSelectedAxiom] = useState<string>('all');
  const [leanCode, setLeanCode] = useState<string>('');
  const [loadingCode, setLoadingCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [runningVerification, setRunningVerification] = useState<boolean>(false);
  const [verificationLogs, setVerificationLogs] = useState<string[] | null>(null);

  // Active challenge
  const activeChallenge =
    challenges.find((c) => c.name === selectedChallengeName) || challenges[0];

  // Fetch full lean code when activeChallenge changes
  useEffect(() => {
    if (!activeChallenge) return;
    setLoadingCode(true);
    setVerificationLogs(null);

    fetch(`/challenges/${activeChallenge.name}.lean`)
      .then((res) => {
        if (!res.ok) throw new Error('File not found');
        return res.text();
      })
      .then((text) => {
        setLeanCode(text);
        setLoadingCode(false);
      })
      .catch(() => {
        // Fallback to preview if fetch fails
        setLeanCode(activeChallenge.preview || '-- Lean 4 verification source code');
        setLoadingCode(false);
      });
  }, [activeChallenge?.name]);

  // Filter challenges
  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.theorems.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      c.challengeModule.toLowerCase().includes(search.toLowerCase());

    const matchesAxiom =
      selectedAxiom === 'all' || c.permittedAxioms.includes(selectedAxiom);

    return matchesSearch && matchesAxiom;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(leanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLean = () => {
    const blob = new Blob([leanCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChallenge.name}.lean`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSimulator = () => {
    setRunningVerification(true);
    setVerificationLogs([
      `$ lake env comparator ComparatorChallenges/${activeChallenge.name}.json`,
      `[1/4] Loading challenge module: ${activeChallenge.challengeModule}...`,
    ]);

    setTimeout(() => {
      setVerificationLogs((prev) => [
        ...(prev || []),
        `[2/4] Validating permitted axioms: [${activeChallenge.permittedAxioms.join(', ')}]...`,
      ]);
    }, 400);

    setTimeout(() => {
      setVerificationLogs((prev) => [
        ...(prev || []),
        `[3/4] Verifying theorem signature: ${activeChallenge.theorems.join(', ') || 'OK'}`,
        activeChallenge.enableNanoda
          ? `[3.5/4] Nanoda standalone checker: ENABLED (zero-trust external verification)`
          : `[3.5/4] Standard Lean 4 type checker validation...`,
      ]);
    }, 900);

    setTimeout(() => {
      setVerificationLogs((prev) => [
        ...(prev || []),
        `[4/4] Axiom audit complete: 0 unapproved axioms, 0 sorry statements.`,
        `✅ SUCCESS: Proof conforms to comparator challenge specification.`,
      ]);
      setRunningVerification(false);
    }, 1500);
  };

  // Find linked family
  const linkedFamily = activeChallenge?.matchedFamilyId
    ? families.find((f) => f.id === activeChallenge.matchedFamilyId)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Description Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Lean 4 Comparator Verification Challenges</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              OpenAI models output formal proofs checked using the Lean 4 Comparator protocol. Each challenge verifies mathematical theorems against strict specification modules, ensuring no proof pollution, circular dependencies, or unapproved axioms.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800 text-center">
              <div className="text-base font-bold text-emerald-400 font-mono">416</div>
              <div className="text-[10px] text-slate-400">Total Specs</div>
            </div>
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800 text-center">
              <div className="text-base font-bold text-indigo-400 font-mono">100%</div>
              <div className="text-[10px] text-slate-400">Isolated Specs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Challenge Selector */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[480px] sm:h-[560px] lg:h-[750px] shadow-sm">
          <div className="space-y-3 pb-3 border-b border-slate-800">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Filter 416 challenges..."
                aria-label="Filter 416 comparator challenges by name or theorem"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[38px]"
              />
            </div>

            {/* Axiom Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <span className="text-slate-400 shrink-0">Axiom:</span>
              {['all', 'Classical.choice', 'Quot.sound', 'propext'].map((ax) => (
                <button
                  key={ax}
                  onClick={() => setSelectedAxiom(ax)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors ${
                    selectedAxiom === ax
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ax === 'all' ? 'All' : ax.replace('.choice', '')}
                </button>
              ))}
            </div>
          </div>

          {/* List of Challenges */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pt-3 pr-1">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No challenges found matching criteria.
              </div>
            ) : (
              filteredChallenges.map((ch) => {
                const isSelected = activeChallenge?.name === ch.name;
                return (
                  <button
                    key={ch.name}
                    onClick={() => onSelectChallenge(ch.name)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-sm shadow-indigo-500/10'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {ch.name}
                      </span>
                      {ch.enableNanoda && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                          Nanoda
                        </span>
                      )}
                    </div>
                    {ch.theorems.length > 0 && (
                      <p className="font-mono text-[10px] text-slate-400 truncate mt-1">
                        {ch.theorems[0]}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                      <span>{ch.lineCount} lines</span>
                      <span>{ch.permittedAxioms.length} axioms</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Showing {filteredChallenges.length} of {challenges.length} challenges
          </div>
        </div>

        {/* Right Column: Code Viewer & Spec Inspector */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[520px] sm:h-[600px] lg:h-[750px]">
          {/* Top Panel: Spec Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-white">
                    {activeChallenge.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                    .lean
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Module: {activeChallenge.challengeModule}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunSimulator}
                  disabled={runningVerification}
                  aria-label="Simulate lake env comparator run on this challenge"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-all min-h-[36px]"
                  title="Simulate lake env comparator run"
                >
                  <Play className={`w-3.5 h-3.5 ${runningVerification ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>{runningVerification ? 'Verifying...' : 'Test Comparator'}</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  aria-label="Copy Lean 4 source code to clipboard"
                  className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-200 transition-colors min-h-[36px]"
                  title="Copy Lean Source"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadLean}
                  aria-label={`Download ${activeChallenge.name}.lean file`}
                  className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-650 text-slate-200 transition-colors min-h-[36px]"
                  title="Download .lean"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Spec Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-1">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Solution Module
                </span>
                <span className="font-mono text-slate-200 text-[11px] truncate block mt-0.5" title={activeChallenge.solutionModule}>
                  {activeChallenge.solutionModule || 'None'}
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Permitted Axioms
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {activeChallenge.permittedAxioms.map((ax) => (
                    <span key={ax} className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                      {ax}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Linked Result Family
                </span>
                {linkedFamily ? (
                  <button
                    onClick={() => onOpenFamily && onOpenFamily(linkedFamily.id)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-[11px] font-medium mt-0.5 truncate"
                  >
                    <span>Family #{linkedFamily.id}: {linkedFamily.title.slice(0, 22)}...</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                  </button>
                ) : (
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Supporting / Core result</span>
                )}
              </div>
            </div>

            {/* Target Theorems */}
            {activeChallenge.theorems.length > 0 && (
              <div className="bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold text-[11px]">Target Theorem:</span>
                <span className="font-mono text-emerald-300 text-[11px] truncate">
                  {activeChallenge.theorems.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Verification Logs Terminal (if simulator run) */}
          {verificationLogs && (
            <div className="bg-black/90 p-3.5 border-b border-emerald-500/30 font-mono text-xs text-emerald-400 space-y-1 shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-emerald-400" />
                  <span>Comparator Runner Simulation</span>
                </span>
                <button
                  onClick={() => setVerificationLogs(null)}
                  className="hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              {verificationLogs.map((log, i) => (
                <div key={i} className={log.startsWith('✅') ? 'text-emerald-300 font-bold' : log.startsWith('$') ? 'text-indigo-300' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Main Lean Code Display with Syntax Look */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed text-slate-200">
            {loadingCode ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Loading Lean 4 source...
              </div>
            ) : (
              <pre className="overflow-x-auto">
                <code>
                  {leanCode.split('\n').map((line, idx) => {
                    // Simple highlighting for Lean keywords
                    let coloredLine = line;
                    const isComment = line.trim().startsWith('--') || line.trim().startsWith('/-') || line.trim().startsWith('*-') || line.trim().startsWith('*');
                    const isImport = line.trim().startsWith('import ');
                    const isTheorem = line.trim().startsWith('theorem ') || line.trim().startsWith('def ') || line.trim().startsWith('lemma ');
                    const isSorry = line.includes('sorry');

                    return (
                      <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                        <span className="table-cell pr-4 text-right select-none text-slate-600 text-[10px] font-mono w-10">
                          {idx + 1}
                        </span>
                        <span
                          className={`table-cell whitespace-pre ${
                            isComment
                              ? 'text-slate-500 italic'
                              : isSorry
                              ? 'text-amber-400 font-bold bg-amber-950/20 px-1 rounded'
                              : isTheorem
                              ? 'text-indigo-300 font-semibold'
                              : isImport
                              ? 'text-purple-300'
                              : 'text-slate-200'
                          }`}
                        >
                          {coloredLine}
                        </span>
                      </div>
                    );
                  })}
                </code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
