import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      default: null,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "MOVE",
        "ASSIGN",
        "REORDER",
      ],
      required: true,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

activityLogSchema.index({ tenantId: 1, createdAt: -1 });
activityLogSchema.index({ taskId: 1, createdAt: -1 });
activityLogSchema.index({ boardId: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;