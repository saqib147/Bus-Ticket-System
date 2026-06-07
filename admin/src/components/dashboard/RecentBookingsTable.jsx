import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';

const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
  refunded: 'secondary',
};

export default function RecentBookingsTable({ bookings, isLoading }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passenger</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bookings || []).slice(0, 5).map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">
                    {booking.passengerId?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {booking.scheduleId?.routeId
                      ? `${booking.scheduleId.routeId.source} → ${booking.scheduleId.routeId.destination}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {booking.createdAt
                      ? format(new Date(booking.createdAt), 'MMM d, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[booking.status] || 'outline'}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!bookings || bookings.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No recent bookings
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
