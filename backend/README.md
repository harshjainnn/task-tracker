# Team Task Manager - Backend Setup

This folder holds the production-level Node.js + Express backend service, wired with Prisma ORM and pre-configured for PostgreSQL.

---

## 🛠️ Tech Stack & Configurations

- **Runtime**: Node.js (v18+) with standard ES Modules (`import`/`export` syntax).
- **Web Server**: Express.js with custom centralized error-handling.
- **ORM**: Prisma Client.
- **Database**: PostgreSQL (Prisma datasource provider).
- **Authentication**: JWT & BCrypt-ready.
- **Process Manager**: Nodemon (dev mode).

---

## 📁 Modern Modular Folder Structure

```text
backend/
├── prisma/
│   ├── schema.prisma   # PostgreSQL Database schema
│   └── seed.js         # Hashed authentication seed script
├── src/
│   ├── config/         # App configuration modules (e.g., DB Client)
│   ├── controllers/    # Route controllers (future auth, user, tasks logic)
│   ├── middleware/     # Global express middlewares (CORS, error handlers)
│   ├── routes/         # Unified route structure mappings
│   ├── services/       # Core business workflows & third-party integrations
│   ├── utils/          # Helpers (e.g. JWT builders, validators)
│   ├── validations/    # Payload validation schemas (e.g. Zod/Joi rules)
│   ├── app.js          # Express middleware bindings & route wiring
│   └── server.js       # App entry point with graceful shutdown loops
├── .env                # Secret configurations
├── package.json        # NPM scripts & dependencies
└── README.md           # Documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Initialize package configurations:
```bash
npm install
```

### 2. Configure Environment Variables
Make sure to check the [.env](file:///c:/Users/shrey/OneDrive/Desktop/pro/backend/.env) file. Update the database url with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/team_task_manager?schema=public"
```

### 3. Generate Database Client
To sync database schemas with your type models, run:
```bash
npx prisma generate
```

### 4. Execute Migrations
Create your PostgreSQL tables and relationships instantly:
```bash
npx prisma migrate dev --name init
```

### 5. Seed Core Data
Insert a pre-configured sample Admin, Member, Project, and Tasks:
```bash
npx prisma db seed
```

### 6. Boot the Server
Run in standard hot-reloading development mode:
```bash
npm run dev
```
The server will bind to `http://localhost:5000`.

---

## 📡 API Routing Walkthrough

- **GET `/`**: Returns base server status checking if API is operational.
  ```json
  {
    "message": "Team Task Manager API Running",
    "version": "1.0.0"
  }
  ```
- **GET `/health`**: Returns detailed services diagnostic checks (testing database connectivity status).
  ```json
  {
    "status": "UP",
    "timestamp": "2026-05-20T12:00:00.000Z",
    "services": {
      "database": "CONNECTED",
      "api": "HEALTHY"
    }
  }
  ```

---

## 📊 Database Verification

To verify that your database tables have been successfully provisioned:

1. **Prisma Studio (Recommended GUI)**:
   Run the following command to open a beautiful browser-based viewer of all tables, relations, and records:
   ```bash
   npx prisma studio
   ```
2. **Terminal (psql)**:
   Alternatively, log in to your PostgreSQL CLI and inspect:
   ```sql
   \c team_task_manager
   \dt
   SELECT * FROM users;
   ```
