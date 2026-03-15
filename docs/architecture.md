# System Architecture Document
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. System Architecture Overview

This system follows a standard three-tier architecture consisting of a frontend client, backend API server, and a relational database. The architecture is designed to support multi-tenancy with strict data isolation, role-based access control, and scalable deployment.

### High-Level Components
- Client (Web Browser)
- Frontend Application (React)
- Backend API Server (Node.js + Express)
- Database (PostgreSQL)
- Authentication (JWT-based)

All components are containerized using Docker for consistent local execution and automated evaluation.

---

## 2. Architecture Diagram

The system architecture diagram illustrates the following flow:

1. The user interacts with the application through a web browser.
2. The browser communicates with the frontend React application.
3. The frontend sends authenticated API requests to the backend server.
4. The backend validates JWT tokens, enforces role-based access control, and applies tenant isolation.
5. The backend communicates with the PostgreSQL database using Prisma ORM.
6. Responses are sent back to the frontend for rendering.

**Diagram Location:**  
`docs/images/system-architecture.png`

---

## 3. Database Schema Design (ERD)

The database schema is designed around tenant-based data isolation using a shared database and shared schema approach.

### Core Tables
- tenants
- users
- projects
- tasks
- audit_logs

### Key Design Considerations
- Every tenant-specific table includes a `tenant_id` column.
- Foreign key constraints enforce relational integrity.
- Composite unique constraint on `(tenant_id, email)` ensures per-tenant email uniqueness.
- Cascade delete rules maintain data consistency.

**ERD Location:**  
`docs/images/database-erd.png`

---

## 4. API Architecture

The backend exposes RESTful APIs organized by functional modules.

### Authentication APIs
- POST /api/auth/register-tenant
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

### Tenant APIs
- GET /api/tenants/:tenantId
- PUT /api/tenants/:tenantId
- GET /api/tenants (super admin only)

### User APIs
- POST /api/tenants/:tenantId/users
- GET /api/tenants/:tenantId/users
- PUT /api/users/:userId
- DELETE /api/users/:userId

### Project APIs
- POST /api/projects
- GET /api/projects
- PUT /api/projects/:projectId
- DELETE /api/projects/:projectId

### Task APIs
- POST /api/projects/:projectId/tasks
- GET /api/projects/:projectId/tasks
- PATCH /api/tasks/:taskId/status
- PUT /api/tasks/:taskId

---

## 5. Authentication & Authorization Flow

- Users authenticate using email, password, and tenant subdomain.
- On successful login, the backend issues a JWT token.
- The JWT contains user ID, tenant ID, and role.
- Middleware validates the token on each request.
- Role-based guards restrict access to protected endpoints.
- Tenant isolation is enforced by filtering queries using tenant ID.

---

## 6. Tenant Isolation Strategy

Tenant isolation is implemented at the application layer using middleware and consistent query filtering. The backend never trusts tenant identifiers provided by the client and always derives tenant context from the authenticated user or parent entities.

This approach ensures strict data isolation while maintaining scalability and simplicity.
