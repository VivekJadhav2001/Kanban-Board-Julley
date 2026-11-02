import { axiosInstance } from './axiosInstance';
import type { Task } from '@/types';

export interface CreateTaskInput {
  title: string;
  description?: string;
  columnId: string;
  assignedTo?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
  assignedTo?: string | null;
  version: number;
}

export interface MoveTaskInput {
  columnId: string;
  position: number;
  version: number;
}

export interface ReorderTaskInput {
  position: number;
  version: number;
}

export interface AssignTaskInput {
  assignedTo: string | null;
  version: number;
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: { tasks: Task[] };
  results: number;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: { task: Task };
}

export const taskApi = {
  create: (boardId: string, input: CreateTaskInput) =>
    axiosInstance.post<TaskResponse>(`/boards/${boardId}/tasks`, input),

  list: (boardId: string, params?: { columnId?: string; assignedTo?: string }) =>
    axiosInstance.get<TasksResponse>(`/boards/${boardId}/tasks`, { params }),

  getById: (taskId: string) =>
    axiosInstance.get<TaskResponse>(`/tasks/${taskId}`),

  update: (taskId: string, input: UpdateTaskInput) =>
    axiosInstance.patch<TaskResponse>(`/tasks/${taskId}`, input),

  remove: (taskId: string, version: number) =>
    axiosInstance.delete<TaskResponse>(`/tasks/${taskId}`, { data: { version } }),

  move: (taskId: string, input: MoveTaskInput) =>
    axiosInstance.patch<TaskResponse>(`/tasks/${taskId}/move`, input),

  reorder: (taskId: string, input: ReorderTaskInput) =>
    axiosInstance.patch<TaskResponse>(`/tasks/${taskId}/reorder`, input),

  assign: (taskId: string, input: AssignTaskInput) =>
    axiosInstance.patch<TaskResponse>(`/tasks/${taskId}/assign`, input),
};
