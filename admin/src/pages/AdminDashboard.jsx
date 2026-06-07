import { DollarSign, Ticket, Users, Route } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import BookingsPieChart from '@/components/dashboard/BookingsPieChart';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import PendingApprovalsCard from '@/components/dashboard/PendingApprovalsCard';
import {
  useGetAdminStatsQuery,
  useGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
} from '@/store/api/adminApi';

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetAdminRevenueReportQuery({});
  const { data: bookingsReport, isLoading: reportLoading } = useGetAdminBookingsReportQuery();

  const stats = statsData?.data?.stats;
  const recentBookings = statsData?.data?.recentBookings;
  const pendingOperators = statsData?.data?.pendingOperators;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          prefix="Rs. "
          icon={DollarSign}
          color="text-emerald-600"
        />
        <KpiCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Ticket}
          color="text-blue-600"
        />
        <KpiCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={Users}
          color="text-violet-600"
        />
        <KpiCard
          title="Active Routes"
          value={stats?.activeRoutes || 0}
          icon={Route}
          color="text-orange-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueChart
          data={revenueData?.data?.revenue}
          isLoading={revenueLoading || statsLoading}
        />
        <BookingsPieChart
          data={bookingsReport?.data?.breakdown}
          isLoading={reportLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentBookingsTable bookings={recentBookings} isLoading={statsLoading} />
        <PendingApprovalsCard operators={pendingOperators} isLoading={statsLoading} />
      </div>
    </div>
  );
}
