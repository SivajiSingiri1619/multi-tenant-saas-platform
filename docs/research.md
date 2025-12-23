# Research Document

## 1. Multi-Tenancy Analysis

Multi-tenancy is an architectural pattern where a single application instance serves multiple organizations, known as tenants, while ensuring complete data isolation between them. Each tenant operates as if they have their own independent system, even though they share the same underlying infrastructure.

In a multi-tenant SaaS application, users belong to a specific tenant, and all resources such as users, projects, and tasks are associated with that tenant. A critical requirement of multi-tenancy is that data belonging to one tenant must never be accessible to another tenant, even in cases of API manipulation or unauthorized access attempts.

### Multi-Tenancy Approaches

There are three commonly used multi-tenancy approaches in industry:

#### 1. Shared Database + Shared Schema

In this approach, all tenants share a single database and a single set of tables. Each table contains a `tenant_id` column that identifies which tenant a particular record belongs to.

Example:
- One `projects` table stores projects for all tenants.
- Each row contains a `tenant_id` value.

**Advantages:**
- Simple to implement and maintain
- Cost-effective and resource-efficient
- Easy to scale for SaaS MVPs
- Works well with containerized deployments

**Disadvantages:**
- Requires strict enforcement of tenant filtering
- A coding mistake can lead to data leakage

#### 2. Shared Database + Separate Schema

In this approach, a single database is used, but each tenant has its own schema. Tables are duplicated per tenant under different schemas.

**Advantages:**
- Better logical separation than shared schema
- Reduced risk of accidental data access

**Disadvantages:**
- Complex database migrations
- Increased operational overhead
- Difficult to manage at scale

#### 3. Separate Database per Tenant

In this approach, each tenant has a completely separate database.

**Advantages:**
- Maximum data isolation
- Strong security guarantees

**Disadvantages:**
- High infrastructure cost
- Difficult to scale and manage
- Not suitable for MVPs or academic projects

### Chosen Approach

For this project, the **Shared Database + Shared Schema with tenant_id** approach is selected.

This approach aligns well with the project requirements, supports efficient Docker-based deployment, and is widely used in production SaaS applications. Tenant isolation is enforced at the application layer by extracting `tenant_id` from authenticated JWT tokens and applying it to all database queries. Super admin users are an exception and have a `tenant_id` value of NULL, allowing them to access data across tenants.

By enforcing tenant isolation strictly at the backend level and never trusting client-provided tenant identifiers, the system ensures strong data security while maintaining scalability and simplicity.


## 2. Technology Stack Justification

Choosing the right technology stack is critical for building a scalable, secure, and maintainable multi-tenant SaaS application. The selected stack for this project was chosen based on industry best practices, project requirements, and ease of integration with Docker-based deployment.

### Frontend: React (with Vite)

React is a popular JavaScript library for building user interfaces using a component-based architecture. It allows the application to be broken down into reusable components, making the UI easy to maintain and extend. React is well suited for role-based user interfaces, where different users see different features based on their permissions.

Vite is used as the build tool for React due to its fast development server and optimized build process. It provides quicker startup times compared to traditional tools and integrates well with Docker containers.

### Backend: Node.js with Express

Node.js is a widely used runtime for building scalable backend services using JavaScript. Express is a lightweight and flexible framework built on top of Node.js that simplifies REST API development.

This combination is ideal for multi-tenant SaaS applications because it supports middleware-based architecture, making it easy to implement authentication, authorization, tenant isolation, and audit logging. The non-blocking I/O model of Node.js also ensures good performance under concurrent usage.

### Database: PostgreSQL

PostgreSQL is a powerful relational database known for its reliability, performance, and strong support for ACID transactions. It is well suited for multi-tenant systems that require strict data integrity and relational consistency.

PostgreSQL supports foreign key constraints, indexing, and cascading deletes, which are essential for enforcing tenant isolation and maintaining relationships between users, projects, and tasks.

### Authentication: JSON Web Tokens (JWT)

JWT-based authentication is used to provide stateless and secure user authentication. Tokens contain essential user information such as user ID, tenant ID, and role, which allows the backend to enforce authorization rules without storing session data.

JWT is ideal for containerized applications because it scales well and does not require shared session storage.

### DevOps: Docker and Docker Compose

Docker is used to containerize the backend, frontend, and database services. Docker Compose is used to orchestrate these services and allow the entire application to be started with a single command.

This approach ensures consistent environments across development and evaluation systems and simplifies automated testing and deployment.

### Documentation: Markdown

Markdown is used for all documentation due to its simplicity and readability. It integrates well with GitHub repositories and allows clear presentation of technical content without additional tooling.

Overall, this technology stack provides a balance of scalability, security, and developer productivity, making it suitable for a production-ready multi-tenant SaaS application.


## 3. Security Considerations

(To be written)
