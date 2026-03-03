# ADR-001: Nested Project Routing and Shared Project Layout

## Status
Accepted

## Context
The MVP had a single board route and duplicated project-level framing concerns in page-level code.

## Decision
Adopt nested project routes under `/projects/:projectId/*` with a shared `ProjectLayout`:
- `/projects/:projectId/board`
- `/projects/:projectId/list`
- `/projects/:projectId/timeline`
- `/projects/:projectId/settings`

`ProjectLayout` owns shared project header + view tabs and provides route-scoped project context.

## Consequences
- Shared project shell logic is centralized.
- New project views can be added without duplicating layout code.
- Loader-level guard can validate `projectId` before rendering children.

## Rejected Alternatives
- Flat route model with duplicated page wrappers.
- Board-only route with deferred route architecture.