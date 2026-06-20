import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowLeft, CheckCircle2, AlertCircle, Clock, CreditCard } from 'lucide-react';
import { eventsApi, reserveApi, bookingsApi, type EventDetail } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import SeatPicker from '../components/booking/SeatPicker';
import { formatDate, formatTime } from '../lib/utils';

type BookingStep = 'select' | 'confirm' | 'done';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  on_sale: { label: 'On Sale', cls: 'badge-success' },
  sold_out: { label: 'Sold Out', cls: 'badge-error' },
  cancelled: { label: 'Cancelled', cls: 'badge-warning' },
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<BookingStep>('select');
  const [reservationId, setReservationId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [reservedSeatNumbers, setReservedSeatNumbers] = useState<string[]>([]);

  const loadDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await eventsApi.detail(id);
      setDetail(res.data.data);
    } catch {
      setError('Failed to load event details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadDetail(); }, [id]);

  const handleReserve = async (seatIds: string[]) => {
    if (!user) { navigate('/login'); return; }
    if (!id) return;
    setIsReserving(true);
    setError('');
    try {
      const res = await reserveApi.reserve({ eventId: id, seatIds });
      setReservationId(res.data.data.reservationId);
      setExpiresAt(res.data.data.expiresAt);
      // Get seat numbers from selected IDs
      const nums = detail?.seats.filter((s) => seatIds.includes(s.id)).map((s) => s.seatNumber) ?? [];
      setReservedSeatNumbers(nums);
      setStep('confirm');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to reserve seats. They may already be taken.';
      setError(msg);
    } finally {
      setIsReserving(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!paymentId.trim()) { setError('Please enter a payment ID'); return; }
    setIsConfirming(true);
    setError('');
    try {
      await bookingsApi.confirm({ reservationId, paymentId });
      setStep('done');
      // Reload seats to reflect booked status
      void loadDetail();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Booking failed. Reservation may have expired.';
      setError(msg);
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-brand-500)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button onClick={() => void loadDetail()} className="btn-primary">Retry</button>
      </div>
    );
  }

  if (!detail) return null;
  const { event, seats } = detail;
  const statusInfo = STATUS_BADGE[event.status] ?? { label: event.status, cls: 'badge-info' };

  // ─── Booking Done State ───────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div
          className="rounded-2xl p-10 text-center max-w-md w-full"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(45, 138, 78, 0.1)', border: '2px solid #2d8a4e' }}
          >
            <CheckCircle2 size={32} style={{ color: '#2d8a4e' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            Booking Confirmed!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Your tickets for <strong style={{ color: 'var(--color-text-primary)' }}>{event.name}</strong> have been booked.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {reservedSeatNumbers.map((s) => (
              <span key={s} style={{ background: 'rgba(45, 138, 78, 0.1)', border: '1px solid rgba(45, 138, 78, 0.25)', color: '#2d8a4e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                {s}
              </span>
            ))}
          </div>
          <button onClick={() => navigate('/events')} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            Browse More Events
          </button>
        </div>
      </div>
    );
  }

  // ─── Confirm Step ────────────────────────────────────────────────────────
  if (step === 'confirm') {
    const expiresDate = new Date(expiresAt);
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div
          className="rounded-2xl p-8 w-full max-w-md"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            Confirm Booking
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {event.name} · {formatDate(event.date)}
          </p>

          {/* Reservation info */}
          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: 'rgba(183, 121, 31, 0.08)', border: '1px solid rgba(183, 121, 31, 0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontWeight: 600 }}>
              <Clock size={14} />
              Seats Reserved — Expires at {expiresDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex flex-wrap gap-2">
              {reservedSeatNumbers.map((s) => (
                <span key={s} style={{ background: 'rgba(183, 121, 31, 0.1)', color: 'var(--color-warning)', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg p-3 mb-4" style={{ background: 'rgba(197, 48, 48, 0.08)', border: '1px solid rgba(197, 48, 48, 0.2)', color: 'var(--color-error)', fontSize: '0.85rem' }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Payment ID */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={13} />
              Payment ID
            </label>
            <input
              id="payment-id"
              type="text"
              className="input-base"
              placeholder="e.g. pay_abc123xyz (from payment gateway)"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              For testing, enter any string (e.g. <code style={{ color: 'var(--color-brand-500)' }}>pay_test_001</code>)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep('select'); setError(''); }}
              className="btn-ghost"
              style={{ flex: 1 }}
            >
              ← Back
            </button>
            <button
              onClick={() => void handleConfirmBooking()}
              disabled={isConfirming}
              className="btn-primary"
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  Confirm &amp; Book
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Select Seats Step ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Event Header */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--color-surface-2) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '2rem 0',
        }}
      >
        <div className="section-container">
          <button
            onClick={() => navigate('/events')}
            className="btn-ghost flex items-center gap-2 mb-5"
            style={{ padding: '0.35rem 0.75rem' }}
          >
            <ArrowLeft size={15} />
            Back to Events
          </button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Poster thumbnail */}
            {event.posterUrl && (
              <div style={{ flexShrink: 0 }}>
                <img
                  src={event.posterUrl}
                  alt={event.name}
                  style={{ width: '120px', borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(26,26,26,0.12)', display: 'block' }}
                />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                {event.category && (
                  <span className="badge badge-info">{event.category}</span>
                )}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
                {event.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  <MapPin size={15} style={{ color: 'var(--color-brand-500)' }} />
                  {event.venue}
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  <Calendar size={15} style={{ color: 'var(--color-brand-500)' }} />
                  {formatDate(event.date)} at {formatTime(event.date)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="section-container mt-4">
          <div
            className="flex items-center gap-2 rounded-xl p-4"
            style={{ background: 'rgba(197, 48, 48, 0.08)', border: '1px solid rgba(197, 48, 48, 0.2)', color: 'var(--color-error)', fontSize: '0.875rem' }}
          >
            <AlertCircle size={15} />
            {error}
          </div>
        </div>
      )}

      {/* No auth warning */}
      {!user && (
        <div className="section-container mt-4">
          <div
            className="flex items-center gap-2 rounded-xl p-4"
            style={{ background: 'rgba(183, 121, 31, 0.08)', border: '1px solid rgba(183, 121, 31, 0.25)', color: 'var(--color-warning)', fontSize: '0.875rem' }}
          >
            <AlertCircle size={15} />
            Please{' '}
            <a href="/login" style={{ color: 'var(--color-warning)', fontWeight: 700 }}>sign in</a>
            {' '}to reserve seats.
          </div>
        </div>
      )}

      {/* Seat Picker */}
      <section className="section-container py-8">
        {event.status !== 'on_sale' ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {event.status === 'sold_out' ? '🎟️' : '❌'}
            </p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
              {event.status === 'sold_out' ? 'This event is sold out' : 'This event has been cancelled'}
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <SeatPicker
              seats={seats}
              seatConfig={event.seatConfig}
              eventId={event._id}
              onReserve={handleReserve}
              isLoading={isReserving}
            />
          </div>
        )}
      </section>
    </div>
  );
}
