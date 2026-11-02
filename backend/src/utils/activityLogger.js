import ActivityLog from "../models/ActivityLog.js";

// Use this helper after a successful database operation.
// req must already contain user, organizationId and tenantId.
const logActivity = async ({
  req,
  action,
  boardId = null,
  taskId = null,
  details = {},
}) => {
  return ActivityLog.create({
    organizationId: req.organizationId,
    tenantId: req.tenantId,
    userId: req.user._id,
    boardId,
    taskId,
    action,
    details,
  });
};

export default logActivity;
