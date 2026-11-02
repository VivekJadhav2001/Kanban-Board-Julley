
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Helper to get token from cookie or Authorization header
const getToken = (req) => {
  // First priority: HTTP-only cookie
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  // Optional fallback: Bearer token
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

// Protect routes - User must be logged in
export const protect = asyncHandler(async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    throw new ApiError(401, "Not authorized. Please login.");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token.");
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "User not found. Please login again.");
  }

  req.user = user;

  next();
});

// Optional authentication - User login is not compulsory
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    req.user = user || null;
  } catch (error) {
    req.user = null;
  }

  next();
});
