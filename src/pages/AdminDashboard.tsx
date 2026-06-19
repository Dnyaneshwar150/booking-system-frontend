import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Ticket, CheckCircle2, AlertCircle, ImageIcon, MapPin, Calendar, Rows3, LayoutGrid, Users } from 'lucide-react';
import { eventsApi, type CreateEventPayload } from '../lib/api';

const DEFAULT_SEAT_CONFIG = {
  rows: 8,
  seatsPerRow: 12,
  aislePosition: 6,
  seatTypes: {
    regular: { price: 150, rows: [0, 1, 2] },
    premium: { price: 250, rows: [3, 4, 5] },
    vip: { price: 350, rows: [6, 7] },
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [rows, setRows] = useState(DEFAULT_SEAT_CONFIG.rows);
  const [seatsPerRow, setSeatsPerRow] = useState(DEFAULT_SEAT_CONFIG.seatsPerRow);
  const [aislePosition, setAislePosition] = useState(DEFAULT_SEAT_CONFIG.aislePosition);
  const [regularPrice, setRegularPrice] = useState(150);
  const [premiumPrice, setPremiumPrice] = useState(250);
  const [vipPrice, setVipPrice] = useState(350);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const totalRows = rows;
    // Auto-split rows: bottom 2 = VIP, next 3 = Premium, rest = Regular
    const vipRows = [totalRows - 1, totalRows - 2].filter((r) => r >= 0);
    const premiumRows = [totalRows - 3, totalRows - 4, totalRows - 5].filter((r) => r >= 0 && !vipRows.includes(r));
    const regularRows = Array.from({ length: totalRows }, (_, i) => i).filter(
      (r) => !vipRows.includes(r) && !premiumRows.includes(r)
    );

    const payload: CreateEventPayload = {
      name,
      venue,
      date: new Date(date).toISOString(),
      category: category || undefined,
      posterUrl: posterUrl || undefined,
      seatConfig: {
        rows: totalRows,
        seatsPerRow,
        aislePosition,
        seatTypes: {
          regular: { price: regularPrice, rows: regularRows },
          premium: { price: premiumPrice, rows: premiumRows },
          vip: { price: vipPrice, rows: vipRows },
        },
      },
    };

    try {
      const res = await eventsApi.create(payload);
      const { event, seatsCreated } = res.data.data;
      setSuccess(`✓ "${event.name}" created with ${seatsCreated} seats!`);
      // Reset form
      setName(''); setVenue(''); setDate(''); setCategory(''); setPosterUrl('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create event.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <section style={{ background: 'linear-gradient(180deg, rgba(79,110,247,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--color-border)', padding: '2.5rem 0 2rem' }}>
        <div className="section-container">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center" style={{ boxShadow: '0 4px 12px rgba(79,110,247,0.35)' }}>
              <Ticket size={18} className="text-white" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Admin Dashboard
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Create and manage events for SortMyScene
          </p>
        </div>
      </section>

      <div className="section-container py-8">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>

          {/* Form */}
          <div
            className="rounded-2xl p-7"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle size={18} style={{ color: 'var(--color-brand-500)' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Create New Event</h2>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl p-4 mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '0.85rem' }}>
                <AlertCircle size={15} />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 rounded-xl p-4 mb-5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '0.85rem' }}>
                <CheckCircle2 size={15} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                <div>
                  {success}
                  <button onClick={() => navigate('/events')} style={{ display: 'block', marginTop: '0.5rem', color: '#10b981', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                    View all events →
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Basic Info */}
              <fieldset style={{ border: 'none', padding: 0 }}>
                <legend style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'block' }}>
                  Event Details
                </legend>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Ticket size={12} /> Event Name
                    </label>
                    <input id="admin-name" type="text" className="input-base" placeholder="e.g. Avengers Endgame" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={12} /> Venue
                      </label>
                      <input id="admin-venue" type="text" className="input-base" placeholder="e.g. PVR Cinema, Pune" value={venue} onChange={(e) => setVenue(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={12} /> Date &amp; Time
                      </label>
                      <input id="admin-date" type="datetime-local" className="input-base" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category (optional)</label>
                      <input id="admin-category" type="text" className="input-base" placeholder="e.g. Concert, Comedy, Magic" value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ImageIcon size={12} /> Poster URL (optional)
                      </label>
                      <input id="admin-poster" type="url" className="input-base" placeholder="https://example.com/poster.jpg" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Seat Config */}
              <fieldset
                style={{ border: 'none', padding: 0, borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}
              >
                <legend style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', display: 'block' }}>
                  Seat Configuration
                </legend>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Rows3 size={12} /> Number of Rows
                      </label>
                      <input id="admin-rows" type="number" min={4} max={26} className="input-base" value={rows} onChange={(e) => setRows(Number(e.target.value))} required />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <LayoutGrid size={12} /> Seats per Row
                      </label>
                      <input id="admin-seats-per-row" type="number" min={4} max={30} className="input-base" value={seatsPerRow} onChange={(e) => setSeatsPerRow(Number(e.target.value))} required />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={12} /> Aisle After Seat #
                      </label>
                      <input id="admin-aisle" type="number" min={1} max={seatsPerRow - 1} className="input-base" value={aislePosition} onChange={(e) => setAislePosition(Number(e.target.value))} required />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                  >
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                      Ticket Pricing (₹)
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                      {[
                        { id: 'admin-regular-price', label: 'Regular', value: regularPrice, setter: setRegularPrice, color: '#3b82f6' },
                        { id: 'admin-premium-price', label: 'Premium', value: premiumPrice, setter: setPremiumPrice, color: '#8b5cf6' },
                        { id: 'admin-vip-price', label: 'VIP', value: vipPrice, setter: setVipPrice, color: '#f59e0b' },
                      ].map((tier) => (
                        <div key={tier.label} className="flex flex-col gap-1.5 flex-1">
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: tier.color }}>{tier.label}</label>
                          <div className="relative">
                            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>₹</span>
                            <input
                              id={tier.id}
                              type="number"
                              min={0}
                              className="input-base"
                              style={{ paddingLeft: '1.75rem' }}
                              value={tier.value}
                              onChange={(e) => tier.setter(Number(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                      Rows auto-split: bottom 2 = VIP, next 3 = Premium, remaining = Regular
                    </p>
                  </div>
                </div>
              </fieldset>

              <button
                id="admin-create-submit"
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ padding: '0.875rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Create Event
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview panel */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', position: 'sticky', top: '5rem' }}
            >
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
                Event Preview
              </h3>
              <div
                className="rounded-xl overflow-hidden"
                style={{ aspectRatio: '3/4', background: posterUrl ? `url(${posterUrl}) center/cover` : 'linear-gradient(135deg, #1e3a5f, #2d1b54)', marginBottom: '1rem', display: 'flex', alignItems: 'flex-end', position: 'relative' }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 30%, transparent 100%)' }} />
                <div style={{ position: 'relative', padding: '1rem', zIndex: 1 }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {name || 'Event Name'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                    {venue || 'Venue'}
                  </p>
                </div>
                {!posterUrl && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
                    <div style={{ textAlign: 'center', opacity: 0.3 }}>
                      <ImageIcon size={32} style={{ color: 'white', margin: '0 auto 0.5rem' }} />
                      <p style={{ color: 'white', fontSize: '0.7rem' }}>Add poster URL</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { label: 'Total Seats', value: rows * seatsPerRow },
                  { label: 'Regular seats', value: `${Math.max(0, rows - 5)} rows × ₹${regularPrice}` },
                  { label: 'Premium seats', value: `3 rows × ₹${premiumPrice}` },
                  { label: 'VIP seats', value: `2 rows × ₹${vipPrice}` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center" style={{ fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
