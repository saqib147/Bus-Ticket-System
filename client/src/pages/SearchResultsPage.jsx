import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSearchBusesQuery } from '@/store/api/busApi';
import { setSearchParams } from '@/store/slices/searchSlice';
import SearchWidget from '@/components/landing/SearchWidget';
import SearchResults from '@/components/search/SearchResults';
import toast from 'react-hot-toast';

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();

  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const date = params.get('date') || '';
  const type = params.get('type') || '';

  useEffect(() => {
    if (from && to && date) {
      dispatch(setSearchParams({ from, to, date, type }));
    }
  }, [from, to, date, type, dispatch]);

  const { data, isLoading, isError, error } = useSearchBusesQuery(
    { from, to, date, type: type || undefined },
    { skip: !from || !to || !date }
  );

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message || 'Search failed');
    }
  }, [isError, error]);

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Search Results</h1>
        {from && to && (
          <p className="text-muted-foreground">
            {from} → {to} · {date}
          </p>
        )}
      </div>

      <div className="mb-8">
        <SearchWidget compact />
      </div>

      {!from || !to || !date ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">Enter your search criteria above to find buses</p>
        </div>
      ) : (
        <SearchResults results={data?.data?.results || []} isLoading={isLoading} />
      )}
    </div>
  );
}
