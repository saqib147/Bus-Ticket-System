import { cn } from '@/utils/cn';

export default function SeatLegend() {
  const items = [
    { label: 'Available', className: 'bg-emerald-100 border-emerald-400' },
    { label: 'Selected', className: 'bg-primary border-primary' },
    { label: 'Locked', className: 'bg-amber-100 border-amber-400' },
    { label: 'Booked', className: 'bg-red-100 border-red-300' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm">
          <div className={cn('h-4 w-4 rounded border', item.className)} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
