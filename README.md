# ShipCheck AI 🚀

> AI-assisted GitHub repository submission-readiness analyzer — built for the [Kiro Build Challenge](https://awssbggeu.com/challenges/kiro-build-challenge)

ShipCheck AI scans public GitHub repositories for documentation gaps, configuration issues, security risks, broken links, and hygiene problems — then generates an evidence-based readiness report with an actionable score and AI-powered recommendations.

## What it checks

| Category | Weight | What's evaluated |
|----------|--------|-----------------|
| README | 30 pts | Presence, length, description, install instructions, usage, tech stack, demo links, code blocks |
| Build Config | 20 pts | package.json, scripts, lock file, CI/CD, .gitignore |
| Security | 20 pts | Committed .env files, secret pattern detection, .env.example presence |
| Links | 10 pts | URL reachability, placeholder link detection |
| Repo Hygiene | 12 pts | GitHub description, topics, CONTRIBUTING.md, source code presence, activity |
| License | 8 pts | LICENSE file, SPDX identifier recognition |

**Scoring:** Each category starts at full weight. Every `critical` finding deducts 20 pts, `warning` −8 pts, `info` −2 pts from its category. Final score is 0–100 with grades A–F.

## Architecture

```
User → React Frontend (Vite)
     → Express Backend
       → GitHub REST API
       → Deterministic Rule Engine (6 checker modules)
       → Scoring Engine (weighted 0–100)
       → AI Recommendation Layer (OpenAI gpt-4o-mini, with fallback)
     ← ReadinessReport
```

The AI layer explains and prioritizes findings from the rule engine — it never invents issues. When no OpenAI key is configured, a deterministic fallback still generates useful recommendations.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Lucide React icons

### Backend
- Node.js + Express + TypeScript
- Axios (GitHub API client)
- OpenAI SDK (gpt-4o-mini)

### Testing
- Vitest

### Dev tooling
- Kiro AI IDE (Specs, Steering, Hooks)
- npm workspaces

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A public GitHub repository URL to analyze
- (Optional) GitHub Personal Access Token — increases API rate limit from 60 to 5,000 req/hr
- (Optional) OpenAI API key — enables AI recommendations

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ShipCheck-AI-GitHub-Repository-Submission-Readiness-Agent.git
cd ShipCheck-AI-GitHub-Repository-Submission-Readiness-Agent

# Install all workspace dependencies
npm install
```

### Configuration

```bash
# Copy the backend environment template
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
# Optional but recommended
GITHUB_TOKEN=ghp_your_token_here

# Optional — enables AI recommendations
OPENAI_API_KEY=sk-your_key_here

# Defaults shown
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Run in development

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173` (with `/api` proxied to the backend)

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

Output: `backend/dist/` and `frontend/dist/`.

## API Reference

### `POST /api/analyze`

Analyzes a public GitHub repository.

**Request body:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "includeAI": true
}
```

**Response:** `ReadinessReport` — see `backend/src/types/index.ts` for the full shape.

### `POST /api/fix-suggestion`

Returns a detailed AI-generated fix for a specific finding.

**Request body:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "findingId": "readme_missing",
  "context": "Optional additional context"
}
```

**Requires** `OPENAI_API_KEY` to be set.

### `GET /api/health`

Returns `{ "status": "ok" }`.

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── engine/
│   │   │   ├── checkers/        # One checker per category
│   │   │   ├── ruleEngine.ts    # Orchestrates all checkers
│   │   │   ├── scorer.ts        # Weighted 0–100 score
│   │   │   └── reportAssembler.ts
│   │   ├── routes/
│   │   │   ├── analyze.ts
│   │   │   └── fixSuggestion.ts
│   │   ├── services/
│   │   │   ├── githubService.ts
│   │   │   └── aiService.ts
│   │   ├── tests/
│   │   └── types/index.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # React UI components
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   └── types.ts
│   └── package.json
├── .kiro/
│   ├── steering/project.md      # Kiro project guidelines
│   └── hooks/                   # Automated checks on save/task completion
└── package.json                 # Root workspace
```

## How I used Kiro

This project was built entirely inside [Kiro AI IDE](https://kiro.dev).

- **Kiro Specs** — Structured the project into requirements → design → implementation tasks, then executed each task in order.
- **Kiro Steering** (`.kiro/steering/project.md`) — Maintained persistent coding standards, architecture decisions, and scoring weights throughout all sessions.
- **Kiro Hooks** — Automated `tsc --noEmit` type-checking after every TypeScript file save, and ran the Vitest test suite after each completed spec task.
- **Kiro Autopilot** — Used throughout to scaffold, implement, debug, and verify the full stack end-to-end.

## Security notes

- ShipCheck AI only analyzes **public** repositories. Private repo requests are rejected with HTTP 422.
- Secret detection is a best-effort surface scan using regex patterns. It is not a substitute for dedicated tools like `gitleaks` or `truffleHog`.
- No full file contents are sent to OpenAI — only finding summaries and repository metadata.

## Builder

- **Name:** Tanya Garg
- **Track:** Developer Tools / AI & Productivity
- **Challenge:** [Kiro Build Challenge](https://awssbggeu.com/challenges/kiro-build-challenge) — AWS Student Builder Group GEU × AWS Student Builder Group PIET

## License

MIT
