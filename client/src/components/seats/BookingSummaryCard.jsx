import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/currency';

export default function BookingSummaryCard({
  schedule,
  route,
  bus,
  selectedSeats,
  lockExpiresAt,
  onProceed,
  isLoading,
}) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const total = (schedule?.fare || 0) * selectedSeats.length;

  useEffect(() => {
    if (!lockExpiresAt) return undefined;

    const update = () => {
      const diff = differenceInSeconds(new Date(lockExpiresAt), new Date());
      setSecondsLeft(Math.max(0, diff));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const lockProgress = lockExpiresAt
    ? (secondsLeft / 300) * 100
    : 0;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {route && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{route.source} → {route.destination}</span>
          </div>
        )}
        {schedule && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {schedule.departureTime} - {schedule.arrivalTime}
          </div>
        )}
        {bus && (
          <p className="text-sm">{bus.name} · <Badge variant="secondary">{bus.type}</Badge></p>
        )}

        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Selected Seats ({selectedSeats.length})
          </div>
          {selectedSeats.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSeats.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">No seats selected</p>
          )}
        </div>

        {lockExpiresAt && selectedSeats.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-amber-800">Seat lock expires in</span>
              <span className="font-mono font-bold text-amber-900">{formatTime(secondsLeft)}</span>
            </div>
            <Progress value={lockProgress} className="mt-2 h-2" />
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(schedule?.fare)} × {selectedSeats.length} seat(s)</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={selectedSeats.length === 0 || isLoading}
          onClick={onProceed}
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </CardFooter>
    </Card>
  );
}
