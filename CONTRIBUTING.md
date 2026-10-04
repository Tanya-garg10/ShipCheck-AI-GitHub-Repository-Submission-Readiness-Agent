# Contributing to ShipCheck AI

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/ShipCheck-AI-GitHub-Repository-Submission-Readiness-Agent.git
cd ShipCheck-AI-GitHub-Repository-Submission-Readiness-Agent
npm install
cp backend/.env.example backend/.env   # fill in tokens
npm run dev
```

## Adding a New Checker

1. Create `backend/src/engine/checkers/<name>Checker.ts` — export `check<Name>(ctx: RepoContext): Finding[]`.
2. Register it in `backend/src/engine/ruleEngine.ts`.
3. Add the new `CheckCategory` to `backend/src/types/index.ts` and mirror it in `frontend/src/types.ts`.
4. Adjust `CATEGORY_WEIGHTS` in `backend/src/engine/scorer.ts` so weights still sum to 100.
5. Add a display label in `frontend/src/components/FindingsList.tsx` and `ScoreCard.tsx`.
6. Write at least one test in `backend/src/tests/`.

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR.
- Run `npm test` before submitting. All tests must pass.
- Use conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.
- Add or update tests for any changed logic.

## Code Style

- TypeScript strict mode — no `any`.
- Prefer named exports.
- Error handling: never swallow errors silently.
