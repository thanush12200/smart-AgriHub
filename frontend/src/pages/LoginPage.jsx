import { useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  useDocTitle('Sign In');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
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
    <div className="relative min-h-screen overflow-hidden bg-surface-50 px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,122,76,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(200,97,31,0.12),transparent_26%)]" />
      <div className="relative mx-auto grid min-h-[90vh] max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="animate-fadeIn">
          <div className="mb-6 flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z" />
              <path d="M2 21c0-3 1.9-5.5 4.5-6.3" />
            </svg>
            <span className="font-display text-xl font-extrabold text-slate-900">Smart Agri Hub</span>
          </div>

          <p className="page-kicker">Precision Agriculture Platform</p>
          <h1 className="mt-3 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
            Grow with clarity,
            <br />
            act with confidence.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600">
            Weather intelligence, crop prediction, fertilizer planning, and AI guidance — one platform built for modern farming.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-shell backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">Forecast</p>
              <p className="mt-2 text-lg font-bold text-slate-900">7-day weather alerts</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Stay ahead of rainfall swings, heat pressure, and field timing decisions.</p>
            </div>
            <div className="rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-shell backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-500">AI Models</p>
              <p className="mt-2 text-lg font-bold text-slate-900">Crop + NPK + Chat</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use production-ready agricultural intelligence across the full farm workflow.</p>
            </div>
          </div>
        </section>

        <section className="card border-white/70 p-7 md:p-8 animate-fadeIn">
          <p className="page-kicker">Secure Access</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-900">Welcome back</h2>
          <p className="section-subtitle">Sign in to continue your farm workflow.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="field-label" htmlFor="login-email">Email address</label>
              <input id="login-email" className="input" placeholder="you@example.com" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="login-password">Password</label>
              <input id="login-password" className="input" placeholder="Enter your password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {error ? <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-col gap-2">
              <button className="btn-primary w-full" disabled={loading} type="submit">{loading ? 'Signing in…' : 'Sign in'}</button>
              
              {import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true' && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="bg-[var(--bg-card)] px-2 text-slate-500">Or continue with</span></div>
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
            </div>
          </form>

          <p className="mt-5 text-sm text-slate-500">
            New here?{' '}
            <Link className="font-semibold text-brand-500 hover:text-brand-600 transition-colors" to="/signup">Create an account</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
