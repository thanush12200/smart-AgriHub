import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
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
    <div className="relative min-h-screen bg-surface-50 px-4 py-8">
      <div className="relative mx-auto grid min-h-[90vh] max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left — brand messaging */}
        <section className="animate-fadeIn">
          <div className="mb-6 flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z" />
              <path d="M2 21c0-3 1.9-5.5 4.5-6.3" />
            </svg>
            <span className="font-display text-xl text-slate-900">Smart Agri Hub</span>
          </div>

          <h1 className="font-display text-4xl leading-tight text-slate-900 md:text-5xl">
            Grow smarter,<br />not harder.
          </h1>
          <p className="mt-4 max-w-md text-slate-500">
            Weather intelligence, crop prediction, fertilizer planning, and AI guidance — one platform built for modern farming.
          </p>

          <div className="mt-8 flex gap-4">
            <div className="rounded-card border border-surface-200 bg-white p-4 shadow-card">
              <p className="text-xs font-semibold text-brand-500">Forecast</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">7-day weather alerts</p>
            </div>
            <div className="rounded-card border border-surface-200 bg-white p-4 shadow-card">
              <p className="text-xs font-semibold text-accent-400">AI Models</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">Crop + NPK + Chat</p>
            </div>
          </div>
        </section>

        {/* Right — login form */}
        <section className="card p-7 md:p-8 animate-fadeIn">
          <h2 className="font-display text-2xl text-slate-900">Welcome back</h2>
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
