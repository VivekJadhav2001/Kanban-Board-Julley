import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthToken } from '@/store/authStore';
import { useTenantId } from '@/store/tenantStore';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5050';

export function useSocket(eventHandlers: Record<string, (data: any) => void>) {
  const token = useAuthToken();
  const tenantId = useTenantId();

  useEffect(() => {
    if (!token || !tenantId) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join-tenant', tenantId);
    });

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.off('connect');
      Object.keys(eventHandlers).forEach((event) => {
        socket.off(event, eventHandlers[event]);
      });
      socket.disconnect();
    };
  }, [token, tenantId, eventHandlers]);
}
