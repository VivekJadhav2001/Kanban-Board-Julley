import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  verifyOrganizationAccess,
  setTenantContext,
  verifyTenantAccess,
} from "../middlewares/tenantMiddleware.js";
import {
  createTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} from "../controllers/tenantController.js";

const router = express.Router();

router.post(
  "/organizations/:organizationId/tenants",
  protect,
  verifyOrganizationAccess,
  createTenant
);
router.get(
  "/organizations/:organizationId/tenants",
  protect,
  verifyOrganizationAccess,
  getTenants
);
router.get("/tenants/:tenantId", protect, setTenantContext, verifyTenantAccess, getTenantById);
router.patch("/tenants/:tenantId", protect, setTenantContext, verifyTenantAccess, updateTenant);
router.delete("/tenants/:tenantId", protect, setTenantContext, verifyTenantAccess, deleteTenant);

export default router;
