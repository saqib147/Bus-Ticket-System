import { cn } from '@/utils/cn';

const statusStyles = {
  available: 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200 cursor-pointer',
  selected: 'bg-primary border-primary text-primary-foreground animate-pulse-glow cursor-pointer',
  locked: 'bg-amber-100 border-amber-400 text-amber-800 cursor-not-allowed opacity-70',
  booked: 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed opacity-60',
  mine: 'bg-blue-100 border-blue-500 text-blue-800 cursor-pointer',
};

export default function SeatButton({ seatNumber, status, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || status === 'booked' || status === 'locked'}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-md border text-xs font-semibold transition-all',
        statusStyles[status] || statusStyles.available
      )}
      title={`Seat ${seatNumber}`}
    >
      {seatNumber}
    </button>
  );
}
