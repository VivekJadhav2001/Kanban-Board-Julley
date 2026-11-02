import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  setTenantContext,
  verifyTenantAccess,
} from "../middlewares/tenantMiddleware.js";
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
} from "../controllers/boardController.js";

const router = express.Router();

router.post(
  "/tenants/:tenantId/boards",
  protect,
  setTenantContext,
  verifyTenantAccess,
  createBoard
);
router.get(
  "/tenants/:tenantId/boards",
  protect,
  setTenantContext,
  verifyTenantAccess,
  getBoards
);
router.get(
  "/tenants/:tenantId/boards/:boardId",
  protect,
  setTenantContext,
  verifyTenantAccess,
  getBoardById
);
router.patch(
  "/tenants/:tenantId/boards/:boardId",
  protect,
  setTenantContext,
  verifyTenantAccess,
  updateBoard
);
router.delete(
  "/tenants/:tenantId/boards/:boardId",
  protect,
  setTenantContext,
  verifyTenantAccess,
  deleteBoard
);

export default router;
