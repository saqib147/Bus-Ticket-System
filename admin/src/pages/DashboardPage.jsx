import { useSelector } from 'react-redux';
import { selectCurrentUser, selectUserRole } from '@/store/slices/authSlice';
import AdminDashboard from './AdminDashboard';
import OperatorDashboard from './OperatorDashboard';
import OperatorPendingPage from './OperatorPendingPage';

export default function DashboardPage() {
  const role = useSelector(selectUserRole);
  const user = useSelector(selectCurrentUser);

  if (role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.operatorStatus === 'pending') {
    return <OperatorPendingPage />;
  }

  return <OperatorDashboard />;
}
