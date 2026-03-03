# Project Management MVP (React + TypeScript + Tailwind)

## Run

```bash
npm install
npm run dev
```

## Included

- App shell with `Sidebar` + `Topbar`
- Route: `/projects/:projectId/board`
- Project board page with:
  - Project header
  - View toolbar (board/sort/add)
  - Client-side search + assignee/tag filters
  - 3-column Kanban board (Backlog, In Progress, Completed)
- Reusable typed UI primitives (`Button`, `Input`, `Badge`, `Avatar`, `IconButton`, `Divider`)
- Task cards with priority, tags, assignee, due date, comment/attachment counts
- Right-side task drawer with details/comments
  - Click-to-open
  - ESC-to-close
  - Desktop docked panel, tablet overlay, mobile fullscreen behavior
- Zustand store for drawer and filter/search UI state
- Mock in-code project, members, and tasks data

## Intentionally Excluded (MVP scope)

- Authentication and user management backend
- Realtime collaboration/sync
- Timeline/Gantt view
- Notifications backend
- File upload backend
- API/backend integration