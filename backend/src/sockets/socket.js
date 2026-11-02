import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import Membership from "../models/Membership.js";
import { socketAuth } from "./socketAuth.js";

export const initializeSockets = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    socket.on("join-tenant", async (tenantId, acknowledge) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(tenantId)) {
          throw new Error("Invalid tenant ID.");
        }

        const tenant = await Tenant.findOne({ _id: tenantId, isActive: true });
        if (!tenant) throw new Error("Tenant not found.");

        const membership = await Membership.exists({
          userId: socket.user._id,
          organizationId: tenant.organizationId,
          status: "ACTIVE",
          $or: [
            { tenantId: tenant._id },
            { tenantId: null, role: "ORG_ADMIN" },
          ],
        });

        if (!membership) throw new Error("Tenant access denied.");

        socket.join(`tenant:${tenant._id}`);
        acknowledge?.({ success: true });
      } catch (error) {
        acknowledge?.({ success: false, message: error.message });
      }
    });
  });
};
