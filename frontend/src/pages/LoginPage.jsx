import { useState, Suspense, lazy } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthScene = lazy(() => import('../components/3d/AuthScene'));

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        <circle cx="12" cy="12" r="5"/>
      </svg>
    ),
    label: 'Weather Intelligence',
    desc: '7-day forecasts, alerts, and rainfall timing for field decisions.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z"/>
        <path d="M2 21c0-3 1.9-5.5 4.5-6.3"/>
      </svg>
    ),
    label: 'Crop Prediction',
    desc: 'AI-powered recommendations from soil and climate profiles.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
    label: 'NPK Analysis',
    desc: 'Precision fertilizer dosage from soil nutrient readings.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: 'AI Agronomy Chat',
    desc: 'Conversational assistant with source confidence metadata.',
  },
];

export default function LoginPage() {
  useDocTitle('Sign In');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex">

      {/* Left panel — 3D scene */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col">
        <Suspense fallback={<div style={{ background: '#040d08', width: '100%', height: '100%' }} />}>
          <AuthScene className="absolute inset-0" />
        </Suspense>

        {/* Gradient overlay bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Brand overlay content */}
        <div className="relative z-10 flex flex-col h-full p-10 pb-12">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(41,160,100,0.18)', border: '1px solid rgba(41,160,100,0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#41b878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z"/>
                <path d="M2 21c0-3 1.9-5.5 4.5-6.3"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Smart Agri Hub</span>
          </motion.div>

          {/* Hero copy */}
          <motion.div
            className="mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: '#41b878' }}>
              Precision Agriculture Platform
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.08] tracking-tight">
              Grow with clarity,<br/>
              <span style={{ color: '#7ad5a0' }}>act with confidence.</span>
            </h1>
            <p className="mt-4 text-sm leading-7 max-w-md" style={{ color: 'rgba(255,255,255,0.62)' }}>
              Weather intelligence, crop prediction, fertilizer planning, and AI guidance — one platform built for modern farming.
            </p>

            {/* Feature pills */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              {FEATURES.map((feat) => (
                <motion.div
                  key={feat.label}
                  className="rounded-2xl p-3.5 flex items-start gap-3"
                  style={{
                    background: 'rgba(7,20,13,0.65)',
                    border: '1px solid rgba(41,160,100,0.18)',
                    backdropFilter: 'blur(16px)',
                  }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(41,160,100,0.4)' }}
                >
                  <span style={{ color: '#41b878', flexShrink: 0 }}>{feat.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white mb-0.5">{feat.label}</p>
                    <p className="text-[11px] leading-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — sign in form */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10 lg:py-0"
        style={{ background: 'var(--bg-main)' }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
            <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z"/>
            <path d="M2 21c0-3 1.9-5.5 4.5-6.3"/>
          </svg>
          <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Smart Agri Hub</span>
        </div>

        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Card */}
          <div
            className="rounded-[28px] p-7 md:p-8"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderTopColor: 'rgba(255,255,255,0.22)',
              boxShadow: '0 8px 48px var(--shadow-depth), 0 1px 0 rgba(255,255,255,0.1) inset',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Icon accent */}
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(26,122,76,0.1)', border: '1px solid rgba(26,122,76,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>

            <p className="page-kicker">Secure Access</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to continue your farm workflow.
            </p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="field-label" htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  className="input"
                  placeholder="you@example.com"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="login-password">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    className="input pr-12"
                    placeholder="Enter your password"
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  className="rounded-xl border px-3 py-2.5 text-sm"
                  style={{ background: 'rgba(220,38,38,0.08)', borderColor: 'rgba(220,38,38,0.2)', color: '#dc2626' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  {error}
                </motion.p>
              )}

              <button
                className="btn-primary w-full py-3 text-base mt-1"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" opacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>

              {import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true' && (
                <>
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full" style={{ borderTop: '1px solid var(--border-light)' }} />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>or continue with</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary w-full"
                    disabled={loading}
                    onClick={() => setForm({ email: 'demo@agrihub.com', password: 'DemoPassword123!' })}
                  >
                    Use Demo Account
                  </button>
                </>
              )}
            </form>

            <p className="mt-5 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              New here?{' '}
              <Link
                className="font-semibold transition-colors"
                style={{ color: 'var(--brand-500)' }}
                to="/signup"
              >
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
