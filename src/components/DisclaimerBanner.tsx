import React from 'react';
import { SyncStatus } from '../services/upstreamSync';
import { RefreshCw, ExternalLink, GitFork, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DisclaimerBannerProps {
  syncStatus: SyncStatus;
  onTriggerSync: () => void;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ syncStatus, onTriggerSync }) => {
  return (
    <aside
      aria-label="Fork disclaimer and upstream synchronization status"
      className="bg-slate-900/95 border-b border-amber-500/30 text-slate-200 px-4 py-2.5 sm:px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Fork Disclaimer */}
        <div className="flex items-start sm:items-center gap-2 text-slate-300">
          <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0 mt-0.5 sm:mt-0">
            <GitFork className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <p className="leading-relaxed">
            <strong className="text-amber-300 font-semibold">Fork Notice:</strong> This web app is an independent open-source fork and research explorer for the OpenAI mathematical collection. It is{' '}
            <span className="text-white font-medium">not affiliated with or endorsed by OpenAI</span>.{' '}
            <a
              href="https://github.com/fraubentz/openai-math-diarrhea"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 font-medium inline-flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
            >
              <span>Original Repository</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </p>
        </div>

        {/* Live Upstream Sync Status & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus.isSyncing
                  ? 'bg-amber-400 animate-ping'
                  : syncStatus.status === 'synced'
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400'
              }`}
              aria-hidden="true"
            />
            <span className="text-[11px] text-slate-400" aria-live="polite">
              {syncStatus.message}
            </span>
          </div>

          <button
            onClick={onTriggerSync}
            disabled={syncStatus.isSyncing}
            aria-label="Synchronize manuscripts with original upstream GitHub repository"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 active:bg-slate-700 disabled:opacity-50 text-[11px] font-medium text-slate-200 border border-slate-700/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 min-h-[34px] sm:min-h-[30px]"
          >
            <RefreshCw
              className={`w-3 h-3 text-indigo-400 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{syncStatus.isSyncing ? 'Syncing...' : 'Sync Upstream'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
