import { useEffect, useState } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';

const JournalPage = () => {
  useDocTitle('Farm Journal');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    activityType: 'sowing',
    cropName: '',
    notes: ''
  });

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/journal', { params: { type: filter, search } });
      setEntries(data.entries);
    } catch (err) {
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(fetchEntries, 300);
    return () => clearTimeout(handle);
  }, [filter, search]);

  const openForm = (entry = null) => {
    if (entry) {
      setEditingId(entry._id);
      setForm({
        title: entry.title,
        date: new Date(entry.date).toISOString().split('T')[0],
        activityType: entry.activityType,
        cropName: entry.cropName || '',
        notes: entry.notes || ''
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        activityType: 'sowing',
        cropName: '',
        notes: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingId) {
        await api.patch(`/journal/${editingId}`, form);
      } else {
        await api.post('/journal', form);
      }
      setModalOpen(false);
      fetchEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await api.delete(`/journal/${id}`);
      fetchEntries();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const activityColors = {
    sowing: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    irrigation: 'bg-blue-100 text-blue-800 border-blue-200',
    pesticide: 'bg-red-100 text-red-800 border-red-200',
    fertilizer: 'bg-amber-100 text-amber-800 border-amber-200',
    harvest: 'bg-purple-100 text-purple-800 border-purple-200',
    other: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Farm Journal</h1>
          <p className="mt-1 text-sm text-slate-500">Record your field activities and track crop progress.</p>
        </div>
        <button className="btn-primary" onClick={() => openForm()}>+ New Entry</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <input 
          className="input" 
          placeholder="Search notes, crop..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
        <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Activities</option>
          <option value="sowing">Sowing</option>
          <option value="irrigation">Irrigation</option>
          <option value="fertilizer">Fertilizer</option>
          <option value="pesticide">Pesticide</option>
          <option value="harvest">Harvest</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && <div className="p-4 text-red-600 bg-red-50 rounded-xl">{error}</div>}

      {loading ? (
        <div className="card p-12 text-center text-slate-500">Loading journal...</div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <p>No journal entries found. Start documenting your farm activities.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
          {entries.map(entry => (
            <div key={entry._id} className="relative pl-6 sm:pl-8 group">
              {/* Timeline dot */}
              <div className="absolute left-[-9px] top-1.5 h-4 w-4 rounded-full border-4 border-surface-50 bg-brand-500 shadow" />
              
              <div className="card p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${activityColors[entry.activityType]}`}>
                        {entry.activityType}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{entry.title}</h3>
                    {entry.cropName && <p className="text-xs font-semibold text-brand-600 mt-0.5">Crop: {entry.cropName}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs text-brand-600 hover:text-brand-800 font-semibold" onClick={() => openForm(entry)}>Edit</button>
                    <button className="text-xs text-red-600 hover:text-red-800 font-semibold" onClick={() => handleDelete(entry._id)}>Delete</button>
                  </div>
                </div>
                
                {entry.notes && (
                  <div className="mt-3 text-sm text-slate-600 border-l-2 border-slate-200 pl-3">
                    {entry.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-slideUp">
            <h3 className="font-display text-xl text-slate-900 mb-4">{editingId ? 'Edit Entry' : 'New Journal Entry'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="field-label">Title</label>
                <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="E.g., Added NPK 10-26-26" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Date</label>
                  <input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div>
                  <label className="field-label">Activity</label>
                  <select className="input" value={form.activityType} onChange={e => setForm({...form, activityType: e.target.value})}>
                    <option value="sowing">Sowing</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="pesticide">Pesticide</option>
                    <option value="harvest">Harvest</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Crop Name (Optional)</label>
                <input className="input" value={form.cropName} onChange={e => setForm({...form, cropName: e.target.value})} placeholder="E.g., Wheat" />
              </div>
              <div>
                <label className="field-label">Notes</label>
                <textarea className="input min-h-[100px]" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Observations, quantities used, weather condition..."></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
