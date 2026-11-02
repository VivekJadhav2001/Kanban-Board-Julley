import { axiosInstance } from './axiosInstance';
import type { Column } from '@/types';

export interface CreateColumnInput {
  name: string;
}

export interface UpdateColumnInput {
  name?: string;
}

export interface ColumnItem {
  columnId: string;
  position: number;
}

export interface ReorderColumnsInput {
  columns: ColumnItem[];
}

export interface ColumnsResponse {
  success: boolean;
  message: string;
  data: { columns: Column[] };
  results: number;
}

export interface ColumnResponse {
  success: boolean;
  message: string;
  data: { column: Column };
}

export const columnApi = {
  create: (boardId: string, input: CreateColumnInput) =>
    axiosInstance.post<ColumnResponse>(`/boards/${boardId}/columns`, input),

  list: (boardId: string) =>
    axiosInstance.get<ColumnsResponse>(`/boards/${boardId}/columns`),

  update: (columnId: string, input: UpdateColumnInput) =>
    axiosInstance.patch<ColumnResponse>(`/columns/${columnId}`, input),

  remove: (columnId: string) =>
    axiosInstance.delete<ColumnResponse>(`/columns/${columnId}`),

  reorder: (boardId: string, input: ReorderColumnsInput) =>
    axiosInstance.patch<ColumnResponse>(
      `/boards/${boardId}/columns/reorder`,
      input
    ),
};
