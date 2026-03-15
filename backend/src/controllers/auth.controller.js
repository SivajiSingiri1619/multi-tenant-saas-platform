const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");

// -----------------------------
// REGISTER TENANT
// -----------------------------
exports.registerTenant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const {
    tenantName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName,
  } = req.body;

  try {
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (existingTenant) {
      return res
        .status(409)
        .json({ success: false, message: "Subdomain already exists" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: adminEmail },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          subdomain,
          status: "active",
          subscriptionPlan: "free",
          maxUsers: 5,
          maxProjects: 3,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          fullName: adminFullName,
          role: "tenant_admin",
          tenantId: tenant.id,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: adminUser.id,
          action: "REGISTER_TENANT",
          entityType: "tenant",
          entityId: tenant.id,
          ipAddress: req.ip,
        },
      });

      return { tenant, adminUser };
    });

    return res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId: result.tenant.id,
        subdomain: result.tenant.subdomain,
        adminUser: {
          id: result.adminUser.id,
          email: result.adminUser.email,
          fullName: result.adminUser.fullName,
          role: result.adminUser.role,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------------------
// LOGIN
// -----------------------------
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, tenantSubdomain } = req.body;

  try {
    // SUPER ADMIN LOGIN
    if (!tenantSubdomain) {
      const user = await prisma.user.findFirst({
        where: { email, role: "super_admin" },
      });

      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.passwordHash
      );
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        tenantId: null,
        role: user.role,
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN_SUPER_ADMIN",
          entityType: "user",
          entityId: user.id,
          ipAddress: req.ip,
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          token,
        },
      });
    }

    // TENANT USER LOGIN
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSubdomain },
    });

    if (!tenant || tenant.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Tenant not accessible" });
    }

    const user = await prisma.user.findFirst({
      where: { email, tenantId: tenant.id },
    });

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        action: "LOGIN",
        entityType: "user",
        entityId: user.id,
        ipAddress: req.ip,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          tenantId: user.tenantId,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------------------
// ME (READ ONLY)
// -----------------------------
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { tenant: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        tenant: user.tenant
          ? {
              id: user.tenant.id,
              name: user.tenant.name,
              subdomain: user.tenant.subdomain,
              subscriptionPlan: user.tenant.subscriptionPlan,
              maxUsers: user.tenant.maxUsers,
              maxProjects: user.tenant.maxProjects,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------------------
// LOGOUT
// -----------------------------
exports.logout = async (req, res) => {
  await prisma.auditLog.create({
    data: {
      tenantId: req.user.tenantId,
      userId: req.user.userId,
      action: "LOGOUT",
      entityType: "user",
      entityId: req.user.userId,
      ipAddress: req.ip,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
