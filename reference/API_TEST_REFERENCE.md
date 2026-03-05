# Collaboard Backend API Reference

## Base URLs
- API base: `/api/v1`
- Swagger: `/api/docs/`
- OpenAPI schema: `/api/schema/`
- Health check: `/healthz`

## List of All APIs

### Auth
- `POST /api/v1/auth/google/login` (public)
- `POST /api/v1/auth/dev/login` (public; dev/test mode)
- `POST /api/v1/auth/register` (public; production local auth)
- `POST /api/v1/auth/login` (public; production local auth)
- `POST /api/v1/auth/refresh` (public)
- `POST /api/v1/auth/logout` (auth required)
- `GET /api/v1/auth/me` (auth required)

### Workspaces
- `GET /api/v1/workspaces` (auth required)
- `POST /api/v1/workspaces` (auth required)
- `GET /api/v1/workspaces/{workspace_id}` (auth required)
- `PUT /api/v1/workspaces/{workspace_id}` (auth required)
- `PATCH /api/v1/workspaces/{workspace_id}` (auth required)
- `GET /api/v1/workspaces/{workspace_id}/members` (auth required)
- `POST /api/v1/workspaces/{workspace_id}/members` (auth required)
- `PATCH /api/v1/workspaces/{workspace_id}/members/{user_id}` (auth required)
- `DELETE /api/v1/workspaces/{workspace_id}/members/{user_id}` (auth required)

### Projects
- `GET /api/v1/workspaces/{workspace_id}/projects` (auth required)
- `POST /api/v1/workspaces/{workspace_id}/projects` (auth required)
- `GET /api/v1/projects/{project_id}` (auth required)
- `PUT /api/v1/projects/{project_id}` (auth required)
- `PATCH /api/v1/projects/{project_id}` (auth required)
- `DELETE /api/v1/projects/{project_id}` (auth required; soft delete)
- `GET /api/v1/projects/{project_id}/members` (auth required)
- `POST /api/v1/projects/{project_id}/members` (auth required)

### Board Columns
- `GET /api/v1/projects/{project_id}/columns` (auth required)
- `POST /api/v1/projects/{project_id}/columns` (auth required)
- `GET /api/v1/projects/{project_id}/columns/{column_id}` (auth required)
- `PUT /api/v1/projects/{project_id}/columns/{column_id}` (auth required)
- `PATCH /api/v1/projects/{project_id}/columns/{column_id}` (auth required)
- `DELETE /api/v1/projects/{project_id}/columns/{column_id}` (auth required)
- `POST /api/v1/projects/{project_id}/columns/reorder` (auth required)

### Tasks
- `GET /api/v1/projects/{project_id}/tasks` (auth required)
- `POST /api/v1/projects/{project_id}/tasks` (auth required)
- `GET /api/v1/projects/{project_id}/tasks/{task_id}` (auth required)
- `PUT /api/v1/projects/{project_id}/tasks/{task_id}` (auth required)
- `PATCH /api/v1/projects/{project_id}/tasks/{task_id}` (auth required)
- `DELETE /api/v1/projects/{project_id}/tasks/{task_id}` (auth required; soft delete)
- `POST /api/v1/projects/{project_id}/tasks/reorder` (auth required)

Task list query params:
- `assignee_id`
- `tag`
- `search`
- `column_id`

### Comments
- `GET /api/v1/tasks/{task_id}/comments` (auth required)
- `POST /api/v1/tasks/{task_id}/comments` (auth required)
- `GET /api/v1/tasks/{task_id}/comments/{comment_id}` (auth required)
- `PUT /api/v1/tasks/{task_id}/comments/{comment_id}` (auth required)
- `PATCH /api/v1/tasks/{task_id}/comments/{comment_id}` (auth required)
- `DELETE /api/v1/tasks/{task_id}/comments/{comment_id}` (auth required)

### Attachments
- `GET /api/v1/tasks/{task_id}/attachments` (auth required)
- `POST /api/v1/tasks/{task_id}/attachments` (auth required; multipart/form-data)
- `DELETE /api/v1/tasks/{task_id}/attachments/{attachment_id}` (auth required)

## Test Data

## Demo seed data (from `python manage.py seed_demo`)
- Owner user: `owner@collaboard.local` (`name: Owner`)
- Member user: `member@collaboard.local` (`name: Member`)
- Workspace: `Mad Dogs Portal` (`slug: mad-dogs-portal`)
- Project: `Mad Dogs Portal`
- Columns: `Backlog`, `In Progress`, `Completed`
- Task: `Revamping login page`
- Comment: `Please complete by end of week.`

## API payload examples

### 1) Dev login
`POST /api/v1/auth/dev/login`
```json
{
  "email": "demo@test.local",
  "name": "Demo"
}
```

### 1b) Production register (local)
`POST /api/v1/auth/register`
```json
{
  "email": "prod.user@test.local",
  "name": "Prod User",
  "password": "StrongPass123"
}
```

### 1c) Production login (local)
`POST /api/v1/auth/login`
```json
{
  "email": "prod.user@test.local",
  "password": "StrongPass123"
}
```

### 2) Create workspace
`POST /api/v1/workspaces`
```json
{
  "name": "Workspace Alpha",
  "slug": "workspace-alpha"
}
```

### 3) Add workspace member
`POST /api/v1/workspaces/{workspace_id}/members`
```json
{
  "email": "member@test.local",
  "role": "ADMIN"
}
```

### 4) Create project
`POST /api/v1/workspaces/{workspace_id}/projects`
```json
{
  "name": "Project A",
  "description": "Internal project",
  "due_date": "2026-06-30",
  "progress": 0,
  "archived": false
}
```

### 5) Create board column
`POST /api/v1/projects/{project_id}/columns`
```json
{
  "name": "Backlog",
  "color": "#64748b"
}
```

### 6) Reorder columns
`POST /api/v1/projects/{project_id}/columns/reorder`
```json
{
  "ordered_column_ids": [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222"
  ]
}
```

### 7) Create task
`POST /api/v1/projects/{project_id}/tasks`
```json
{
  "column": "11111111-1111-1111-1111-111111111111",
  "title": "Build API",
  "description": "Implement endpoint",
  "priority": "HIGH",
  "tags": ["backend", "api"]
}
```

### 8) Reorder/move task
`POST /api/v1/projects/{project_id}/tasks/reorder`
```json
{
  "task_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "from_column_id": "11111111-1111-1111-1111-111111111111",
  "to_column_id": "22222222-2222-2222-2222-222222222222",
  "from_index": 0,
  "to_index": 0
}
```

### 9) Create comment
`POST /api/v1/tasks/{task_id}/comments`
```json
{
  "message": "Please complete by end of week."
}
```

### 10) Upload attachment
`POST /api/v1/tasks/{task_id}/attachments` (multipart/form-data)
- Field name: `file`
- Max size: `10MB` (default)
- Allowed content types (default): `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, `text/plain`

## Instructions

### 1) Run backend
```powershell
pip install -r requirements\dev.txt
python manage.py migrate
python manage.py runserver
```

### 2) Optional: seed demo data
```powershell
python manage.py seed_demo
```

### 3) Get JWT token (dev login)
```powershell
curl -X POST http://127.0.0.1:8000/api/v1/auth/dev/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"demo@test.local\",\"name\":\"Demo\"}"
```

Copy `access` token from the response.

### 4) Call protected APIs
Use header:
```http
Authorization: Bearer <access_token>
```

### 5) Explore APIs from docs
- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- OpenAPI JSON: `http://127.0.0.1:8000/api/schema/`

### 6) Run API tests
```powershell
pytest tests\api -q
```

### Notes
- List endpoints are paginated:
```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```
