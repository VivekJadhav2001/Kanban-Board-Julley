import ActivityLog from "../models/ActivityLog.js";
import Task from "../models/Task.js";
import Board from "../models/Board.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// GET /api/v1/tenants/:tenantId/activity
export const getActivityLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
    100
  );

  const filter = {
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  };

  if (req.query.boardId) filter.boardId = req.query.boardId;
  if (req.query.taskId) filter.taskId = req.query.taskId;
  if (req.query.action) filter.action = req.query.action;

  const [activities, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: activities.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: { activities },
  });
});

// GET /api/v1/tasks/:taskId/activity
export const getTaskActivity = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.taskId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  }).select("_id");

  if (!task) throw new ApiError(404, "Task not found.");

  const activities = await ActivityLog.find({
    taskId: task._id,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  })
    .populate("userId", "name email avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: activities.length,
    data: { activities },
  });
});

// GET /api/v1/boards/:boardId/activity
export const getBoardActivity = asyncHandler(async (req, res) => {
  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  }).select("_id");

  if (!board) throw new ApiError(404, "Board not found.");

  const activities = await ActivityLog.find({
    boardId: board._id,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  })
    .populate("userId", "name email avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: activities.length,
    data: { activities },
  });
});
