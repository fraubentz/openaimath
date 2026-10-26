# OpenAI Math Manuscripts & Lean 4 Formalizations Explorer

[![Deploy to GitHub Pages & Upstream Sync](https://github.com/fraubentz/openai-math-diarrhea/actions/workflows/deploy.yml/badge.svg)](https://github.com/fraubentz/openai-math-diarrhea/actions/workflows/deploy.yml)
[![Repository Size](https://img.shields.io/badge/repo%20size-~3.3%20MB-emerald)](https://github.com/fraubentz/openai-math-diarrhea)
[![Total Files](https://img.shields.io/badge/tracked%20files-34-indigo)](https://github.com/fraubentz/openai-math-diarrhea)

An interactive, accessible research portal and web explorer for the **719 mathematical manuscripts across 372 families** and **416 Lean 4 formal verification challenges** produced during OpenAI's deep mathematical reasoning evaluations.

> **Fork Notice & Disclaimer**: This web application is an independent open-source fork and viewer maintained by [PY (@fraubentz)](https://github.com/fraubentz). It is not affiliated with, sponsored by, or endorsed by OpenAI.

---

## ⚡ Lightweight Architecture (Why Push & Pull are Now Instant)

The original OpenAI dataset contains **133,956 files** (~811 MB), including 62,353 Lean theorem files and 749 preprint PDF directories. Attempting to track all 133k loose files in a single web repository causes GitHub push timeouts, API rate limits, and Git clone slowdowns.

To solve this, this explorer uses a **decoupled streaming architecture**:
- **Lightweight Repository Core**: The web explorer repository contains only **34 files** (~3.3 MB total).
- **Pre-Compiled Metadata (`src/data/`)**: All 372 families, 719 manuscript abstracts, KaTeX formulas, and 416 Lean comparator challenge specifications are pre-compiled into fast, compressed JSON indices.
- **On-Demand Streaming**: When users view original PDF preprints or ChatGPT Pro reasoning traces, the app streams them directly from GitHub's native viewer.
- **Client-Side Lean Generator**: When users click "Download .lean", the file is generated instantly in-memory from the bundled specification without bloating the repository with 400+ duplicate static files.
- **Live Upstream Auto-Sync**: The application automatically checks the upstream GitHub repository on startup to sync newly added or revised manuscripts.

---

## 🚀 Features

- **Interactive Manuscript Catalogue**: Full search across all 372 families and 719 papers with instant KaTeX mathematical rendering and one-click BibTeX generation.
- **Lean 4 Comparator Verification Inspector**: Interactive browser for all 416 verification challenges with theorem signature inspection, permitted axioms (`propext`, `Quot.sound`, `Classical.choice`), syntax-highlighted source code, and a simulated `lake env comparator` test runner.
- **3-Hour Thinking Compute Traces**: Dedicated portal for the 10 landmark results where OpenAI published abridged model reasoning traces.
- **Formalization Metrics**: Statistical dashboard tracking the ~42% top-line verification progress, discipline breakdown, and permitted axiom hygiene.
- **Revision Timeline**: Changelog documenting the October 7, 2026 update, retractions (sign error in split abelian eightfolds), and proof repairs.
- **Display Themes**: Light Mode (Academic paper), Dark Mode (Deep slate), and an Eco-Friendly OLED Mode (pure `#000000` pitch black to save battery display power).
- **Cross-Platform & Accessible**: Fully keyboard and screen-reader accessible (WCAG 2.2 compliant), optimized for macOS, iOS, Android, Windows, and Linux.

---

## 🛠️ Local Development & Deployment

### Quick Start
```bash
# 1. Clone the lightweight repository (takes < 1 second!)
git clone https://github.com/fraubentz/openai-math-diarrhea.git
cd openai-math-diarrhea

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### Build & GitHub Pages Deployment
The project is pre-configured with relative asset paths (`base: './'`) and automatic SPA 404 routing:
```bash
npm run build
```
The output in `dist/` is ready to deploy to GitHub Pages, Cloudflare Pages, or Vercel. A GitHub Actions workflow (`.github/workflows/deploy.yml`) is included for automatic builds and scheduled daily upstream syncing.

---

## 📜 Upstream Original Collection Summary

The vast majority of results in this catalog were obtained with a uniform procedure using an unreleased internal OpenAI model. On average, each result consumed three hours of ChatGPT Pro thinking compute with that model across ~4,000 posed research problems.

- **Total Families**: 372
- **Total Manuscripts**: 719
- **Top-Line Formalized**: ~42% (300 / 719 results verified)
- **Comparator Challenges**: 416 specifications
- **Axioms Checked**: Standard Lean 4 foundation (`propext`, `Quot.sound`, `Classical.choice`)
