import { useState } from 'react';

const STATIC_MANDI_DATA = [
  { id: 1, crop: 'Wheat', market: 'Azadpur, Delhi', min: 2150, max: 2400, modal: 2280, date: 'Today', trend: 'up' },
  { id: 2, crop: 'Rice (Paddy)', market: 'Karnal, Haryana', min: 2500, max: 3200, modal: 2850, date: 'Today', trend: 'stable' },
  { id: 3, crop: 'Maize', market: 'Gulabbagh, Bihar', min: 1800, max: 2100, modal: 1950, date: 'Today', trend: 'down' },
  { id: 4, crop: 'Cotton', market: 'Rajkot, Gujarat', min: 6500, max: 7200, modal: 6850, date: 'Yesterday', trend: 'up' },
  { id: 5, crop: 'Sugarcane', market: 'Muzaffarnagar, UP', min: 350, max: 380, modal: 370, date: 'Today', trend: 'stable' },
  { id: 6, crop: 'Soybean', market: 'Indore, MP', min: 4200, max: 4800, modal: 4500, date: 'Yesterday', trend: 'down' },
  { id: 7, crop: 'Onion', market: 'Lasalgaon, Maharashtra', min: 1200, max: 2500, modal: 1800, date: 'Today', trend: 'up' },
  { id: 8, crop: 'Potato', market: 'Agra, UP', min: 800, max: 1300, modal: 1050, date: 'Today', trend: 'up' },
  { id: 9, crop: 'Tomato', market: 'Kolar, Karnataka', min: 1500, max: 2800, modal: 2100, date: 'Today', trend: 'stable' },
  { id: 10, crop: 'Groundnut', market: 'Bikaner, Rajasthan', min: 5800, max: 6400, modal: 6100, date: 'Yesterday', trend: 'up' },
];

const MandiPricesPage = () => {
  const [search, setSearch] = useState('');
  
  const filteredData = STATIC_MANDI_DATA.filter(item => 
    item.crop.toLowerCase().includes(search.toLowerCase()) || 
    item.market.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      <div className="mb-8">
        <p className="section-label">Market Intelligence</p>
        <h1 className="font-display text-4xl text-slate-900 mt-1">Daily Mandi Prices</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Get the latest wholesale commodity prices across major Indian markets to negotiate better rates for your harvest. Prices are shown in ₹ per Quintal (100 kg).
        </p>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <input 
            className="input max-w-md" 
            placeholder="Search crop or market name (e.g., Wheat, Delhi)..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            Data sourced from Agmarknet
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-3 font-semibold rounded-tl-xl">Commodity</th>
                <th className="p-3 font-semibold">Market Center</th>
                <th className="p-3 font-semibold text-right">Min Price (₹)</th>
                <th className="p-3 font-semibold text-right">Max Price (₹)</th>
                <th className="p-3 font-semibold text-right">Modal Price (₹)</th>
                <th className="p-3 font-semibold rounded-tr-xl flex justify-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No market data found for your search.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{item.crop}</td>
                    <td className="p-3 text-slate-600">{item.market}</td>
                    <td className="p-3 text-right text-slate-600">{item.min}</td>
                    <td className="p-3 text-right text-slate-600">{item.max}</td>
                    <td className="p-3 text-right font-bold text-brand-700">{item.modal}</td>
                    <td className="p-3 flex justify-center">
                      {item.trend === 'up' && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">↑</span>}
                      {item.trend === 'down' && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">↓</span>}
                      {item.trend === 'stable' && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">-</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MandiPricesPage;
