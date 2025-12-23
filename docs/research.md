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

(To be written)

## 3. Security Considerations

(To be written)
