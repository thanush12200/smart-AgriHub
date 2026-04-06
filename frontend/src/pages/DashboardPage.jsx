import { useEffect, useState, Suspense, lazy } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axiosClient';
import MetricCard from '../components/MetricCard';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { useSocketAlerts } from '../hooks/useSocket';
import { motion } from 'framer-motion';

const FarmScene = lazy(() => import('../components/3d/FarmScene'));

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ChartTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid var(--border-light)',
  background: 'var(--bg-card)',
  fontSize: '13px',
  backdropFilter: 'blur(12px)',
  color: 'var(--text-primary)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function DashboardPage() {
  useDocTitle('Dashboard');
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const alerts = useSocketAlerts(user?.region);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analyticsRes, weatherRes] = await Promise.all([
          api.get('/dashboard/analytics'),
          api.get('/weather/current', { params: { region: user?.region } }),
        ]);
        setAnalytics(analyticsRes.data);
        setWeather(weatherRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.region]);

  const downloadReport = async () => {
    setDownloadError('');
    setDownloadingPdf(true);
    try {
      const res = await api.get('/dashboard/report/pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smart-agri-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.response?.data?.message || 'Failed to download report.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-fadeIn">
        {/* Skeleton hero */}
        <div className="rounded-[32px] h-56 shimmer" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="rounded-[24px] h-28 shimmer" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map(i => <div key={i} className="rounded-[24px] h-72 shimmer" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] border border-red-200 bg-red-50 p-5 text-sm text-red-600 flex items-center gap-3">
        <AlertIcon /> {error}
      </div>
    );
  }

  const displayAlerts = alerts.length ? alerts : analytics.alerts;

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ── 3D Mission Control Hero ─────────────── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-[32px]"
        style={{
          background: 'linear-gradient(160deg, #071510 0%, #0a1e14 60%, #0e2818 100%)',
          border: '1px solid rgba(41,160,100,0.2)',
          minHeight: 280,
        }}
      >
        {/* 3D background */}
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <FarmScene className="w-full h-full" />
          </Suspense>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-end lg:justify-between min-h-[280px]">
          <div className="flex flex-col justify-end">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 w-fit"
              style={{ background: 'rgba(41,160,100,0.15)', border: '1px solid rgba(41,160,100,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7ad5a0' }}>
                Field Command Center
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {getGreeting()}, <span style={{ color: '#7ad5a0' }}>{user?.name || 'Farmer'}</span>
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Your farm intelligence dashboard — live weather, activity trends, nutrient posture, and advisory signals in one view.
            </p>
          </div>

          {/* Hero info cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[380px]">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(7,20,13,0.72)', border: '1px solid rgba(41,160,100,0.2)', backdropFilter: 'blur(16px)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Region</p>
              <p className="text-base font-bold text-white">{user?.region || 'India'}</p>
              <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Alerts tuned to your area</p>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(7,20,13,0.72)', border: '1px solid rgba(41,160,100,0.2)', backdropFilter: 'blur(16px)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Reports</p>
              <p className="text-base font-bold text-white">Operational Snapshot</p>
              <button
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-white transition-all"
                style={{ background: 'rgba(41,160,100,0.2)', border: '1px solid rgba(41,160,100,0.35)' }}
                onClick={downloadReport}
                disabled={downloadingPdf}
                type="button"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(41,160,100,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(41,160,100,0.2)'}
              >
                <DownloadIcon />
                {downloadingPdf ? 'Generating…' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Metric Cards ────────────────────────── */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Crop Predictions"
          value={analytics.summary.cropPredictions}
          subtitle="Total prediction runs"
          accent="emerald"
        />
        <MetricCard
          title="Fertilizer Advice"
          value={analytics.summary.fertilizerRecommendations}
          subtitle="Generated recommendations"
          accent="sky"
        />
        <MetricCard
          title="Chat Queries"
          value={analytics.summary.chatQueries}
          subtitle="Farmer interactions"
          accent="amber"
        />
      </motion.div>

      {/* ── Weather Alerts ───────────────────────── */}
      {displayAlerts.length > 0 && (
        <motion.section
          variants={item}
          className="card p-5 md:p-6"
          style={{
            borderLeft: '3px solid #f59e0b',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.06), transparent 50%), var(--bg-card)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="section-label" style={{ color: '#d97706' }}>Live Advisory</p>
              <h3 className="section-title mt-1">Weather Alerts</h3>
            </div>
            <span className="badge-amber">{displayAlerts.length} active</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {displayAlerts.map((alert, idx) => (
              <motion.div
                key={`${alert.type}-${idx}`}
                className="rounded-2xl p-4 text-sm"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  color: 'var(--text-primary)',
                }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.07 }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#d97706' }}>
                  {alert.type || 'Weather Alert'}
                </p>
                <p className="font-semibold">{alert.date}</p>
                <p className="mt-1 leading-6" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Weather Widget ───────────────────────── */}
      <motion.div variants={item}>
        <WeatherWidget weather={weather} />
      </motion.div>

      {/* ── Charts ──────────────────────────────── */}
      <motion.div variants={item} className="grid gap-5 lg:grid-cols-2">
        {/* Crop Confidence Trend */}
        <section className="card p-5 md:p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="section-label">Trend</p>
              <h3 className="section-title mt-1">Crop Confidence</h3>
              <p className="section-subtitle">Recent prediction confidence trajectory</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,122,76,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <LineChart data={analytics.cropYieldTrend}>
                <defs>
                  <linearGradient id="cropGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a7a4c" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#1a7a4c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={ChartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#1a7a4c"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1a7a4c', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#29a064' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Soil Health (NPK) */}
        <section className="card p-5 md:p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="section-label">Nutrients</p>
              <h3 className="section-title mt-1">Soil Health (NPK)</h3>
              <p className="section-subtitle">Nutrient profile from latest advisory</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,97,31,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-500">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <BarChart data={analytics.soilHealth}>
                <defs>
                  <linearGradient id="npkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8611f" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#e07c3a" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="metric" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={ChartTooltipStyle} />
                <Bar dataKey="value" fill="url(#npkGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </motion.div>

      {downloadError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {downloadError}
        </p>
      )}
    </motion.div>
  );
}
