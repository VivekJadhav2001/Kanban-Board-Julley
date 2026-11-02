import ApiError from "../utils/ApiError.js";

// Check whether user has the required role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const membership =
      req.membership || req.organizationMembership;

    if (!membership) {
      throw new ApiError(403, "Membership information not found.");
    }

    if (!roles.includes(membership.role)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action."
      );
    }

    next();
  };
};

// Allow only organization admins
export const isOrganizationAdmin = authorizeRoles("ORG_ADMIN");

// Allow organization admins and tenant admins
export const isTenantAdmin = authorizeRoles(
  "ORG_ADMIN",
  "TENANT_ADMIN"
);