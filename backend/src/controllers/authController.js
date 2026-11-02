import bcrypt from "bcrypt";
import User from "../models/User.js";
import Membership from "../models/Membership.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";

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
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    token,
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

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
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
    if (!name.trim()) throw new ApiError(400, "Name cannot be empty.");
    updates.name = name.trim();
  }

  if (avatar !== undefined) updates.avatar = avatar;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: { user },
  });
});

// PATCH /api/v1/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required.");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must contain at least 8 characters.");
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

  res.status(200).json({
    success: true,
    message: "Password changed successfully. Please login again if required.",
  });
});
