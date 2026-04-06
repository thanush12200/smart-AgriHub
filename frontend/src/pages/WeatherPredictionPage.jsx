import { useEffect, useMemo, useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useSocketAlerts } from '../hooks/useSocket';

const scoreRisk = (forecast) => {
  if (!forecast.length) return { heat: 'low', rain: 'low', frost: 'low' };

  const maxTemp = Math.max(...forecast.map((day) => Number(day.maxTemp || 0)));
  const maxRain = Math.max(...forecast.map((day) => Number(day.rainMm || 0)));
  const minTemp = Math.min(...forecast.map((day) => Number(day.minTemp || 0)));

  const heat = maxTemp >= 38 ? 'high' : maxTemp >= 34 ? 'medium' : 'low';
  const rain = maxRain >= 40 ? 'high' : maxRain >= 20 ? 'medium' : 'low';
  const frost = minTemp <= 4 ? 'high' : minTemp <= 8 ? 'medium' : 'low';

  return { heat, rain, frost };
};

const badgeClass = {
  low: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  medium: 'border-amber-300 bg-amber-50 text-amber-800',
  high: 'border-red-300 bg-red-50 text-red-800'
};

const WeatherPredictionPage = () => {
  useDocTitle('Weather Prediction');
  const { user } = useAuth();
  const [region, setRegion] = useState(user?.region || 'Karnataka');
  const [query, setQuery] = useState(user?.region || 'Karnataka');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const liveAlerts = useSocketAlerts(region);

  const loadWeather = async (selectedRegion) => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/weather/current', { params: { region: selectedRegion } });
      setWeather(data);
      setRegion(selectedRegion);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather prediction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(region);

    const interval = setInterval(() => {
      loadWeather(region);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const forecastChartData = useMemo(() => {
    if (!weather?.forecast?.length) return [];
    return weather.forecast.map((day) => ({
      date: day.date,
      maxTemp: Number(day.maxTemp),
      minTemp: Number(day.minTemp),
      rainMm: Number(day.rainMm || 0)
    }));
  }, [weather]);

  const risks = useMemo(() => scoreRisk(weather?.forecast || []), [weather]);
  const mergedAlerts = liveAlerts.length ? liveAlerts : weather?.alerts || [];

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    loadWeather(query.trim());
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <section className="page-hero">
        <p className="page-kicker text-sky-700">Prediction Input</p>
        <h2 className="page-title">Weather Prediction System</h2>
        <p className="page-copy">Get current weather, a 7-day forecast trend, and farming risk indicators by region.</p>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]" onSubmit={handleSearch}>
          <input
            className="input"
            placeholder="Enter region, city, or district"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-primary" type="submit">Predict</button>
          <button className="btn-secondary" type="button" onClick={() => loadWeather(region)}>Refresh</button>
        </form>
      </section>

      {loading ? (
        <section className="card p-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-sky-500/30 border-t-sky-700" />
          <p className="text-slate-700">Loading weather prediction...</p>
        </section>
      ) : null}

      {error ? <section className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</section> : null}

      {!loading && weather ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="card p-4">
              <p className="text-xs text-slate-500">Region</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{weather.current?.region}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500">Current Temp</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{weather.current?.tempC} deg C</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{weather.current?.humidity}%</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500">Condition</p>
              <p className="mt-1 text-xl font-bold capitalize text-slate-900">{weather.current?.condition}</p>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="card p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Heat Risk</p>
              <span className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-black uppercase ${badgeClass[risks.heat]}`}>{risks.heat}</span>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Heavy Rain Risk</p>
              <span className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-black uppercase ${badgeClass[risks.rain]}`}>{risks.rain}</span>
            </div>
            <div className="card p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Frost Risk</p>
              <span className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-black uppercase ${badgeClass[risks.frost]}`}>{risks.frost}</span>
            </div>
          </section>

          {mergedAlerts.length ? (
            <section className="card p-5">
              <h3 className="font-display text-xl font-bold text-slate-900">Live Weather Alerts</h3>
              <div className="mt-2 space-y-2">
                {mergedAlerts.map((alert, idx) => (
                  <p key={`${alert.type}-${idx}`} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {alert.date || 'Today'}: {alert.message}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <section className="card p-5 md:p-6">
            <h3 className="font-display text-xl font-bold text-slate-900">7-Day Forecast Trend</h3>
            <p className="mb-3 text-sm text-slate-500">Temperature envelope and rainfall intensity</p>
            <div className="h-80">
              <ResponsiveContainer>
                <AreaChart data={forecastChartData}>
                  <defs>
                    <linearGradient id="maxTempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Area type="monotone" dataKey="maxTemp" stroke="#ea580c" fill="url(#maxTempGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="rainMm" stroke="#0284c7" fill="url(#rainGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <h3 className="font-display text-xl font-bold text-slate-900">Day-wise Prediction Table</h3>
            <div className="mt-3 overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Min Temp</th>
                    <th className="px-3 py-2">Max Temp</th>
                    <th className="px-3 py-2">Humidity</th>
                    <th className="px-3 py-2">Rain (mm)</th>
                    <th className="px-3 py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {weather.forecast?.length ? (
                    weather.forecast.map((day) => (
                      <tr className="border-t border-slate-200 text-slate-700" key={day.date}>
                        <td className="px-3 py-2">{day.date}</td>
                        <td className="px-3 py-2">{day.minTemp}</td>
                        <td className="px-3 py-2">{day.maxTemp}</td>
                        <td className="px-3 py-2">{day.humidity}%</td>
                        <td className="px-3 py-2">{day.rainMm}</td>
                        <td className="px-3 py-2 capitalize">{day.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-3 text-slate-500" colSpan={6}>No forecast data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default WeatherPredictionPage;
