import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  verifyOrganizationAccess,
  verifyTenantAccess,
  setTenantContext,
  setMembershipOrganizationContext,
} from "../middlewares/tenantMiddleware.js";
import {
  addMember,
  getOrganizationMembers,
  getTenantMembers,
  updateMemberRole,
  removeMember,
} from "../controllers/membershipController.js";

const router = express.Router();

router.post(
  "/organizations/:organizationId/members",
  protect,
  verifyOrganizationAccess,
  addMember
);
router.get(
  "/organizations/:organizationId/members",
  protect,
  verifyOrganizationAccess,
  getOrganizationMembers
);
router.get(
  "/tenants/:tenantId/members",
  protect,
  setTenantContext,
  verifyTenantAccess,
  getTenantMembers
);
router.patch(
  "/members/:membershipId/role",
  protect,
  setMembershipOrganizationContext,
  verifyOrganizationAccess,
  updateMemberRole
);
router.delete(
  "/members/:membershipId",
  protect,
  setMembershipOrganizationContext,
  verifyOrganizationAccess,
  removeMember
);

export default router;
