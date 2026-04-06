import { useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';

const STATIC_CALENDAR_DATA = [
  { id: 1, crop: 'Wheat', type: 'Rabi', region: 'North', sow: [10, 11], harvest: [3, 4] },
  { id: 2, crop: 'Rice (Kharif)', type: 'Kharif', region: 'All', sow: [5, 6, 7], harvest: [9, 10, 11] },
  { id: 3, crop: 'Maize', type: 'Kharif', region: 'All', sow: [5, 6, 7], harvest: [8, 9, 10] },
  { id: 4, crop: 'Cotton', type: 'Kharif', region: 'Central/South', sow: [4, 5, 6], harvest: [9, 10, 11, 12] },
  { id: 5, crop: 'Mustard', type: 'Rabi', region: 'North/Central', sow: [9, 10], harvest: [2, 3] },
  { id: 6, crop: 'Groundnut', type: 'Kharif', region: 'West/South', sow: [5, 6, 7], harvest: [9, 10, 11] },
  { id: 7, crop: 'Sugarcane', type: 'Annual', region: 'All', sow: [1, 2, 3, 9, 10], harvest: [11, 12, 1, 2, 3] },
  { id: 8, crop: 'Chickpea (Gram)', type: 'Rabi', region: 'Central/North', sow: [9, 10, 11], harvest: [2, 3, 4] },
  { id: 9, crop: 'Soybean', type: 'Kharif', region: 'Central', sow: [5, 6, 7], harvest: [9, 10] },
  { id: 10, crop: 'Jowar', type: 'Kharif/Rabi', region: 'Central/South', sow: [6, 7, 9, 10], harvest: [10, 11, 1, 2] },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CropCalendarPage = () => {
  useDocTitle('Crop Calendar');
  const [regionFilter, setRegionFilter] = useState('All');
  const [seasonFilter, setSeasonFilter] = useState('All');

  const filteredData = STATIC_CALENDAR_DATA.filter(item => {
    if (regionFilter !== 'All' && item.region !== 'All' && !item.region.includes(regionFilter)) return false;
    if (seasonFilter !== 'All' && !item.type.includes(seasonFilter)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fadeIn">
      <section className="page-hero mb-8">
        <p className="page-kicker">Planning Guide</p>
        <h1 className="page-title">Sowing & Harvest Calendar</h1>
        <p className="page-copy max-w-3xl">
          Reference guide for planning agricultural activities. Shows approximate sowing and harvesting months for major Indian crops by region and season.
        </p>
        <p className="mt-1 text-xs text-slate-400">Timings are indicative and may vary based on local conditions.</p>
      </section>

      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select className="input w-48" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
             <option value="All">All Regions</option>
             <option value="North">North India</option>
             <option value="Central">Central India</option>
             <option value="South">South India</option>
             <option value="West">West India</option>
          </select>

          <select className="input w-48" value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
             <option value="All">All Seasons</option>
             <option value="Kharif">Kharif (Monsoon)</option>
             <option value="Rabi">Rabi (Winter)</option>
             <option value="Annual">Annual / Zaid</option>
          </select>

          <div className="ml-auto flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-400"></span> Sowing</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-amber-400"></span> Harvest</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-3 font-semibold w-48 rounded-tl-xl sticky left-0 bg-surface-50 z-10">Crop Details</th>
                {MONTHS.map(m => <th key={m} className="p-3 font-semibold text-center w-12">{m}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="13" className="p-8 text-center text-slate-500">No crops found for these filters.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 bg-white sticky left-0 z-10">
                      <p className="font-bold text-slate-900">{item.crop}</p>
                      <p className="text-[10px] uppercase font-semibold text-slate-500">{item.type} • {item.region}</p>
                    </td>
                    {MONTHS.map((m, idx) => {
                      const monthNum = idx + 1;
                      const isSow = item.sow.includes(monthNum);
                      const isHarvest = item.harvest.includes(monthNum);
                      
                      let bgClass = "bg-transparent";
                      if (isSow && isHarvest) bgClass = "bg-gradient-to-r from-emerald-400 to-amber-400 opacity-80";
                      else if (isSow) bgClass = "bg-emerald-400 opacity-80";
                      else if (isHarvest) bgClass = "bg-amber-400 opacity-80";
                      
                      return (
                        <td key={m} className="p-1 border-l border-slate-50">
                          <div className={`h-8 w-full rounded pl-0.5 ${bgClass}`}></div>
                        </td>
                      );
                    })}
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

export default CropCalendarPage;
