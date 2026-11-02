import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  verifyTenantAccess,
  setBoardTenantContext,
  setColumnTenantContext,
} from "../middlewares/tenantMiddleware.js";
import {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from "../controllers/columnController.js";

const router = express.Router();

router.post(
  "/boards/:boardId/columns",
  protect,
  setBoardTenantContext,
  verifyTenantAccess,
  createColumn
);
router.get("/boards/:boardId/columns", protect, setBoardTenantContext, verifyTenantAccess, getColumns);
router.patch("/columns/:columnId", protect, setColumnTenantContext, verifyTenantAccess, updateColumn);
router.delete("/columns/:columnId", protect, setColumnTenantContext, verifyTenantAccess, deleteColumn);
router.patch(
  "/boards/:boardId/columns/reorder",
  protect,
  setBoardTenantContext,
  verifyTenantAccess,
  reorderColumns
);

export default router;
