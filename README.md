# SortMyScene - Booking System Frontend

A modern event booking platform frontend built with React, TypeScript, and Tailwind CSS. Browse events, select seats across multiple pricing tiers, and complete bookings with an intuitive user interface.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Setup & Installation](#setup--installation)
5. [Project Structure](#project-structure)
6. [Key Components](#key-components)
7. [Configuration](#configuration)
8. [Development](#development)

---

## Overview

An event booking platform that allows users to authenticate, browse events, select seats from a 2D interactive grid, and complete bookings. Administrators can create events with fully customizable seat configurations.

### Core Capabilities

- **User Authentication**: Register, login with role-based access (user/admin)
- **Event Browsing**: Filter and search events by status and keywords
- **Seat Selection**: Interactive 2D seat grid with three pricing tiers
- **Booking Flow**: Reserve seats, enter payment ID, confirm bookings
- **Admin Dashboard**: Create events with dynamic seat configurations
- **Protected Routes**: Authentication and admin-only access control
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

---

## Features

### 1. Authentication System

- User registration with name, email, password
- Admin registration with admin secret validation
- User login with JWT token authentication
- Session persistence via localStorage
- Automatic token attachment to all API requests
- Auto-logout on invalid token

### 2. Event Management

**Users Can:**

- View all events with details
- Filter events by status: On Sale, Sold Out, Cancelled
- Search events by name or venue
- View event details including date, venue, category
- See event posters with fallback gradients

**Admins Can:**

- Create new events
- Set event: name, venue, date, category, poster URL
- Configure seat layout: rows, seats per row, aisle position
- Set independent pricing for Regular, Premium, VIP seats
- Automatic row assignment to seat types

### 3. Seat Selection & Booking

**Seat Grid Features:**

- Interactive 2D seat layout visualization
- Three seat types with independent pricing:
  - Regular (default ₹150)
  - Premium (default ₹250)
  - VIP (default ₹350)
- Multi-seat selection with real-time price calculation
- Seat legend showing all types and selection status

**Booking Flow:**

1. User selects seats from grid
2. Clicks "Reserve" to send to backend
3. Backend confirms reservation with expiry time
4. User enters payment ID
5. User confirms booking
6. Backend marks seats as booked

**Seat States:**

- `available`: White, clickable
- `reserved`: Light gray dashed border
- `booked`: Dark gray, disabled
- `selected`: Green highlight, user selected (local only)

### 4. Visual Design

- Modern gradient design system
- Custom CSS variables for theming
- Event cards with:
  - Poster image with fallback patterns
  - Status badge (On Sale/Sold Out/Cancelled)
  - Date/time overlay
  - Minimum price display
- Responsive navigation with mobile menu
- Error and success messaging

---

## Tech Stack

### Frontend Framework & Build

- **React 18**: Hooks-based functional components
- **TypeScript**: Full type safety and compile-time checking
- **Vite**: Fast build tool and development server

### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **CSS Variables**: Custom theme system

### HTTP & State Management

- **Axios**: HTTP client with JWT interceptor support
- **React Router**: Client-side routing
- **React Context API**: Global authentication state
- **React Hooks**: Local component state (useState, useCallback, useMemo)

### Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "lucide-react": "latest",
  "typescript": "^5.x",
  "tailwindcss": "^3.x"
}
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at `http://localhost:3000`

### Installation

```bash
# Clone repository
git clone https://github.com/Dnyaneshwar150/booking-system-frontend.git
cd booking-system-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will run at `http://localhost:5173`

### Production Build

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview

# Output directory: ./dist
```

---

## Project Structure

```
src/
├── pages/                      # Page components
│   ├── LoginPage.tsx          # User login form
│   ├── RegisterPage.tsx        # User registration form
│   ├── EventsPage.tsx          # Event list with filters
│   ├── EventDetailPage.tsx     # Seat selection & booking
│   └── AdminDashboard.tsx      # Event creation form
│
├── components/                # Reusable components
│   ├── booking/
│   │   └── SeatPicker.tsx     # 2D seat grid selector
│   ├── events/
│   │   └── EventCard.tsx      # Event display card
│   └── layout/
│       ├── Navbar.tsx         # Navigation bar
│       └── ProtectedRoute.tsx # Auth & role guard
│
├── context/
│   └── AuthContext.tsx        # Auth state & functions
│
├── lib/
│   ├── api.ts                # Axios instance & endpoints
│   ├── constants.ts          # SEAT_STYLES, DEFAULT_SEAT_CONFIG
│   └── utils.ts              # formatDate, formatTime, etc.
│
├── assets/                   # Static files
├── App.tsx                   # Routing & layout
├── main.tsx                  # Entry point
└── index.css                 # Global styles & theme
```

---

## Key Components

### SeatPicker

Renders interactive 2D seat grid and manages selection.

**Props:**

```typescript
interface SeatPickerProps {
  seats: Seat[];
  seatConfig: SeatConfig;
  eventId: string;
  onReserve: (seatIds: string[]) => Promise<void>;
  isLoading?: boolean;
}
```

**What it does:**

- Builds 2D grid from flat seat array
- Handles seat click to toggle selection
- Displays selected seat count and total price
- Shows seat legend with all types
- Prevents disabled seats from being selected
- Calls `onReserve` when user clicks reserve button

**Internal state:**

- `seatGrid`: 2D array of seat data
- `selectedSeats`: Array of selected seat objects
- `totalPrice`: Sum of selected seat prices

### EventCard

Displays event summary card.

**Features:**

- Shows event poster with fallback gradient
- Displays status badge
- Shows date/time overlay
- Displays minimum price
- Links to event detail page
- Handles poster loading errors

### EventDetailPage

Manages the booking workflow.

**Three-step flow:**

1. **Select**: User chooses seats using SeatPicker
2. **Confirm**: User enters payment ID and confirms
3. **Done**: Shows booking confirmation

**State:**

- `detail`: Event and seats data
- `reservationId`: From backend after reserve
- `step`: Current booking step
- `error`: Error messages

### AuthContext & useAuth

Manages authentication state globally.

**Context provides:**

- `user`: Current user object (null if not logged in)
- `token`: JWT token from localStorage
- `isLoading`: Whether auth is being initialized
- `isAdmin`: Computed from user.role
- `login()`: Set token and user
- `logout()`: Clear token and user

**Features:**

- Loads token from localStorage on mount
- Fetches user details via `/auth/me`
- Auto-logs out if token is invalid
- Persists token across page refreshes

### ProtectedRoute

Guards routes based on authentication.

```typescript
<Route
  path="/events/:id"
  element={
    <ProtectedRoute>
      <EventDetailPage />
    </ProtectedRoute>
  }
/>

// Admin-only route
<Route
  path="/admin"
  element={
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

---

## Configuration

### Environment Variables

Create `.env` from `.env.example`:

```env
VITE_BASE_URL=http://localhost:3000/api
```

**Important:** Only variables prefixed with `VITE_` are exposed to client code in Vite.

### Theme Customization

Edit CSS variables in `src/index.css`:

```css
--color-bg: #fafaf8              /* Page background */
--color-surface: #ffffff          /* Card background */
--color-surface-2: #f5f4f0       /* Hover/secondary bg */
--color-border: #e5e4e0          /* Border color */
--color-text-primary: #1a1a1a    /* Main text */
--color-text-secondary: #6b6b6b  /* Secondary text */
--color-text-muted: #9a9a9a      /* Muted/tertiary text */
--color-brand-500: #2d8a4e       /* Primary accent */
```

### Seat Configuration

Default settings in `src/lib/constants.ts`:

```typescript
{
  rows: 8,
  seatsPerRow: 12,
  aislePosition: 6,
  seatTypes: {
    regular: { price: 150, rows: [0, 1, 2] },
    premium: { price: 250, rows: [3, 4, 5] },
    vip: { price: 350, rows: [6, 7] }
  }
}
```

Customizable when admins create events.

---

## API Integration

### Implemented Endpoints

**Auth:**

```
POST /auth/register  { name, email, password, role?, adminSecret? }
POST /auth/login     { email, password }
GET /auth/me         (requires JWT token)
```

**Events:**

```
GET /events          - List all events
GET /events/:id      - Get event details with seats
POST /events         - Create new event (admin only)
```

**Bookings:**

```
POST /reserve        { eventId, seatIds }
POST /bookings       { reservationId, paymentId }
```

---

## Development

### Available Scripts

```bash
# Start dev server with hot reload
npm run dev

# Type check (no build)
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Architecture

**Component Structure:**

- Pages handle routes and data flow
- Components are presentational with callbacks
- API layer in `lib/api.ts` isolates HTTP logic
- Context for global auth state
- Constants centralized in `lib/constants.ts`

**State Management:**

- Component state: useState for local form/UI
- Context: AuthContext for global auth state
- Props: Event callbacks for child-to-parent communication
- API: Backend as source of truth for data

**Type Safety:**

- Full TypeScript coverage
- Interface definitions in `lib/api.ts`
- Props typing for all components
- Return types on functions

### Debugging

**Browser DevTools:**

- React DevTools extension: Inspect component tree and state
- Network tab: Verify API calls to `VITE_BASE_URL`
- Console: Check for JavaScript errors
- Application tab: View localStorage for token

**Common Issues:**

| Problem                | Solution                                |
| ---------------------- | --------------------------------------- |
| 404 to wrong URL       | Check `.env` VITE_BASE_URL value        |
| Auth failing           | Ensure backend running at BASE_URL      |
| Styles not applying    | Clear browser cache, restart dev server |
| Component not updating | Check if state is in correct component  |
