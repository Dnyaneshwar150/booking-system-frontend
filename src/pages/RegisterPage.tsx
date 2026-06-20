import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, Ticket, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ADMIN_HINT = 'admin_creation_secret_change_this';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [adminSecret, setAdminSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const payload = { name, email, password, role, ...(role === 'admin' ? { adminSecret } : {}) };
      const res = await authApi.register(payload);
      const { token, user } = res.data.data;
      login(token, user);
      navigate(user.role === 'admin' ? '/admin' : '/events');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,26,26,0.03) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,107,107,0.02) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-4"
            style={{ boxShadow: '0 8px 24px rgba(26, 26, 26, 0.15)' }}
          >
            <Ticket size={28} className="text-white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create an account to book events
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg p-3 mb-5"
              style={{ background: 'rgba(197, 48, 48, 0.08)', border: '1px solid rgba(197, 48, 48, 0.2)', color: 'var(--color-error)', fontSize: '0.85rem' }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Role toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            {(['user', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s',
                  background: role === r ? 'var(--color-brand-500)' : 'transparent',
                  color: role === r ? '#fff' : 'var(--color-text-muted)',
                  boxShadow: role === r ? '0 4px 12px rgba(26, 26, 26, 0.15)' : 'none',
                }}
              >
                {r === 'user' ? <User size={14} /> : <ShieldCheck size={14} />}
                {r === 'user' ? 'User' : 'Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Full Name</label>
              <div className="relative">
                <User size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-name"
                  type="text"
                  className="input-base"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-email"
                  type="email"
                  className="input-base"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-base"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <Lock size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-base"
                  style={{
                    paddingLeft: '2.5rem',
                    borderColor: confirmPassword && confirmPassword !== password ? 'var(--color-error)' : undefined,
                  }}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Admin Secret (conditional) */}
            {role === 'admin' && (
              <div
                className="flex flex-col gap-1.5 rounded-xl p-4"
                style={{ background: 'rgba(26,26,26,0.03)', border: '1px solid var(--color-border)' }}
              >
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={14} />
                  Admin Secret Key
                </label>
                <input
                  id="reg-admin-secret"
                  type="password"
                  className="input-base"
                  placeholder="Enter the admin secret..."
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  required
                  autoComplete="off"
                  style={{ background: 'var(--color-surface-3)' }}
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Default for dev: <code style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem' }}>{ADMIN_HINT}</code>
                </p>
              </div>
            )}

            <button
              id="reg-submit"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ padding: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                `Create ${role === 'admin' ? 'Admin' : ''} Account`
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-brand-500)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
