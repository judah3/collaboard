# ADR-004: Dynamic Board Columns and Drag-and-Drop

## Status
Accepted

## Context
The initial MVP used a fixed status-based board with static columns and no mutation workflows for columns/tasks.

## Decision
Adopt dynamic `BoardColumn` entities and bind tasks to `columnId` instead of fixed status unions. Implement drag-and-drop for:
- task reorder within a column
- task move across columns
- column reorder across board

Use `@dnd-kit/core` + `@dnd-kit/sortable` with repository-backed mutations.

## Consequences
- Board structure is user-configurable and no longer tied to hardcoded statuses.
- Ordering logic is explicit (`order` fields on columns and tasks).
- Future API migration is simplified via repository contracts.

## Rejected Alternatives
- Keeping fixed status columns.
- Deferring DnD and relying only on dropdown-based movement.
- Implementing a bespoke drag system.