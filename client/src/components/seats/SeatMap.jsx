import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import BusOutline from './BusOutline';
import SeatButton from './SeatButton';
import SeatLegend from './SeatLegend';

export default function SeatMap({ seats = [], onSeatClick, currentUserId }) {
  const selectedSeats = useSelector((state) => state.booking.selectedSeats);

  const grid = useMemo(() => {
    const maxRow = Math.max(...seats.map((s) => s.row), 0);
    const maxCol = Math.max(...seats.map((s) => s.column), 0);
    const map = {};

    seats.forEach((seat) => {
      if (!map[seat.row]) map[seat.row] = {};
      map[seat.row][seat.column] = seat;
    });

    return { maxRow, maxCol, map };
  }, [seats]);

  const getSeatStatus = (seat) => {
    if (selectedSeats.includes(seat.seatNumber)) return 'selected';
    if (seat.status === 'booked') return 'booked';
    if (seat.status === 'locked') {
      if (seat.lockedBy === currentUserId) return 'mine';
      return 'locked';
    }
    return 'available';
  };

  return (
    <div className="space-y-6">
      <SeatLegend />
      <BusOutline>
        <div className="space-y-3">
          {Array.from({ length: grid.maxRow }, (_, rowIdx) => {
            const row = rowIdx + 1;
            return (
              <div key={row} className="flex items-center justify-center gap-3">
                {Array.from({ length: grid.maxCol }, (_, colIdx) => {
                  const col = colIdx + 1;
                  const seat = grid.map[row]?.[col];

                  if (!seat) {
                    return <div key={col} className="h-10 w-10" />;
                  }

                  const isAisle = col === Math.ceil(grid.maxCol / 2);
                  return (
                    <div key={col} className="flex items-center gap-3">
                      {isAisle && col > 1 && <div className="w-6" />}
                      <SeatButton
                        seatNumber={seat.seatNumber}
                        status={getSeatStatus(seat)}
                        onClick={() => onSeatClick(seat)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </BusOutline>
    </div>
  );
}
