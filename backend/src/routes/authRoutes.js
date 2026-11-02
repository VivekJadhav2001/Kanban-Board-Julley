import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.patch("/profile", protect, updateUserProfile);
router.patch("/change-password", protect, changePassword);

export default router;
