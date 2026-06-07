import { MapPin, Clock, Users, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function OrderSummaryCard({ booking, schedule, route, bus }) {
  const seats = booking?.seats || [];
  const total = booking?.totalAmount || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {route && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{route.source} → {route.destination}</span>
          </div>
        )}

        {schedule && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {schedule.departureTime} - {schedule.arrivalTime}
          </div>
        )}

        {bus && (
          <p className="text-sm">
            {bus.name} · <Badge variant="secondary">{bus.type}</Badge>
          </p>
        )}

        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Seats
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {seats.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CreditCard className="h-4 w-4" />
              Total Amount
            </span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
