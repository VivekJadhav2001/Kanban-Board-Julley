import mongoose from "mongoose";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import Membership from "../models/Membership.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// POST /api/v1/organizations/:organizationId/members
// Add an existing registered user. Email invitations can be added later.
export const addMember = asyncHandler(async (req, res) => {
  const { email, tenantId = null, role = "MEMBER" } = req.body;
  const organizationId = req.params.organizationId;

  if (!email) throw new ApiError(400, "Member email is required.");

  const allowedRoles = tenantId ? ["TENANT_ADMIN", "MEMBER"] : ["MEMBER"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      tenantId
        ? "Tenant membership role must be TENANT_ADMIN or MEMBER."
        : "Organization-wide membership can only use MEMBER here."
    );
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User does not exist. Ask them to register first.");
  }

  if (tenantId) {
    const tenant = await Tenant.findOne({
      _id: tenantId,
      organizationId,
      isActive: true,
    });

    if (!tenant) throw new ApiError(404, "Tenant not found in this organization.");
  }

  const membership = await Membership.create({
    userId: user._id,
    organizationId,
    tenantId,
    role,
    status: "ACTIVE",
  });

  res.status(201).json({
    success: true,
    message: "Member added successfully.",
    data: { membership },
  });
});

// GET /api/v1/organizations/:organizationId/members
export const getOrganizationMembers = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    organizationId: req.params.organizationId,
    status: "ACTIVE",
  })
    .populate("userId", "name email avatar")
    .populate("tenantId", "name slug")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: memberships.length,
    data: { memberships },
  });
});

// GET /api/v1/tenants/:tenantId/members
export const getTenantMembers = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    tenantId: req.params.tenantId,
    status: "ACTIVE",
  })
    .populate("userId", "name email avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: memberships.length,
    data: { memberships },
  });
});

// PATCH /api/v1/members/:membershipId/role
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const existingMembership = await Membership.findOne({
    _id: req.params.membershipId,
    organizationId: req.organizationId,
  });

  if (!existingMembership) throw new ApiError(404, "Membership not found.");

  const allowedRoles = existingMembership.tenantId
    ? ["TENANT_ADMIN", "MEMBER"]
    : ["MEMBER"];

  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      existingMembership.tenantId
        ? "Tenant membership role must be TENANT_ADMIN or MEMBER."
        : "Organization-wide membership can only use MEMBER here."
    );
  }

  const membership = await Membership.findOneAndUpdate(
    {
      _id: req.params.membershipId,
      organizationId: req.organizationId,
    },
    { role },
    { new: true, runValidators: true }
  );

  if (!membership) throw new ApiError(404, "Membership not found.");

  res.status(200).json({
    success: true,
    message: "Member role updated successfully.",
    data: { membership },
  });
});

// DELETE /api/v1/members/:membershipId
export const removeMember = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.membershipId)) {
    throw new ApiError(400, "Invalid membership ID.");
  }

  const membership = await Membership.findOneAndDelete({
    _id: req.params.membershipId,
    organizationId: req.organizationId,
  });

  if (!membership) throw new ApiError(404, "Membership not found.");

  res.status(200).json({
    success: true,
    message: "Member removed successfully.",
  });
});
