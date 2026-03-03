# ADR-003: Frontend Middleware Pattern

## Status
Accepted

## Context
Route checks and data policies can drift when implemented ad hoc in component trees.

## Decision
Use two middleware layers:
1. Route guards (`requireProjectExists`, `requireFeatureFlag`) in route loaders.
2. Data interceptor utilities for request normalization, error mapping, and response shaping.

## Consequences
- Access and feature policies are centralized.
- Error handling is consistent and testable.
- Future auth/flag policies can plug into existing boundaries.

## Rejected Alternatives
- Component-level policy checks only.
- No middleware abstraction.