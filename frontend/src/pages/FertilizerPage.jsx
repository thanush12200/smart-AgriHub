import { useState, Suspense, lazy } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import { motion } from 'framer-motion';

const NutrientOrbitScene = lazy(() => import('../components/3d/NutrientOrbitScene'));

const NPK_META = {
  nitrogen: { color: '#41b878', label: 'Nitrogen', desc: 'Leaf growth & chlorophyll' },
  phosphorous: { color: '#38bdf8', label: 'Phosphorus', desc: 'Root & flower development' },
  potassium: { color: '#f0aa73', label: 'Potassium', desc: 'Disease resistance & yield' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FertilizerPage() {
  useDocTitle('Fertilizer Advisor');
  const [input, setInput] = useState({
    cropType: 'Paddy', soilType: 'Loamy',
    nitrogen: 30, phosphorous: 25, potassium: 28,
    temperature: 28, humidity: 65, moisture: 40,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
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
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">

      {/* ── Hero with Nutrient Orbit 3D ─────── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[32px]"
        style={{
          background: 'linear-gradient(160deg, #07100a 0%, #0c1c12 60%, #0a1810 100%)',
          border: '1px solid rgba(41,160,100,0.2)',
          minHeight: 240,
        }}
      >
        {/* 3D scene right */}
        <div className="absolute right-0 top-0 bottom-0 w-[50%] hidden lg:block">
          <Suspense fallback={null}>
            <NutrientOrbitScene className="w-full h-full" />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end min-h-[240px]">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 w-fit"
            style={{ background: 'rgba(240,170,115,0.12)', border: '1px solid rgba(240,170,115,0.28)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f0aa73' }}>
              Nutrient Planning
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Fertilizer Recommendation<br/>
            <span style={{ color: '#f0aa73' }}>precise & organic.</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Get dosage plans with organic alternatives based on your crop and current NPK soil values.
          </p>

          {/* Live NPK mini-display */}
          <div className="flex gap-3 mt-5">
            {Object.entries(NPK_META).map(([key, meta]) => (
              <div key={key} className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${meta.color}30` }}>
                <span className="text-xs font-black" style={{ color: meta.color }}>{key.charAt(0).toUpperCase()}</span>
                <span className="text-sm font-bold text-white">{input[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Form + Results ──────────────────── */}
      <motion.div variants={item} className="grid gap-5 lg:grid-cols-2">
        <form className="card p-5 md:p-6 space-y-5" onSubmit={onSubmit}>
          <div>
            <p className="section-label">Advisory Inputs</p>
            <h2 className="section-title mt-1">Crop and NPK profile</h2>
          </div>

          {/* Crop pills */}
          <div>
            <label className="field-label">Crop</label>
            <div className="flex flex-wrap gap-2 mt-1.5 mb-2">
              {['Paddy', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Millets', 'Barley', 'Pulses', 'Oil seeds', 'Ground Nuts', 'Tobacco'].map(crop => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => setInput({ ...input, cropType: crop })}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                  style={{
                    background: input.cropType === crop ? 'rgba(240,170,115,0.15)' : 'var(--bg-elevated)',
                    border: input.cropType === crop ? '1px solid rgba(240,170,115,0.4)' : '1px solid var(--border-light)',
                    color: input.cropType === crop ? 'var(--accent-500)' : 'var(--text-secondary)',
                  }}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Soil type pills */}
          <div>
            <label className="field-label">Soil Type</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'].map(soil => (
                <button
                  key={soil}
                  type="button"
                  onClick={() => setInput({ ...input, soilType: soil })}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                  style={{
                    background: input.soilType === soil ? 'rgba(26,122,76,0.15)' : 'var(--bg-elevated)',
                    border: input.soilType === soil ? '1px solid rgba(26,122,76,0.4)' : '1px solid var(--border-light)',
                    color: input.soilType === soil ? 'var(--brand-500)' : 'var(--text-secondary)',
                  }}
                >
                  {soil}
                </button>
              ))}
            </div>
          </div>

          {/* Environment inputs */}
          <div>
            <label className="field-label">Environment</label>
            <div className="grid grid-cols-3 gap-3 mt-1.5">
              <div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Temp (°C)</span>
                <input className="input mt-1" type="number" step="0.1" value={input.temperature}
                  onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })} />
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Humidity (%)</span>
                <input className="input mt-1" type="number" step="0.1" min={0} max={100} value={input.humidity}
                  onChange={(e) => setInput({ ...input, humidity: Number(e.target.value) })} />
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Moisture (%)</span>
                <input className="input mt-1" type="number" step="0.1" min={0} max={100} value={input.moisture}
                  onChange={(e) => setInput({ ...input, moisture: Number(e.target.value) })} />
              </div>
            </div>
          </div>

          {/* NPK inputs with visual styling */}
          <div>
            <label className="field-label">NPK Values (Current Soil Levels)</label>
            <div className="space-y-3 mt-1.5">
              {Object.entries(NPK_META).map(([key, meta]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center"
                        style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                        {key.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{meta.label}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>— {meta.desc}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: meta.color }}>{input[key]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={input[key]}
                      onChange={(e) => setInput({ ...input, [key]: Number(e.target.value) })}
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: meta.color }}
                    />
                    <input
                      className="input w-20 text-center text-sm"
                      type="number"
                      value={input[key]}
                      onChange={(e) => setInput({ ...input, [key]: Number(e.target.value) })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl border px-3 py-2.5 text-sm"
              style={{ background: 'rgba(220,38,38,0.08)', borderColor: 'rgba(220,38,38,0.2)', color: '#dc2626' }}>
              {error}
            </p>
          )}
          <button className="btn-accent w-full py-3" disabled={loading} type="submit">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Analyzing…
              </span>
            ) : '⚗️ Get Recommendation'}
          </button>
        </form>

        <section className="card p-5 md:p-6">
          <p className="section-label" style={{ color: 'var(--accent-500)' }}>Advisory</p>
          <h3 className="section-title mt-1">Results</h3>

          {!result ? (
            <div className="mt-6 flex flex-col items-center text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <span className="text-5xl mb-3 opacity-40">⚗️</span>
              <p className="text-sm">Enter crop and NPK values to view recommendation.</p>
            </div>
          ) : (
            <motion.div className="mt-4 space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {/* Fertilizer hero */}
              <div className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(200,97,31,0.1), rgba(200,97,31,0.05))',
                  borderLeft: '3px solid var(--accent-500)',
                  border: '1px solid rgba(200,97,31,0.22)',
                }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent-500)' }}>
                  Recommended Fertilizer
                </p>
                <p className="font-display text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {result.fertilizer}
                </p>
              </div>

              {/* Dosage + Confidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Dosage</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {result.dosageKgPerAcre}
                    <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>kg/acre</span>
                  </p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Confidence</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(result.confidence * 100)}%
                  </p>
                </div>
              </div>

              {/* NPK bars */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                <p className="section-label mb-4">Soil Health Report</p>
                <div className="space-y-3.5">
                  {Object.entries(NPK_META).map(([key, meta]) => (
                    <div key={key} className="flex items-center gap-3 text-sm">
                      <span className="w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0"
                        style={{ background: `${meta.color}18`, color: meta.color }}>
                        {key.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}aa)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, input[key])}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-sm" style={{ color: meta.color }}>
                        {input[key]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 text-xs" style={{ borderTop: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Avg Score: </span>
                  {Math.round((input.nitrogen + input.phosphorous + input.potassium) / 3)}/100
                  {input.nitrogen < 30 && (
                    <span className="ml-2" style={{ color: 'var(--accent-500)' }}>
                      · Low N: consider planting legumes.
                    </span>
                  )}
                </div>
              </div>

              {/* Organic alternatives */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
                  🌿 Organic Alternatives
                </p>
                {result.organicAlternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="mb-2 flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-sm"
                    style={{
                      background: 'rgba(26,122,76,0.07)',
                      border: '1px solid rgba(26,122,76,0.18)',
                      color: 'var(--brand-500)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z"/>
                      <path d="M2 21c0-3 1.9-5.5 4.5-6.3"/>
                    </svg>
                    <span>{alt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      </motion.div>
    </motion.div>
  );
}
