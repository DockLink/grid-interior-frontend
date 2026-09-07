# GRID API Readiness Sheet

**Date:** 2 Sep 2026  
**Frontend:** `grid-interior-frontend` BFF (`app/api/**`)  
**Backend:** NestJS `grid-interior-backend` (URI version `/v2` unless noted)  
**Auth:** Nest v2 + **Supabase Auth** (not Auth0). FE does not call Supabase directly.

Legend: **exists** = Nest route present · **partial** = Nest covers some methods/shapes · **missing** = no Nest match · **fe-only** = intentional FE/env behavior

---

## Summary

| Domain | FE BFF routes | Nest readiness |
|---|---|---|
| Auth & sessions | 9 | Mostly exists; dedicated `POST /auth/logout` missing (FE revokes via `DELETE /auth/sessions/:id`) |
| Users / access requests | 5 | exists |
| Projects / members | 4 | exists (`POST` create is Nest `/projects/create`) |
| Project links | 1 | **missing** |
| Tasks / holds | 10 | exists (incl. reopen) |
| Files / folders / share / storage | 16 | exists (unversioned file/share controllers); public share metadata **missing** |
| Notifications | 2 | exists (unversioned) |
| Clients | 4 | exists |
| Suppliers / vendors | 6 | mostly exists; `GET /vendor-tasks/:id` **partial** |
| Meeting minutes | 3 | exists |
| App settings | 1 | exists |
| Maps | 1 | **fe-only** (env key; no Nest) |

---

## Auth

| FE BFF | Methods | Nest target | Status | Notes |
|---|---|---|---|---|
| `/api/auth/login` | POST | `POST /v2/auth/login` | exists | Supabase-shaped tokens |
| `/api/auth/logout` | POST | *(none)* → `DELETE /v2/auth/sessions/:sessionId` | partial | FE-2: BFF revokes current session from JWT `session_id` |
| `/api/auth/refresh` | POST | `POST /v2/auth/refresh` | exists | |
| `/api/auth/sign-out-all` | POST | `POST /v2/auth/sign-out-all` | exists | Supabase admin sign-out all |
| `/api/auth/change-password` | POST | `POST /v2/auth/change-password` | exists | |
| `/api/auth/me` | GET, PATCH | `GET\|PATCH /v2/auth/me` | exists | |
| `/api/auth/me/preferences` | PATCH | `PATCH /v2/auth/me/preferences` | exists | |
| `/api/auth/sessions` | GET | `GET /v2/auth/sessions` | exists | |
| `/api/auth/sessions/[sessionId]` | DELETE | `DELETE /v2/auth/sessions/:sessionId` | exists | Used by logout + settings |

Auth0 webhook/v1 paths on Nest are **out of FE scope**.

---

## Users & access requests

| FE BFF | Methods | Nest target | Status |
|---|---|---|---|
| `/api/users` | GET, POST | `GET /v2/users`, `POST /v2/users/create` | exists |
| `/api/users/[userId]` | GET, PATCH, DELETE | `/v2/users/:user_id` | exists |
| `/api/access-requests` | GET, POST | `/v2/access-requests` | exists |
| `/api/access-requests/[id]` | GET, DELETE | `/v2/access-requests/:id` | exists |
| `/api/access-requests/review` | POST | `POST /v2/access-requests/review` | exists |

---

## Projects

| FE BFF | Methods | Nest target | Status | Notes |
|---|---|---|---|---|
| `/api/projects` | GET, POST | `GET /v2/projects`, `POST /v2/projects/create` | exists | Create path differs |
| `/api/projects/[projectId]` | GET, PATCH, DELETE | `/v2/projects/:project_id` | exists | |
| `/api/projects/[projectId]/members` | GET, PUT | `/v2/projects/:project_id/members` | exists | |
| `/api/projects/[projectId]/links` | GET, PATCH | `/v2/projects/:id/links` | **missing** | FE BFF present; Nest controller not found |

---

## Tasks & hold requests

| FE BFF | Methods | Nest target | Status |
|---|---|---|---|
| `/api/tasks` | GET, POST | `/v2/tasks` | exists |
| `/api/tasks/batch-assignees` | POST | `POST /v2/tasks/batch-assignees` | exists |
| `/api/tasks/[taskId]` | GET, PATCH | `/v2/tasks/:id` | exists |
| `/api/tasks/[taskId]/assignees` | GET, PUT | `/v2/tasks/:task_id/assignees` | exists |
| `/api/tasks/[taskId]/dates` | PATCH | `PATCH /v2/tasks/:id/dates` | exists |
| `/api/tasks/[taskId]/my-completion` | PATCH | `PATCH /v2/tasks/:task_id/my-completion` | exists |
| `/api/tasks/[taskId]/reopen` | POST | `POST /v2/tasks/:id/reopen` | exists | FE-1 BFF added |
| `/api/taskable-hold-requests` | GET, POST | `/v2/taskable-hold-requests` | exists |
| `/api/taskable-hold-requests/[id]` | GET, PATCH, DELETE | `/v2/taskable-hold-requests/:id` | exists |
| `/api/taskable-hold-requests/process` | POST | `POST /v2/taskable-hold-requests/process` | exists |

---

## Files, share, storage (Nest mostly unversioned)

File/share helpers strip `/v2` from `BACKEND_API_URL` via `backendFileFetch`.

| FE BFF | Methods | Nest target | Status | Notes |
|---|---|---|---|---|
| `/api/projects/[projectId]/folders` | GET/POST/… | `projects/:id/folders` | exists | unversioned |
| `/api/projects/[projectId]/folders/custom` | POST | `projects/:id/folders/custom` | exists | |
| `/api/projects/[projectId]/files` | GET | `projects/:id/files` | exists | |
| `/api/projects/[projectId]/files/recent` | GET | `projects/:id/files/recent` | exists | |
| `/api/projects/[projectId]/files/tree` | GET | `projects/:id/files/tree` | exists | |
| `/api/projects/[projectId]/files/upload` | POST | `projects/:id/files/upload` | exists | |
| `/api/projects/[projectId]/files/multipart/[action]` | POST | `projects/:id/files/multipart/:action` | exists | |
| `/api/files/[fileId]` | GET, PATCH, DELETE | `files/:id` | exists | |
| `/api/files/[fileId]/download-url` | GET | `files/:id/download-url` | exists | |
| `/api/files/[fileId]/versions` | GET | `files/:id/versions` | exists | |
| `/api/files/[fileId]/share` | POST | `files/:id/share` | exists | |
| `/api/share/[token]` | DELETE | `DELETE /share/:token` | exists | |
| `/api/share/public/[token]` | GET | `GET /share/:token` | **missing** | Nest has stream `GET /share/:token/file/:fid/content` only |
| `/api/storage/upload` | POST | `POST /v2/storage/upload` | exists | versioned |
| `/api/file-notifications` | GET | `GET /file-notifications` | exists | unversioned |
| `/api/share-link-notifications` | GET | `GET /share-link-notifications` | exists | unversioned |

---

## Clients

| FE BFF | Methods | Nest target | Status |
|---|---|---|---|
| `/api/clients` | GET, POST | `/v2/clients` | exists |
| `/api/clients/pipeline` | GET | `GET /v2/clients/pipeline` | exists |
| `/api/clients/[id]` | GET, PATCH, DELETE | `/v2/clients/:id` | exists |
| `/api/clients/[id]/comm-log` | GET, POST | `/v2/clients/:id/comm-log` | exists |

---

## Suppliers / sub-vendors / vendor tasks

| FE BFF | Methods | Nest target | Status | Notes |
|---|---|---|---|---|
| `/api/suppliers` | GET, POST | `/v2/suppliers` | exists | |
| `/api/suppliers/[id]` | GET, PATCH, DELETE | `/v2/suppliers/:id` | exists | |
| `/api/sub-vendors` | GET, POST | `/v2/sub-vendors` | exists | |
| `/api/sub-vendors/[id]` | GET, PATCH | `/v2/sub-vendors/:id` | exists | |
| `/api/vendor-tasks` | GET, POST | `/v2/vendor-tasks` | exists | |
| `/api/vendor-tasks/[id]` | GET, PATCH, DELETE | `/v2/vendor-tasks/:id` | **partial** | Nest: PATCH/DELETE; **no GET :id** |

---

## Meeting minutes

| FE BFF | Methods | Nest target | Status |
|---|---|---|---|
| `/api/meeting-minutes/projects/[projectId]` | GET, POST | `/v2/meeting-minutes/projects/:projectId` | exists |
| `/api/meeting-minutes/[id]` | GET, PATCH, DELETE | `/v2/meeting-minutes/:id` | exists |
| `/api/meeting-minutes/[id]/action-items/[actionItemIndex]/status` | PATCH | `/v2/meeting-minutes/:id/action-items/:index/status` | exists |

---

## Settings & maps

| FE BFF | Methods | Nest target | Status | Notes |
|---|---|---|---|---|
| `/api/app-settings/appearance` | GET, PATCH | `/v2/app-settings/appearance` | exists | |
| `/api/maps/config` | GET | — | **fe-only** | Returns `GOOGLE_MAPS_API_KEY` / `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from env |

---

## Backend gaps to ticket (priority)

1. **Project links** — Nest `GET|PATCH /projects/:id/links` (FE BFF already wired)
2. **Public share metadata** — Nest `GET /share/:token` for landing page
3. **Vendor task by id** — Nest `GET /vendor-tasks/:id` if FE profile needs it
4. **Dedicated logout** (optional) — Nest could expose `POST /auth/logout`; FE currently uses session revoke

---

## Env contract

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_ENABLE_AUTH=true` | Live Nest mode |
| `BACKEND_API_URL=http://localhost:3001/v2` | Nest JSON (+ file helpers strip `/v2`) |
| `NEXT_PUBLIC_APP_URL` | Absolute share links |
| Maps API key | `/api/maps/config` |

Default host for all BFF Nest helpers: **`:3001`** (not `:3000`).
