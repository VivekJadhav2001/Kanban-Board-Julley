import { axiosInstance } from './axiosInstance';
import type { ActivityLog } from '@/types';

export interface ActivityResponse {
  success: boolean;
  message: string;
  data: { activities: ActivityLog[] };
  results: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const activityApi = {
  listForTenant: (tenantId: string, params?: { page?: number; limit?: number; boardId?: string; taskId?: string; action?: string }) =>
    axiosInstance.get<ActivityResponse>(`/tenants/${tenantId}/activity`, { params }),

  listForTask: (taskId: string) =>
    axiosInstance.get<ActivityResponse>(`/tasks/${taskId}/activity`),

  listForBoard: (boardId: string, params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ActivityResponse>(`/boards/${boardId}/activity`, { params }),
};
