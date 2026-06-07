import { useParams, Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { Star, Wifi, Users, Clock, ArrowRight } from 'lucide-react';
import { useGetBusByIdQuery, useGetScheduleByIdQuery } from '@/store/api/busApi';
import { useGetBusReviewsQuery } from '@/store/api/reviewApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function BusDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get('scheduleId');

  const { data: busData, isLoading: busLoading } = useGetBusByIdQuery(id);
  const { data: scheduleData } = useGetScheduleByIdQuery(scheduleId, { skip: !scheduleId });
  const { data: reviewsData } = useGetBusReviewsQuery(id);

  const bus = busData?.data?.bus;
  const schedule = scheduleData?.data?.schedule;
  const reviews = reviewsData?.data?.reviews || [];

  if (busLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-lg">Bus not found</p>
        <Link to="/search"><Button className="mt-4">Back to Search</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {bus.photos?.[0] && (
            <img
              src={bus.photos[0]}
              alt={bus.name}
              className="h-64 w-full rounded-xl object-cover"
            />
          )}

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{bus.name}</h1>
              <Badge>{bus.type}</Badge>
              {bus.rating > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {bus.rating.toFixed(1)} ({bus.totalReviews} reviews)
                </span>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">Bus #{bus.busNumber}</p>
          </div>

          <Tabs defaultValue="overview">
            {({ active, setActive }) => (
              <>
                <TabsList>
                  <TabsTrigger value="overview" active={active} setActive={setActive}>Overview</TabsTrigger>
                  <TabsTrigger value="amenities" active={active} setActive={setActive}>Amenities</TabsTrigger>
                  <TabsTrigger value="reviews" active={active} setActive={setActive}>Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" active={active} className="mt-4">
                  <Card>
                    <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Seats</p>
                          <p className="font-semibold">{bus.totalSeats}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Layout</p>
                          <p className="font-semibold">
                            {bus.seatLayout?.rows}×{bus.seatLayout?.columns}
                          </p>
                        </div>
                      </div>
                      {schedule && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Fare</p>
                            <p className="font-semibold">{formatCurrency(schedule.fare)}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="amenities" active={active} className="mt-4">
                  <Card>
                    <CardContent className="flex flex-wrap gap-2 p-6">
                      {(bus.amenities || []).length > 0 ? (
                        bus.amenities.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)
                      ) : (
                        <p className="text-muted-foreground">No amenities listed</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reviews" active={active} className="mt-4 space-y-4">
                  {reviews.length === 0 ? (
                    <Card><CardContent className="p-6 text-muted-foreground">No reviews yet</CardContent></Card>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="mt-2 text-sm">{review.comment}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{review.passengerId?.name}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Book This Bus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedule ? (
                <>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(schedule.fare)}</p>
                  <p className="text-sm text-muted-foreground">
                    {schedule.availableSeats} seats available
                  </p>
                  <Link to={`/schedule/${schedule._id}/seats`}>
                    <Button className="w-full gap-2">
                      Select Seats <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a schedule from search results to book
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
