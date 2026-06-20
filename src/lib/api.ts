import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  adminSecret?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string; role: "user" | "admin" };
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ data: AuthResponse }>("/auth/register", data),
  login: (data: LoginPayload) =>
    api.post<{ data: AuthResponse }>("/auth/login", data),
  me: () => api.get<{ data: AuthResponse["user"] }>("/auth/me"),
};

// ─── Events ─────────────────────────────────────────────────────────────────

export interface SeatTypeConfig {
  name?: string;
  price: number;
  rows: number[];
}

export interface SeatConfig {
  rows: number;
  seatsPerRow: number;
  aislePosition?: number;
  seatTypes: {
    vip: SeatTypeConfig;
    premium: SeatTypeConfig;
    regular: SeatTypeConfig;
  };
}

export interface Event {
  _id: string;
  name: string;
  venue: string;
  date: string;
  status: "on_sale" | "sold_out" | "cancelled";
  category?: string;
  posterUrl?: string;
  seatConfig: SeatConfig;
  createdAt: string;
}

export interface Seat {
  id: string;
  seatNumber: string;
  row: number;
  column: number;
  type: "regular" | "premium" | "vip";
  price: number;
  status: "available" | "reserved" | "booked";
}

export interface EventDetail {
  event: Event;
  seats: Seat[];
}

export interface CreateEventPayload {
  name: string;
  venue: string;
  date: string;
  category?: string;
  posterUrl?: string;
  seatConfig: SeatConfig;
}

export const eventsApi = {
  list: () => api.get<{ data: Event[] }>("/events"),
  detail: (id: string) => api.get<{ data: EventDetail }>(`/events/${id}`),
  create: (data: CreateEventPayload) =>
    api.post<{ data: { event: Event; seatsCreated: number } }>("/events", data),
};

// ─── Reservations ────────────────────────────────────────────────────────────

export interface ReservePayload {
  eventId: string;
  seatIds: string[];
}

export interface ReservationResponse {
  reservationId: string;
  expiresAt: string;
}

export const reserveApi = {
  reserve: (data: ReservePayload) =>
    api.post<{ data: ReservationResponse }>("/reserve", data),
};

// ─── Bookings ────────────────────────────────────────────────────────────────

export interface BookingPayload {
  reservationId: string;
  paymentId: string;
}

export const bookingsApi = {
  confirm: (data: BookingPayload) =>
    api.post<{ data: object }>("/bookings", data),
};
