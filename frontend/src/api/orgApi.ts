import { axiosInstance } from './axiosInstance';
import type { Organization } from '@/types';

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  description?: string;
}

export interface OrganizationsResponse {
  success: boolean;
  message: string;
  data: { organizations: Organization[] };
  results: number;
}

export interface OrganizationResponse {
  success: boolean;
  message: string;
  data: { organization: Organization };
}

export const orgApi = {
  create: (input: CreateOrganizationInput) =>
    axiosInstance.post<OrganizationResponse>('/organizations', input),

  list: () => axiosInstance.get<OrganizationsResponse>('/organizations'),

  getById: (id: string) =>
    axiosInstance.get<OrganizationResponse>(`/organizations/${id}`),

  update: (id: string, input: UpdateOrganizationInput) =>
    axiosInstance.patch<OrganizationResponse>(`/organizations/${id}`, input),

  remove: (id: string) =>
    axiosInstance.delete<OrganizationResponse>(`/organizations/${id}`),
};
