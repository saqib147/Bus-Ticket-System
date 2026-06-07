import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import BusCard from './BusCard';
import SortBar from './SortBar';
import FilterSidebar from './FilterSidebar';
import { Skeleton } from '@/components/ui/Skeleton';

function sortResults(results, sortBy) {
  const sorted = [...results];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.schedule.fare - b.schedule.fare);
    case 'price-high':
      return sorted.sort((a, b) => b.schedule.fare - a.schedule.fare);
    case 'seats':
      return sorted.sort((a, b) => b.schedule.availableSeats - a.schedule.availableSeats);
    case 'rating':
      return sorted.sort((a, b) => (b.bus?.rating || 0) - (a.bus?.rating || 0));
    case 'departure':
    default:
      return sorted.sort((a, b) =>
        (a.schedule.departureTime || '').localeCompare(b.schedule.departureTime || '')
      );
  }
}

function filterResults(results, { type, priceRange, amenities }) {
  return results.filter((r) => {
    if (type && r.bus?.type !== type) return false;
    if (r.schedule.fare < priceRange[0] || r.schedule.fare > priceRange[1]) return false;
    if (amenities.length > 0) {
      const busAmenities = r.bus?.amenities || [];
      if (!amenities.every((a) => busAmenities.includes(a))) return false;
    }
    return true;
  });
}

export default function SearchResults({ results = [], isLoading }) {
  const filters = useSelector((state) => state.search);

  const filtered = useMemo(
    () => sortResults(filterResults(results, filters), filters.sortBy),
    [results, filters]
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-4">
        <Skeleton className="hidden h-80 lg:block" />
        <div className="space-y-4 lg:col-span-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="hidden lg:block">
        <FilterSidebar />
      </div>
      <div className="space-y-4 lg:col-span-3">
        <SortBar count={filtered.length} />
        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-lg font-medium">No buses found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          filtered.map((result) => (
            <BusCard key={result.schedule._id} result={result} />
          ))
        )}
      </div>
    </div>
  );
}
