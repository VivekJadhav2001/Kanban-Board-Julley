import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },

    role: {
      type: String,
      enum: ["ORG_ADMIN", "TENANT_ADMIN", "MEMBER"],
      required: true,
      default: "MEMBER",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INVITED"],
      default: "INVITED",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate organization-wide memberships.
membershipSchema.index(
  { userId: 1, organizationId: 1 },
  {
    unique: true,
    partialFilterExpression: { tenantId: null },
  }
);

// Prevent duplicate tenant memberships.
membershipSchema.index(
  { userId: 1, organizationId: 1, tenantId: 1 },
  {
    unique: true,
    partialFilterExpression: { tenantId: { $type: "objectId" } },
  }
);

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;