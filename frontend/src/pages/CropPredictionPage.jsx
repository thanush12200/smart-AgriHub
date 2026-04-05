import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import useDocTitle from '../hooks/useDocTitle';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CropPredictionPage = () => {
  useDocTitle('Crop Prediction');
  const [input, setInput] = useState({ soilType: 'black', rainfall: 120, temperature: 28, region: 'Karnataka' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [plantImage, setPlantImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [plantResult, setPlantResult] = useState(null);
  const [plantError, setPlantError] = useState('');
  const [plantLoading, setPlantLoading] = useState(false);

  useEffect(() => {
    if (!plantImage) {
      setImagePreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(plantImage);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [plantImage]);

  const onSubmit = async (event) => {
    event.preventDefault();
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

  const onPlantImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPlantError('');
    setPlantResult(null);

    if (!file) {
      setPlantImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has((file.type || '').toLowerCase())) {
      setPlantImage(null);
      setPlantError('Unsupported format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    setPlantImage(file);
  };

  const onPlantDetect = async (event) => {
    event.preventDefault();
    setPlantError('');

    if (!plantImage) {
      setPlantError('Please upload a plant image first.');
      return;
    }

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
    ? (
      String(plantResult.plant || '').toLowerCase() === 'unknown' && plantResult.commonName
        ? plantResult.commonName
        : plantResult.plant
    )
    : '';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section 1: Crop Prediction */}
      <div>
        <p className="section-label">Crop Intelligence</p>
        <h1 className="section-title mt-1">Predict the best crops for your field</h1>
        <p className="section-subtitle">Enter your soil and climate conditions to get AI-ranked crop recommendations.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <form className="card p-5 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Soil Type</label>
              <input className="input" placeholder="e.g. black, alluvial" value={input.soilType} onChange={(e) => setInput({ ...input, soilType: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Region</label>
              <input className="input" placeholder="e.g. Karnataka" value={input.region} onChange={(e) => setInput({ ...input, region: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Rainfall (mm)</label>
              <input className="input" type="number" value={input.rainfall} onChange={(e) => setInput({ ...input, rainfall: Number(e.target.value) })} />
            </div>
            <div>
              <label className="field-label">Temperature (°C)</label>
              <input className="input" type="number" value={input.temperature} onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })} />
            </div>
          </div>
          {error ? <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p> : null}
          <button className="btn-primary w-full" disabled={loading} type="submit">{loading ? 'Analyzing…' : 'Predict Crops'}</button>
        </form>

        <section className="card p-5">
          <p className="section-label text-accent-400">Results</p>
          <h3 className="section-title mt-1">Recommendations</h3>
          {!result ? (
            <p className="mt-3 text-sm text-slate-400">Run a prediction to see ranked crops here.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-600">Confidence: <span className="font-semibold text-slate-900">{Math.round(result.confidence * 100)}%</span></p>
              <div className="space-y-2">
                {result.recommendations.map((item, idx) => (
                  <div key={item.crop} className={`stagger-item flex items-center justify-between rounded-lg border p-3 ${idx === 0 ? 'border-brand-200 bg-brand-50' : 'border-surface-200 bg-surface-50'}`}>
                    <span className={`text-sm font-semibold capitalize ${idx === 0 ? 'text-brand-700' : 'text-slate-700'}`}>
                      {idx === 0 ? '🏆 ' : ''}{item.crop}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">{Math.round(item.score * 100)}%</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Feature Importance</p>
                {result.featureImportance.map((item) => (
                  <div key={item.feature} className="mb-1.5">
                    <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                      <span>{item.feature}</span>
                      <span>{Math.round(item.importance * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-200">
                      <div className="h-1.5 rounded-full bg-brand-400 transition-all" style={{ width: `${Math.round(item.importance * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Section 2: Plant Detection */}
      <div className="mt-2">
        <p className="section-label text-violet-500">Plant Detection</p>
        <h2 className="section-title mt-1">Identify a plant from an image</h2>
        <p className="section-subtitle">Upload a clear photo of a leaf or fruit to detect the crop type and health status.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <form className="card p-5 space-y-4" onSubmit={onPlantDetect}>
          <label className="block cursor-pointer">
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onPlantImageChange}
            />
            {imagePreview ? (
              <div className="overflow-hidden rounded-lg border border-surface-200">
                <img src={imagePreview} alt="Plant preview" className="h-56 w-full object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-surface-300 bg-surface-50 p-10 transition-colors hover:border-brand-300 hover:bg-brand-50/30">
                <UploadIcon />
                <p className="text-sm font-medium text-slate-500">Click to upload an image</p>
                <p className="text-xs text-slate-400">JPG, PNG, or WEBP</p>
              </div>
            )}
          </label>

          {plantError ? <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{plantError}</p> : null}
          <button className="btn-primary w-full" disabled={plantLoading || !plantImage} type="submit">
            {plantLoading ? 'Detecting…' : 'Detect Plant'}
          </button>
        </form>

        <section className="card p-5">
          <p className="section-label text-violet-500">Detection Result</p>
          <h3 className="section-title mt-1">Plant Analysis</h3>

          {!plantResult ? (
            <p className="mt-3 text-sm text-slate-400">Upload an image and run detection.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {/* Plant name hero */}
              <div className="rounded-lg border-l-[3px] border-l-violet-400 bg-violet-50/50 p-4">
                <p className="text-2xl font-display capitalize text-slate-900">{displayPlantName}</p>
                {plantResult.commonName ? (
                  <p className="text-xs text-slate-600 mt-0.5">Common: {plantResult.commonName}</p>
                ) : null}
                {plantResult.scientificName ? (
                  <p className="text-xs italic text-slate-400">{plantResult.scientificName}</p>
                ) : null}
              </div>

              {/* Confidence */}
              <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
                <p className="text-xs text-slate-400">Confidence</p>
                <p className="text-lg font-semibold text-slate-900">{Math.round(Number(plantResult.confidence || 0) * 100)}%</p>
              </div>

              {/* Health */}
              <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
                <p className="text-xs text-slate-400">Health Status</p>
                <p className="text-sm font-semibold text-slate-800">{plantResult.healthStatus}</p>
              </div>

              {plantResult.message ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-amber-700">{plantResult.message}</p>
              ) : null}

              {plantResult.description ? (
                <div className="rounded-lg border border-surface-200 bg-surface-50 p-3">
                  <p className="text-xs text-slate-400 mb-1">Analysis</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{plantResult.description}</p>
                </div>
              ) : null}

              {plantResult.detectedIssues?.length ? (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Detected Issues</p>
                  {plantResult.detectedIssues.map((issue, idx) => (
                    <p key={`${issue}-${idx}`} className="stagger-item mb-1.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-amber-700">
                      <span>⚠️</span><span>{issue}</span>
                    </p>
                  ))}
                </div>
              ) : null}

              {plantResult.topMatches?.length ? (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Top Matches</p>
                  {plantResult.topMatches.map((match) => (
                    <div key={match.crop} className="stagger-item mb-1.5 flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2">
                      <span className="text-sm font-medium capitalize text-slate-700">{match.crop}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm">{Math.round(match.score * 100)}%</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">🌱 Care Tips</p>
                {(plantResult.careTips || []).map((tip, idx) => (
                  <p key={`${tip}-${idx}`} className="stagger-item mb-1.5 rounded-lg border border-brand-100 bg-brand-50/40 px-3 py-2 text-sm text-brand-800">
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CropPredictionPage;
