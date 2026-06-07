import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Search, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { setSearchParams } from '@/store/slices/searchSlice';
import { useGetRoutesQuery } from '@/store/api/busApi';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';

export default function SearchWidget({ compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();

  const { data: routesData } = useGetRoutesQuery({});
  const routes = routesData?.data?.routes ?? [];

  // Always read initial values from URL when compact (results page),
  // otherwise start empty for the homepage widget.
  const initFrom = compact ? (urlParams.get('from') || '') : '';
  const initTo   = compact ? (urlParams.get('to')   || '') : '';
  const initDate = compact
    ? (urlParams.get('date') || format(new Date(), 'yyyy-MM-dd'))
    : format(new Date(), 'yyyy-MM-dd');
  const initType = compact ? (urlParams.get('type') || '') : '';

  const [from, setFrom] = useState(initFrom);
  const [to,   setTo]   = useState(initTo);
  const [date, setDate] = useState(initDate);
  const [type, setType] = useState(initType);

  // When the URL changes (user hit back/forward or a new search was triggered),
  // sync the widget fields to match.
  useEffect(() => {
    if (compact) {
      setFrom(urlParams.get('from') || '');
      setTo(urlParams.get('to')     || '');
      setDate(urlParams.get('date') || format(new Date(), 'yyyy-MM-dd'));
      setType(urlParams.get('type') || '');
    }
  }, [compact, urlParams]);

  // Unique source cities
  const sources = [...new Set(routes.map((r) => r.source))].sort();

  // Destinations valid for the selected source
  const destinations = [
    ...new Set(
      routes
        .filter((r) => !from || r.source === from)
        .map((r) => r.destination)
    ),
  ].sort();

  // Reset "to" if it's no longer a valid destination for the new "from"
  useEffect(() => {
    if (to && destinations.length > 0 && !destinations.includes(to)) {
      setTo('');
    }
  }, [from]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;

    const params = { from, to, date, type };
    dispatch(setSearchParams(params));
    navigate(
      `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}${type ? `&type=${type}` : ''}`
    );
  };

  return (
    <Card className={compact ? 'shadow-lg' : 'shadow-xl border-0 bg-white/95 backdrop-blur'}>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-5 md:items-end">

          {/* From */}
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" /> From
            </Label>
            <Select
              id="from"
              name="from"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setTo(''); }}
              required
            >
              <option value="">Select city</option>
              {sources.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Select>
          </div>

          {/* To */}
          <div className="space-y-2">
            <Label htmlFor="to" className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" /> To
            </Label>
            <Select
              id="to"
              name="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              disabled={!from}
            >
              <option value="">{from ? 'Select city' : 'Select From first'}</option>
              {destinations.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Select>
          </div>

          {/* Date — fully controlled */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" /> Date
            </Label>
            <input
              id="date"
              name="date"
              type="date"
              value={date}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Bus Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Bus Type</Label>
            <Select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Semi-Sleeper">Semi-Sleeper</option>
            </Select>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2">
            <Search className="h-4 w-4" />
            Search Buses
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
