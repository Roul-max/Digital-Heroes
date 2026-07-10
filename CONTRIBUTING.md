# Contributing

## Dev Setup

```bash
git clone https://github.com/your-org/leadrouter
cd leadrouter
cp .env.example .env.local   # fill in your values
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add bulk lead reassignment
fix: correct SLA breach calculation for UTC offset
refactor: extract routing criteria into separate validator
docs: update architecture trade-offs table
chore: bump next to 15.1
```

## Branch Strategy

- `main` — production, protected, requires passing CI + review
- `develop` — integration branch
- Feature branches: `feat/your-feature`, `fix/your-fix`

## Pull Requests

Fill out the PR template fully. CI must be green before merge.

## Testing

```bash
npm run test          # unit tests (Vitest)
npm run test:coverage # coverage report
npm run typecheck     # TypeScript strict check
npm run lint          # ESLint
```

All new server actions and utility functions must have unit tests.
