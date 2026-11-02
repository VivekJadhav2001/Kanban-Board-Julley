import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  verifyOrganizationAccess,
} from "../middlewares/tenantMiddleware.js";
import {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizationController.js";

const router = express.Router();

router.post("/", protect, createOrganization);
router.get("/", protect, getOrganizations);
router.get("/:organizationId", protect, verifyOrganizationAccess, getOrganizationById);
router.patch("/:organizationId", protect, verifyOrganizationAccess, updateOrganization);
router.delete("/:organizationId", protect, verifyOrganizationAccess, deleteOrganization);

export default router;
