import { create } from 'zustand';
import type { TenantContext } from '@/types';

export const useTenantStore = create<TenantContext>((set) => ({
  organizationId: null,
  tenantId: null,
  membership: null,
  setOrganization: (organizationId) => set({ organizationId }),
  setTenant: (tenantId) => set({ tenantId }),
  setMembership: (membership: any) => set({ membership }),
  clearContext: () =>
    set({
      organizationId: null,
      tenantId: null,
      membership: null,
    }),
}));

export const useOrgId = () => useTenantStore((s) => s.organizationId);
export const useTenantId = () => useTenantStore((s) => s.tenantId);
export const useMembership = () => useTenantStore((s) => s.membership);
