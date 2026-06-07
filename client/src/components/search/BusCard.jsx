import { Link } from 'react-router-dom';
import { Clock, Users, Star, Wifi, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function BusCard({ result }) {
  const { schedule, bus, route, operator } = result;
  const amenities = bus?.amenities?.slice(0, 3) || [];

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {bus?.photos?.[0] && (
            <div className="h-40 w-full shrink-0 md:h-auto md:w-48">
              <img
                src={bus.photos[0]}
                alt={bus.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col justify-between p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{bus?.name || 'Bus'}</h3>
                  <Badge variant="secondary">{bus?.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {route?.source} → {route?.destination}
                </p>
                <p className="text-xs text-muted-foreground">{operator?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatCurrency(schedule?.fare)}</p>
                <p className="text-xs text-muted-foreground">per seat</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {schedule?.departureTime} - {schedule?.arrivalTime}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {schedule?.availableSeats} seats left
              </span>
              {bus?.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {bus.rating.toFixed(1)}
                </span>
              )}
            </div>

            {amenities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <Badge key={a} variant="outline" className="gap-1">
                    <Wifi className="h-3 w-3" /> {a}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/bus/${bus?._id}?scheduleId=${schedule?._id}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
              <Link to={`/schedule/${schedule?._id}/seats`}>
                <Button size="sm" className="gap-1">
                  Select Seats <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
