# TaskMaster — MERN Stack Task Management System

A production-grade task management system built with MongoDB, Express, React, and Node.js featuring full **Role-Based Access Control (RBAC)** and **scalable API patterns**.

---

## Architecture Overview

```
taskmaster/
├── backend/                    # Express + MongoDB API
│   ├── config/
│   │   ├── db.js               # Mongoose connection (pooled, retry)
│   │   └── logger.js           # Winston structured logging
│   ├── controllers/
│   │   ├── authController.js   # JWT auth, refresh token rotation
│   │   └── taskController.js   # Paginated, filtered task CRUD
│   ├── middleware/
│   │   ├── auth.js             # authenticate, restrictTo, requirePermission, requireProjectAccess
│   │   └── validate.js         # Joi schema validation
│   ├── models/
│   │   ├── User.js             # RBAC roles + permissions
│   │   ├── Task.js             # Full-text search indexes
│   │   └── Project.js          # Membership + role helpers
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── projectRoutes.js
│   │   └── userRoutes.js
│   └── server.js               # Helmet, CORS, rate limiting, global error handler
└── frontend/                   # React 18 SPA
    └── src/
        ├── context/AuthContext.jsx   # Auth state + RBAC helpers (can, hasRole)
        ├── hooks/useData.js          # Paginated list hook, abort-controller cancellation
        ├── services/api.js           # Axios + auto refresh interceptor
        ├── components/
        │   ├── Layout.jsx            # Sidebar + role-filtered nav
        │   └── ProtectedRoute.jsx    # ProtectedRoute, RoleGate, PermissionGate
        └── pages/
            ├── DashboardPage.jsx     # KPI stats, status/priority charts
            ├── TasksPage.jsx         # Filterable, paginated task list
            ├── BoardPage.jsx         # Kanban board (5 columns)
            ├── ProjectsPage.jsx      # Project cards
            └── UsersPage.jsx         # Admin role management table
```

---

## RBAC Design

### Roles & Permissions

| Role      | Permissions |
|-----------|-------------|
| **admin** | create/delete users, manage roles, full CRUD on all resources |
| **manager** | create projects/tasks, assign tasks, view team |
| **developer** | view/update own assigned tasks, add comments |
| **viewer** | read-only access to assigned items |

### How it works (Backend)

```js
// 1. Authenticate JWT
router.use(authenticate);

// 2. Restrict by role
router.delete("/:id", restrictTo("admin", "manager"), deleteTask);

// 3. Restrict by permission (fine-grained)
router.post("/", requirePermission("create:task"), createTask);

// 4. Project membership guard
router.get("/:projectId", requireProjectAccess("viewer"), getProject);
router.patch("/:projectId", requireProjectAccess("manager"), updateProject);
```

### How it works (Frontend)

```jsx
// PermissionGate — conditionally renders based on permission
<PermissionGate permission="create:task">
  <button>New Task</button>
</PermissionGate>

// RoleGate — conditionally renders based on minimum role
<RoleGate minRole="manager">
  <AdminPanel />
</RoleGate>

// useAuth hook
const { can, hasRole, user } = useAuth();
if (can("delete:task")) { /* show delete button */ }
```

---

## Scalable API Patterns

### 1. Connection Pooling
```js
mongoose.connect(uri, { maxPoolSize: 10 });
```

### 2. Paginated Queries
```
GET /api/v1/tasks?page=2&limit=20&status=in_progress&priority=high&search=redis
```
Returns:
```json
{
  "data": [...],
  "pagination": { "page": 2, "limit": 20, "total": 147, "pages": 8 }
}
```

### 3. Parallel Aggregation
```js
const [tasks, total] = await Promise.all([
  Task.find(filter).skip(skip).limit(limit),
  Task.countDocuments(filter),
]);
```

### 4. Database Indexes
```js
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ title: "text", description: "text" }); // Full-text search
```

### 5. Rate Limiting
- Global: 200 req / 15 min
- Auth routes: 20 req / 15 min (brute-force protection)

### 6. JWT Refresh Token Rotation
- Access token: 15 minutes
- Refresh token: 7 days, stored in DB
- Auto-refresh queue in Axios interceptor (prevents concurrent refresh storms)

### 7. Request Abort Controller
Frontend hooks cancel in-flight requests on param change to prevent race conditions:
```js
abortRef.current = new AbortController();
const { data } = await fetchFn(params, { signal: abortRef.current.signal });
```

---

## Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT secrets
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/taskmaster
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## API Reference

| Method | Endpoint | Auth | Permission |
|--------|----------|------|------------|
| POST | /api/v1/auth/register | — | — |
| POST | /api/v1/auth/login | — | — |
| POST | /api/v1/auth/refresh | — | — |
| GET | /api/v1/auth/me | ✓ | — |
| GET | /api/v1/tasks | ✓ | view:assigned |
| POST | /api/v1/tasks | ✓ | create:task |
| PATCH | /api/v1/tasks/:id | ✓ | update:assigned |
| DELETE | /api/v1/tasks/:id | ✓ | delete:task |
| GET | /api/v1/tasks/stats | ✓ | — |
| GET | /api/v1/projects | ✓ | — |
| POST | /api/v1/projects | ✓ | manager+ |
| PATCH | /api/v1/projects/:id | ✓ | project manager |
| DELETE | /api/v1/projects/:id | ✓ | admin |
| GET | /api/v1/users | ✓ | admin |
| PATCH | /api/v1/users/:id/role | ✓ | manage:roles |
