import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getUserById,
  getUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:userId", protect, getUserById);
router.get("/", protect, getUsers);

export default router;
