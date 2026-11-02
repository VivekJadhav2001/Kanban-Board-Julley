export type Role = 'ORG_ADMIN' | 'TENANT_ADMIN' | 'MEMBER';
export type MembershipStatus = 'ACTIVE' | 'INVITED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ActivityAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'MOVE'
  | 'ASSIGN'
  | 'REORDER'
  | 'COMMENT';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  organizationId: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Membership {
  _id: string;
  userId: string;
  organizationId: string;
  tenantId?: string | null;
  role: Role;
  status: MembershipStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Board {
  _id: string;
  name: string;
  description: string;
  organizationId: string;
  tenantId: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  _id: string;
  name: string;
  boardId: string;
  organizationId: string;
  tenantId: string;
  position: number;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  boardId: string;
  columnId: string;
  organizationId: string;
  tenantId: string;
  assignedTo?: string | User | null;
  createdBy: string;
  priority: TaskPriority;
  position: number;
  dueDate?: string | null;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  _id: string;
  organizationId: string;
  tenantId: string;
  userId: string | User;
  boardId?: string | null;
  taskId?: string | null;
  action: ActivityAction;
  details: Record<string, unknown>;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  organizationId: string;
  tenantId: string;
  userId: User | string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PopulatedMembership
  extends Omit<Membership, 'userId' | 'tenantId'> {
  userId: User;
  tenantId?: (Pick<Tenant, '_id' | 'name' | 'slug'> & { _id: string }) | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T> {
  results: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError extends Error {
  statusCode: number;
  message: string;
  errors?: unknown[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export interface TenantContext {
  organizationId: string | null;
  tenantId: string | null;
  membership?: Membership | null;
  setOrganization: (id: string | null) => void;
  setTenant: (id: string | null) => void;
  clearContext: () => void;
}
