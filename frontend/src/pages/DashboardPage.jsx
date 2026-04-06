import { useEffect, useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axiosClient';
import MetricCard from '../components/MetricCard';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { useSocketAlerts } from '../hooks/useSocket';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const DashboardPage = () => {
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
          api.get('/weather/current', { params: { region: user?.region } })
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
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'smart-agri-report.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.response?.data?.message || 'Failed to download report. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center animate-fadeIn">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-surface-200 border-t-brand-500" />
        <p className="text-sm text-slate-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return <p className="rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p>;
  }

  const displayAlerts = alerts.length ? alerts : analytics.alerts;

  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="page-hero">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-kicker">Field Command Center</p>
            <h1 className="page-title">
              {getGreeting()}, {user?.name || 'Farmer'}
            </h1>
            <p className="page-copy">
              Your farm intelligence dashboard brings together live weather, activity trends, nutrient posture, and advisory signals in one premium view.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
            <div className="rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-sm backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Region</p>
              <p className="mt-2 text-lg font-bold text-slate-950">{user?.region || 'India'}</p>
              <p className="mt-1 text-sm text-slate-500">Alerts and forecast tuned to your operating area</p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-sm backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Reports</p>
              <p className="mt-2 text-lg font-bold text-slate-950">Operational Snapshot</p>
              <button className="btn-primary mt-3 w-full" onClick={downloadReport} disabled={downloadingPdf} type="button">
                <DownloadIcon />
                {downloadingPdf ? 'Generating…' : 'Download PDF Report'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Crop Predictions" value={analytics.summary.cropPredictions} subtitle="Total prediction runs" accent="emerald" />
        <MetricCard title="Fertilizer Advice" value={analytics.summary.fertilizerRecommendations} subtitle="Generated recommendations" accent="sky" />
        <MetricCard title="Chat Queries" value={analytics.summary.chatQueries} subtitle="Farmer interactions" accent="amber" />
      </div>

      {displayAlerts.length ? (
        <section className="card border-l-[3px] border-l-amber-400 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-label text-amber-600">Live Advisory</p>
              <h3 className="section-title mt-1">Weather Alerts</h3>
            </div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {displayAlerts.length} active
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {displayAlerts.map((alert, idx) => (
              <div key={`${alert.type}-${idx}`} className="stagger-item rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">{alert.type || 'Weather Alert'}</p>
                <p className="mt-2 font-semibold">{alert.date}</p>
                <p className="mt-1 leading-6">{alert.message}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <WeatherWidget weather={weather} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 md:p-6">
          <p className="section-label">Trend</p>
          <h3 className="section-title mt-1">Crop Confidence</h3>
          <p className="section-subtitle">Recent prediction confidence trajectory</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={analytics.cropYieldTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e5df" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e5df', fontSize: '13px' }} />
                <Line type="monotone" dataKey="confidence" stroke="#1a7a4c" strokeWidth={2.5} dot={{ r: 4, fill: '#1a7a4c' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5 md:p-6">
          <p className="section-label">Nutrients</p>
          <h3 className="section-title mt-1">Soil Health (NPK)</h3>
          <p className="section-subtitle">Nutrient profile from latest advisory</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={analytics.soilHealth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e5df" />
                <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e8e5df', fontSize: '13px' }} />
                <Bar dataKey="value" fill="#e07c3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {downloadError ? <p className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-600">{downloadError}</p> : null}
    </div>
  );
};

export default DashboardPage;
