import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axiosClient';
import MetricCard from '../components/MetricCard';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';
import { useSocketAlerts } from '../hooks/useSocket';

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
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-600" />
        <p className="font-semibold text-slate-700">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return <p className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</p>;
  }

  const displayAlerts = alerts.length ? alerts : analytics.alerts;

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Crop Predictions" value={analytics.summary.cropPredictions} subtitle="Total prediction runs" accent="emerald" />
        <MetricCard title="Fertilizer Advice" value={analytics.summary.fertilizerRecommendations} subtitle="Generated recommendations" accent="sky" />
        <MetricCard title="Chat Queries" value={analytics.summary.chatQueries} subtitle="Farmer interactions" accent="amber" />
      </div>

      {displayAlerts.length ? (
        <section className="card border-l-4 border-l-amber-400 p-5">
          <h3 className="font-display text-xl font-bold text-slate-900">Active Weather Alerts</h3>
          <div className="mt-2 space-y-2">
            {displayAlerts.map((alert, idx) => (
              <p key={`${alert.type}-${idx}`} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {alert.date}: {alert.message}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <WeatherWidget weather={weather} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="font-display text-xl font-bold text-slate-900">Crop Yield Trend (Confidence)</h3>
          <p className="mb-3 text-sm text-slate-500">Recent prediction confidence trajectory</p>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={analytics.cropYieldTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="confidence" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="font-display text-xl font-bold text-slate-900">Soil Health (NPK)</h3>
          <p className="mb-3 text-sm text-slate-500">Nutrient profile from latest advisory cycle</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={analytics.soilHealth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="metric" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="value" fill="#0369a1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <button className="btn-primary" onClick={downloadReport} type="button">Download PDF Report</button>
    </div>
  );
};

export default DashboardPage;
