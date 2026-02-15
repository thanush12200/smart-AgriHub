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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_8%,#065f4622_0%,#0b1023_50%,#050816_100%)] px-5 py-8 text-white">
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-[92vh] max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <section>
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">Precision. Planning. Profitability.</p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Smart decisions for every acre, every day.
          </h1>
          <p className="mt-4 max-w-lg text-slate-200/90">
            Use weather intelligence, crop prediction, fertilizer optimization, and AI guidance from one unified platform.
          </p>

          <div className="mt-7 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Forecast</p>
              <p className="mt-1 text-sm font-semibold">7-day alerts</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">AI Models</p>
              <p className="mt-1 text-sm font-semibold">Crop + NPK + Chat</p>
            </div>
          </div>
        </section>

        <section className="card p-7 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-600">Login to continue your farm intelligence workflow.</p>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <input className="input" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button className="btn-primary w-full" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Login'}</button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            New here? <Link className="font-semibold text-emerald-700" to="/signup">Create account</Link>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Admin users can login here using admin credentials and will be redirected to the Admin panel automatically.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
