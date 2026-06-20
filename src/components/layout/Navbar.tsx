import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Ticket,
  LogOut,
  LayoutDashboard,
  CalendarDays,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className='sticky top-0 z-50 glass border-b'
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className='section-container'>
        <div className='flex items-center justify-between h-16'>
          <Link
            to='/events'
            className='flex items-center gap-2 group'
          >
            <div
              className='w-8 h-8 rounded-lg gradient-brand flex items-center justify-center'
              style={{ boxShadow: "0 4px 12px rgba(26, 26, 26, 0.15)" }}
            >
              <Ticket
                size={16}
                className='text-white'
              />
            </div>
            <span
              className='font-bold text-lg tracking-tight'
              style={{ color: "var(--color-text-primary)" }}
            >
              tickets.
            </span>
          </Link>

          <div className='hidden md:flex items-center gap-1'>
            <NavLink
              to='/events'
              active={isActive("/events")}
            >
              <CalendarDays size={15} />
              Events
            </NavLink>
            {isAdmin && (
              <NavLink
                to='/admin'
                active={isActive("/admin")}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </NavLink>
            )}
          </div>

          {user ? (
            <div className='hidden md:flex items-center gap-3'>
              <div
                className='flex items-center gap-2 px-3 py-1.5 rounded-lg'
                style={{ background: "var(--color-surface-2)" }}
              >
                <div className='w-6 h-6 rounded-full gradient-brand flex items-center justify-center'>
                  <User
                    size={12}
                    className='text-white'
                  />
                </div>
                <div className='flex flex-col'>
                  <span
                    className='text-xs font-semibold'
                    style={{
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {user.name}
                  </span>
                  <span
                    className='text-xs uppercase tracking-wider'
                    style={{
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className='btn-ghost flex items-center gap-2 px-3 py-1'
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div className='hidden md:flex items-center gap-2'>
              <Link
                to='/login'
                className='btn-ghost no-underline px-3 py-1'
              >
                Sign In
              </Link>
              <Link
                to='/register'
                className='btn-primary no-underline px-3 py-1'
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            className='md:hidden btn-ghost p-1'
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='Toggle menu'
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className='md:hidden glass border-t'
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className='section-container py-4 flex flex-col gap-2'>
            <Link
              to='/events'
              onClick={() => setMenuOpen(false)}
              className='flex items-center gap-2 py-2 px-0 text-sm no-underline'
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <CalendarDays size={15} /> Events
            </Link>
            {isAdmin && (
              <Link
                to='/admin'
                onClick={() => setMenuOpen(false)}
                className='flex items-center gap-2 py-2 px-0 text-sm no-underline'
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className='btn-ghost flex items-center gap-2 mt-2'
              >
                <LogOut size={14} /> Logout ({user.name})
              </button>
            ) : (
              <div className='flex gap-2 mt-2'>
                <Link
                  to='/login'
                  onClick={() => setMenuOpen(false)}
                  className='btn-ghost flex-1 text-center no-underline'
                >
                  Sign In
                </Link>
                <Link
                  to='/register'
                  onClick={() => setMenuOpen(false)}
                  className='btn-primary flex-1 text-center no-underline'
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium no-underline transition-all ${
        active ? "bg-surface-2" : ""
      }`}
      style={{
        color: active
          ? "var(--color-brand-500)"
          : "var(--color-text-secondary)",
        backgroundColor: active ? "var(--color-surface-2)" : "transparent",
      }}
    >
      {children}
    </Link>
  );
}
