const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const prisma = require("../config/prisma");

// -----------------------------
// CREATE USER
// -----------------------------
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, fullName, role } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Enforce per-tenant unique email
      const existing = await tx.user.findFirst({
        where: { email, tenantId: req.tenantId },
      });
      if (existing) {
        throw {
          status: 409,
          message: "Email already exists in this tenant",
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role,
          tenantId: req.tenantId,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.userId,
          action: "CREATE_USER",
          entityType: "user",
          entityId: user.id,
          ipAddress: req.ip,
        },
      });

      return user;
    });

    return res.status(201).json({
      success: true,
      data: {
        id: result.id,
        email: result.email,
        fullName: result.fullName,
        role: result.role,
        isActive: result.isActive,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// -----------------------------
// LIST USERS (READ ONLY)
// -----------------------------
exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.tenantId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------------------
// UPDATE USER
// -----------------------------
exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const { fullName, role } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id, tenantId: req.tenantId },
      });
      if (!user) {
        throw { status: 404, message: "User not found" };
      }

      const updated = await tx.user.update({
        where: { id, tenantId: req.tenantId },
        data: {
          ...(fullName !== undefined && { fullName }),
          ...(role !== undefined && { role }),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.userId,
          action: "UPDATE_USER",
          entityType: "user",
          entityId: updated.id,
          ipAddress: req.ip,
        },
      });

      return updated;
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// -----------------------------
// DELETE (DEACTIVATE) USER
// -----------------------------
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id, tenantId: req.tenantId },
      });

      if (!user) {
        throw { status: 404, message: "User not found" };
      }

      // Prevent deleting yourself
      if (id === req.user.userId) {
        throw {
          status: 400,
          message: "You cannot delete your own account",
        };
      }

      // Prevent deleting last tenant admin
      if (user.role === "tenant_admin") {
        const adminCount = await tx.user.count({
          where: {
            tenantId: req.tenantId,
            role: "tenant_admin",
          },
        });

        if (adminCount <= 1) {
          throw {
            status: 400,
            message: "Tenant must have at least one admin",
          };
        }
      }

      await tx.user.delete({
        where: { id, tenantId: req.tenantId },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.userId,
          action: "DELETE_USER",
          entityType: "user",
          entityId: id,
          ipAddress: req.ip,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
