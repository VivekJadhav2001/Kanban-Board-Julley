import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import DashboardPage from '@/pages/Dashboard';
import OrganizationPage from '@/pages/OrganizationPage';
import TenantPage from '@/pages/TenantPage';
import BoardPage from '@/pages/BoardPage';
import CreateOrganizationPage from '@/pages/CreateOrganizationPage';
import CreateTenantPage from '@/pages/CreateTenantPage';
import CreateBoardPage from '@/pages/CreateBoardPage';
import CreateColumnPage from '@/pages/CreateColumnPage';
import CreateTaskPage from '@/pages/CreateTaskPage';
import EditTaskPage from '@/pages/EditTaskPage';
import ProfilePage from '@/pages/Profile';
import NotFoundPage from '@/pages/NotFound';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="organization/create" element={<CreateOrganizationPage />} />
          <Route path="organization/:organizationId" element={<OrganizationPage />} />
          <Route path="organization/:organizationId/tenant/create" element={<CreateTenantPage />} />
          <Route path="tenant/:tenantId" element={<TenantPage />} />
          <Route path="tenant/:tenantId/board/create" element={<CreateBoardPage />} />
          <Route path="board/:tenantId/:boardId" element={<BoardPage />} />
          <Route path="board/:tenantId/:boardId/column/create" element={<CreateColumnPage />} />
          <Route path="board/:tenantId/:boardId/task/create" element={<CreateTaskPage />} />
          <Route path="board/:tenantId/:boardId/task/:taskId/edit" element={<EditTaskPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
