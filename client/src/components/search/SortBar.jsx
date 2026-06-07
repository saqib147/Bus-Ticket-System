import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpDown } from 'lucide-react';
import { setSortBy } from '@/store/slices/searchSlice';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';

export default function SortBar({ count = 0 }) {
  const dispatch = useDispatch();
  const sortBy = useSelector((state) => state.search.sortBy);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{count}</span> buses found
      </p>
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="sort" className="sr-only">Sort by</Label>
        <Select
          id="sort"
          value={sortBy}
          onChange={(e) => dispatch(setSortBy(e.target.value))}
          className="w-44"
        >
          <option value="departure">Departure Time</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="seats">Most Seats</option>
          <option value="rating">Highest Rated</option>
        </Select>
      </div>
    </div>
  );
}
