import { format } from 'date-fns';
import { Clock, Bus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const statusVariant = {
  scheduled: 'default',
  departed: 'warning',
  arrived: 'success',
  cancelled: 'destructive',
};

export default function TodaysSchedules({ schedules, isLoading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today&apos;s Schedules
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !schedules?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No schedules for today
          </p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule._id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {schedule.busId?.name || schedule.busId?.busNumber}
                    </span>
                  </div>
                  <Badge variant={statusVariant[schedule.status] || 'outline'}>
                    {schedule.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {schedule.routeId?.source} → {schedule.routeId?.destination}
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {schedule.departureTime} - {schedule.arrivalTime}
                  </span>
                  <span>{schedule.availableSeats} seats left</span>
                </div>
                {schedule.date && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(schedule.date), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
