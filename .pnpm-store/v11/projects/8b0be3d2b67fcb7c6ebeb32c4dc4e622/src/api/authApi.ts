import { axiosInstance } from './axiosInstance';
import type { User } from '@/types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  data: { user: User };
}

export interface UpdateProfileInput {
  name?: string;
  avatar?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  register: (input: RegisterInput) =>
    axiosInstance.post<AuthResponse>('/auth/register', input),

  login: (input: LoginInput) =>
    axiosInstance.post<AuthResponse>('/auth/login', input),

  me: () => axiosInstance.get<AuthResponse>('/auth/me'),

  updateProfile: (input: UpdateProfileInput) =>
    axiosInstance.patch<AuthResponse>('/auth/profile', input),

  changePassword: (input: ChangePasswordInput) =>
    axiosInstance.patch<AuthResponse>('/auth/change-password', input),
};
