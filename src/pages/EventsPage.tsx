import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, CalendarDays, RefreshCw, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi, type Event } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/events/EventCard';

type StatusFilter = 'all' | 'on_sale' | 'sold_out' | 'cancelled';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'on_sale', label: 'On Sale' },
  { value: 'sold_out', label: 'Sold Out' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function EventsPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const loadEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await eventsApi.list();
      setEvents(res.data.data);
    } catch {
      setError('Failed to load events. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadEvents(); }, []);

  const filtered = events.filter((e) => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Hero header */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--color-surface-2) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '3rem 0 2rem',
        }}
      >
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={18} style={{ color: 'var(--color-brand-500)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-brand-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Upcoming
                </span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Discover Events
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Find concerts, shows, and live experiences near you
              </p>
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <Ticket size={15} />
                Create Event
              </Link>
            )}
          </div>

          {/* Search bar */}
          <div className="relative mt-6" style={{ maxWidth: '480px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              id="events-search"
              type="text"
              className="input-base"
              style={{ paddingLeft: '2.75rem', borderRadius: '9999px' }}
              placeholder="Search by name or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section style={{ borderBottom: '1px solid var(--color-border-subtle)', padding: '0.75rem 0' }}>
        <div className="section-container">
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} style={{ color: 'var(--color-text-muted)' }} />
            <div className="flex gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s',
                    background: statusFilter === tab.value ? 'var(--color-brand-500)' : 'var(--color-surface-2)',
                    color: statusFilter === tab.value ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => void loadEvents()}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-container py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-brand-500)', borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading events...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div style={{ fontSize: '3rem' }}>⚠️</div>
            <p style={{ color: 'var(--color-error)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>
            <button onClick={() => void loadEvents()} className="btn-outline" style={{ marginTop: '0.5rem' }}>
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div style={{ fontSize: '3rem' }}>🎭</div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No events found</p>
            {isAdmin && (
              <Link to="/admin" className="btn-primary" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
                Create your first event
              </Link>
            )}
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filtered.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
