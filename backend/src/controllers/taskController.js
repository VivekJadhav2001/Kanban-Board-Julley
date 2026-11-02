import mongoose from "mongoose";
import Task from "../models/Task.js";
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Membership from "../models/Membership.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import logActivity from "../utils/activityLogger.js";
import emitTenantEvent from "../utils/socketEmitter.js";

const taskPopulate = [
  { path: "assignedTo", select: "name email avatar" },
  { path: "createdBy", select: "name email avatar" },
];

// Check that a column belongs to the same board and tenant.
const getValidColumn = async (columnId, boardId, tenantId) => {
  const column = await Column.findOne({
    _id: columnId,
    boardId,
    tenantId,
  });

  if (!column) throw new ApiError(400, "Column does not belong to this board.");
  return column;
};

const validateAssignee = async (assignedTo, organizationId, tenantId) => {
  if (!assignedTo) return null;

  const membership = await Membership.findOne({
    userId: assignedTo,
    organizationId,
    tenantId,
    status: "ACTIVE",
  });

  if (!membership) {
    // Organization-wide admins are also allowed to be assigned.
    const orgAdmin = await Membership.findOne({
      userId: assignedTo,
      organizationId,
      tenantId: null,
      role: "ORG_ADMIN",
      status: "ACTIVE",
    });

    if (!orgAdmin) {
      throw new ApiError(400, "Assignee is not an active member of this tenant.");
    }
  }

  return assignedTo;
};

// POST /api/v1/boards/:boardId/tasks
export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description = "",
    columnId,
    assignedTo = null,
    priority = "MEDIUM",
    dueDate = null,
  } = req.body;

  if (!title?.trim() || !columnId) {
    throw new ApiError(400, "Task title and columnId are required.");
  }

  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!board) throw new ApiError(404, "Board not found.");

  const column = await getValidColumn(columnId, board._id, req.tenantId);
  await validateAssignee(
    assignedTo,
    req.organizationId,
    req.tenantId
  );

  const lastTask = await Task.findOne({
    boardId: board._id,
    columnId: column._id,
    tenantId: req.tenantId,
  }).sort({ position: -1 });

  const task = await Task.create({
    title: title.trim(),
    description,
    boardId: board._id,
    columnId: column._id,
    organizationId: req.organizationId,
    tenantId: req.tenantId,
    assignedTo,
    createdBy: req.user._id,
    priority,
    dueDate,
    position: lastTask ? lastTask.position + 1000 : 1000,
    version: 0,
  });

  await logActivity({
    req,
    action: "CREATE",
    boardId: board._id,
    taskId: task._id,
    details: { title: task.title },
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate);

  emitTenantEvent(req, req.tenantId, "task:created", {
    task: populatedTask,
    boardId: board._id,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully.",
    data: { task: populatedTask },
  });
});

// GET /api/v1/boards/:boardId/tasks
export const getTasks = asyncHandler(async (req, res) => {
  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!board) throw new ApiError(404, "Board not found.");

  const filter = {
    boardId: board._id,
    tenantId: req.tenantId,
  };

  if (req.query.columnId) filter.columnId = req.query.columnId;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  const tasks = await Task.find(filter)
    .populate(taskPopulate)
    .sort({ columnId: 1, position: 1 });

  res.status(200).json({
    success: true,
    results: tasks.length,
    data: { tasks },
  });
});

// GET /api/v1/tasks/:taskId
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  }).populate(taskPopulate);

  if (!task) throw new ApiError(404, "Task not found.");

  res.status(200).json({ success: true, data: { task } });
});

// PATCH /api/v1/tasks/:taskId
// Body must include version. Example: { "title": "New title", "version": 0 }
export const updateTask = asyncHandler(async (req, res) => {
  const { version, ...body } = req.body;

  if (!Number.isInteger(version) || version < 0) {
    throw new ApiError(400, "A valid task version is required.");
  }

  const allowedFields = [
    "title",
    "description",
    "priority",
    "dueDate",
    "assignedTo",
  ];
  const updates = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Provide at least one task field to update.");
  }

  if (updates.title !== undefined) {
    if (!updates.title.trim()) throw new ApiError(400, "Title cannot be empty.");
    updates.title = updates.title.trim();
  }

  if (updates.assignedTo !== undefined) {
    await validateAssignee(
      updates.assignedTo,
      req.organizationId,
      req.tenantId
    );
  }

  const oldTask = await Task.findOne({
    _id: req.params.taskId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
    version,
  });

  if (!oldTask) {
    const exists = await Task.exists({
      _id: req.params.taskId,
      tenantId: req.tenantId,
    });

    if (!exists) throw new ApiError(404, "Task not found.");
    throw new ApiError(409, "Task was changed by another user. Refresh and try again.");
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.taskId,
      tenantId: req.tenantId,
      organizationId: req.organizationId,
      version,
    },
    {
      $set: updates,
      $inc: { version: 1 },
    },
    { new: true, runValidators: true }
  ).populate(taskPopulate);

  if (!task) {
    throw new ApiError(409, "Task was changed by another user. Refresh and try again.");
  }

  await logActivity({
    req,
    action: "UPDATE",
    boardId: task.boardId,
    taskId: task._id,
    details: { before: oldTask.toObject(), after: task.toObject() },
  });

  emitTenantEvent(req, req.tenantId, "task:updated", { task });

  res.status(200).json({
    success: true,
    message: "Task updated successfully.",
    data: { task },
  });
});

// DELETE /api/v1/tasks/:taskId
// Body: { "version": 0 }
export const deleteTask = asyncHandler(async (req, res) => {
  const { version } = req.body;

  if (!Number.isInteger(version) || version < 0) {
    throw new ApiError(400, "A valid task version is required in the request body.");
  }

  const task = await Task.findOneAndDelete({
    _id: req.params.taskId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
    version,
  });

  if (!task) {
    const exists = await Task.exists({
      _id: req.params.taskId,
      tenantId: req.tenantId,
    });

    if (!exists) throw new ApiError(404, "Task not found.");
    throw new ApiError(409, "Task was changed by another user. Refresh and try again.");
  }

  await logActivity({
    req,
    action: "DELETE",
    boardId: task.boardId,
    taskId: task._id,
    details: { deletedTask: task.toObject() },
  });

  emitTenantEvent(req, req.tenantId, "task:deleted", {
    taskId: task._id,
    boardId: task.boardId,
  });

  res.status(200).json({
    success: true,
    message: "Task deleted successfully.",
  });
});

// PATCH /api/v1/tasks/:taskId/move
// Body: { "columnId": "...", "position": 1000, "version": 0 }
export const moveTask = asyncHandler(async (req, res) => {
  const { columnId, position, version } = req.body;

  if (!columnId || !Number.isFinite(position)) {
    throw new ApiError(400, "columnId and a valid position are required.");
  }

  if (!Number.isInteger(version) || version < 0) {
    throw new ApiError(400, "A valid task version is required.");
  }

  const oldTask = await Task.findOne({
    _id: req.params.taskId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
    version,
  });

  if (!oldTask) {
    const exists = await Task.exists({
      _id: req.params.taskId,
      tenantId: req.tenantId,
    });
    if (!exists) throw new ApiError(404, "Task not found.");
    throw new ApiError(409, "Task was changed by another user. Refresh and try again.");
  }

  await getValidColumn(columnId, oldTask.boardId, req.tenantId);

  const task = await Task.findOneAndUpdate(
    {
      _id: oldTask._id,
      tenantId: req.tenantId,
      version,
    },
    {
      $set: { columnId, position },
      $inc: { version: 1 },
    },
    { new: true, runValidators: true }
  ).populate(taskPopulate);

  if (!task) {
    throw new ApiError(409, "Task was changed by another user. Refresh and try again.");
  }

  await logActivity({
    req,
    action: "MOVE",
    boardId: task.boardId,
    taskId: task._id,
    details: {
      fromColumnId: oldTask.columnId,
      toColumnId: task.columnId,
      fromPosition: oldTask.position,
      toPosition: task.position,
    },
  });

  emitTenantEvent(req, req.tenantId, "task:moved", { task });

  res.status(200).json({
    success: true,
    message: "Task moved successfully.",
    data: { task },
  });
});

// PATCH /api/v1/tasks/:taskId/reorder
// Body: { "position": 2000, "version": 1 }
export const reorderTasks = asyncHandler(async (req, res) => {
  const { position, version } = req.body;

  if (!Number.isFinite(position)) {
    throw new ApiError(400, "A valid position is required.");
  }
  if (!Number.isInteger(version) || version < 0) {
    throw new ApiError(400, "A valid task version is required.");
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.taskId,
      tenantId: req.tenantId,
      organizationId: req.organizationId,
      version,
    },
    {
      $set: { position },
      $inc: { version: 1 },
    },
    { new: true, runValidators: true }
  ).populate(taskPopulate);

  if (!task) {
    const exists = await Task.exists({
      _id: req.params.taskId,
      tenantId: req.tenantId,
    });
    if (!exists) throw new ApiError(404, "Task not found.");
    throw new ApiError(409, "Task was changed by another user. Refresh and try again.");
  }

  await logActivity({
    req,
    action: "REORDER",
    boardId: task.boardId,
    taskId: task._id,
    details: { position },
  });

  emitTenantEvent(req, req.tenantId, "task:reordered", { task });

  res.status(200).json({
    success: true,
    message: "Task reordered successfully.",
    data: { task },
  });
});

// PATCH /api/v1/tasks/:taskId/assign
// Body: { "assignedTo": "<userId|null>", "version": 0 }
export const assignTask = asyncHandler(async (req, res) => {
  const { assignedTo = null, version } = req.body;

  if (!Number.isInteger(version) || version < 0) {
    throw new ApiError(400, "A valid task version is required.");
  }

  await validateAssignee(assignedTo, req.organizationId, req.tenantId);

  const task = await Task.findOneAndUpdate(
    {
      _id: req.params.taskId,
      tenantId: req.tenantId,
      organizationId: req.organizationId,
      version,
    },
    {
      $set: { assignedTo },
      $inc: { version: 1 },
    },
    { new: true, runValidators: true }
  ).populate(taskPopulate);

  if (!task) {
    const exists = await Task.exists({
      _id: req.params.taskId,
      tenantId: req.tenantId,
    });
    if (!exists) throw new ApiError(404, "Task not found.");
    throw new ApiError(409, "Task was changed by another user. Refresh and try again.");
  }

  await logActivity({
    req,
    action: "ASSIGN",
    boardId: task.boardId,
    taskId: task._id,
    details: { assignedTo },
  });

  emitTenantEvent(req, req.tenantId, "task:assigned", { task });

  res.status(200).json({
    success: true,
    message: "Task assignment updated successfully.",
    data: { task },
  });
});
