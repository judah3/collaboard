# Django Backend + REST API Plan (v1)

## Summary
Build a new Django REST backend as a separate service that replaces frontend mock repositories while preserving existing board/task behaviors from:
- `src/app/repositories.tsx`
- `src/features/board/mockColumnRepository.ts`
- `src/features/tasks/repository/mockTaskRepository.ts`

Scope includes full PM domain for v1: workspaces, memberships, projects, columns, tasks, comments, attachments metadata, and strict RBAC (`Owner/Admin/Member`), with no realtime in v1.

## 1. Architecture and Service Layout
1. Create `backend/` Django project with apps: `identity`, `workspaces`, `projects`, `boards`, `tasks`, `comments`, `attachments`, `common`.
2. Add Docker services: `frontend`, `backend`, `postgres`, `nginx` (or keep frontend nginx and add API reverse proxy route `/api`).
3. Use DRF + `djangorestframework-simplejwt` for JWT auth.
4. Use Google OAuth token verification server-side, then mint local access/refresh JWT pair.
5. Keep REST-only in v1; no websocket/channels.

## 2. Domain Model (DB)
1. `User`: UUID PK, email unique, name, avatar_url, auth_provider.
2. `Workspace`: UUID PK, name, slug, created_by.
3. `WorkspaceMembership`: user, workspace, role (`OWNER|ADMIN|MEMBER`), unique `(workspace,user)`.
4. `Project`: UUID PK, workspace FK, name, description, due_date, progress, archived flag.
5. `ProjectMembership`: optional override role per project (if absent, inherit workspace membership).
6. `BoardColumn`: UUID PK, project FK, name, order, color, created_at.
7. `Task`: UUID PK, project FK, column FK, order, title, description, priority, assignee FK nullable, due_date, attachments_count, comments_count, created_by, updated_at.
8. `TaskTag`: normalized tag table + M2M to task.
9. `TaskComment`: UUID PK, task FK, author FK, message, created_at, updated_at.
10. `Attachment`: UUID PK, task FK, uploaded_by FK, filename, content_type, size_bytes, storage_path, created_at.

## 3. API Contracts (v1)
1. Base path: `/api/v1`.
2. Auth:
- `POST /auth/google/login` (Google ID token -> access/refresh JWT + user profile).
- `POST /auth/refresh`.
- `POST /auth/logout` (refresh token blacklist).
- `GET /auth/me`.
3. Workspace and membership:
- `GET/POST /workspaces`.
- `GET/PATCH /workspaces/{id}`.
- `GET/POST /workspaces/{id}/members`.
- `PATCH/DELETE /workspaces/{id}/members/{user_id}`.
4. Projects:
- `GET/POST /workspaces/{id}/projects`.
- `GET/PATCH/DELETE /projects/{id}`.
- `GET/POST /projects/{id}/members`.
5. Columns:
- `GET/POST /projects/{id}/columns`.
- `PATCH/DELETE /projects/{id}/columns/{column_id}`.
- `POST /projects/{id}/columns/reorder` with ordered column IDs.
6. Tasks:
- `GET/POST /projects/{id}/tasks` with filters `assignee_id`, `tag`, `search`, `column_id`.
- `GET/PATCH/DELETE /projects/{id}/tasks/{task_id}`.
- `POST /projects/{id}/tasks/reorder` with `{task_id, from_column_id, to_column_id, from_index, to_index}`.
7. Comments:
- `GET/POST /tasks/{task_id}/comments`.
- `PATCH/DELETE /tasks/{task_id}/comments/{comment_id}`.
8. Attachments (local disk):
- `POST /tasks/{task_id}/attachments` (multipart).
- `GET /tasks/{task_id}/attachments`.
- `DELETE /tasks/{task_id}/attachments/{attachment_id}`.
9. List responses use paginated envelope (`count,next,previous,results`) consistently.

## 4. Validation and Business Rules
1. Column rules: required name, max 40 chars, unique per project (case-insensitive), max 8 columns.
2. Task rules: title required/max 120, description max 1000, max 8 tags, each tag max 24, valid due date.
3. Reorder operations run in DB transaction; normalize `order` indexes to contiguous integers.
4. `comments_count` and `attachments_count` maintained transactionally on create/delete.
5. RBAC:
- `Owner`: full workspace/project control.
- `Admin`: manage projects/tasks/columns/members except owner transfer/removal.
- `Member`: read/write tasks/comments/attachments; no workspace role admin actions.

## 5. Frontend Integration Plan
1. Add API repository adapters implementing existing interfaces in:
- `src/features/projects/repository/types.ts`
- `src/features/board/repository.types.ts`
- `src/features/tasks/repository/types.ts`
2. Keep current hook/query keys; only swap repository implementation in `src/app/repositories.tsx`.
3. Add mapper layer to convert paginated envelopes to current plain arrays where needed.
4. Add auth token storage/refresh interceptor in `src/shared/lib/interceptors.ts`.

## 6. Testing and Acceptance
1. Backend unit tests for serializers, permissions, reorder services, and counters.
2. Backend API integration tests for all CRUD + reorder + RBAC denials + auth refresh flow.
3. Contract tests ensuring backend payload matches frontend type expectations.
4. Frontend MSW/integration updates for paginated responses and auth failures.
5. E2E smoke (existing) plus API-backed smoke path for: login, load board, create column, create task, move task across columns, comment, upload attachment.

## 7. Delivery Sequence
1. Bootstrap backend project, DB, Docker compose, health endpoints.
2. Implement auth and user/workspace/membership foundation.
3. Implement projects + columns + reorder.
4. Implement tasks + tags + reorder + filters.
5. Implement comments and attachments.
6. Integrate frontend adapters and env wiring.
7. Full test pass, seed data, and docs (`backend/README`, API examples, role matrix).

## Public API / Interface Additions
1. New backend HTTP API under `/api/v1/*`.
2. Frontend repository implementations change from in-memory mock to HTTP-backed adapters.
3. Frontend receives paginated envelopes from API; adapters expose existing return types to avoid broad UI refactor.
4. Authentication flow added to frontend app bootstrap (JWT lifecycle).

## Assumptions and Defaults Chosen
1. Django 5.x + DRF + PostgreSQL 16 in Docker.
2. UUID primary keys for all domain entities.
3. Local file storage for attachments in v1 (`MEDIA_ROOT` volume).
4. Google OAuth login endpoint receives Google token from frontend and performs server verification.
5. No realtime updates in v1; consistency through mutations + query invalidation.
6. API versioning starts at `/api/v1`; breaking changes require `/api/v2`.
