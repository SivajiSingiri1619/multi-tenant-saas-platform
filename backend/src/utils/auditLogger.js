const prisma = require("../config/prisma");

async function logAudit({
  tenantId = null,
  userId = null,
  action,
  entityType = null,
  entityId = null,
  ipAddress = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
}

module.exports = logAudit;
