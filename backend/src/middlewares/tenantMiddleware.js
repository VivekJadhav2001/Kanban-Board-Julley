import mongoose from "mongoose";

import Tenant from "../models/Tenant.js";
import Membership from "../models/Membership.js";
import Board from "../models/Board.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// Read tenant ID from params or headers
export const setTenantContext = (req, res, next) => {
  const tenantId = req.params.tenantId || req.headers["x-tenant-id"];

  if (!tenantId) {
    throw new ApiError(400, "Tenant ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    throw new ApiError(400, "Invalid tenant ID.");
  }

  req.tenantId = tenantId;

  next();
};

// Verify whether the logged-in user belongs to the tenant
export const verifyTenantAccess = asyncHandler(async (req, res, next) => {
  const tenantId = req.tenantId || req.params.tenantId;

  if (!tenantId) {
    throw new ApiError(400, "Tenant ID is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    throw new ApiError(400, "Invalid tenant ID.");
  }

  const tenant = await Tenant.findOne({
    _id: tenantId,
    isActive: true,
  });

  if (!tenant) {
    throw new ApiError(404, "Tenant not found or inactive.");
  }

  // Check tenant-specific membership first
  let membership = await Membership.findOne({
    userId: req.user._id,
    organizationId: tenant.organizationId,
    tenantId: tenant._id,
    status: "ACTIVE",
  });

  // If not found, check organization-wide membership
  if (!membership) {
    membership = await Membership.findOne({
      userId: req.user._id,
      organizationId: tenant.organizationId,
      tenantId: null,
      role: "ORG_ADMIN",
      status: "ACTIVE",
    });
  }

  if (!membership) {
    throw new ApiError(403, "You do not have access to this tenant.");
  }

  req.tenant = tenant;
  req.tenantId = tenant._id.toString();
  req.membership = membership;
  req.organizationId = tenant.organizationId.toString();

  next();
});

// Resource routes do not include a tenant ID in their URL. Resolve it from the
// resource instead of trusting a client-supplied header, then use the same
// membership check as tenant-scoped routes.
const setResourceTenantContext = (Model, paramName) =>
  asyncHandler(async (req, res, next) => {
    const resourceId = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      throw new ApiError(400, `Invalid ${paramName}.`);
    }

    const resource = await Model.findById(resourceId).select("tenantId");
    if (!resource) throw new ApiError(404, "Resource not found.");

    req.tenantId = resource.tenantId.toString();
    next();
  });

export const setBoardTenantContext = setResourceTenantContext(Board, "boardId");
export const setColumnTenantContext = setResourceTenantContext(Column, "columnId");
export const setTaskTenantContext = setResourceTenantContext(Task, "taskId");

export const setMembershipOrganizationContext = asyncHandler(
  async (req, res, next) => {
    const { membershipId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(membershipId)) {
      throw new ApiError(400, "Invalid membership ID.");
    }

    const membership = await Membership.findById(membershipId).select(
      "organizationId"
    );
    if (!membership) throw new ApiError(404, "Membership not found.");

    req.organizationId = membership.organizationId.toString();
    req.params.organizationId = req.organizationId;
    next();
  }
);

// Verify whether the logged-in user belongs to an organization
export const verifyOrganizationAccess = asyncHandler(
  async (req, res, next) => {
    const organizationId =
      req.params.organizationId || req.body.organizationId;

    if (!organizationId) {
      throw new ApiError(400, "Organization ID is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new ApiError(400, "Invalid organization ID.");
    }

    const membership = await Membership.findOne({
      userId: req.user._id,
      organizationId,
      tenantId: null,
      status: "ACTIVE",
    });

    // Check whether the user has any active membership in this organization
    const organizationMembership =
      membership ||
      (await Membership.findOne({
        userId: req.user._id,
        organizationId,
        status: "ACTIVE",
      }));

    if (!organizationMembership) {
      throw new ApiError(
        403,
        "You do not have access to this organization."
      );
    }

    req.organizationId = organizationId;
    req.organizationMembership = organizationMembership;

    next();
  }
);

// Verify whether the tenant belongs to the requested organization
export const verifyTenantOrganization = asyncHandler(
  async (req, res, next) => {
    const organizationId =
      req.params.organizationId || req.organizationId;

    const tenantId = req.tenantId || req.params.tenantId;

    if (!organizationId || !tenantId) {
      throw new ApiError(400, "Organization ID and Tenant ID are required.");
    }

    if (
      !mongoose.Types.ObjectId.isValid(organizationId) ||
      !mongoose.Types.ObjectId.isValid(tenantId)
    ) {
      throw new ApiError(400, "Invalid organization or tenant ID.");
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      organizationId,
      isActive: true,
    });

    if (!tenant) {
      throw new ApiError(
        403,
        "This tenant does not belong to the requested organization."
      );
    }

    req.tenant = tenant;
    req.tenantId = tenant._id.toString();

    next();
  }
);
