// Seat styling configuration
export const SEAT_STYLES = {
  regular: {
    available: {
      bg: "#ffffff",
      border: "#e5e4e0",
      text: "#6b6b6b",
      hover: "#fafaf8",
    },
    label: "Regular",
  },
  premium: {
    available: {
      bg: "#f5f4f0",
      border: "#d1d0cb",
      text: "#1a1a1a",
      hover: "#eeede9",
    },
    label: "Premium",
  },
  vip: {
    available: {
      bg: "#fcfaf2",
      border: "#b7791f",
      text: "#b7791f",
      hover: "#f6f2e2",
    },
    label: "VIP",
  },
};

// Event status labels and styling
export const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  on_sale: { label: "On Sale", cls: "badge-success" },
  sold_out: { label: "Sold Out", cls: "badge-error" },
  cancelled: { label: "Cancelled", cls: "badge-warning" },
};

// Gradient fallbacks for event posters
export const GRADIENT_FALLBACKS = [
  "linear-gradient(135deg, #f5f4f0 0%, #e5e4e0 100%)",
  "linear-gradient(135deg, #eeede9 0%, #dcdad4 100%)",
  "linear-gradient(135deg, #fafaf8 0%, #eae9e4 100%)",
  "linear-gradient(135deg, #eae9e4 0%, #dcdad4 100%)",
  "linear-gradient(135deg, #f5f4f0 0%, #dcdad4 100%)",
  "linear-gradient(135deg, #eeede9 0%, #e5e4e0 100%)",
];

// Get poster fallback gradient based on event ID
export function getPosterFallback(id: string): string {
  const idx = id.charCodeAt(id.length - 1) % GRADIENT_FALLBACKS.length;
  return GRADIENT_FALLBACKS[idx];
}

// Default seat configuration
export const DEFAULT_SEAT_CONFIG = {
  rows: 8,
  seatsPerRow: 12,
  aislePosition: 6,
  seatTypes: {
    regular: { price: 150, rows: [0, 1, 2] },
    premium: { price: 250, rows: [3, 4, 5] },
    vip: { price: 350, rows: [6, 7] },
  },
};
