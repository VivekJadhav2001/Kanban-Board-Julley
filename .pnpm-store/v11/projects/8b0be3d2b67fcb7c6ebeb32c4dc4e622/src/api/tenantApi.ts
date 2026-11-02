import { axiosInstance } from './axiosInstance';
import type { Tenant } from '@/types';

export interface CreateTenantInput {
  name: string;
  slug: string;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
}

export interface TenantsResponse {
  success: boolean;
  message: string;
  data: { tenants: Tenant[] };
  results: number;
}

export interface TenantResponse {
  success: boolean;
  message: string;
  data: { tenant: Tenant };
}

export const tenantApi = {
  create: (organizationId: string, input: CreateTenantInput) =>
    axiosInstance.post<TenantResponse>(
      `/organizations/${organizationId}/tenants`,
      input
    ),

  list: (organizationId?: string) =>
    axiosInstance.get<TenantsResponse>(
      organizationId ? `/organizations/${organizationId}/tenants` : '/tenants'
    ),

  getById: (id: string) => axiosInstance.get<TenantResponse>(`/tenants/${id}`),

  update: (id: string, input: UpdateTenantInput) =>
    axiosInstance.patch<TenantResponse>(`/tenants/${id}`, input),

  remove: (id: string) =>
    axiosInstance.delete<TenantResponse>(`/tenants/${id}`),
};
