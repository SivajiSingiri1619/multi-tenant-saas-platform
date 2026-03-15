const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const superAdminPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.user.create({
    data: {
      email: "superadmin@system.com",
      passwordHash: superAdminPassword,
      fullName: "System Super Admin",
      role: "super_admin",
      tenantId: null,
    },
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: "Demo Company",
      subdomain: "demo",
      status: "active",
      subscriptionPlan: "pro",
      maxUsers: 25,
      maxProjects: 15,
    },
  });

  const adminPassword = await bcrypt.hash("Demo@123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      passwordHash: adminPassword,
      fullName: "Demo Admin",
      role: "tenant_admin",
      tenantId: tenant.id,
    },
  });

  const userPassword = await bcrypt.hash("User@123", 10);
  const user1 = await prisma.user.create({
    data: {
      email: "user1@demo.com",
      passwordHash: userPassword,
      fullName: "User One",
      role: "user",
      tenantId: tenant.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@demo.com",
      passwordHash: userPassword,
      fullName: "User Two",
      role: "user",
      tenantId: tenant.id,
    },
  });

  const project1 = await prisma.project.create({
    data: {
      name: "Project Alpha",
      status: "active",
      tenantId: tenant.id,
      createdById: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Project Beta",
      status: "active",
      tenantId: tenant.id,
      createdById: admin.id,
    },
  });

  await prisma.task.createMany({
    data: [
      { title: "Task 1", tenantId: tenant.id, projectId: project1.id },
      { title: "Task 2", tenantId: tenant.id, projectId: project1.id },
      { title: "Task 3", tenantId: tenant.id, projectId: project2.id },
      { title: "Task 4", tenantId: tenant.id, projectId: project2.id },
      { title: "Task 5", tenantId: tenant.id, projectId: project2.id },
    ],
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
