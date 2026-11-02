import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import emitTenantEvent from "../utils/socketEmitter.js";

// POST /api/v1/tenants/:tenantId/boards
export const createBoard = asyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;

  if (!name?.trim()) throw new ApiError(400, "Board name is required.");

  const board = await Board.create({
    name: name.trim(),
    description,
    organizationId: req.organizationId,
    tenantId: req.tenantId,
    createdBy: req.user._id,
  });

  emitTenantEvent(req, req.tenantId, "board:created", { board });

  res.status(201).json({
    success: true,
    message: "Board created successfully.",
    data: { board },
  });
});

// GET /api/v1/tenants/:tenantId/boards
export const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: boards.length,
    data: { boards },
  });
});

// GET /api/v1/tenants/:tenantId/boards/:boardId
export const getBoardById = asyncHandler(async (req, res) => {
  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!board) throw new ApiError(404, "Board not found.");

  const [columns, tasks] = await Promise.all([
    Column.find({
      boardId: board._id,
      tenantId: req.tenantId,
    }).sort({ position: 1 }),
    Task.find({
      boardId: board._id,
      tenantId: req.tenantId,
    })
      .populate("assignedTo", "name email avatar")
      .sort({ columnId: 1, position: 1 }),
  ]);

  res.status(200).json({
    success: true,
    data: { board, columns, tasks },
  });
});

// PATCH /api/v1/tenants/:tenantId/boards/:boardId
export const updateBoard = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.description !== undefined) {
    updates.description = req.body.description;
  }

  if (!Object.keys(updates).length) {
    throw new ApiError(400, "Provide a name or description to update.");
  }

  const board = await Board.findOneAndUpdate(
    {
      _id: req.params.boardId,
      tenantId: req.tenantId,
      organizationId: req.organizationId,
    },
    updates,
    { new: true, runValidators: true }
  );

  if (!board) throw new ApiError(404, "Board not found.");

  emitTenantEvent(req, req.tenantId, "board:updated", { board });

  res.status(200).json({
    success: true,
    message: "Board updated successfully.",
    data: { board },
  });
});

// DELETE /api/v1/tenants/:tenantId/boards/:boardId
export const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!board) throw new ApiError(404, "Board not found.");

  await Task.deleteMany({
    boardId: board._id,
    tenantId: req.tenantId,
  });
  await Column.deleteMany({
    boardId: board._id,
    tenantId: req.tenantId,
  });
  await board.deleteOne();

  emitTenantEvent(req, req.tenantId, "board:deleted", {
    boardId: board._id,
  });

  res.status(200).json({
    success: true,
    message: "Board and its columns/tasks deleted successfully.",
  });
});
