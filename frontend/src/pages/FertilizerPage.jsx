import { useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';

const LeafIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500 shrink-0 mt-0.5">
    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z" />
    <path d="M2 21c0-3 1.9-5.5 4.5-6.3" />
  </svg>
);

const FertilizerPage = () => {
  useDocTitle('Fertilizer Advisor');
  const [input, setInput] = useState({ crop: 'rice', npk: { n: 30, p: 25, k: 28 } });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/fertilizer/recommend', input);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <section className="page-hero mb-5">
        <p className="page-kicker">Nutrient Planning</p>
        <h1 className="page-title">Fertilizer Recommendation</h1>
        <p className="page-copy">Get dosage plans with organic alternatives based on your crop and current NPK soil values.</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <form className="card space-y-4 p-5 md:p-6" onSubmit={onSubmit}>
          <div>
            <p className="section-label">Advisory Inputs</p>
            <h2 className="section-title mt-1">Crop and NPK profile</h2>
          </div>
          <div>
            <label className="field-label">Crop</label>
            <input className="input" placeholder="e.g. rice, wheat, maize" value={input.crop} onChange={(e) => setInput({ ...input, crop: e.target.value })} />
          </div>

          <div>
            <label className="field-label">NPK Values (Current Soil Levels)</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="block text-center text-[10px] font-bold text-brand-500 mb-1">N</span>
                <input className="input text-center" type="number" value={input.npk.n} onChange={(e) => setInput({ ...input, npk: { ...input.npk, n: Number(e.target.value) } })} />
              </div>
              <div>
                <span className="block text-center text-[10px] font-bold text-sky-500 mb-1">P</span>
                <input className="input text-center" type="number" value={input.npk.p} onChange={(e) => setInput({ ...input, npk: { ...input.npk, p: Number(e.target.value) } })} />
              </div>
              <div>
                <span className="block text-center text-[10px] font-bold text-accent-400 mb-1">K</span>
                <input className="input text-center" type="number" value={input.npk.k} onChange={(e) => setInput({ ...input, npk: { ...input.npk, k: Number(e.target.value) } })} />
              </div>
            </div>
          </div>

          {error ? <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p> : null}
          <button className="btn-primary w-full" disabled={loading} type="submit">{loading ? 'Analyzing…' : 'Get Recommendation'}</button>
        </form>

        <section className="card p-5 md:p-6">
          <p className="section-label text-accent-400">Advisory</p>
          <h3 className="section-title mt-1">Results</h3>
          {!result ? (
            <p className="mt-3 text-sm text-slate-400">Enter crop and NPK values to view recommendation.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border-l-[3px] border-l-accent-400 bg-accent-50 p-4">
                <p className="text-xs text-accent-600 uppercase tracking-[0.18em] font-semibold">Recommended Fertilizer</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-slate-900">{result.fertilizer}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
                  <p className="text-xs text-slate-400">Dosage</p>
                  <p className="mt-0.5 text-lg font-semibold text-slate-900">{result.dosageKgPerAcre} <span className="text-sm font-normal text-slate-500">kg/acre</span></p>
                </div>
                <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
                  <p className="text-xs text-slate-400">Confidence</p>
                  <p className="mt-0.5 text-lg font-semibold text-slate-900">{Math.round(result.confidence * 100)}%</p>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-surface-200 bg-surface-50 p-4">
                <p className="section-label">Soil Health Report</p>
                
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-brand-600 w-8">N</span>
                    <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, (input.npk.n / 100) * 100)}%` }} />
                    </div>
                    <span className="w-12 text-right text-slate-500">{input.npk.n}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-sky-500 w-8">P</span>
                    <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: `${Math.min(100, (input.npk.p / 100) * 100)}%` }} />
                    </div>
                    <span className="w-12 text-right text-slate-500">{input.npk.p}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-accent-500 w-8">K</span>
                    <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-accent-500" style={{ width: `${Math.min(100, (input.npk.k / 100) * 100)}%` }} />
                    </div>
                    <span className="w-12 text-right text-slate-500">{input.npk.k}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-surface-200 text-xs text-slate-600">
                  <p><span className="font-semibold text-slate-900">Score Out of 100:</span> {Math.round((input.npk.n + input.npk.p + input.npk.k) / 3)}/100</p>
                  <p className="mt-1">
                    {input.npk.n < 30 ? 'Tip: Your soil is low in Nitrogen. Consider planting legumes.' : 'Great nitrogen levels!'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-slate-500 mb-2">🌿 Organic Alternatives</p>
                {result.organicAlternatives.map((alt) => (
                  <div key={alt} className="stagger-item mb-1.5 flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/40 px-3 py-3 text-sm text-brand-800">
                    <LeafIcon />
                    <span>{alt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FertilizerPage;
