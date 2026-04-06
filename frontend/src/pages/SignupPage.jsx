import { useState, Suspense, lazy } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AuthScene = lazy(() => import('../components/3d/AuthScene'));

const STEPS = [
  { icon: '🌱', label: 'Create account', desc: 'Set up your farmer profile' },
  { icon: '📍', label: 'Set your region', desc: 'Localized weather and crop data' },
  { icon: '🤖', label: 'AI ready', desc: 'Instant access to predictions' },
];

export default function SignupPage() {
  useDocTitle('Create Account');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', region: 'Karnataka', language: 'en' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex">

      {/* Left panel — 3D scene */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col">
        <Suspense fallback={<div style={{ background: '#040d08', width: '100%', height: '100%' }} />}>
          <AuthScene className="absolute inset-0" />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10 pb-12">
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

          <motion.div
            className="mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: '#41b878' }}>
              Join the platform
            </p>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.1] tracking-tight">
              Start farming smarter<br/>
              <span style={{ color: '#7ad5a0' }}>from day one.</span>
            </h1>
            <p className="mt-4 text-sm leading-7 max-w-md" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Thousands of farmers use Smart Agri Hub to make data-driven decisions about their crops, soil, and harvests.
            </p>

            <div className="mt-8 space-y-3">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: 'rgba(7,20,13,0.55)', border: '1px solid rgba(41,160,100,0.15)', backdropFilter: 'blur(12px)' }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <span className="text-xl w-8 text-center">{step.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.label}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — signup form */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10 lg:py-0 overflow-y-auto"
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
          className="w-full max-w-[420px] my-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
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
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'rgba(26,122,76,0.1)', border: '1px solid rgba(26,122,76,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>

            <p className="page-kicker">New Farmer Onboarding</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Create your account
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of farmers using AI-powered insights.
            </p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="field-label" htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  className="input"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  className="input"
                  type="password"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label" htmlFor="signup-region">Region</label>
                  <input
                    id="signup-region"
                    className="input"
                    placeholder="e.g. Karnataka"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="signup-language">Language</label>
                  <select
                    id="signup-language"
                    className="input"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="kn">Kannada</option>
                  </select>
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
                className="btn-primary w-full py-3 text-base"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" opacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <Link
                className="font-semibold transition-colors"
                style={{ color: 'var(--brand-500)' }}
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
