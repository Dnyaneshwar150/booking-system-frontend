import { Link } from "react-router-dom";
import { MapPin, Tag, ArrowRight } from "lucide-react";
import type { Event } from "../../lib/api";
import { formatDate, formatTime } from "../../lib/utils";
import { STATUS_LABEL, getPosterFallback } from "../../lib/constants";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const status = STATUS_LABEL[event.status] ?? {
    label: event.status,
    cls: "badge-info",
  };
  const seatTypes = event.seatConfig?.seatTypes;
  const minPrice = seatTypes
    ? Math.min(
        seatTypes.regular?.price ?? Infinity,
        seatTypes.premium?.price ?? Infinity,
        seatTypes.vip?.price ?? Infinity,
      )
    : 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className='no-underline block'
    >
      <article
        className='card-hover rounded-2xl overflow-hidden h-full flex flex-col'
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          className='relative overflow-hidden'
          style={{ aspectRatio: "3/4", maxHeight: "280px" }}
        >
          {event.posterUrl ? (
            <img
              src={event.posterUrl}
              alt={event.name}
              className='w-full h-full object-cover block'
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent)
                  parent.style.background = getPosterFallback(event._id);
              }}
            />
          ) : (
            <div
              className='w-full h-full flex items-center justify-center'
              style={{
                background: getPosterFallback(event._id),
              }}
            >
              <div className='text-center px-4'>
                <div className='text-5xl mb-2'>🎭</div>
                <p
                  className='text-xs font-medium uppercase tracking-widest'
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {event.category ?? "Event"}
                </p>
              </div>
            </div>
          )}

          <div className='absolute top-3 left-3'>
            <span className={`badge ${status.cls}`}>{status.label}</span>
          </div>

          <div
            className='absolute bottom-0 left-0 right-0 px-3 py-2'
            style={{
              background:
                "linear-gradient(to top, rgba(26,26,26,0.7) 0%, transparent 100%)",
            }}
          >
            <span className='text-xs font-semibold text-white'>
              {formatDate(event.date)} · {formatTime(event.date)}
            </span>
          </div>
        </div>

        <div className='flex flex-col gap-2 p-4 flex-1'>
          <h3
            className='font-bold text-base line-clamp-2'
            style={{
              color: "var(--color-text-primary)",
              lineHeight: 1.3,
            }}
          >
            {event.name}
          </h3>

          <div
            className='flex items-center gap-1.5 text-xs'
            style={{ color: "var(--color-text-muted)" }}
          >
            <MapPin
              size={13}
              className='shrink-0'
            />
            <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
              {event.venue}
            </span>
          </div>

          {event.category && (
            <div
              className='flex items-center gap-1.5 text-xs'
              style={{ color: "var(--color-text-muted)" }}
            >
              <Tag size={13} />
              <span>{event.category}</span>
            </div>
          )}

          <div
            className='flex items-center justify-between mt-auto pt-3'
            style={{ borderTop: "1px solid var(--color-border-subtle)" }}
          >
            <div>
              <span
                className='text-xs block'
                style={{
                  color: "var(--color-text-muted)",
                }}
              >
                Starting from
              </span>
              <span
                className='font-bold text-base'
                style={{
                  color: "var(--color-brand-500)",
                }}
              >
                ₹{minPrice.toLocaleString("en-IN")}
              </span>
            </div>
            {event.status === "on_sale" && (
              <div
                className='flex items-center gap-1 text-xs font-semibold'
                style={{
                  color: "var(--color-brand-500)",
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
