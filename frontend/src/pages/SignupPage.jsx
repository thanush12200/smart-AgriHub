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
    <div className="relative min-h-screen bg-surface-50 px-4 py-8">
      <div className="relative mx-auto max-w-lg animate-fadeIn">
        <div className="mb-8 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
            <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z" />
            <path d="M2 21c0-3 1.9-5.5 4.5-6.3" />
          </svg>
          <Link to="/login" className="font-display text-lg text-slate-900 hover:text-brand-600 transition-colors">Smart Agri Hub</Link>
        </div>

        <div className="card p-7 md:p-8">
          <h2 className="font-display text-2xl text-slate-900">Create your account</h2>
          <p className="section-subtitle">Join thousands of farmers using AI-powered insights.</p>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div>
              <label className="field-label" htmlFor="signup-name">Full name</label>
              <input id="signup-name" className="input" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="signup-email">Email</label>
              <input id="signup-email" className="input" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="signup-password">Password</label>
              <input id="signup-password" className="input" type="password" placeholder="At least 6 characters" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="signup-region">Region</label>
                <input id="signup-region" className="input" placeholder="e.g. Karnataka" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
              <div>
                <label className="field-label" htmlFor="signup-language">Language</label>
                <select id="signup-language" className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                </select>
              </div>
            </div>

            {error ? <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p> : null}
            <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Creating account…' : 'Create account'}</button>
          </form>

          <p className="mt-5 text-sm text-slate-500">
            Already registered?{' '}
            <Link className="font-semibold text-brand-500 hover:text-brand-600 transition-colors" to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
