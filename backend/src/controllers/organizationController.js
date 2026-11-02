import Organization from "../models/Organization.js";
import Tenant from "../models/Tenant.js";
import Membership from "../models/Membership.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// POST /api/v1/organizations
export const createOrganization = asyncHandler(async (req, res) => {
  const { name, slug, description = "" } = req.body;

  if (!name || !slug) {
    throw new ApiError(400, "Organization name and slug are required.");
  }

  const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

  const organization = await Organization.create({
    name: name.trim(),
    slug: normalizedSlug,
    description,
    createdBy: req.user._id,
  });

  // The creator becomes the organization-wide admin.
  await Membership.create({
    userId: req.user._id,
    organizationId: organization._id,
    tenantId: null,
    role: "ORG_ADMIN",
    status: "ACTIVE",
  });

  res.status(201).json({
    success: true,
    message: "Organization created successfully.",
    data: { organization },
  });
});

// GET /api/v1/organizations
export const getOrganizations = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    userId: req.user._id,
    status: "ACTIVE",
  }).select("organizationId");

  const organizationIds = [
    ...new Set(memberships.map((item) => item.organizationId.toString())),
  ];

  const organizations = await Organization.find({
    _id: { $in: organizationIds },
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: organizations.length,
    data: { organizations },
  });
});

// GET /api/v1/organizations/:organizationId
export const getOrganizationById = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.organizationId);

  if (!organization) throw new ApiError(404, "Organization not found.");

  res.status(200).json({ success: true, data: { organization } });
});

// PATCH /api/v1/organizations/:organizationId
export const updateOrganization = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name.trim();
  if (slug !== undefined) {
    updates.slug = slug.trim().toLowerCase().replace(/\s+/g, "-");
  }
  if (description !== undefined) updates.description = description;

  if (!Object.keys(updates).length) {
    throw new ApiError(400, "Provide at least one field to update.");
  }

  const organization = await Organization.findByIdAndUpdate(
    req.params.organizationId,
    updates,
    { new: true, runValidators: true }
  );

  if (!organization) throw new ApiError(404, "Organization not found.");

  res.status(200).json({
    success: true,
    message: "Organization updated successfully.",
    data: { organization },
  });
});

// DELETE /api/v1/organizations/:organizationId
// Deliberately refuses deletion while tenants exist to avoid accidental data loss.
export const deleteOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.organizationId);

  if (!organization) throw new ApiError(404, "Organization not found.");

  const tenantExists = await Tenant.exists({
    organizationId: organization._id,
  });

  if (tenantExists) {
    throw new ApiError(
      409,
      "Delete or deactivate this organization's tenants before deleting it."
    );
  }

  await Membership.deleteMany({ organizationId: organization._id });
  await organization.deleteOne();

  res.status(200).json({
    success: true,
    message: "Organization deleted successfully.",
  });
});
