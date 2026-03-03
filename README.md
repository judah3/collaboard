# Project Management Frontend Foundation

Refactored MVP frontend using React + TypeScript with nested project routes, middleware guards, repository/query data boundaries, and UI-only Zustand state.

## Run

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run typecheck
npm run test
npm run test:e2e:smoke
npm run build
```

## Architecture Highlights

- Nested routes under `/projects/:projectId/*`
- Shared `ProjectLayout` for project header and view tabs
- Route-level middleware guards (`requireProjectExists`, `requireFeatureFlag`)
- Repository contracts and mock adapters for project/task data
- React Query hooks for server-like data state
- Zustand reserved for local UI interaction state

## Documentation

- Baseline: `docs/baseline.md`
- ADRs: `docs/architecture/*`
- Team playbook: `docs/playbook/*`

## Included

- Board page with filter/search/sort UI state
- Task drawer with ESC close and responsive behavior
- Placeholder list/timeline/settings routes
- Unit + integration + e2e smoke test scaffolding
- CI workflow and PR checklist template

## Intentionally Excluded

- Backend/API integration
- Auth and permissions backend
- Realtime collaboration sync
- Notifications backend
- File upload backend