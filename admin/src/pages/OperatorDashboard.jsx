import { DollarSign, Users, Calendar, Bus } from 'lucide-react';
import KpiCard from '@/components/dashboard/KpiCard';
import WeeklyRevenueBar from '@/components/dashboard/WeeklyRevenueBar';
import TodaysSchedules from '@/components/dashboard/TodaysSchedules';
import FleetStatusTable from '@/components/dashboard/FleetStatusTable';
import {
  useGetOperatorStatsQuery,
  useGetOperatorRevenueReportQuery,
  useGetMyBusesQuery,
} from '@/store/api/adminApi';

export default function OperatorDashboard() {
  const { data: statsData, isLoading: statsLoading } = useGetOperatorStatsQuery();
  const { data: revenueData, isLoading: revenueLoading } = useGetOperatorRevenueReportQuery();
  const { data: busesData, isLoading: busesLoading } = useGetMyBusesQuery();

  const stats = statsData?.data?.stats;
  const todaySchedules = statsData?.data?.todaySchedules;
  const buses = busesData?.data?.buses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Today's Revenue"
          value={stats?.todayRevenue || 0}
          prefix="Rs. "
          icon={DollarSign}
          color="text-emerald-600"
        />
        <KpiCard
          title="Today's Passengers"
          value={stats?.todayPassengers || 0}
          icon={Users}
          color="text-blue-600"
        />
        <KpiCard
          title="Active Schedules"
          value={stats?.activeSchedules || 0}
          icon={Calendar}
          color="text-violet-600"
        />
        <KpiCard
          title="Fleet Size"
          value={stats?.fleetSize || 0}
          icon={Bus}
          color="text-orange-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WeeklyRevenueBar
          data={revenueData?.data?.revenue}
          isLoading={revenueLoading}
        />
        <TodaysSchedules schedules={todaySchedules} isLoading={statsLoading} />
      </div>

      <FleetStatusTable buses={buses} isLoading={busesLoading || statsLoading} />
    </div>
  );
}
