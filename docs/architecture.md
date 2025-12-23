# System Architecture Document

## 1. System Architecture Overview

The system follows a standard three-tier architecture consisting of a frontend client, a backend API server, and a relational database. This separation of concerns ensures scalability, maintainability, and security.

### High-Level Architecture

- **Client (Browser):** Users interact with the system through a web browser.
- **Frontend Application:** A React-based frontend provides the user interface and communicates with the backend via REST APIs.
- **Backend API Server:** A Node.js and Express-based backend handles business logic, authentication, authorization, and tenant isolation.
- **Database:** PostgreSQL is used to store all application data, including tenants, users, projects, tasks, and audit logs.

### Authentication Flow

1. The user submits login credentials through the frontend.
2. The backend validates the credentials.
3. Upon successful authentication, the backend generates a JWT token containing user ID, tenant ID, and role.
4. The frontend stores the token and includes it in the Authorization header for all subsequent requests.
5. The backend validates the token on each request and enforces role-based access control and tenant isolation.

This architecture ensures that tenant data is securely isolated and only accessible to authorized users.

## 2. API Architecture

The backend exposes RESTful APIs organized by functional modules. Authentication and authorization are enforced for protected endpoints.

### Authentication APIs
- POST /api/auth/register-tenant (Public)
- POST /api/auth/login (Public)
- GET /api/auth/me (Authenticated)
- POST /api/auth/logout (Authenticated)

### Tenant Management APIs
- GET /api/tenants/:tenantId (Authenticated)
- PUT /api/tenants/:tenantId (Authenticated, Role-based)
- GET /api/tenants (Authenticated, Super Admin only)

### User Management APIs
- POST /api/tenants/:tenantId/users (Authenticated, Tenant Admin)
- GET /api/tenants/:tenantId/users (Authenticated)
- PUT /api/users/:userId (Authenticated)
- DELETE /api/users/:userId (Authenticated, Tenant Admin)

### Project Management APIs
- POST /api/projects (Authenticated)
- GET /api/projects (Authenticated)
- PUT /api/projects/:projectId (Authenticated)
- DELETE /api/projects/:projectId (Authenticated)

### Task Management APIs
- POST /api/projects/:projectId/tasks (Authenticated)
- GET /api/projects/:projectId/tasks (Authenticated)
- PATCH /api/tasks/:taskId/status (Authenticated)
- PUT /api/tasks/:taskId (Authenticated)

## 3. Database Architecture

The database schema is designed to support multi-tenancy with strict data isolation. All tenant-specific tables include a `tenant_id` column to associate records with their respective tenants.

### Core Tables
- **tenants:** Stores organization-level information.
- **users:** Stores user accounts and roles, associated with tenants.
- **projects:** Stores projects created under tenants.
- **tasks:** Stores tasks under projects and tenants.
- **audit_logs:** Stores logs of critical system actions.

Foreign key constraints and cascading deletes are used to maintain referential integrity. Indexes are created on tenant_id columns to improve query performance.

An Entity Relationship Diagram (ERD) is provided separately to visually represent table relationships.
