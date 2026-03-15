const { validationResult } = require("express-validator");
const prisma = require("../config/prisma");

// -----------------------------
// CREATE TASK
// -----------------------------
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { projectId } = req.params;
  const { title, description, priority, assignedToId, dueDate } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Verify project belongs to tenant
      const project = await tx.project.findFirst({
        where: { id: projectId, tenantId: req.tenantId },
      });
      if (!project) {
        throw { status: 404, message: "Project not found" };
      }

      // Validate assigned user
      if (assignedToId) {
        const user = await tx.user.findFirst({
          where: {
            id: assignedToId,
            tenantId: req.tenantId,
            isActive: true,
          },
        });
        if (!user) {
          throw {
            status: 400,
            message: "Assigned user not found in tenant",
          };
        }
      }

      const task = await tx.task.create({
        data: {
          title,
          description,
          priority: priority || "medium",
          tenantId: req.tenantId,
          projectId,
          assignedToId,
          dueDate,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.userId,
          action: "CREATE_TASK",
          entityType: "task",
          entityId: task.id,
          ipAddress: req.ip,
        },
      });

      return task;
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// -----------------------------
// LIST TASKS
// -----------------------------
exports.listTasks = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        tenantId: req.tenantId,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -----------------------------
// UPDATE TASK
// -----------------------------
exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, priority, assignedToId } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id, tenantId: req.tenantId },
      });
      if (!task) {
        throw { status: 404, message: "Task not found" };
      }

      if (assignedToId !== undefined) {
        const user = await tx.user.findFirst({
          where: {
            id: assignedToId,
            tenantId: req.tenantId,
            isActive: true,
          },
        });
        if (!user) {
          throw {
            status: 400,
            message: "Assigned user not found in tenant",
          };
        }
      }

      const updated = await tx.task.update({
        where: { id, tenantId: req.tenantId },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(priority !== undefined && { priority }),
          ...(assignedToId !== undefined && { assignedToId }),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.userId,
          action: "UPDATE_TASK",
          entityType: "task",
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
// UPDATE TASK STATUS
// -----------------------------
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id, tenantId: req.tenantId },
      });
      if (!task) {
        throw { status: 404, message: "Task not found" };
      }

      if (
        req.user.role === "user" &&
        task.assignedToId !== req.user.userId
      ) {
        throw {
          status: 403,
          message: "You can only update your assigned tasks",
        };
      }

      const updated = await tx.task.update({
        where: { id, tenantId: req.tenantId },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.userId,
          action: "UPDATE_TASK_STATUS",
          entityType: "task",
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
// DELETE TASK
// -----------------------------
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: { id, tenantId: req.tenantId },
      });
      if (!task) {
        throw { status: 404, message: "Task not found" };
      }

      await tx.task.delete({
        where: { id, tenantId: req.tenantId },
      });

      await tx.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user.userId,
          action: "DELETE_TASK",
          entityType: "task",
          entityId: id,
          ipAddress: req.ip,
        },
      });
    });

    return res
      .status(200)
      .json({ success: true, message: "Task deleted" });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
