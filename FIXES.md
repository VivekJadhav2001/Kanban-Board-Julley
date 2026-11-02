# Fixes applied
1. Routes: board/column/task/membership routes now use the full paths the frontend and README expect (`/tenants/:id/boards`, `/boards/:id/columns`, `/columns/:id`, `/boards/:id/tasks`, `/tasks/:id`, `/members/:id`). Previously every board/column/task call returned 404, and `GET /users` was swallowed by `/:taskId`.
2. `frontend/index.html` pointed at `main.jsx` (duplicate of `main.tsx`); now uses `main.tsx`, `main.jsx` removed.
3. CORS now reads `CLIENT_ORIGINS` (comma-separated) so a deployed frontend can be added without code changes; added `GET /health`.
4. DB: `MONGODB_DB_NAME` (default `julley-kanban`) because the Atlas URI has no database name (it silently used `test`); 10s connect timeout so a bad Atlas IP allow-list fails fast.
5. Tests: `scripts/api-smoke.mjs` (API, 25 calls) and `scripts/ui-test.py` (real browser, full flow).
