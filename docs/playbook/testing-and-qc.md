# Testing and Quality Control

## Mandatory Stack
- Unit/Component: Vitest + React Testing Library
- Integration mocking: MSW
- E2E smoke: Playwright

## Required Checks
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e:smoke` (CI)

## Minimum Coverage Scenarios
- Store actions and state transitions
- Task filter combinations (assignee/tag/search)
- Drawer open/close and ESC behavior
- Route guard behavior for valid/invalid project ids
- Project route navigation smoke