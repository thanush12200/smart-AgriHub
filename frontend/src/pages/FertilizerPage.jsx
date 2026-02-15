import { useState } from 'react';
import api from '../api/axiosClient';

const FertilizerPage = () => {
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
    <div className="grid gap-4 lg:grid-cols-2 animate-fadeIn">
      <form className="card space-y-3 p-5" onSubmit={onSubmit}>
        <p className="text-[10px] font-black uppercase tracking-[0.23em] text-sky-700">Nutrient input</p>
        <h2 className="font-display text-2xl font-bold text-slate-900">Fertilizer Recommendation</h2>
        <input className="input" placeholder="Crop" value={input.crop} onChange={(e) => setInput({ ...input, crop: e.target.value })} />
        <input className="input" type="number" placeholder="N" value={input.npk.n} onChange={(e) => setInput({ ...input, npk: { ...input.npk, n: Number(e.target.value) } })} />
        <input className="input" type="number" placeholder="P" value={input.npk.p} onChange={(e) => setInput({ ...input, npk: { ...input.npk, p: Number(e.target.value) } })} />
        <input className="input" type="number" placeholder="K" value={input.npk.k} onChange={(e) => setInput({ ...input, npk: { ...input.npk, k: Number(e.target.value) } })} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Calculating...' : 'Get Recommendation'}</button>
      </form>

      <section className="card p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.23em] text-emerald-700">Recommendation output</p>
        <h3 className="font-display text-2xl font-bold text-slate-900">Advisory Output</h3>
        {!result ? (
          <p className="mt-2 text-sm text-slate-500">Enter crop + NPK to view recommendation.</p>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-700">Fertilizer: <span className="font-semibold">{result.fertilizer}</span></p>
            <p className="text-sm text-slate-700">Dosage: <span className="font-semibold">{result.dosageKgPerAcre} kg/acre</span></p>
            <p className="text-sm text-slate-700">Confidence: <span className="font-semibold">{result.confidence}</span></p>
            <h4 className="mt-3 text-sm font-semibold text-slate-800">Organic Alternatives</h4>
            <ul className="mt-1 space-y-2 text-sm text-slate-700">
              {result.organicAlternatives.map((alt) => (
                <li key={alt} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">{alt}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default FertilizerPage;
