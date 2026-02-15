const WeatherWidget = ({ weather }) => {
  if (!weather) return null;

  return (
    <section className="card overflow-hidden p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Realtime climate feed</p>
          <h2 className="font-display text-2xl font-bold text-slate-900">Live Weather: {weather.current?.region}</h2>
        </div>
        <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
          updated now
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Temperature</p>
          <p className="text-lg font-bold text-slate-900">{weather.current?.tempC} deg C</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Humidity</p>
          <p className="text-lg font-bold text-slate-900">{weather.current?.humidity}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Condition</p>
          <p className="text-lg font-bold text-slate-900">{weather.current?.condition}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Wind</p>
          <p className="text-lg font-bold text-slate-900">{weather.current?.windKph} km/h</p>
        </div>
      </div>

      <div className="mt-5 overflow-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Min Temp</th>
              <th className="px-3 py-2">Max Temp</th>
              <th className="px-3 py-2">Rain (mm)</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {weather.forecast?.length ? (
              weather.forecast.map((day) => (
                <tr key={day.date} className="border-t border-slate-200 text-slate-700">
                  <td className="px-3 py-2">{day.date}</td>
                  <td className="px-3 py-2">{day.minTemp}</td>
                  <td className="px-3 py-2">{day.maxTemp}</td>
                  <td className="px-3 py-2">{day.rainMm}</td>
                  <td className="px-3 py-2">{day.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={5}>Forecast unavailable for this region.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default WeatherWidget;
