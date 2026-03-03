# Baseline Reference

## Purpose
Capture pre-refactor UI/route baseline and define freeze criteria.

## Reference Fixtures
- Main UI reference: `reference/image_sample.png`
- Styling reference: `reference/mvp_styling_guidelines_pm_tool.md`

## Current Route Map
- `/` -> redirects to `/projects/mad-dogs-portal/board`
- `/projects/:projectId/*`
  - `/board`
  - `/list`
  - `/timeline`
  - `/settings`

## Refactor Done Criteria
- No UX regression on app shell, board columns, and task drawer interactions.
- Existing board interactions preserved (search/filter/drawer open-close/ESC).
- Typecheck, tests, and build pass in CI.

## Freeze Rule
No net-new product functionality should be merged during architecture refactor branch.