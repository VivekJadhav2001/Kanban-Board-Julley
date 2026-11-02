import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  setTenantContext,
  verifyTenantAccess,
  setBoardTenantContext,
  setTaskTenantContext,
} from "../middlewares/tenantMiddleware.js";
import {
  getActivityLogs,
  getTaskActivity,
  getBoardActivity,
} from "../controllers/activityController.js";

const router = express.Router();

router.get(
  "/tenants/:tenantId/activity",
  protect,
  setTenantContext,
  verifyTenantAccess,
  getActivityLogs
);
router.get("/tasks/:taskId/activity", protect, setTaskTenantContext, verifyTenantAccess, getTaskActivity);
router.get("/boards/:boardId/activity", protect, setBoardTenantContext, verifyTenantAccess, getBoardActivity);

export default router;
