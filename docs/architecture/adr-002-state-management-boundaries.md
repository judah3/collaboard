# ADR-002: State Management Boundaries

## Status
Accepted

## Context
MVP state was mostly local and direct data imports existed in page code.

## Decision
Split state responsibilities:
- UI interaction state: Zustand (`selectedTaskId`, drawer state, filters, sort).
- Server-like data state: React Query hooks + repository adapters.

## Consequences
- No duplicate source of truth between UI store and data cache.
- Data fetching/mutation is centralized and adapter-backed.
- Mock-to-API migration is localized to repositories.

## Rejected Alternatives
- Zustand-only for both UI and data orchestration.
- Context reducers for all state.