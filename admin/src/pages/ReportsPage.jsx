import { formatCurrency } from '@/utils/currency';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import RevenueChart from '@/components/dashboard/RevenueChart';
import BookingsPieChart from '@/components/dashboard/BookingsPieChart';
import WeeklyRevenueBar from '@/components/dashboard/WeeklyRevenueBar';
import { selectUserRole } from '@/store/slices/authSlice';
import {
  useGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
  useGetOperatorRevenueReportQuery,
} from '@/store/api/adminApi';

export default function ReportsPage() {
  const role = useSelector(selectUserRole);
  const [activeTab, setActiveTab] = useState('revenue');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const adminRevenue = useGetAdminRevenueReportQuery(
    { startDate, endDate },
    { skip: role !== 'admin' }
  );
  const adminBookings = useGetAdminBookingsReportQuery(undefined, { skip: role !== 'admin' });
  const operatorRevenue = useGetOperatorRevenueReportQuery(undefined, {
    skip: role !== 'operator',
  });

  const revenueData =
    role === 'admin' ? adminRevenue.data?.data?.revenue : operatorRevenue.data?.data?.revenue;
  const revenueLoading =
    role === 'admin' ? adminRevenue.isLoading : operatorRevenue.isLoading;
  const bookingsBreakdown = adminBookings.data?.data?.breakdown;

  return (
    <div className="space-y-6">
      {role === 'admin' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="revenue" activeValue={activeTab} onClick={setActiveTab}>
            Revenue
          </TabsTrigger>
          {role === 'admin' && (
            <TabsTrigger value="bookings" activeValue={activeTab} onClick={setActiveTab}>
              Bookings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="revenue" activeValue={activeTab}>
          <div className="grid gap-4 lg:grid-cols-2">
            {role === 'admin' ? (
              <RevenueChart data={revenueData} isLoading={revenueLoading} />
            ) : (
              <WeeklyRevenueBar data={revenueData} isLoading={revenueLoading} />
            )}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-bold">
                      {formatCurrency(
                        (revenueData || []).reduce((sum, item) => sum + (item.total || 0), 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Points</span>
                    <span className="font-bold">{(revenueData || []).length}</span>
                  </div>
                  {role === 'admin' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Transactions</span>
                      <span className="font-bold">
                        {(revenueData || []).reduce(
                          (sum, item) => sum + (item.count || 0),
                          0
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {role === 'admin' && (
          <TabsContent value="bookings" activeValue={activeTab}>
            <div className="grid gap-4 lg:grid-cols-2">
              <BookingsPieChart
                data={bookingsBreakdown}
                isLoading={adminBookings.isLoading}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Booking Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(bookingsBreakdown || []).map((item) => (
                      <div key={item._id} className="flex justify-between items-center">
                        <span className="capitalize">{item._id}</span>
                        <span className="font-bold">{item.count}</span>
                      </div>
                    ))}
                    {(!bookingsBreakdown || bookingsBreakdown.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
