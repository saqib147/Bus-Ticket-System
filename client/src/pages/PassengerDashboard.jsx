import { formatCurrency } from '@/utils/currency';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Calendar, User, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetUserBookingsQuery } from '@/store/api/bookingApi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import BookingCard from '@/components/dashboard/BookingCard';

function DashboardContent() {
  const { data, isLoading } = useGetUserBookingsQuery();
  const bookings = data?.data?.bookings || [];

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const upcoming = confirmed.filter(
    (b) => b.scheduleId?.date && new Date(b.scheduleId.date) >= new Date()
  );
  const totalSpent = confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const chartData = confirmed.slice(0, 6).reverse().map((b) => ({
    name: b.scheduleId?.routeId
      ? `${b.scheduleId.routeId.source?.slice(0, 3)}→${b.scheduleId.routeId.destination?.slice(0, 3)}`
      : 'Trip',
    amount: b.totalAmount,
  }));

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your bookings and profile</p>
        </div>
        <Link to="/search">
          <Button className="gap-2">
            Book a Trip <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Ticket, label: 'Total Bookings', value: bookings.length },
          { icon: Calendar, label: 'Upcoming Trips', value: upcoming.length },
          { icon: User, label: 'Total Spent', value: formatCurrency(totalSpent) },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Amount']} />
                <Bar dataKey="amount" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Link to="/dashboard/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No bookings yet. Start by searching for a bus!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 3).map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PassengerDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
