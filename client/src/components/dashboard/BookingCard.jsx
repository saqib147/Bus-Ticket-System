import { formatCurrency } from '@/utils/currency';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const statusVariant = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'destructive',
  refunded: 'secondary',
};

export default function BookingCard({ booking, onCancel }) {
  const schedule = booking.scheduleId;
  const route = schedule?.routeId;
  const bus = schedule?.busId;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold">
                {route?.source} → {route?.destination}
              </span>
              <Badge variant={statusVariant[booking.status] || 'outline'}>
                {booking.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{bus?.name}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {schedule?.departureTime}
              </span>
              <span>
                {schedule?.date ? format(new Date(schedule.date), 'MMM d, yyyy') : '—'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatCurrency(booking.totalAmount)}</p>
            <div className="mt-1 flex flex-wrap justify-end gap-1">
              {booking.seats?.map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {booking.status === 'confirmed' && (
            <Link to={`/booking/success?bookingId=${booking._id}`}>
              <Button size="sm" variant="outline" className="gap-1">
                View Ticket <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
          {['confirmed', 'pending'].includes(booking.status) && onCancel && (
            <Button size="sm" variant="destructive" onClick={() => onCancel(booking._id)}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
