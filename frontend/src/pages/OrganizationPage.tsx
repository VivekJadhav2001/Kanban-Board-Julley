'use client';

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orgApi } from '@/api/orgApi';
import { tenantApi } from '@/api/tenantApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Spinner } from '@/components/common/Spinner';
import { EditEntityModal } from '@/components/common/EditEntityModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MembersPanel } from '@/components/members/MembersPanel';
import {
  Plus,
  ArrowUpRight,
  Building2,
  Layers,
  ArrowLeft,
  Users,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Organization, Tenant } from '@/types';

export default function OrganizationPage() {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [membersOpen, setMembersOpen] = React.useState(false);

  const [orgModalOpen, setOrgModalOpen] = React.useState(false);
  const [orgSaving, setOrgSaving] = React.useState(false);
  const [orgModalError, setOrgModalError] = React.useState<string | null>(null);

  const [deleteOrgOpen, setDeleteOrgOpen] = React.useState(false);
  const [deletingOrg, setDeletingOrg] = React.useState(false);
  const [deleteOrgError, setDeleteOrgError] = React.useState<string | null>(null);

  const [tenantToEdit, setTenantToEdit] = React.useState<Tenant | null>(null);
  const [tenantSaving, setTenantSaving] = React.useState(false);
  const [tenantModalError, setTenantModalError] = React.useState<string | null>(null);

  const [tenantToDelete, setTenantToDelete] = React.useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = React.useState(false);
  const [tenantDeleteError, setTenantDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);

    Promise.all([orgApi.getById(organizationId), tenantApi.list(organizationId)])
      .then(([orgResponse, tenantResponse]) => {
        setOrganization(orgResponse.data.data.organization);
        setTenants(tenantResponse.data.data.tenants);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load organization');
      })
      .finally(() => setLoading(false));
  }, [organizationId]);

  const handleCreateTenant = () => {
    if (!organizationId) return;
    navigate(`/organization/${organizationId}/tenant/create`);
  };

  const handleOrgSave = async (values: Record<string, string>) => {
    if (!organizationId) return;
    setOrgSaving(true);
    setOrgModalError(null);
    try {
      const response = await orgApi.update(organizationId, {
        name: values.name,
        slug: values.slug,
        description: values.description || '',
      });
      setOrganization(response.data.data.organization);
      setOrgModalOpen(false);
    } catch (err: unknown) {
      setOrgModalError(err instanceof Error ? err.message : 'Could not update organization.');
    } finally {
      setOrgSaving(false);
    }
  };

  const handleOrgDelete = async () => {
    if (!organizationId) return;
    setDeletingOrg(true);
    setDeleteOrgError(null);
    try {
      await orgApi.remove(organizationId);
      navigate('/dashboard');
    } catch (err: unknown) {
      setDeleteOrgError(err instanceof Error ? err.message : 'Could not delete organization.');
    } finally {
      setDeletingOrg(false);
    }
  };

  const handleTenantSave = async (values: Record<string, string>) => {
    if (!tenantToEdit) return;
    setTenantSaving(true);
    setTenantModalError(null);
    try {
      const response = await tenantApi.update(tenantToEdit._id, {
        name: values.name,
        slug: values.slug,
      });
      setTenants((current) =>
        current.map((tenant) =>
          tenant._id === tenantToEdit._id ? response.data.data.tenant : tenant
        )
      );
      setTenantToEdit(null);
    } catch (err: unknown) {
      setTenantModalError(err instanceof Error ? err.message : 'Could not update tenant.');
    } finally {
      setTenantSaving(false);
    }
  };

  const handleTenantDelete = async () => {
    if (!tenantToDelete) return;
    setDeletingTenant(true);
    setTenantDeleteError(null);
    try {
      await tenantApi.remove(tenantToDelete._id);
      setTenants((current) => current.filter((tenant) => tenant._id !== tenantToDelete._id));
      setTenantToDelete(null);
    } catch (err: unknown) {
      setTenantDeleteError(err instanceof Error ? err.message : 'Could not delete tenant.');
    } finally {
      setDeletingTenant(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title={organization?.name || 'Organization'}
        description={
          organization?.description ||
          'Tenants isolate boards, members, and realtime events for each team.'
        }
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
              <Users className="h-4 w-4" />
              Members
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateTenant}>
              <Plus className="h-4 w-4" />
              New tenant
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {organization?.slug && <Badge variant="secondary">{organization.slug}</Badge>}
          <Badge variant="secondary">
            <Layers className="h-3 w-3" />
            {tenants.length} tenants
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setOrgModalOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit organization
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOrgOpen(true)}
            className="text-slate-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-white">All tenants</h2>
          <p className="text-sm text-slate-500">Choose a tenant to open its boards.</p>
        </div>
        <Badge variant="secondary">{tenants.length} total</Badge>
      </div>

      {loading ? (
        <Card className="p-10">
          <Spinner label="Loading tenants..." />
        </Card>
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="No tenants yet"
          description="Create a tenant for each product, department, or client you want to keep separate."
          action={
            <Button variant="accent" onClick={handleCreateTenant}>
              <Plus className="h-4 w-4" />
              Create your first tenant
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tenants.map((tenant) => (
            <Card
              key={tenant._id}
              interactive
              className="group p-5 sm:p-6"
              onClick={() => navigate(`/tenant/${tenant._id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-violet-500/25 group-hover:text-violet-200">
                  <Layers className="h-5 w-5" />
                </div>
                <Badge variant={tenant.isActive ? 'success' : 'muted'}>
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <h3 className="mt-4 truncate text-base font-semibold text-white transition-colors group-hover:text-violet-200">
                {tenant.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{tenant.slug}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setTenantModalError(null);
                      setTenantToEdit(tenant);
                    }}
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-violet-300"
                    aria-label={`Edit ${tenant.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setTenantDeleteError(null);
                      setTenantToDelete(tenant);
                    }}
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Delete ${tenant.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 transition-all group-hover:bg-violet-500 group-hover:text-white">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={handleCreateTenant}
            className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5 text-slate-500 transition-all duration-300 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] hover:text-yellow-300"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-colors group-hover:border-yellow-400/40 group-hover:bg-yellow-400/10">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">New tenant</span>
          </button>
        </div>
      )}

      <EditEntityModal
        open={orgModalOpen}
        title="Edit organization"
        description="Update the name, URL slug, or description."
        fields={[
          { name: 'name', label: 'Organization name', required: true, maxLength: 120 },
          { name: 'slug', label: 'Slug', required: true, lowercase: true, maxLength: 80 },
          { name: 'description', label: 'Description', textarea: true, maxLength: 500 },
        ]}
        initialValues={{
          name: organization?.name || '',
          slug: organization?.slug || '',
          description: organization?.description || '',
        }}
        submitLabel="Save organization"
        loading={orgSaving}
        error={orgModalError}
        onSubmit={(values) => void handleOrgSave(values)}
        onClose={() => {
          setOrgModalOpen(false);
          setOrgModalError(null);
        }}
      />

      <ConfirmDialog
        open={deleteOrgOpen}
        title="Delete this organization?"
        description="All tenants must be removed first. Deleting the organization removes its memberships and any inactive tenant data. This cannot be undone."
        confirmLabel="Delete organization"
        loading={deletingOrg}
        error={deleteOrgError}
        onConfirm={() => void handleOrgDelete()}
        onClose={() => {
          setDeleteOrgOpen(false);
          setDeleteOrgError(null);
        }}
      />

      <EditEntityModal
        open={Boolean(tenantToEdit)}
        title="Edit tenant"
        description="Rename this workspace or update its slug."
        fields={[
          { name: 'name', label: 'Tenant name', required: true, maxLength: 120 },
          { name: 'slug', label: 'Slug', required: true, lowercase: true, maxLength: 80 },
        ]}
        initialValues={{
          name: tenantToEdit?.name || '',
          slug: tenantToEdit?.slug || '',
        }}
        submitLabel="Save tenant"
        loading={tenantSaving}
        error={tenantModalError}
        onSubmit={(values) => void handleTenantSave(values)}
        onClose={() => {
          setTenantToEdit(null);
          setTenantModalError(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(tenantToDelete)}
        title={`Delete “${tenantToDelete?.name || 'tenant'}”?`}
        description="The tenant will be deactivated and removed from your workspace list, and its members will lose access. Boards and tasks are retained for historical records."
        confirmLabel="Delete tenant"
        loading={deletingTenant}
        error={tenantDeleteError}
        onConfirm={() => void handleTenantDelete()}
        onClose={() => {
          setTenantToDelete(null);
          setTenantDeleteError(null);
        }}
      />

      {organizationId && (
        <MembersPanel
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          organizationId={organizationId}
          title="Organization members"
        />
      )}
    </div>
  );
}
