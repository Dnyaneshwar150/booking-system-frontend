import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, LogOut, LayoutDashboard, CalendarDays, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 glass"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/events" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 4px 12px rgba(79, 110, 247, 0.4)' }}
            >
              <Ticket size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Sort<span className="gradient-text">MyScene</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/events" active={isActive('/events')}>
              <CalendarDays size={15} />
              Events
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" active={isActive('/admin')}>
                <LayoutDashboard size={15} />
                Dashboard
              </NavLink>
            )}
          </div>

          {/* User area */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
                <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center">
                  <User size={12} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-ghost flex items-center gap-2" style={{ padding: '0.4rem 0.75rem' }}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost" style={{ padding: '0.4rem 0.9rem', textDecoration: 'none' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.4rem 0.9rem', textDecoration: 'none' }}>Sign Up</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn-ghost"
            style={{ padding: '0.4rem' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden glass border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="section-container py-4 flex flex-col gap-2">
            <Link to="/events" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={15} /> Events
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', padding: '0.5rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="btn-ghost flex items-center gap-2 mt-2">
                <LogOut size={14} /> Logout ({user.name})
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-ghost" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.4rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        color: active ? 'var(--color-brand-500)' : 'var(--color-text-secondary)',
        background: active ? 'rgba(79, 110, 247, 0.1)' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </Link>
  );
}
