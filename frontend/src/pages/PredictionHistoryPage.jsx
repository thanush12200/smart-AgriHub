import { useEffect, useState, Suspense, lazy } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import Badge from '../components/Badge';

const TimelineScene = lazy(() => import('../components/3d/TimelineScene'));



const PredictionHistoryPage = () => {
  useDocTitle('Prediction History');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = filter !== 'all' ? { type: filter } : {};
        const { data } = await api.get('/predictions/history', { params });
        setLogs(data.logs);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filter]);

  const handleReUse = (type, input) => {
    navigate(type === 'crop' ? '/crop-prediction' : '/fertilizer', { state: { prefill: input } });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn">
      <section
        className="relative overflow-hidden rounded-[32px]"
        style={{
          background: 'linear-gradient(160deg, #071510 0%, #0a1e14 60%, #0e2818 100%)',
          border: '1px solid rgba(41,160,100,0.2)',
          minHeight: 220,
        }}
      >
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <TimelineScene className="w-full h-full" />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 p-6 md:p-8 min-h-[220px]">
          <div className="flex flex-col justify-end">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 w-fit"
              style={{ background: 'rgba(41,160,100,0.15)', border: '1px solid rgba(41,160,100,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7ad5a0' }}>
                Decision Trail
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
              Prediction History
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Review past crop and fertilizer analyses, then reuse any previous input set to move faster.
            </p>
          </div>
          <select className="input w-48" value={filter} onChange={(e) => setFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
            <option value="all">All Predictions</option>
            <option value="crop">Crop Only</option>
            <option value="fertilizer">Fertilizer Only</option>
          </select>
        </div>
      </section>

      {error ? <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div> : null}

      {loading ? (
        <div className="card p-12 text-center text-slate-500">Loading history...</div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <p>No predictions found.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button className="btn-primary" onClick={() => navigate('/crop-prediction')}>New Crop Prediction</button>
            <button className="btn-secondary" onClick={() => navigate('/fertilizer')}>New Fertilizer Plan</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log._id} className="card p-5 grid gap-4 items-start md:grid-cols-[1.5fr_2fr_auto]">
              
              {/* Info Column */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge color={log.type === 'crop' ? 'green' : 'sky'}>{log.type}</Badge>
                  <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xl font-display font-bold text-slate-900">
                  {log.type === 'crop' ? log.output.crop : log.output.fertilizer}
                </p>
                {log.confidence && (
                  <div className="mt-2 w-32">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>Conf:</span><span>{(log.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: `${log.confidence * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Data Column */}
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1 tracking-wide uppercase text-[10px]">Inputs provided</p>
                {log.type === 'crop' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <p>N: {log.input.npk?.n}</p>
                    <p>Temp: {log.input.weather?.temperature}</p>
                    <p>P: {log.input.npk?.p}</p>
                    <p>Hum: {log.input.weather?.humidity}</p>
                    <p>K: {log.input.npk?.k}</p>
                    <p>pH: {log.input.soil?.ph}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <p>Crop: {log.input.crop}</p>
                    <p>N: {log.input.npk?.n}</p>
                    <p>P: {log.input.npk?.p}</p>
                    <p>K: {log.input.npk?.k}</p>
                  </div>
                )}
              </div>

              {/* Action Column */}
              <div className="flex flex-col gap-2 self-center">
                <button 
                  className="btn-secondary text-xs px-3 py-1.5" 
                  onClick={() => handleReUse(log.type, log.input)}
                >
                  Reuse Inputs
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictionHistoryPage;
