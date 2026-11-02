import { axiosInstance } from './axiosInstance';
import type { PopulatedMembership, Role } from '@/types';

export interface MembershipsResponse {
  success: boolean;
  message: string;
  data: { memberships: PopulatedMembership[] };
  results: number;
}

export interface MembershipResponse {
  success: boolean;
  message: string;
  data: { membership: PopulatedMembership };
}

export interface AddMemberInput {
  email: string;
  role?: Extract<Role, 'TENANT_ADMIN' | 'MEMBER'>;
  tenantId?: string | null;
}

export const membershipApi = {
  listForOrganization: (organizationId: string) =>
    axiosInstance.get<MembershipsResponse>(
      `/organizations/${organizationId}/members`
    ),

  listForTenant: (tenantId: string) =>
    axiosInstance.get<MembershipsResponse>(`/tenants/${tenantId}/members`),

  add: (organizationId: string, input: AddMemberInput) =>
    axiosInstance.post<MembershipResponse>(
      `/organizations/${organizationId}/members`,
      input
    ),

  updateRole: (membershipId: string, role: Role) =>
    axiosInstance.patch<MembershipResponse>(
      `/members/${membershipId}/role`,
      { role }
    ),

  remove: (membershipId: string) =>
    axiosInstance.delete<MembershipResponse>(`/members/${membershipId}`),
};
