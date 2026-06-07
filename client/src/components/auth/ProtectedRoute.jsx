import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, requiredRole = 'passenger' }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Not logged in at all → go to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role (e.g. operator cookie still active)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/auth/login" state={{ from: location, wrongRole: user?.role }} replace />;
  }

  return children;
}
