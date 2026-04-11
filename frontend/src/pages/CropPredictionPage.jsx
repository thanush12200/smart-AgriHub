import { useEffect, useState, Suspense, lazy } from 'react';
import api from '../api/axiosClient';
import useDocTitle from '../hooks/useDocTitle';
import { motion } from 'framer-motion';

const SoilLayersScene = lazy(() => import('../components/3d/SoilLayersScene'));

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CropPredictionPage() {
  useDocTitle('Crop Prediction');
  const [input, setInput] = useState({ N: 50, P: 50, K: 50, temperature: 28, humidity: 70, ph: 6.5, rainfall: 120 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [plantImage, setPlantImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [plantResult, setPlantResult] = useState(null);
  const [plantError, setPlantError] = useState('');
  const [plantLoading, setPlantLoading] = useState(false);

  useEffect(() => {
    if (!plantImage) { setImagePreview(''); return; }
    const url = URL.createObjectURL(plantImage);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [plantImage]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/crop/predict', input);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const onPlantImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPlantError('');
    setPlantResult(null);
    if (!file) { setPlantImage(null); return; }
    if (!ALLOWED_IMAGE_TYPES.has((file.type || '').toLowerCase())) {
      setPlantImage(null);
      setPlantError('Unsupported format. Please upload JPG, PNG, or WEBP.');
      return;
    }
    setPlantImage(file);
  };

  const onPlantDetect = async (e) => {
    e.preventDefault();
    setPlantError('');
    if (!plantImage) { setPlantError('Please upload a plant image first.'); return; }
    const formData = new FormData();
    formData.append('image', plantImage);
    setPlantLoading(true);
    try {
      const { data } = await api.post('/crop/detect-plant', formData);
      setPlantResult(data);
    } catch (err) {
      setPlantError(err.response?.data?.message || 'Plant detection failed');
    } finally {
      setPlantLoading(false);
    }
  };

  const displayPlantName = plantResult
    ? (String(plantResult.plant || '').toLowerCase() === 'unknown' && plantResult.commonName
        ? plantResult.commonName : plantResult.plant)
    : '';

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">

      {/* ── Hero with 3D soil layers ─────────── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[32px]"
        style={{
          background: 'linear-gradient(160deg, #071510 0%, #0d1f15 60%, #0a1a10 100%)',
          border: '1px solid rgba(41,160,100,0.2)',
          minHeight: 220,
        }}
      >
        {/* 3D scene right side */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:block">
          <Suspense fallback={null}>
            <SoilLayersScene className="w-full h-full" />
          </Suspense>
        </div>
        {/* gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end min-h-[220px]">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 w-fit"
            style={{ background: 'rgba(41,160,100,0.15)', border: '1px solid rgba(41,160,100,0.28)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#7ad5a0' }}>
              Agronomy Lab
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Predict the best crops<br/>
            <span style={{ color: '#7ad5a0' }}>for your field.</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Enter your soil and climate conditions to get AI-ranked crop recommendations with confidence and feature importance.
          </p>
        </div>
      </motion.section>

      {/* ── Prediction form + results ─────────── */}
      <motion.div variants={item} className="grid gap-5 lg:grid-cols-2">
        <form className="card p-5 md:p-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <p className="section-label">Field Inputs</p>
            <h2 className="section-title mt-1">Soil and climate profile</h2>
          </div>

          {/* NPK Sliders */}
          <div>
            <label className="field-label">NPK Values (Soil Nutrient Levels)</label>
            <div className="space-y-3 mt-1.5">
              {[{key:'N',label:'Nitrogen',color:'#41b878',max:140},{key:'P',label:'Phosphorus',color:'#38bdf8',max:140},{key:'K',label:'Potassium',color:'#f0aa73',max:210}].map(item => (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center"
                        style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}30` }}>
                        {item.key}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{input[item.key]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={item.max} value={input[item.key]}
                      onChange={(e) => setInput({ ...input, [item.key]: Number(e.target.value) })}
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: item.color }} />
                    <input className="input w-20 text-center text-sm" type="number" min={0} max={item.max}
                      value={input[item.key]} onChange={(e) => setInput({ ...input, [item.key]: Number(e.target.value) })} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Climate inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Temperature (°C)</label>
              <input className="input" type="number" step="0.1" value={input.temperature}
                onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })} />
            </div>
            <div>
              <label className="field-label">Humidity (%)</label>
              <input className="input" type="number" step="0.1" min={0} max={100} value={input.humidity}
                onChange={(e) => setInput({ ...input, humidity: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Soil pH</label>
              <input className="input" type="number" step="0.1" min={0} max={14} value={input.ph}
                onChange={(e) => setInput({ ...input, ph: Number(e.target.value) })} />
            </div>
            <div>
              <label className="field-label">Rainfall (mm)</label>
              <input className="input" type="number" value={input.rainfall}
                onChange={(e) => setInput({ ...input, rainfall: Number(e.target.value) })} />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border px-3 py-2.5 text-sm"
              style={{ background: 'rgba(220,38,38,0.08)', borderColor: 'rgba(220,38,38,0.2)', color: '#dc2626' }}>
              {error}
            </p>
          )}
          <button className="btn-primary w-full py-3" disabled={loading} type="submit">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Analyzing…
              </span>
            ) : '🌱 Predict Crops'}
          </button>
        </form>

        <section className="card p-5 md:p-6">
          <p className="section-label">Results</p>
          <h3 className="section-title mt-1">Recommendations</h3>
          {!result ? (
            <div className="mt-6 flex flex-col items-center justify-center text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-40">
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z"/>
                <path d="M2 21c0-3 1.9-5.5 4.5-6.3"/>
              </svg>
              <p className="text-sm">Run a prediction to see ranked crops here.</p>
            </div>
          ) : (
            <motion.div
              className="mt-4 space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Confidence hero */}
              <div className="rounded-2xl p-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(26,122,76,0.12), rgba(26,122,76,0.06))', border: '1px solid rgba(26,122,76,0.22)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--brand-500)' }}>
                  Model Confidence
                </p>
                <p className="text-4xl font-display font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(result.confidence * 100)}%
                </p>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--border-light)' }}>
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--brand-500), var(--brand-600))' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(result.confidence * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={rec.crop}
                    className="rounded-2xl p-3.5"
                    style={{
                      background: idx === 0 ? 'rgba(26,122,76,0.1)' : 'var(--bg-elevated)',
                      border: idx === 0 ? '1px solid rgba(26,122,76,0.28)' : '1px solid var(--border-light)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize" style={{ color: idx === 0 ? 'var(--brand-500)' : 'var(--text-primary)' }}>
                        {idx === 0 ? '🏆 ' : `${idx + 1}. `}{rec.crop}
                      </span>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{
                        background: 'var(--bg-card)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-light)',
                      }}>
                        {Math.round(rec.score * 100)}%
                      </span>
                    </div>
                    {rec.season && (
                      <div className="flex gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>🗓 {rec.season}</span>
                        <span>💧 {rec.waterNeed}</span>
                        <span>📅 {rec.growthDays} days</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Feature importance */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Feature Importance
                </p>
                {result.featureImportance.map((feat) => (
                  <div key={feat.feature} className="mb-2.5">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <span className="capitalize">{feat.feature}</span>
                      <span className="font-semibold">{Math.round(feat.importance * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--border-light)' }}>
                      <motion.div
                        className="h-1.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--brand-500), #7ad5a0)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(feat.importance * 100)}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      </motion.div>

      {/* ── Plant Detection ─────────────────── */}
      <motion.section
        variants={item}
        className="rounded-[28px] p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(109,40,217,0.04))',
          border: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 w-fit"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
            AI Vision
          </span>
        </div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Plant Detection
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Upload a clear photo of a leaf or fruit to detect crop type, health status, and care suggestions.
        </p>
      </motion.section>

      <motion.div variants={item} className="grid gap-5 lg:grid-cols-2">
        <form className="card p-5 md:p-6 space-y-4" onSubmit={onPlantDetect}>
          <label className="block cursor-pointer">
            <input className="sr-only" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={onPlantImageChange} />
            {imagePreview ? (
              <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border-light)' }}>
                <img src={imagePreview} alt="Plant preview" className="h-56 w-full object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl p-10 transition-all cursor-pointer"
                style={{
                  border: '2px dashed var(--border-strong)',
                  background: 'var(--bg-elevated)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'
                  e.currentTarget.style.background = 'rgba(139,92,246,0.04)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)'
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Click to upload an image</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>JPG, PNG, or WEBP</p>
              </div>
            )}
          </label>

          {plantError && (
            <p className="rounded-xl border px-3 py-2.5 text-sm"
              style={{ background: 'rgba(220,38,38,0.08)', borderColor: 'rgba(220,38,38,0.2)', color: '#dc2626' }}>
              {plantError}
            </p>
          )}
          <button
            className="btn-primary w-full py-3"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            disabled={plantLoading || !plantImage}
            type="submit"
          >
            {plantLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Detecting…
              </span>
            ) : '🔬 Detect Plant'}
          </button>
        </form>

        <section className="card p-5 md:p-6">
          <p className="section-label" style={{ color: '#7c3aed' }}>Detection Result</p>
          <h3 className="section-title mt-1">Plant Analysis</h3>

          {!plantResult ? (
            <div className="mt-6 flex flex-col items-center text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <span className="text-4xl mb-3 opacity-50">🔬</span>
              <p className="text-sm">Upload an image and run detection.</p>
            </div>
          ) : (
            <motion.div className="mt-4 space-y-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(139,92,246,0.08)', borderLeft: '3px solid #7c3aed' }}>
                <p className="text-xl font-display font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
                  {displayPlantName}
                </p>
                {plantResult.commonName && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Common: {plantResult.commonName}</p>}
                {plantResult.scientificName && <p className="text-xs italic mt-0.5" style={{ color: 'var(--text-muted)' }}>{plantResult.scientificName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Confidence</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(Number(plantResult.confidence || 0) * 100)}%
                  </p>
                </div>
                <div className="rounded-2xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Health Status</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{plantResult.healthStatus}</p>
                </div>
              </div>

              {plantResult.message && (
                <p className="rounded-xl px-3 py-2.5 text-sm" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#d97706' }}>
                  {plantResult.message}
                </p>
              )}
              {plantResult.description && (
                <div className="rounded-2xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                  <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Analysis</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plantResult.description}</p>
                </div>
              )}
              {plantResult.detectedIssues?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Detected Issues</p>
                  {plantResult.detectedIssues.map((issue, i) => (
                    <p key={i} className="mb-1.5 flex items-start gap-2 rounded-xl px-3 py-2 text-sm"
                      style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)', color: '#d97706' }}>
                      <span>⚠️</span><span>{issue}</span>
                    </p>
                  ))}
                </div>
              )}
              {plantResult.topMatches?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Top Matches</p>
                  {plantResult.topMatches.map((match) => (
                    <div key={match.crop} className="mb-1.5 flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                      <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{match.crop}</span>
                      <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                        {Math.round(match.score * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {plantResult.careTips?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>🌱 Care Tips</p>
                  {plantResult.careTips.map((tip, i) => (
                    <p key={i} className="mb-1.5 rounded-xl px-3 py-2 text-sm"
                      style={{ background: 'rgba(26,122,76,0.08)', border: '1px solid rgba(26,122,76,0.18)', color: 'var(--brand-500)' }}>
                      {tip}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </section>
      </motion.div>
    </motion.div>
  );
}
