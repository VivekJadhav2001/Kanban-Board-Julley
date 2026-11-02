import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  setBoardTenantContext,
  setTaskTenantContext,
  verifyTenantAccess,
} from "../middlewares/tenantMiddleware.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  moveTask,
  reorderTasks,
  assignTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/boards/:boardId/tasks", protect, setBoardTenantContext, verifyTenantAccess, createTask);
router.get("/boards/:boardId/tasks", protect, setBoardTenantContext, verifyTenantAccess, getTasks);
router.get("/tasks/:taskId", protect, setTaskTenantContext, verifyTenantAccess, getTaskById);
router.patch("/tasks/:taskId", protect, setTaskTenantContext, verifyTenantAccess, updateTask);
router.delete("/tasks/:taskId", protect, setTaskTenantContext, verifyTenantAccess, deleteTask);
router.patch("/tasks/:taskId/move", protect, setTaskTenantContext, verifyTenantAccess, moveTask);
router.patch("/tasks/:taskId/reorder", protect, setTaskTenantContext, verifyTenantAccess, reorderTasks);
router.patch("/tasks/:taskId/assign", protect, setTaskTenantContext, verifyTenantAccess, assignTask);

export default router;
