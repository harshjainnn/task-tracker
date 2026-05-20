# Team Task Manager Testing Checklist

## Auth
- Sign up with a valid name, email, and password.
- Confirm duplicate email signup returns a clear error.
- Log in with the created account.
- Refresh a protected route and confirm the session persists.
- Log out and confirm protected routes redirect to `/login`.
- Confirm invalid or expired tokens clear the local session.

## Dashboard
- Confirm `/api/dashboard/stats` requires authentication.
- Confirm admin stats include all tasks and projects.
- Confirm member stats include only assigned tasks and assigned projects.
- Confirm overdue tasks are counted only when `dueDate` is before today and status is not `COMPLETED`.
- Confirm recent projects, recent tasks, and status distribution render from live API data.

## Projects
- Confirm admins can create, update, delete, and view all projects.
- Confirm project creation automatically adds the creator as a member.
- Confirm admins can add members by email.
- Confirm duplicate project members are rejected.
- Confirm members only see assigned projects.
- Confirm members cannot create, update, delete, or add members to projects.

## Tasks
- Confirm admins can create, update, assign, filter, and delete tasks.
- Confirm invalid status and priority values return `400`.
- Confirm invalid project, task, or user ids return clear errors.
- Confirm members only see assigned tasks.
- Confirm members can update only the status of their assigned tasks.
- Confirm members cannot create or delete tasks.
- Confirm dashboard stats update after task changes.

## Frontend UX
- Confirm dashboard, projects, project details, and tasks work on mobile, tablet, and desktop.
- Confirm loading skeletons appear during API requests.
- Confirm empty states appear for no projects, no tasks, and no dashboard data.
- Confirm toast notifications appear for login, logout, project creation, task changes, and errors.
- Confirm inline form validation appears before API submission.

## Deployment Safety
- Backend requires `DATABASE_URL` and production `JWT_SECRET`.
- Backend `CLIENT_URL` supports comma-separated frontend origins.
- Frontend uses `VITE_API_URL` for deployed API access.
- `npm run build` succeeds in the frontend.
- Backend imports cleanly with `node -e "import('./src/app.js')"`.
- Vercel rewrites should route SPA refreshes to `index.html`.
- Railway runs Prisma migrations before production traffic.
