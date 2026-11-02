import { axiosInstance } from './axiosInstance';
import type { User } from '@/types';

export interface UserResponse {
  success: boolean;
  message: string;
  data: { user: User };
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: { users: User[] };
  results: number;
}

export const userApi = {
  getById: (id: string) => axiosInstance.get<UserResponse>(`/users/${id}`),

  list: (params?: { tenantId?: string; organizationId?: string }) =>
    axiosInstance.get<UsersResponse>('/users', { params }),
};
