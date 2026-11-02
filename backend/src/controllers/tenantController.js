import Tenant from "../models/Tenant.js";
import Board from "../models/Board.js";
import Membership from "../models/Membership.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// POST /api/v1/organizations/:organizationId/tenants
export const createTenant = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;
  const organizationId = req.params.organizationId || req.organizationId;

  if (!name || !slug) {
    throw new ApiError(400, "Tenant name and slug are required.");
  }

  const tenant = await Tenant.create({
    name: name.trim(),
    slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
    organizationId,
    createdBy: req.user._id,
  });

  // Give the creator tenant-admin membership as well.
  await Membership.create({
    userId: req.user._id,
    organizationId,
    tenantId: tenant._id,
    role: "TENANT_ADMIN",
    status: "ACTIVE",
  });

  res.status(201).json({
    success: true,
    message: "Tenant created successfully.",
    data: { tenant },
  });
});

// GET /api/v1/organizations/:organizationId/tenants
export const getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find({
    organizationId: req.params.organizationId || req.organizationId,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: tenants.length,
    data: { tenants },
  });
});

// GET /api/v1/tenants/:tenantId
export const getTenantById = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findOne({
    _id: req.params.tenantId,
    isActive: true,
  });

  if (!tenant) throw new ApiError(404, "Tenant not found.");

  res.status(200).json({ success: true, data: { tenant } });
});

// PATCH /api/v1/tenants/:tenantId
export const updateTenant = asyncHandler(async (req, res) => {
  const updates = {};
  const { name, slug } = req.body;

  if (name !== undefined) updates.name = name.trim();
  if (slug !== undefined) {
    updates.slug = slug.trim().toLowerCase().replace(/\s+/g, "-");
  }

  if (!Object.keys(updates).length) {
    throw new ApiError(400, "Provide a name or slug to update.");
  }

  const tenant = await Tenant.findOneAndUpdate(
    { _id: req.params.tenantId, organizationId: req.organizationId },
    updates,
    { new: true, runValidators: true }
  );

  if (!tenant) throw new ApiError(404, "Tenant not found.");

  res.status(200).json({
    success: true,
    message: "Tenant updated successfully.",
    data: { tenant },
  });
});

// DELETE /api/v1/tenants/:tenantId
// Soft delete: preserve boards/tasks/activity for historical records.
export const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findOneAndUpdate(
    { _id: req.params.tenantId, organizationId: req.organizationId },
    { isActive: false },
    { new: true }
  );

  if (!tenant) throw new ApiError(404, "Tenant not found.");

  await Membership.updateMany(
    { tenantId: tenant._id },
    { status: "INVITED" }
  );

  res.status(200).json({
    success: true,
    message: "Tenant deactivated successfully.",
  });
});
