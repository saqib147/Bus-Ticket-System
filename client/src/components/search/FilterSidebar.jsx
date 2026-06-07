import { formatCurrency } from '@/utils/currency';
import { useDispatch, useSelector } from 'react-redux';
import { setTypeFilter, setPriceRange, setAmenities } from '@/store/slices/searchSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';

const amenityOptions = ['WiFi', 'USB Charging', 'Water Bottle', 'Blanket', 'Reading Light', 'AC'];

export default function FilterSidebar() {
  const dispatch = useDispatch();
  const { type, priceRange, amenities } = useSelector((state) => state.search);

  const toggleAmenity = (amenity) => {
    const next = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    dispatch(setAmenities(next));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Bus Type</Label>
          <Select value={type} onChange={(e) => dispatch(setTypeFilter(e.target.value))}>
            <option value="">All Types</option>
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
            <option value="Sleeper">Sleeper</option>
            <option value="Semi-Sleeper">Semi-Sleeper</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</Label>
          <Slider
            value={priceRange}
            onValueChange={(val) => dispatch(setPriceRange(val))}
            min={0}
            max={10000}
            step={100}
          />
        </div>

        <div className="space-y-3">
          <Label>Amenities</Label>
          {amenityOptions.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={amenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
