import User from "../models/User.js";
import Membership from "../models/Membership.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// GET /api/v1/users/:userId
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select(
    "name email avatar createdAt"
  );

  if (!user) throw new ApiError(404, "User not found.");

  res.status(200).json({ success: true, data: { user } });
});

// GET /api/v1/users
// Returns users who share an active organization/tenant membership with the requester.
export const getUsers = asyncHandler(async (req, res) => {
  const { tenantId, organizationId } = req.query;

  if (!tenantId && !organizationId) {
    throw new ApiError(400, "Provide tenantId or organizationId.");
  }

  const membershipQuery = { status: "ACTIVE" };

  if (tenantId) membershipQuery.tenantId = tenantId;
  if (organizationId) membershipQuery.organizationId = organizationId;

  const memberships = await Membership.find(membershipQuery).select("userId");
  const userIds = [...new Set(memberships.map((item) => item.userId.toString()))];

  const users = await User.find({ _id: { $in: userIds } }).select(
    "name email avatar"
  );

  res.status(200).json({
    success: true,
    results: users.length,
    data: { users },
  });
});
