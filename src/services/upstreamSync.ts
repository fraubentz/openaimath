import { Family } from '../types';

export interface SyncStatus {
  lastChecked: string | null;
  commitSha: string | null;
  isSyncing: boolean;
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  message: string;
}

const UPSTREAM_RAW_CONTENTS = 'https://raw.githubusercontent.com/fraubentz/openai-math-diarrhea/main/CONTENTS.md';
const UPSTREAM_COMMIT_API = 'https://api.github.com/repos/fraubentz/openai-math-diarrhea/commits/main';
const STORAGE_KEY_FAMILIES = 'openai_math_synced_families';
const STORAGE_KEY_META = 'openai_math_sync_meta';

export function getCachedSyncedFamilies(): Family[] | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_FAMILIES);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length >= 350) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading cached families from localStorage', e);
  }
  return null;
}

export function getCachedSyncMeta(): { lastChecked: string | null; commitSha: string | null } {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_META);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed reading sync meta', e);
  }
  return { lastChecked: null, commitSha: null };
}

// Client-side parser for CONTENTS.md
export function parseUpstreamContents(markdown: string, baseFamilies: Family[]): Family[] {
  const lines = markdown.split('\n');
  const families: Family[] = [];
  let currentFam: Family | null = null;
  let currentPaper: { title: string; pdf: string; abstract: string } | null = null;

  // Build lookup of existing metadata (challenges, reasoning, discipline) to preserve enrichment
  const baseMap = new Map<string, Family>();
  baseFamilies.forEach((f) => baseMap.set(f.id, f));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const famMatch = line.match(/^\*\*(\d{3})\.\s*(.*?)\.\*\*\s*(.*)$/);
    if (famMatch) {
      if (currentPaper && currentFam) {
        currentFam.papers.push(currentPaper);
        currentPaper = null;
      }
      if (currentFam) families.push(currentFam);

      const fId = famMatch[1];
      const fTitle = famMatch[2].trim();
      const fSummary = famMatch[3].trim();
      const existing = baseMap.get(fId);

      currentFam = {
        id: fId,
        title: fTitle,
        summary: fSummary,
        discipline: existing ? existing.discipline : 'Pure & Applied Mathematics',
        hasLeanDoc: fSummary.includes('[Lean]') || line.includes('([Lean]'),
        leanDoc: (fSummary.match(/\[Lean\]\(([^)]+)\)/) || [])[1] || null,
        reasoningTrace: existing ? existing.reasoningTrace : null,
        papers: [],
        challenges: existing ? existing.challenges : [],
        status: fSummary.toLowerCase().includes('withdrawn') ? 'withdrawn' : existing ? existing.status : 'active',
      };
      continue;
    }

    const paperMatch = line.match(/(?:&emsp;|<p>|<td>)?\s*\[([^\]]+)\]\((preprints\/[^)]+)\)(.*)$/);
    if (paperMatch && currentFam) {
      if (currentPaper) {
        currentFam.papers.push(currentPaper);
      }
      currentPaper = {
        title: paperMatch[1].trim(),
        pdf: paperMatch[2].trim(),
        abstract: paperMatch[3] ? paperMatch[3].trim() : '',
      };
      continue;
    }

    if (currentPaper && line && !line.startsWith('</td>') && !line.startsWith('</tr>') && !line.startsWith('<tbody>') && !line.startsWith('<table>')) {
      if (currentPaper.abstract) currentPaper.abstract += ' ' + line;
      else currentPaper.abstract = line;
    } else if (line.startsWith('</td>') && currentPaper) {
      if (currentFam) currentFam.papers.push(currentPaper);
      currentPaper = null;
    }
  }

  if (currentPaper && currentFam) currentFam.papers.push(currentPaper);
  if (currentFam) families.push(currentFam);

  return families.length >= 350 ? families : baseFamilies;
}

export async function syncWithUpstream(
  baseFamilies: Family[],
  onStatusUpdate: (status: SyncStatus) => void
): Promise<Family[] | null> {
  if (!navigator.onLine) {
    onStatusUpdate({
      lastChecked: new Date().toLocaleTimeString(),
      commitSha: null,
      isSyncing: false,
      status: 'offline',
      message: 'Offline (using cached data)',
    });
    return null;
  }

  onStatusUpdate({
    lastChecked: null,
    commitSha: null,
    isSyncing: true,
    status: 'syncing',
    message: 'Checking upstream for latest revisions...',
  });

  try {
    let latestSha: string | null = null;
    try {
      const commitRes = await fetch(UPSTREAM_COMMIT_API, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (commitRes.ok) {
        const commitData = await commitRes.json();
        latestSha = commitData.sha ? commitData.sha.substring(0, 7) : null;
      }
    } catch {
      // Ignore API rate limit, proceed to raw contents
    }

    const contentsRes = await fetch(UPSTREAM_RAW_CONTENTS);
    if (!contentsRes.ok) {
      throw new Error(`HTTP ${contentsRes.status}`);
    }

    const markdown = await contentsRes.text();
    const parsedFamilies = parseUpstreamContents(markdown, baseFamilies);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const meta = { lastChecked: nowStr, commitSha: latestSha || 'main' };

    try {
      localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(parsedFamilies));
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
    } catch (e) {
      console.warn('Storage full or unavailable for caching', e);
    }

    onStatusUpdate({
      lastChecked: nowStr,
      commitSha: latestSha || 'main',
      isSyncing: false,
      status: 'synced',
      message: `Synced with upstream (${latestSha ? 'commit ' + latestSha : 'main'})`,
    });

    return parsedFamilies;
  } catch (err: any) {
    console.warn('Upstream sync failed; using fallback bundled data', err);
    onStatusUpdate({
      lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commitSha: null,
      isSyncing: false,
      status: 'error',
      message: 'Upstream sync unavailable (using local verification baseline)',
    });
    return null;
  }
}
