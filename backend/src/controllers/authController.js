
import bcrypt from "bcrypt";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import { cookieOptions } from "../utils/cookieOptions.js";

// Helper function to set JWT cookie
const sendTokenCookie = (res, userId) => {
  const token = generateToken(userId);

  res.cookie("token", token, cookieOptions);

  return token;
};

// POST /api/v1/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must contain at least 8 characters.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  sendTokenCookie(res, user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    },
  });
});

// POST /api/v1/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  sendTokenCookie(res, user._id);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    },
  });
});

// POST /api/v1/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

// GET /api/v1/auth/me
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// PATCH /api/v1/auth/profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const updates = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Name cannot be empty.");
    }

    updates.name = name.trim();
  }

  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: {
      user,
    },
  });
});

// PATCH /api/v1/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(
      400,
      "Current password and new password are required."
    );
  }

  if (newPassword.length < 8) {
    throw new ApiError(
      400,
      "New password must contain at least 8 characters."
    );
  }

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  user.password = await bcrypt.hash(newPassword, 12);

  await user.save();

  // Clear existing login cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully. Please login again.",
  });
});
