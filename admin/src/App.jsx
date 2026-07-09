import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import UserManagementPage from '@/pages/UserManagementPage';
import OperatorManagementPage from '@/pages/OperatorManagementPage';
import BusManagementPage from '@/pages/BusManagementPage';
import RouteManagementPage from '@/pages/RouteManagementPage';
import ScheduleManagementPage from '@/pages/ScheduleManagementPage';
import BookingsPage from '@/pages/BookingsPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import { selectIsAuthenticated, selectCurrentUser } from '@/store/slices/authSlice';

function AuthRedirect({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function OperatorOrAdminRoute({ children }) {
  const user = useSelector(selectCurrentUser);
  if (user?.role === 'operator' && user?.operatorStatus !== 'approved') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/auth/login"
        element={
          <AuthRedirect>
            <AdminLoginPage />
          </AuthRedirect>
        }
      />

      <Route
        element={
          <ProtectedRoute roles={['admin', 'operator']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operators"
          element={
            <ProtectedRoute roles={['admin']}>
              <OperatorManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buses"
          element={
            <ProtectedRoute roles={['admin', 'operator']}>
              <OperatorOrAdminRoute>
                <BusManagementPage />
              </OperatorOrAdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/routes"
          element={
            <ProtectedRoute roles={['admin', 'operator']}>
              <OperatorOrAdminRoute>
                <RouteManagementPage />
              </OperatorOrAdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedules"
          element={
            <ProtectedRoute roles={['admin', 'operator']}>
              <OperatorOrAdminRoute>
                <ScheduleManagementPage />
              </OperatorOrAdminRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/bookings" element={<BookingsPage />} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
