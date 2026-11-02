import { axiosInstance } from './axiosInstance';
import type { Comment } from '@/types';

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: { comments: Comment[] };
  results: number;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: { comment: Comment };
}

export const commentApi = {
  list: (taskId: string) =>
    axiosInstance.get<CommentsResponse>(`/tasks/${taskId}/comments`),

  create: (taskId: string, body: string) =>
    axiosInstance.post<CommentResponse>(`/tasks/${taskId}/comments`, { body }),

  remove: (taskId: string, commentId: string) =>
    axiosInstance.delete<CommentResponse>(
      `/tasks/${taskId}/comments/${commentId}`
    ),
};
