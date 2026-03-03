# Component Guidelines

## Ownership Rules
- `pages/`: orchestration only.
- `features/`: domain components, hooks, selectors, mappers, repositories.
- `shared/ui/`: style primitives only.
- `shared/lib/`: stateless reusable utilities.

## Component Constraints
- Keep components focused on one responsibility.
- Prefer typed props over implicit global imports.
- Keep data-fetching and mutation in hooks, not presentational components.

## Accessibility Checklist
- Keyboard support for interactive elements.
- Focus-visible ring for all controls.
- Drawer ESC close and labelled dialog semantics.