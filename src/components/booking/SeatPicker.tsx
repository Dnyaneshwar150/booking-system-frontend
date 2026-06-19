import { useState, useMemo, useCallback } from 'react';
import { Clock, AlertCircle, CheckCircle2, Armchair } from 'lucide-react';
import type { Seat, SeatConfig } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';

// ─── Modern Color Palette for Seat Types ──────────────────────────────────
const SEAT_STYLES = {
  regular: {
    available: {
      bg: '#1e3a5f',
      border: '#3b82f6',
      text: '#93c5fd',
      hover: '#1e4a7a',
    },
    label: 'Regular',
  },
  premium: {
    available: {
      bg: '#2d1b54',
      border: '#8b5cf6',
      text: '#c4b5fd',
      hover: '#3d2470',
    },
    label: 'Premium',
  },
  vip: {
    available: {
      bg: '#3d2a00',
      border: '#f59e0b',
      text: '#fcd34d',
      hover: '#4d3600',
    },
    label: 'VIP',
  },
};

interface SeatState {
  _id: string;
  seatNumber: string;
  row: number;
  column: number;
  type: 'regular' | 'premium' | 'vip';
  price: number;
  status: 'available' | 'reserved' | 'booked';
  selected: boolean;
}

interface SeatPickerProps {
  seats: Seat[];
  seatConfig: SeatConfig;
  eventId: string;
  onReserve: (seatIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function SeatPicker({ seats, seatConfig, onReserve, isLoading = false }: SeatPickerProps) {
  const { rows, seatsPerRow, aislePosition = 6 } = seatConfig;

  // Build 2D grid from flat seat list
  const grid = useMemo<SeatState[][]>(() => {
    const g: SeatState[][] = Array.from({ length: rows }, () => []);
    seats.forEach((s) => {
      if (g[s.row]) {
        g[s.row][s.column] = { ...s, selected: false };
      }
    });
    return g;
  }, [seats, rows]);

  const [seatGrid, setSeatGrid] = useState<SeatState[][]>(grid);
  const [selectedSeats, setSelectedSeats] = useState<SeatState[]>([]);

  const handleSeatClick = useCallback((row: number, col: number) => {
    const seat = seatGrid[row]?.[col];
    if (!seat || seat.status !== 'available') return;

    const isSelected = seat.selected;

    setSeatGrid((prev) =>
      prev.map((r, rIdx) =>
        r.map((s, cIdx) =>
          rIdx === row && cIdx === col ? { ...s, selected: !s.selected } : s
        )
      )
    );

    setSelectedSeats((prev) =>
      isSelected ? prev.filter((s) => s._id !== seat._id) : [...prev, seat]
    );
  }, [seatGrid]);

  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  const getSeatStyle = (seat: SeatState | undefined): React.CSSProperties => {
    if (!seat) return { visibility: 'hidden' };
    if (seat.status === 'booked') {
      return {
        background: '#1a1d26',
        border: '1px solid #2a2d3a',
        color: '#3a3d4a',
        cursor: 'not-allowed',
      };
    }
    if (seat.status === 'reserved') {
      return {
        background: '#1e2230',
        border: '1px dashed #475569',
        color: '#64748b',
        cursor: 'not-allowed',
      };
    }
    if (seat.selected) {
      return {
        background: 'rgba(16, 185, 129, 0.25)',
        border: '2px solid #10b981',
        color: '#10b981',
        cursor: 'pointer',
        transform: 'scale(1.1)',
        boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
      };
    }
    const style = SEAT_STYLES[seat.type];
    return {
      background: style.available.bg,
      border: `1px solid ${style.available.border}`,
      color: style.available.text,
      cursor: 'pointer',
    };
  };

  const handleReserveClick = async () => {
    if (selectedSeats.length === 0) return;
    await onReserve(selectedSeats.map((s) => s._id));
    // Reset after reserve
    setSeatGrid(grid.map((r) => r.map((s) => ({ ...s, selected: false }))));
    setSelectedSeats([]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Screen indicator */}
      <section>
        <div
          style={{
            height: '6px',
            background: 'linear-gradient(90deg, transparent, #4f6ef7, #8b5cf6, transparent)',
            borderRadius: '4px',
            marginBottom: '0.5rem',
          }}
        />
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Screen
        </p>
      </section>

      {/* Seat Grid */}
      <section className="overflow-x-auto">
        <div style={{ display: 'inline-block', minWidth: 'max-content', margin: '0 auto' }}>
          {seatGrid.map((row, rowIdx) => {
            const rowLabel = String.fromCharCode(65 + rowIdx);
            return (
              <div key={rowIdx} className="flex items-center gap-2 mb-1">
                {/* Row label */}
                <span
                  style={{
                    width: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {rowLabel}
                </span>

                {/* Seats with aisle gap */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: seatsPerRow }).map((_, colIdx) => {
                    const seat = row[colIdx];
                    return (
                      <div key={colIdx} className="flex items-center">
                        {colIdx === aislePosition && (
                          <div style={{ width: '1.5rem', flexShrink: 0 }} />
                        )}
                        <button
                          onClick={() => handleSeatClick(rowIdx, colIdx)}
                          disabled={seat?.status !== 'available'}
                          title={seat ? `${seat.seatNumber} — ${SEAT_STYLES[seat.type]?.label ?? seat.type} — ₹${seat.price}` : ''}
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '4px 4px 0 0',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                            outline: 'none',
                            flexShrink: 0,
                            ...getSeatStyle(seat),
                          }}
                        >
                          {colIdx + 1}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Legend */}
      <section>
        <div className="flex flex-wrap gap-4 justify-center">
          {(Object.entries(SEAT_STYLES) as [keyof typeof SEAT_STYLES, typeof SEAT_STYLES[keyof typeof SEAT_STYLES]][]).map(([type, style]) => {
            const price = seatConfig.seatTypes[type]?.price;
            return (
              <div key={type} className="flex items-center gap-2">
                <div
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '3px 3px 0 0',
                    background: style.available.bg,
                    border: `1px solid ${style.available.border}`,
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {style.label} {price ? `(₹${price})` : ''}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-2">
            <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '3px 3px 0 0', background: 'rgba(16,185,129,0.25)', border: '2px solid #10b981' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '3px 3px 0 0', background: '#1e2230', border: '1px dashed #475569' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '3px 3px 0 0', background: '#1a1d26', border: '1px solid #2a2d3a' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Booked</span>
          </div>
        </div>
      </section>

      {/* Booking Summary */}
      <section
        className="rounded-xl p-5"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Armchair size={16} style={{ color: 'var(--color-brand-500)' }} />
          Booking Summary
        </h3>

        {selectedSeats.length === 0 ? (
          <div className="flex items-center gap-2 py-2" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <AlertCircle size={15} />
            No seats selected. Click on available seats above.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Selected seats list */}
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((s) => (
                <div
                  key={s._id}
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '0.375rem',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
                    color: '#10b981',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CheckCircle2 size={11} />
                  {s.seatNumber}
                  <span style={{ opacity: 0.7 }}>· ₹{s.price}</span>
                </div>
              ))}
            </div>

            {/* Breakdown by type */}
            <div
              className="flex flex-col gap-1 pt-3 mt-1"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              {(['regular', 'premium', 'vip'] as const).map((type) => {
                const typeSeats = selectedSeats.filter((s) => s.type === type);
                if (typeSeats.length === 0) return null;
                const subtotal = typeSeats.reduce((a, s) => a + s.price, 0);
                return (
                  <div key={type} className="flex justify-between" style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {SEAT_STYLES[type].label} × {typeSeats.length}
                    </span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-brand-500)' }}>
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleReserveClick}
          disabled={selectedSeats.length === 0 || isLoading}
          className="btn-primary w-full mt-4"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            fontSize: '0.9rem',
          }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Reserving...
            </>
          ) : (
            <>
              <Clock size={15} />
              Reserve {selectedSeats.length > 0 ? `${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}` : 'Seats'}
            </>
          )}
        </button>
        {selectedSeats.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Seats reserved for 10 minutes after clicking Reserve
          </p>
        )}
      </section>
    </div>
  );
}
