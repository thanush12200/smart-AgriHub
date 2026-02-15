import { useEffect, useState } from 'react';
import api from '../api/axiosClient';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const CropPredictionPage = () => {
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
      setPlantError('Unsupported image format. Please upload JPG, PNG, or WEBP image files.');
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
    <div className="space-y-4 animate-fadeIn">
      <div className="grid gap-4 lg:grid-cols-2">
        <form className="card space-y-3 p-5" onSubmit={onSubmit}>
          <p className="text-[10px] font-black uppercase tracking-[0.23em] text-emerald-700">Input panel</p>
          <h2 className="font-display text-2xl font-bold text-slate-900">Crop Prediction System</h2>
          <input className="input" placeholder="Soil type" value={input.soilType} onChange={(e) => setInput({ ...input, soilType: e.target.value })} />
          <input className="input" type="number" placeholder="Rainfall (mm)" value={input.rainfall} onChange={(e) => setInput({ ...input, rainfall: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Temperature (deg C)" value={input.temperature} onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })} />
          <input className="input" placeholder="Region" value={input.region} onChange={(e) => setInput({ ...input, region: e.target.value })} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Predicting...' : 'Predict Crops'}</button>
        </form>

        <section className="card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.23em] text-sky-700">Inference output</p>
          <h3 className="font-display text-2xl font-bold text-slate-900">AI Output</h3>
          {!result ? (
            <p className="mt-2 text-sm text-slate-500">Run prediction to view recommended crops.</p>
          ) : (
            <>
              <p className="mt-3 text-sm text-slate-700">Confidence: <span className="font-semibold">{result.confidence}</span></p>
              <ul className="mt-2 space-y-2 text-sm">
                {result.recommendations.map((item) => (
                  <li key={item.crop} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                    {item.crop} - score: {item.score}
                  </li>
                ))}
              </ul>
              <h4 className="mt-4 text-sm font-semibold text-slate-800">Feature Importance</h4>
              <ul className="mt-1 space-y-2 text-xs text-slate-700">
                {result.featureImportance.map((item) => (
                  <li key={item.feature} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    {item.feature}: {item.importance}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form className="card space-y-3 p-5" onSubmit={onPlantDetect}>
          <p className="text-[10px] font-black uppercase tracking-[0.23em] text-violet-700">Image-based detection</p>
          <h2 className="font-display text-2xl font-bold text-slate-900">Upload Plant Image</h2>
          <p className="text-sm text-slate-600">Upload a leaf/plant photo and detect the likely crop type.</p>

          <input
            className="input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={onPlantImageChange}
          />
          <p className="text-xs text-slate-500">Supported formats: JPG, PNG, WEBP</p>

          {imagePreview ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img src={imagePreview} alt="Plant preview" className="h-56 w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No image selected
            </div>
          )}

          {plantError ? <p className="text-sm text-red-600">{plantError}</p> : null}
          <button className="btn-primary" disabled={plantLoading || !plantImage} type="submit">
            {plantLoading ? 'Detecting Plant...' : 'Detect Plant'}
          </button>
        </form>

        <section className="card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.23em] text-violet-700">Detection result</p>
          <h3 className="font-display text-2xl font-bold text-slate-900">Detected Plant</h3>

          {!plantResult ? (
            <p className="mt-2 text-sm text-slate-500">Upload an image and run detection.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                <p className="text-xs text-violet-700">Plant</p>
                <p className="text-xl font-bold capitalize text-violet-900">{displayPlantName}</p>
                {plantResult.commonName ? (
                  <p className="text-xs text-violet-800">Common: {plantResult.commonName}</p>
                ) : null}
                {plantResult.scientificName ? (
                  <p className="text-xs italic text-violet-700">Scientific: {plantResult.scientificName}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Confidence</p>
                  <p className="text-base font-semibold text-slate-900">{Math.round(Number(plantResult.confidence || 0) * 100)}%</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Source</p>
                  <p className="text-base font-semibold text-slate-900 capitalize">{String(plantResult.source || '-').replaceAll('_', ' ')}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Health Status</p>
                <p className="text-base font-semibold text-slate-900">{plantResult.healthStatus}</p>
              </div>

              {plantResult.message ? (
                <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">{plantResult.message}</p>
              ) : null}

              {plantResult.description ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Analysis</p>
                  <p className="text-sm text-slate-800">{plantResult.description}</p>
                </div>
              ) : null}

              {plantResult.detectedIssues?.length ? (
                <div>
                  <p className="text-sm font-semibold text-slate-800">Detected Issues</p>
                  <ul className="mt-1 space-y-2 text-sm text-slate-700">
                    {plantResult.detectedIssues.map((issue, idx) => (
                      <li key={`${issue}-${idx}`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {plantResult.topMatches?.length ? (
                <div>
                  <p className="text-sm font-semibold text-slate-800">Top Matches</p>
                  <ul className="mt-1 space-y-2 text-sm text-slate-700">
                    {plantResult.topMatches.map((match) => (
                      <li key={match.crop} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 capitalize">
                        {match.crop} - score: {match.score}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-semibold text-slate-800">Care Tips</p>
                <ul className="mt-1 space-y-2 text-sm text-slate-700">
                  {(plantResult.careTips || []).map((tip, idx) => (
                    <li key={`${tip}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CropPredictionPage;
