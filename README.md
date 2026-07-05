# Team Task Manager

Team Task Manager is a full-stack web application for managing projects, assigning tasks, tracking progress, and controlling access based on user roles.

The application includes authentication, role-based authorization, project management, task management, dashboard analytics, project member assignment, protected frontend routes, and deployment-ready configuration.

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcryptjs password hashing

## Main Features

- User signup and login
- Secure password hashing with bcryptjs
- JWT-based authentication
- Protected frontend routes
- Role-based access control
- Admin and member roles
- Project creation and management
- Add users as project members
- Task creation and assignment
- Task status updates
- Dashboard with live backend statistics
- Recent projects and recent tasks
- Task distribution by status
- Toast notifications
- Loading and empty states
- Responsive UI
- Railway/Vercel deployment-ready structure

## User Roles

### Admin

Admins can:

- Create projects
- Update projects
- Delete projects
- Add members to projects
- Create tasks
- Assign tasks
- Edit tasks
- Delete tasks
- View all projects and tasks

### Member

Members can:

- View only assigned projects
- View only assigned tasks
- Update only the status of their assigned tasks

Members cannot create or delete projects or tasks.

## Project Structure

```text
pro/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── README.md
└── TESTING_CHECKLIST.md
```

## Database Models

The main Prisma models are:

- `User`
- `Project`
- `ProjectMember`
- `Task`

`ProjectMember` is the join table between users and projects.

This allows:

- one user to belong to many projects
- one project to have many users

Tasks belong to projects and can be assigned to users. The backend validates that a task assignee must be a member of the selected project.

## Backend API Routes

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Dashboard

```text
GET /api/dashboard/stats
```

Returns:

- total tasks
- completed tasks
- pending tasks
- overdue tasks
- recent projects
- recent tasks
- task distribution by status

### Projects

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
```

### Tasks

```text
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Users

```text
GET /api/users
```

## Environment Variables

### Backend

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/team_task_manager?schema=public"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
PORT=5000
```

### Frontend

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL="http://localhost:5000"
```

For production, replace `VITE_API_URL` with the deployed backend URL.

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd pro
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment

Create `backend/.env` and add your PostgreSQL database URL, JWT secret, and frontend URL.

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed the database

```bash
npm run prisma:seed
```

### 7. Start backend server

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 8. Install frontend dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 9. Start frontend server

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Available Scripts

### Backend

```bash
npm start
npm run dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Demo Flow

Use this flow while presenting the project:

1. Log in as an admin.
2. Show the dashboard with live task and project statistics.
3. Open the Projects page.
4. Create a new project.
5. Open the project details page.
6. Add members to the project from the user dropdown.
7. Open the Tasks page.
8. Create a task and assign it to a project member.
9. Update the task status.
10. Log in as a member.
11. Show that the member only sees assigned projects and tasks.
12. Show that members can only update task status.

## Security Features

- Passwords are hashed before being stored.
- JWT tokens are used for protected routes.
- Admin-only middleware protects privileged backend routes.
- Members cannot create or delete projects or tasks.
- Members can only update their assigned task status.
- Duplicate project members are prevented.
- Invalid task status values are rejected.
- Invalid priority values are rejected.
- Task assignees must belong to the selected project.
- API errors return consistent JSON responses.

## Dashboard

The dashboard uses live backend data from:

```text
GET /api/dashboard/stats
```

It displays:

- total tasks
- completed tasks
- pending tasks
- overdue tasks
- recent projects
- recent tasks
- task status distribution

For admins, dashboard stats include all tasks and projects.

For members, dashboard stats include only assigned tasks and projects.

## Deployment

### Backend on Railway

1. Push the repository to GitHub.
2. Create a Railway project.
3. Add a PostgreSQL database.
4. Add a backend service from GitHub.
5. Set the backend root directory to:

```text
backend
```

6. Add backend environment variables:

```env
DATABASE_URL="your-railway-postgres-url"
JWT_SECRET="your-production-jwt-secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="https://your-frontend-domain.com"
NODE_ENV="production"
```

7. Use this start command:

```bash
npm start
```

For production migrations, run:

```bash
npx prisma migrate deploy
```

### Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set root directory to:

```text
frontend
```

3. Set build command:

```bash
npm run build
```

4. Set output directory:

```text
dist
```

5. Add frontend environment variable:

```env
VITE_API_URL="https://your-backend-url.up.railway.app"
```

## Testing Checklist

A detailed checklist is available in:

```text
TESTING_CHECKLIST.md
```

Main checks:
- Signup
- Login
- Logout
- Protected routes
- Admin permissions
- Member restrictions
- Project creation
- Add project members
- Task creation
- Task assignment
- Task status update
- Dashboard updates
- Production build

## Summary

This project demonstrates a complete full-stack workflow with:

- authentication
- authorization
- relational database design
- REST API development
- dashboard analytics
- frontend state management
- validation and error handling
- deployment-ready structure
