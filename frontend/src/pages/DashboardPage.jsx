import { useEffect, useState } from 'react';
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
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
    const res = await api.get('/dashboard/report/pdf', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'smart-agri-report.pdf';
    anchor.click();
    URL.revokeObjectURL(url);
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
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl text-slate-900">
          {getGreeting()}, {user?.name || 'Farmer'} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening on your farm today.</p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Crop Predictions" value={analytics.summary.cropPredictions} subtitle="Total prediction runs" accent="emerald" />
        <MetricCard title="Fertilizer Advice" value={analytics.summary.fertilizerRecommendations} subtitle="Generated recommendations" accent="sky" />
        <MetricCard title="Chat Queries" value={analytics.summary.chatQueries} subtitle="Farmer interactions" accent="amber" />
      </div>

      {/* Weather alerts */}
      {displayAlerts.length ? (
        <section className="card border-l-[3px] border-l-amber-400 p-5">
          <h3 className="font-display text-xl text-slate-900">Weather Alerts</h3>
          <div className="mt-3 space-y-2">
            {displayAlerts.map((alert, idx) => (
              <p key={`${alert.type}-${idx}`} className="stagger-item flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-sm text-amber-800">
                <span>⚠️</span>
                <span>{alert.date}: {alert.message}</span>
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {/* Weather widget */}
      <WeatherWidget weather={weather} />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
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

        <section className="card p-5">
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

      {/* Download */}
      <button className="btn-secondary" onClick={downloadReport} type="button">
        <DownloadIcon />
        Download PDF Report
      </button>
    </div>
  );
};

export default DashboardPage;
