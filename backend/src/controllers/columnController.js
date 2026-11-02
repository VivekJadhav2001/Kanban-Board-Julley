import Column from "../models/Column.js";
import Board from "../models/Board.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import emitTenantEvent from "../utils/socketEmitter.js";

// POST /api/v1/boards/:boardId/columns
export const createColumn = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) throw new ApiError(400, "Column name is required.");

  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!board) throw new ApiError(404, "Board not found.");

  const lastColumn = await Column.findOne({
    boardId: board._id,
    tenantId: req.tenantId,
  }).sort({ position: -1 });

  const column = await Column.create({
    name: name.trim(),
    boardId: board._id,
    organizationId: req.organizationId,
    tenantId: req.tenantId,
    position: lastColumn ? lastColumn.position + 1000 : 1000,
    createdBy: req.user._id,
  });

  emitTenantEvent(req, req.tenantId, "column:created", { column });

  res.status(201).json({
    success: true,
    message: "Column created successfully.",
    data: { column },
  });
});

// GET /api/v1/boards/:boardId/columns
export const getColumns = asyncHandler(async (req, res) => {
  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!board) throw new ApiError(404, "Board not found.");

  const columns = await Column.find({
    boardId: board._id,
    tenantId: req.tenantId,
  }).sort({ position: 1 });

  res.status(200).json({
    success: true,
    results: columns.length,
    data: { columns },
  });
});

// PATCH /api/v1/columns/:columnId
export const updateColumn = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name.trim();

  if (!Object.keys(updates).length) {
    throw new ApiError(400, "Provide a column name to update.");
  }

  const column = await Column.findOneAndUpdate(
    {
      _id: req.params.columnId,
      tenantId: req.tenantId,
      organizationId: req.organizationId,
    },
    updates,
    { new: true, runValidators: true }
  );

  if (!column) throw new ApiError(404, "Column not found.");

  emitTenantEvent(req, req.tenantId, "column:updated", { column });

  res.status(200).json({
    success: true,
    message: "Column updated successfully.",
    data: { column },
  });
});

// DELETE /api/v1/columns/:columnId
// Refuses deletion while tasks remain; move/delete tasks first.
export const deleteColumn = asyncHandler(async (req, res) => {
  const column = await Column.findOne({
    _id: req.params.columnId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!column) throw new ApiError(404, "Column not found.");

  const hasTasks = await Task.exists({
    columnId: column._id,
    tenantId: req.tenantId,
  });

  if (hasTasks) {
    throw new ApiError(
      409,
      "This column contains tasks. Move or delete them before deleting the column."
    );
  }

  await column.deleteOne();

  emitTenantEvent(req, req.tenantId, "column:deleted", {
    columnId: column._id,
    boardId: column.boardId,
  });

  res.status(200).json({
    success: true,
    message: "Column deleted successfully.",
  });
});

// PATCH /api/v1/boards/:boardId/columns/reorder
// Body: { "columns": [{ "columnId": "...", "position": 1000 }] }
export const reorderColumns = asyncHandler(async (req, res) => {
  const { columns } = req.body;

  if (!Array.isArray(columns) || columns.length === 0) {
    throw new ApiError(400, "A non-empty columns array is required.");
  }

  const board = await Board.findOne({
    _id: req.params.boardId,
    tenantId: req.tenantId,
    organizationId: req.organizationId,
  });

  if (!board) throw new ApiError(404, "Board not found.");

  const existingColumns = await Column.find({
    boardId: board._id,
    tenantId: req.tenantId,
  }).select("_id");

  const allowedIds = new Set(existingColumns.map((item) => item._id.toString()));
  const submittedIds = new Set();

  for (const item of columns) {
    if (
      !item.columnId ||
      !Number.isFinite(item.position) ||
      !allowedIds.has(item.columnId) ||
      submittedIds.has(item.columnId)
    ) {
      throw new ApiError(400, "Invalid or duplicate column reorder data.");
    }
    submittedIds.add(item.columnId);
  }

  await Promise.all(
    columns.map((item) =>
      Column.updateOne(
        {
          _id: item.columnId,
          boardId: board._id,
          tenantId: req.tenantId,
        },
        { $set: { position: item.position } }
      )
    )
  );

  const updatedColumns = await Column.find({
    boardId: board._id,
    tenantId: req.tenantId,
  }).sort({ position: 1 });

  emitTenantEvent(req, req.tenantId, "columns:reordered", {
    boardId: board._id,
    columns: updatedColumns,
  });

  res.status(200).json({
    success: true,
    message: "Columns reordered successfully.",
    data: { columns: updatedColumns },
  });
});
