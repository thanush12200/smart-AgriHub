import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', region: 'Karnataka', language: 'en' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_8%,#065f4622_0%,#0b1023_50%,#050816_100%)] px-5 py-8 text-white">
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-2xl card p-7 md:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Create farmer account</h2>
        <p className="mt-1 text-sm text-slate-600">Start using Smart Agri Hub in less than a minute.</p>

        <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
          <input className="input" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="input" placeholder="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="kn">Kannada</option>
          </select>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Creating...' : 'Sign up'}</button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-emerald-700" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
