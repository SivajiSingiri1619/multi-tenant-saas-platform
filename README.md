# Multi-Tenant SaaS Platform

A full-stack project and task management system built for a multi-tenant SaaS use case. Each organization works inside its own tenant, users are restricted by role, and tenant-scoped data is isolated in the backend and database layers.

This project includes:
- a React frontend
- a Node.js + Express backend
- Prisma ORM with PostgreSQL
- Docker-based local setup
- seeded demo data for evaluation

## Task Focus

This implementation is designed around the core requirements of a multi-tenant SaaS assignment:
- tenant registration with unique subdomains
- JWT-based authentication
- role-based access control
- strict tenant isolation
- project and task management
- subscription plan limits
- audit logging
- containerized local execution

## Core Features

- Multi-tenant architecture using a shared database and shared schema model
- Tenant-aware authorization using JWT payloads and middleware
- Roles: `super_admin`, `tenant_admin`, `user`
- Tenant onboarding with subdomain-based login
- User management within a tenant
- Project CRUD for tenant admins
- Task creation, assignment, update, and status tracking
- Tenant plan and status management for super admins
- Audit logs for important platform actions
- Prisma schema mapped to snake_case database columns

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- Prisma
- JSON Web Token
- bcrypt

### Database
- PostgreSQL

### Tooling
- Docker
- Docker Compose
- Postman collection for API testing

## Architecture Summary

The system uses a 3-layer structure:

1. Frontend client for authentication and dashboard workflows
2. Backend REST API for business logic, RBAC, and tenant isolation
3. PostgreSQL database managed through Prisma

Tenant isolation is enforced by:
- storing tenant ownership on tenant-scoped records
- deriving tenant context from the authenticated user
- filtering queries through tenant-aware backend logic

## Roles

### Super Admin
- view all tenants
- update tenant subscription plans
- activate or suspend tenants

### Tenant Admin
- manage users in their own tenant
- create, update, and delete projects
- create, assign, update, and delete tasks
- update their tenant details

### User
- view tenant projects
- view project tasks
- update assigned task status

## Project Structure

```text
multi-tenant-saas-platform/
|-- backend/
|   |-- prisma/
|   |-- src/
|-- frontend/
|   |-- src/
|-- docs/
|-- docker-compose.yml
|-- Multi-Tenant-SaaS.postman_collection.json
|-- README.md
```

## API Modules

The backend is organized into these main route groups:

- `/api/health`
- `/api/auth`
- `/api/tenants`
- `/api/users`
- `/api/projects`
- `/api/tasks`

Examples:
- `POST /api/auth/register-tenant`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:id/status`

## Database Notes

Prisma is used as the ORM and the database schema is designed for tenant-aware data isolation.

Important implementation details:
- tenant-owned tables use `tenant_id`
- email uniqueness is enforced per tenant
- relations use foreign keys with cascade behavior where appropriate
- Prisma fields remain developer-friendly while database columns are mapped to snake_case such as:
  - `subscription_plan`
  - `max_users`
  - `created_at`
  - `tenant_id`
  - `password_hash`
  - `created_by_id`

## Prerequisites

- Node.js 18+ for backend local development
- Node.js 20+ or current LTS for frontend local development
- Docker Desktop or Docker Engine

## Environment Variables

### Backend

Common backend variables used in this project:

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`

### Frontend

- `VITE_API_URL`

## Quick Start With Docker

This is the recommended way to run the project.

```bash
docker compose up --build
```

Default local URLs:
- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/api/health`
- PostgreSQL: `localhost:5432`

To stop containers:

```bash
docker compose down
```

To stop containers and remove database volume:

```bash
docker compose down -v
```

## Local Development

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server:
- `http://localhost:3000`

## Seeded Demo Accounts

The seed script creates a demo tenant and test users.

### Super Admin
- Email: `superadmin@system.com`
- Password: `Admin@123`
- Tenant subdomain: not required

### Demo Tenant
- Tenant name: `Demo Company`
- Subdomain: `demo`
- Plan: `pro`

### Tenant Admin
- Email: `admin@demo.com`
- Password: `Demo@123`
- Tenant subdomain: `demo`

### Demo Users
- `user1@demo.com` / `User@123`
- `user2@demo.com` / `User@123`
- Tenant subdomain: `demo`

## Testing The APIs

A Postman collection is included in the root of the project:

- `Multi-Tenant-SaaS.postman_collection.json`

Import it into Postman and test authentication, tenant flows, project APIs, task APIs, and admin actions.

## Documentation

Additional task-related documents are available in the `docs/` folder:

- `docs/PRD.md`
- `docs/architecture.md`
- `docs/technical-spec.md`
- `docs/research.md`

These documents cover product scope, architecture, technical decisions, and the selected multi-tenancy approach.

## Troubleshooting

### Port already in use

If Docker fails because a port is already allocated:
- check whether port `3000`, `5000`, or `5432` is already used by another app
- stop the conflicting service, or
- update the host port mapping in `docker-compose.yml`

### Prisma or database reset

If you want a clean local database:

```bash
docker compose down -v
docker compose up --build
```

## Summary

This project demonstrates a practical multi-tenant SaaS platform with:
- secure authentication
- tenant-scoped data access
- role-based controls
- project and task workflows
- Prisma + PostgreSQL persistence
- Docker-based execution for evaluation
