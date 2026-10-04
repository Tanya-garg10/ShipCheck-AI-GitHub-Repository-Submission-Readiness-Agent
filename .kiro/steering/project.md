# ShipCheck AI — Project Steering

## Project Overview

ShipCheck AI is a full-stack GitHub repository submission-readiness analyzer.  
It is a monorepo with two npm workspaces: `backend/` (Express + TypeScript) and `frontend/` (React + TypeScript + Vite + Tailwind).

---

## Architecture

```
User → React Frontend (Vite :5173)
     → Express Backend (:3001)  [proxy via Vite in dev]
       → GitHub REST API
       → Deterministic Rule Engine  (6 checker modules)
       → Scoring Engine             (weighted, 0–100)
       → AI Recommendation Layer    (OpenAI gpt-4o-mini, with fallback)
     ← ReadinessReport JSON
```

### Key directories

| Path | Purpose |
|------|---------|
| `backend/src/types/index.ts` | Single source of truth for all shared types |
| `backend/src/services/githubService.ts` | GitHub API client; `buildRepoContext()` is the main entry point |
| `backend/src/engine/checkers/` | One file per check category — add new checkers here |
| `backend/src/engine/ruleEngine.ts` | Orchestrates all checkers |
| `backend/src/engine/scorer.ts` | Weighted scoring; `CATEGORY_WEIGHTS` defines the point allocation |
| `backend/src/engine/reportAssembler.ts` | Ties GitHub → engine → scorer → AI into one `ReadinessReport` |
| `backend/src/services/aiService.ts` | OpenAI integration with deterministic fallback |
| `backend/src/routes/` | Express route handlers (`analyze`, `fix-suggestion`) |
| `frontend/src/types.ts` | Frontend mirror of backend types — keep in sync manually |
| `frontend/src/api.ts` | Fetch wrapper for backend API |
| `frontend/src/components/` | All React components |

---

## Coding Standards

### General
- Use TypeScript strict mode everywhere.
- Prefer named exports over default exports (exception: React page/app components).
- No `any` types — use `unknown` and narrow with type guards.
- Error handling: never swallow errors silently; log with a `[ComponentName]` prefix.
- All async functions must handle errors — either with try/catch or `.catch()`.

### Backend
- All check finding IDs must be lowercase snake_case and unique across all checkers.
- Every checker returns `Finding[]` — it never throws.
- The rule engine is deterministic-first. AI only explains and prioritizes; it never invents findings.
- Do not expose secret values in findings. Use `evidence` to reference file paths or redacted patterns only.
- Rate limit awareness: keep GitHub API calls to the minimum needed. Re-use `RepoContext` — do not fetch the same repo twice per request.

### Frontend
- Use Tailwind utility classes — no custom CSS except in `index.css`.
- Accessibility: all interactive elements must have `aria-label` or visible label text. Use semantic HTML (`button`, `nav`, `section`, `ul/li`).
- Keep components single-responsibility. Complex logic belongs in hooks or utility functions, not JSX.
- Use `aria-live="polite"` on dynamic result areas.

---

## Scoring Weights (do not change without updating the README)

| Category | Weight |
|----------|--------|
| README | 30 |
| Build Config | 20 |
| Security | 20 |
| Links | 10 |
| Repo Hygiene | 12 |
| License | 8 |

Severity penalties: `critical` → −20 pts, `warning` → −8 pts, `info` → −2 pts.

---

## Adding a New Checker

1. Create `backend/src/engine/checkers/<name>Checker.ts`.
2. Export a function `check<Name>(ctx: RepoContext): Finding[]`.
3. Import and call it in `backend/src/engine/ruleEngine.ts`.
4. Add the category to `CheckCategory` in `backend/src/types/index.ts` and mirror it in `frontend/src/types.ts`.
5. Add the weight to `CATEGORY_WEIGHTS` in `backend/src/engine/scorer.ts` (adjust other weights so they still sum to 100).
6. Add a label in `CATEGORY_LABELS` in `frontend/src/components/FindingsList.tsx` and `ScoreCard.tsx`.

---

## Environment Variables

Backend `.env` (copy from `backend/.env.example`):

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `GITHUB_TOKEN` | No | — | Increases rate limit from 60 → 5,000 req/hr |
| `OPENAI_API_KEY` | No | — | Enables AI recommendations; falls back to deterministic summary if absent |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Any OpenAI chat model |
| `PORT` | No | `3001` | Backend port |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS allowed origin |

---

## Development Commands

```bash
# Install all workspace deps from repo root
npm install

# Run both backend + frontend in dev mode
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Run backend tests
npm test

# Build for production
npm run build
```

---

## Security Considerations

- ShipCheck only scans **public** repositories. Private repo requests return HTTP 422.
- Secret detection is a best-effort surface scan — it is not a substitute for tools like `truffleHog` or `gitleaks`.
- The `.env` file is never committed. The `.env.example` contains only placeholder values.
- OpenAI prompts include repository metadata and finding summaries only — no full file contents are sent to the AI.
