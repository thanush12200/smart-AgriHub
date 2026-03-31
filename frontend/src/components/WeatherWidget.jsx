const conditionEmoji = (condition) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('clear') || c.includes('sun')) return '☀️';
  if (c.includes('cloud')) return '☁️';
  if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫️';
  return '🌤️';
};

const WeatherWidget = ({ weather }) => {
  if (!weather) return null;

  const emoji = conditionEmoji(weather.current?.condition);

  return (
    <section className="card overflow-hidden">
      {/* Header with hero temperature */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-surface-200 p-5 md:p-6">
        <div>
          <p className="section-label">Live Weather</p>
          <h2 className="section-title mt-1">{weather.current?.region}</h2>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl">{emoji}</span>
          <span className="font-display text-5xl text-slate-900">{weather.current?.tempC}°</span>
          <span className="text-sm text-slate-400">C</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-surface-200 border-b border-surface-200">
        <div className="px-5 py-4">
          <p className="text-xs text-slate-400">Humidity</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">{weather.current?.humidity}%</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-slate-400">Condition</p>
          <p className="mt-1 text-lg font-semibold capitalize text-slate-800">{weather.current?.condition}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-slate-400">Wind</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">{weather.current?.windKph} km/h</p>
        </div>
      </div>

      {/* Forecast table */}
      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-200 text-xs text-slate-400">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Min</th>
              <th className="px-5 py-3 font-medium">Max</th>
              <th className="px-5 py-3 font-medium">Rain</th>
              <th className="px-5 py-3 font-medium">Condition</th>
            </tr>
          </thead>
          <tbody>
            {weather.forecast?.length ? (
              weather.forecast.map((day, idx) => (
                <tr
                  key={day.date}
                  className={`border-b border-surface-100 text-slate-700 ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-50'}`}
                >
                  <td className="px-5 py-3 font-medium">{day.date}</td>
                  <td className="px-5 py-3">{day.minTemp}°</td>
                  <td className="px-5 py-3">{day.maxTemp}°</td>
                  <td className="px-5 py-3">{day.rainMm} mm</td>
                  <td className="px-5 py-3 capitalize">{day.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-4 text-slate-400" colSpan={5}>Forecast unavailable for this region.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default WeatherWidget;
