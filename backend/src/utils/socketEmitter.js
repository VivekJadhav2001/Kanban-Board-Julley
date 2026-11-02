// Emits an event only to the room belonging to the authorized tenant.
// server.js/socket.js must set the Socket.IO instance using app.set("io", io).
const emitTenantEvent = (req, tenantId, eventName, payload = {}) => {
  const io = req.app.get("io");

  if (!io || !tenantId) return;

  io.to(`tenant:${tenantId}`).emit(eventName, {
    ...payload,
    tenantId: tenantId.toString(),
  });
};

export default emitTenantEvent;
