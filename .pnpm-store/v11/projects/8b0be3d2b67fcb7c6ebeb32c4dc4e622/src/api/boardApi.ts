import { axiosInstance } from './axiosInstance';
import type { Board } from '@/types';

export interface CreateBoardInput {
  name: string;
  description?: string;
}

export interface UpdateBoardInput {
  name?: string;
  description?: string;
}

export interface BoardsResponse {
  success: boolean;
  message: string;
  data: { boards: Board[] };
  results: number;
}

export interface BoardResponse {
  success: boolean;
  message: string;
  data: { board: Board };
}

export const boardApi = {
  create: (tenantId: string, input: CreateBoardInput) =>
    axiosInstance.post<BoardResponse>(`/tenants/${tenantId}/boards`, input),

  list: (tenantId: string) =>
    axiosInstance.get<BoardsResponse>(`/tenants/${tenantId}/boards`),

  getById: (tenantId: string, boardId: string) =>
    axiosInstance.get<BoardResponse>(`/tenants/${tenantId}/boards/${boardId}`),

  update: (tenantId: string, boardId: string, input: UpdateBoardInput) =>
    axiosInstance.patch<BoardResponse>(
      `/tenants/${tenantId}/boards/${boardId}`,
      input
    ),

  remove: (tenantId: string, boardId: string) =>
    axiosInstance.delete<BoardResponse>(`/tenants/${tenantId}/boards/${boardId}`),
};
