
import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);
router.patch("/profile", protect, updateUserProfile);
router.patch("/change-password", protect, changePassword);

export default router;
