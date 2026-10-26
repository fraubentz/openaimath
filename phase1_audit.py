#!/usr/bin/env python3
"""
Phase 1 batch audit over the openai-math fork: observation-only flagging of terms,
notation and phrasing that could mislead a mathematician, using the Gemini API.

Setup:
    git clone --depth 1 https://github.com/fraubentz/openai-math-diarrhea.git
    pip install google-genai
    export GEMINI_API_KEY="key from AI Studio (Get API key)"

Usage:
    python phase1_audit.py openai-math-diarrhea/preprints --dry-run     # sizes only, no API calls
    python phase1_audit.py openai-math-diarrhea/preprints --limit 3     # pilot: first 3 manuscripts
    python phase1_audit.py openai-math-diarrhea/preprints --only Hodge  # manuscripts whose folder matches
    python phase1_audit.py openai-math-diarrhea/preprints               # everything (resumable)

Outputs (./phase1_out/):
    raw_results.jsonl  one line per chunk; finished chunks are skipped on re-run
    flags.jsonl        every flag, with quote_verified true/false
    candidates.json    flags merged by term, most frequent first
"""
import argparse, json, os, re, time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# ---- settings -------------------------------------------------------------
MODEL = "gemini-2.5-flash"   # set to whichever model AI Studio currently offers
MAX_CHARS = 40000            # target chunk size (~11k tokens)
OVERLAP_PARAS = 1
WORKERS = 4                  # parallel calls; lower this if you hit rate limits
MAX_RETRIES = 5
OUT_DIR = Path("phase1_out")

# .tex files that are scaffolding rather than prose
SKIP = re.compile(r"(preamble|macros|references|bibliography|glyph-mappings|packages|header|style)\.tex$"
                  r"|/(figures|tools)/", re.I)

SYSTEM_PROMPT = """You are a careful auditor of mathematical manuscripts written by AI agents.
Your task is OBSERVATION ONLY: you flag places where a human mathematician
reading the text could be misled. You never correct, rewrite, simplify, or
improve the text, and you never judge whether a proof is correct.

The text is LaTeX source. Ignore LaTeX markup and formatting; flag only
mathematical language, terminology and notation.

You flag four kinds of items:

1. NONSTANDARD_TERM: a term or phrase that is not conventional mathematical
   vocabulary, or that appears to be invented by the author.
2. POSSIBLE_MISUSE: a conventional term that seems to be used with a meaning
   different from its standard one.
3. NOTATION_ISSUE: a symbol or notation that is undefined, reused for different
   objects, used inconsistently, or non-conventional.
4. UNDEFINED_SHORTHAND: an abbreviation, label, or nickname for an object or
   step that the text uses without defining.

Rules:
- Quote verbatim. The "quote" field must be an exact, contiguous substring of
  the input (a short one, under about 200 characters). Never paraphrase it, fix
  typos in it, or merge separate passages.
- Report only what is in the text provided. Do not invent candidates to fill space.
- If you are unsure whether something is nonstandard, include it and set
  "certainty" to "low". Recall matters more than precision at this stage.
- If the text itself defines a term, still list it, but set "defined_in_text"
  to true.
- Do not propose standard replacements or corrections.
- If nothing qualifies, return an empty list.
- Output valid JSON only, with no commentary before or after it."""

USER_TEMPLATE = '''Audit the following chunk from the manuscript "{manuscript}",
location "{location}".

Return a JSON object with this shape:

{{
  "flags": [
    {{
      "category": "NONSTANDARD_TERM | POSSIBLE_MISUSE | NOTATION_ISSUE | UNDEFINED_SHORTHAND",
      "term": "the term or symbol, as written",
      "quote": "exact verbatim excerpt containing it",
      "defined_in_text": true,
      "reason": "one sentence on why this could mislead a reader",
      "certainty": "high | medium | low"
    }}
  ]
}}

TEXT:
"""
{text}
"""'''


# ---- discovery and chunking -------------------------------------------------
def split_big(text):
    """Split one long file into paragraph-aligned pieces <= MAX_CHARS (with overlap)."""
    paras = [p for p in re.split(r"\n\s*\n", text) if p.strip()]
    pieces, cur, cur_len = [], [], 0
    for p in paras:
        while len(p) > MAX_CHARS:                      # one giant paragraph: hard split by lines
            lines, head, hl = p.split("\n"), [], 0
            while lines and hl + len(lines[0]) < MAX_CHARS:
                hl += len(lines[0]) + 1; head.append(lines.pop(0))
            if not head:
                head, lines = [lines[0][:MAX_CHARS]], [lines[0][MAX_CHARS:]] + lines[1:]
            if cur:
                pieces.append(cur); cur, cur_len = [], 0
            pieces.append(["\n".join(head)]); p = "\n".join(lines)
        if cur and cur_len + len(p) > MAX_CHARS:
            pieces.append(cur)
            cur = cur[-OVERLAP_PARAS:] if OVERLAP_PARAS else []
            cur_len = sum(len(x) for x in cur)
        cur.append(p); cur_len += len(p)
    if cur:
        pieces.append(cur)
    return ["\n\n".join(x) for x in pieces]


def manuscript_files(mdir):
    base = mdir / "build" if (mdir / "build").is_dir() else mdir
    files = [f for f in sorted(base.rglob("*.tex")) if not SKIP.search(f.as_posix())]
    return files


def load_units(preprints, only=None, limit=None):
    dirs = sorted(d for d in Path(preprints).iterdir() if d.is_dir())
    if only:
        dirs = [d for d in dirs if only.lower() in d.name.lower()]
    if limit:
        dirs = dirs[:limit]
    for d in dirs:
        # pack small files together, split big ones; location names the source files
        buf, buf_names, buf_len = [], [], 0

        def flush():
            nonlocal buf, buf_names, buf_len
            if buf:
                yield {"manuscript": d.name, "location": " + ".join(buf_names),
                       "text": "\n\n".join(buf)}
            buf, buf_names, buf_len = [], [], 0

        for f in manuscript_files(d):
            text = f.read_text(encoding="utf-8", errors="replace")
            rel = f.relative_to(d).as_posix()
            if not text.strip():
                continue
            if len(text) > MAX_CHARS:
                yield from flush()
                for i, piece in enumerate(split_big(text), 1):
                    yield {"manuscript": d.name, "location": f"{rel} [part {i}]", "text": piece}
            else:
                if buf_len + len(text) > MAX_CHARS:
                    yield from flush()
                buf.append(f"%%% FILE: {rel}\n{text}"); buf_names.append(rel); buf_len += len(text)
        yield from flush()


# ---- model call -------------------------------------------------------------
def audit(client, types, unit):
    prompt = USER_TEMPLATE.format(**unit)
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT, temperature=0.1,
                    response_mime_type="application/json"))
            return json.loads(resp.text).get("flags", [])
        except Exception as e:
            wait = 2 ** attempt * 3
            print(f"  retry {attempt+1}/{MAX_RETRIES} ({unit['manuscript'][:40]}): {e} (waiting {wait}s)")
            time.sleep(wait)
    return None  # gave up; retried automatically on the next run


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("preprints", help="path to the repo's preprints/ folder")
    ap.add_argument("--dry-run", action="store_true", help="count chunks/size only; no API calls")
    ap.add_argument("--limit", type=int, help="only the first N manuscripts (pilot)")
    ap.add_argument("--only", help="only manuscripts whose folder name contains this text")
    a = ap.parse_args()

    units = list(load_units(a.preprints, a.only, a.limit))
    chars = sum(len(u["text"]) for u in units)
    ms = len({u["manuscript"] for u in units})
    print(f"{ms} manuscripts -> {len(units)} chunks, {chars/1e6:.1f}M chars (~{chars/3.5/1e6:.1f}M input tokens)")
    if a.dry_run:
        return

    from google import genai
    from google.genai import types
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    OUT_DIR.mkdir(exist_ok=True)
    raw_path = OUT_DIR / "raw_results.jsonl"

    done = set()
    if raw_path.exists():
        for line in raw_path.read_text(encoding="utf-8").splitlines():
            r = json.loads(line); done.add((r["manuscript"], r["location"]))
    todo = [u for u in units if (u["manuscript"], u["location"]) not in done]
    print(f"{len(done)} chunks already done, {len(todo)} to go")

    with raw_path.open("a", encoding="utf-8") as raw, ThreadPoolExecutor(WORKERS) as pool:
        futs = {pool.submit(audit, client, types, u): u for u in todo}
        for n, fut in enumerate(as_completed(futs), 1):
            u, flags = futs[fut], fut.result()
            if flags is None:
                print(f"[{n}/{len(todo)}] FAILED {u['manuscript'][:50]} / {u['location'][:50]}")
                continue
            raw.write(json.dumps({**u, "flags": flags}, ensure_ascii=False) + "\n"); raw.flush()
            if n % 25 == 0 or n == len(todo):
                print(f"[{n}/{len(todo)}] done")

    # verify quotes, write flags, merge by term
    merged = defaultdict(lambda: {"count": 0, "categories": set(), "manuscripts": set(),
                                  "quotes": [], "unverified": 0})
    with (OUT_DIR / "flags.jsonl").open("w", encoding="utf-8") as out:
        for line in raw_path.read_text(encoding="utf-8").splitlines():
            r = json.loads(line); text_n = norm(r["text"])
            for f in r["flags"]:
                f["manuscript"], f["location"] = r["manuscript"], r["location"]
                q = norm(f.get("quote", ""))
                f["quote_verified"] = bool(q) and q in text_n
                out.write(json.dumps(f, ensure_ascii=False) + "\n")
                m = merged[norm(f.get("term", "")).lower()]
                m["count"] += 1; m["categories"].add(f.get("category", ""))
                m["manuscripts"].add(r["manuscript"])
                if f["quote_verified"] and len(m["quotes"]) < 3:
                    m["quotes"].append(f["quote"])
                if not f["quote_verified"]:
                    m["unverified"] += 1
    cands = [{"term": t, "count": v["count"], "n_manuscripts": len(v["manuscripts"]),
              "categories": sorted(v["categories"]), "unverified_quotes": v["unverified"],
              "sample_quotes": v["quotes"], "manuscripts": sorted(v["manuscripts"])}
             for t, v in merged.items()]
    cands.sort(key=lambda c: (-c["n_manuscripts"], -c["count"]))
    (OUT_DIR / "candidates.json").write_text(json.dumps(cands, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Done. {len(cands)} distinct candidate terms -> {OUT_DIR}/candidates.json")


if __name__ == "__main__":
    main()
