# Research Document
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Multi-Tenancy Analysis

Multi-tenancy is a core architectural concept in Software-as-a-Service (SaaS) applications. A multi-tenant system allows multiple organizations (tenants) to share the same application infrastructure while ensuring strict data isolation, security, and performance guarantees. Choosing the correct multi-tenancy approach is critical, as it directly impacts scalability, cost, security, and system complexity.

This section analyzes three common multi-tenancy approaches and justifies the approach chosen for this project.

---

### 1.1 Shared Database + Shared Schema (Tenant ID Column)

#### Description  
In this approach, all tenants share a single database and a single schema. Every table includes a `tenant_id` column, which is used to identify and isolate data belonging to each tenant. All queries are filtered using this `tenant_id`.

#### Pros  
- Simplest and most cost-effective approach to implement  
- Easy to manage and maintain a single database  
- Efficient resource utilization  
- Easy to scale horizontally for small-to-medium SaaS products  
- Works well with ORMs like Prisma  
- Ideal for containerized environments (Docker)

#### Cons  
- Requires strict discipline in enforcing `tenant_id` filtering  
- A bug in query logic can potentially expose data across tenants  
- Not ideal for extremely large tenants with massive datasets  

---

### 1.2 Shared Database + Separate Schema per Tenant

#### Description  
In this approach, tenants share the same database server, but each tenant has its own schema. For example, tenant A may use `tenant_a.users`, while tenant B uses `tenant_b.users`.

#### Pros  
- Better logical isolation compared to shared schema  
- Easier to run per-tenant migrations or customizations  
- Reduces risk of accidental cross-tenant data access  

#### Cons  
- Increased complexity in schema management  
- Harder to manage migrations across many tenants  
- ORM support is more complex  
- Scaling to many tenants becomes difficult  
- Less suitable for automated evaluation environments  

---

### 1.3 Separate Database per Tenant

#### Description  
In this approach, each tenant has its own dedicated database. The application dynamically connects to the appropriate database based on the tenant context.

#### Pros  
- Strongest data isolation and security  
- Easy to comply with strict regulatory requirements  
- Independent scaling per tenant  

#### Cons  
- High infrastructure and operational cost  
- Complex connection management  
- Difficult to manage migrations and backups  
- Not suitable for small-to-medium SaaS products  
- Overkill for learning-focused and evaluation-based projects  

---

### 1.4 Comparison Table

| Approach | Cost | Complexity | Isolation | Scalability | Suitability |
|--------|------|------------|-----------|-------------|-------------|
| Shared DB + Shared Schema | Low | Low | Medium | High | Excellent |
| Shared DB + Separate Schema | Medium | Medium | High | Medium | Moderate |
| Separate DB per Tenant | High | High | Very High | High | Low |

---

### 1.5 Chosen Approach & Justification

For this project, the **Shared Database + Shared Schema with `tenant_id` column** approach has been chosen.

This approach provides the best balance between simplicity, scalability, and maintainability. It is widely used in real-world SaaS products and is well-suited for a project that requires strict data isolation, role-based access control, Docker-based evaluation, and automated testing.

By enforcing tenant isolation at the application layer using authentication middleware and consistent query filtering, the risks associated with this approach can be effectively mitigated. Additionally, this approach aligns perfectly with ORM-based development, containerized environments, and automated evaluation requirements.

---

## 2. Technology Stack Justification

This project uses a modern, industry-relevant full-stack technology stack designed to balance development speed, scalability, and maintainability.

### Backend Framework – Node.js with Express  
Node.js with Express was chosen due to its simplicity, flexibility, and vast ecosystem. Express provides full control over middleware, authentication, and request handling, making it ideal for implementing role-based access control and tenant isolation logic. Alternatives such as FastAPI and Django were considered, but Node.js was preferred due to familiarity and strong community support.

### Frontend Framework – React  
React was selected for building the frontend user interface due to its component-based architecture, efficient rendering, and widespread industry adoption. React makes it easy to implement protected routes, role-based UI rendering, and responsive layouts. Alternatives such as Angular and Vue were considered, but React was chosen for its flexibility and ecosystem.

### Database – PostgreSQL  
PostgreSQL was chosen for its reliability, strong relational integrity, and support for advanced indexing and constraints. It works seamlessly with Prisma and is well-suited for multi-tenant relational data models. MySQL was considered as an alternative, but PostgreSQL offers better support for complex queries and scalability.

### ORM – Prisma  
Prisma was selected as the ORM due to its type-safe query building, migration support, and clean schema definition. Prisma simplifies database access while reducing the risk of SQL injection and query errors.

### Authentication – JWT  
JSON Web Tokens (JWT) were chosen for authentication due to their stateless nature and suitability for distributed systems. JWT allows secure authentication without requiring server-side session storage, making it ideal for Dockerized and cloud-deployed applications.

### Deployment Platforms  
- **Frontend**: Vercel (optimized for React applications)  
- **Backend**: Render (easy deployment for Node.js services)  
- **Database**: Managed PostgreSQL service  

Docker is used for local development and evaluation to ensure consistency and reproducibility across environments.

---

## 3. Security Considerations

Security is a critical aspect of any multi-tenant SaaS application. The following security measures are implemented in this project:

1. **Data Isolation**  
   All tenant-specific data is isolated using a `tenant_id` column. Every database query is filtered using the tenant ID derived from the authenticated user context.

2. **Authentication & Authorization**  
   JWT-based authentication is used with a fixed expiration time of 24 hours. Role-based access control (RBAC) ensures that only authorized users can access specific API endpoints.

3. **Password Hashing**  
   User passwords are securely hashed using bcrypt before being stored in the database. Plain-text passwords are never stored or transmitted.

4. **Input Validation**  
   All API inputs are validated at the backend to prevent malformed requests, invalid data, and potential injection attacks.

5. **API Security**  
   Sensitive endpoints are protected using authentication middleware. Proper HTTP status codes are returned for unauthorized and forbidden access attempts.

These security practices ensure that the application maintains strong protection against common vulnerabilities while preserving strict tenant isolation.
