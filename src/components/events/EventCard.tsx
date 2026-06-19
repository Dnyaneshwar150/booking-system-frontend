import { Link } from 'react-router-dom';
import { MapPin, Tag, ArrowRight } from 'lucide-react';
import type { Event } from '../../lib/api';
import { formatDate, formatTime } from '../../lib/utils';

interface EventCardProps {
  event: Event;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  on_sale: { label: 'On Sale', cls: 'badge-success' },
  sold_out: { label: 'Sold Out', cls: 'badge-error' },
  cancelled: { label: 'Cancelled', cls: 'badge-warning' },
};

const GRADIENT_FALLBACKS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1e2638 100%)',
  'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #11998e 100%)',
  'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #16222a 0%, #3a6186 100%)',
];

function getPosterFallback(id: string): string {
  const idx = id.charCodeAt(id.length - 1) % GRADIENT_FALLBACKS.length;
  return GRADIENT_FALLBACKS[idx];
}

export default function EventCard({ event }: EventCardProps) {
  const status = STATUS_LABEL[event.status] ?? { label: event.status, cls: 'badge-info' };
  const seatTypes = event.seatConfig?.seatTypes;
  const minPrice = seatTypes
    ? Math.min(
        seatTypes.regular?.price ?? Infinity,
        seatTypes.premium?.price ?? Infinity,
        seatTypes.vip?.price ?? Infinity
      )
    : 0;

  return (
    <Link
      to={`/events/${event._id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        className="card-hover rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Poster / Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '280px' }}>
          {event.posterUrl ? (
            <img
              src={event.posterUrl}
              alt={event.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) parent.style.background = getPosterFallback(event._id);
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: getPosterFallback(event._id),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className="text-center px-4">
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎭</div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {event.category ?? 'Event'}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge overlay */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${status.cls}`}>{status.label}</span>
          </div>

          {/* Date overlay at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem', fontWeight: 600 }}>
              {formatDate(event.date)} · {formatTime(event.date)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <h3
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.name}
          </h3>

          <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.venue}
            </span>
          </div>

          {event.category && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              <Tag size={13} />
              <span>{event.category}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', display: 'block' }}>Starting from</span>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-brand-500)' }}>
                ₹{minPrice.toLocaleString('en-IN')}
              </span>
            </div>
            {event.status === 'on_sale' && (
              <div
                className="flex items-center gap-1"
                style={{
                  color: 'var(--color-brand-500)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                Book <ArrowRight size={14} />
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
