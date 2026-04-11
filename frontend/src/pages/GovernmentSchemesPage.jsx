import { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const GovShieldScene = lazy(() => import('../components/3d/GovShieldScene'));

const modeOptions = [
  { value: 'all', label: 'All Modes' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'both', label: 'Online + Offline' }
];

const categoryLabels = {
  income_support: 'Income Support',
  insurance: 'Insurance',
  irrigation: 'Irrigation',
  credit: 'Credit',
  infrastructure: 'Infrastructure',
  organic_farming: 'Organic Farming',
  market_linkage: 'Market Linkage',
  mechanization: 'Mechanization',
  pension: 'Pension',
  fpo_support: 'FPO Support',
  food_processing: 'Food Processing',
  horticulture: 'Horticulture',
  sustainable_farming: 'Sustainable Farming'
};

const formatCategory = (value) => categoryLabels[value] || value?.replaceAll('_', ' ') || 'General';

const GovernmentSchemesPage = () => {
  useDocTitle('Government Schemes');
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 9 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState({
    search: '',
    category: 'all',
    mode: 'all',
    state: user?.region || '',
    page: 1,
    limit: 9
  });

  const fetchSchemes = async (activeQuery) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: activeQuery.page,
        limit: activeQuery.limit
      };

      if (activeQuery.search.trim()) params.search = activeQuery.search.trim();
      if (activeQuery.category !== 'all') params.category = activeQuery.category;
      if (activeQuery.mode !== 'all') params.mode = activeQuery.mode;
      if (activeQuery.state.trim()) params.state = activeQuery.state.trim();

      const { data } = await api.get('/schemes', { params });
      setSchemes(data.schemes || []);
      setMeta(data.meta || { page: 1, totalPages: 1, total: 0, limit: activeQuery.limit });
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load government schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes(query);
  }, [query.page]);

  const handleSearch = (event) => {
    event.preventDefault();
    setQuery((current) => ({ ...current, page: 1 }));
    fetchSchemes({ ...query, page: 1 });
  };

  const handleFilterChange = (field, value) => {
    const next = { ...query, [field]: value, page: 1 };
    setQuery(next);
    fetchSchemes(next);
  };

  const paginationLabel = useMemo(() => {
    if (!meta.total) return 'No schemes found';
    const from = (meta.page - 1) * meta.limit + 1;
    const to = Math.min(meta.page * meta.limit, meta.total);
    return `Showing ${from}-${to} of ${meta.total} schemes`;
  }, [meta]);

  return (
    <div className="space-y-5 animate-fadeIn">
      <section
        className="relative overflow-hidden rounded-[32px]"
        style={{
          background: 'linear-gradient(160deg, #071510 0%, #0a1e14 60%, #0e2818 100%)',
          border: '1px solid rgba(41,160,100,0.2)',
          minHeight: 260,
        }}
      >
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <GovShieldScene className="w-full h-full" />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-end p-6 md:p-8 min-h-[260px]">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 w-fit"
            style={{ background: 'rgba(41,160,100,0.15)', border: '1px solid rgba(41,160,100,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7ad5a0' }}>
              Farmer Support
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Government Schemes
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Discover active agriculture schemes, benefits, eligibility, and official application links.
          </p>

          <form className="mt-4 grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]" onSubmit={handleSearch}>
            <input
              className="input"
              placeholder="Search by scheme, benefit, ministry, or keyword..."
              value={query.search}
              onChange={(event) => setQuery((current) => ({ ...current, search: event.target.value }))}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
            />

            <select className="input" value={query.category} onChange={(event) => handleFilterChange('category', event.target.value)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
              <option value="all">All Categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{formatCategory(item)}</option>
              ))}
            </select>

            <select className="input" value={query.mode} onChange={(event) => handleFilterChange('mode', event.target.value)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
              {modeOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>

            <input
              className="input"
              placeholder="State / Region"
              value={query.state}
              onChange={(event) => setQuery((current) => ({ ...current, state: event.target.value }))}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
            />

            <button className="btn-primary" type="submit">Search</button>
          </form>

          <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{paginationLabel}</p>
        </div>
      </section>

      {loading ? (
        <section className="card p-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-700" />
          <p className="text-slate-700">Loading schemes...</p>
        </section>
      ) : null}

      {error ? <section className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">{error}</section> : null}

      {!loading && !error ? (
        <section className="grid gap-4 md:grid-cols-2">
          {schemes.length ? (
            schemes.map((scheme) => (
              <article key={scheme.schemeCode} className="card p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                      {formatCategory(scheme.category)}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold text-slate-900">{scheme.title}</h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{scheme.schemeCode}</p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
                    {scheme.applicationMode}
                  </span>
                </div>

                <p className="text-sm text-slate-700">{scheme.summary}</p>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ministry</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{scheme.ministry}</p>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Benefits</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-700">
                      {(scheme.benefits || []).slice(0, 3).map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Eligibility</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-700">
                      {(scheme.eligibility || []).slice(0, 3).map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-600">
                    States: <span className="font-semibold text-slate-800">{(scheme.states || []).join(', ')}</span>
                  </p>
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                  >
                    Official Portal
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="card p-6 text-sm text-slate-600">No schemes matched your filters. Try broader search terms.</div>
          )}
        </section>
      ) : null}

      {!loading && !error && meta.totalPages > 1 ? (
        <section className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="btn-secondary disabled:opacity-50"
            disabled={meta.page <= 1}
            onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
          >
            Previous
          </button>
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary disabled:opacity-50"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
          >
            Next
          </button>
        </section>
      ) : null}
    </div>
  );
};

export default GovernmentSchemesPage;
