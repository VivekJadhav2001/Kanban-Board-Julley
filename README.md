# Julley Kanban Board

A multi-tenant Kanban application with a React/Vite frontend, Express/MongoDB API, JWT authentication, and tenant-scoped Socket.IO events.

## Project layout

| Directory | Purpose |
| --- | --- |
| `frontend/` | React 19, TypeScript, Vite, Zustand, Axios UI |
| `backend/` | Express 5, Mongoose, JWT, Socket.IO API |

## Requirements

- Node.js 20 or newer
- pnpm 11 or newer
- A reachable MongoDB deployment (local MongoDB or MongoDB Atlas)

## Configuration

Create or update `backend/.env` with these values:

```dotenv
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/julley-kanban
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Create or update `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5050/api/v1
```

Never commit a real `.env` file or MongoDB credentials.

## Start the application

Install dependencies if they are not already installed:

```powershell
pnpm --dir backend install
pnpm --dir frontend install
```

Start the API in one terminal:

```powershell
pnpm --dir backend start
```

For automatic backend reloads during development:

```powershell
pnpm --dir backend dev
```

Start the frontend in another terminal:

```powershell
pnpm --dir frontend dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Normal usage flow

1. Register an account and log in.
2. Create an organization.
3. Create a tenant inside that organization.
4. Create a board in the tenant.
5. Create at least one column on the board.
6. Create tasks and assign them to a board column.

## API overview

All API endpoints are prefixed with `/api/v1`. Except for registration and login, endpoints require `Authorization: Bearer <token>`.

| Area | Main routes |
| --- | --- |
| Authentication | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/profile` |
| Organizations | `/organizations` |
| Tenants | `/organizations/:organizationId/tenants`, `/tenants/:tenantId` |
| Boards | `/tenants/:tenantId/boards` |
| Columns | `/boards/:boardId/columns`, `/columns/:columnId` |
| Tasks | `/boards/:boardId/tasks`, `/tasks/:taskId` |
| Activity | `/tenants/:tenantId/activity`, `/boards/:boardId/activity`, `/tasks/:taskId/activity` |
| Memberships | `/organizations/:organizationId/members`, `/tenants/:tenantId/members` |

Task updates, moves, assignments, reorders, and deletion require the task's current `version`. A stale version returns `409 Conflict`, so clients should refresh the task and retry.

## Realtime behavior

The browser connects to Socket.IO using the JWT, then joins the active tenant room. Task, column, and board events are emitted only to members authorized for that tenant. The server must use the same host and port configured by `VITE_API_BASE_URL`.

## Verification commands

```powershell
pnpm --dir backend test
pnpm --dir frontend build
pnpm --dir frontend lint
```

The frontend production build and lint pass. The backend test script currently performs syntax checks; it is not an integration-test suite.

## Known limitations and work still needed

The core create/read/update/delete flows are wired, but these areas need completion before calling the project production-ready:

- No automated API integration tests exist. Add tests covering authorization, invalid IDs, optimistic task-version conflicts, and every route listed above.
- No Docker/Compose setup, deployment configuration, health endpoint, or CI pipeline is included.
- The server will not start until `MONGODB_URI` points to a reachable MongoDB database. This is required infrastructure, not a frontend issue.
- CORS currently allows only Vite development origins (`localhost:5173` and `localhost:5174`). Add the deployed frontend domain before production deployment.
- Organization and tenant management screens do not yet expose membership administration, activity history, board editing/deletion, column editing/deletion/reordering, or drag-and-drop task movement, although related backend APIs exist.
- Role checks should be tightened for all mutations. Current access middleware confirms membership, but the product should explicitly enforce organization-admin and tenant-admin permissions for management actions.
- There is no invitation/email workflow, password reset, rate limiting, request logging, monitoring, backup plan, or production secret management.
- The frontend has no user-facing recovery flow for a `409 Conflict`; it displays the API error and requires the user to refresh manually.

## Troubleshooting

| Symptom | Likely cause and action |
| --- | --- |
| API does not start | Check that every required backend environment variable is set and that MongoDB is reachable. |
| Browser shows a network error | Confirm the backend is running on port `5050` and that `VITE_API_BASE_URL` matches it. |
| `401 Session expired` | Log in again; verify `JWT_SECRET` has not changed after the token was issued. |
| `403` tenant access error | The user needs an active tenant membership or organization-admin membership. |
| No realtime updates | Ensure the browser's API URL points to the Socket.IO server and the user has opened a tenant board. |
| Cannot create a task | Create a column first, then select it in the task form. |
