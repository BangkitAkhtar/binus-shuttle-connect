import { useState, useEffect } from 'react';
import { getUsers, getTrips, saveUsers } from '../../data/mockData';
import { User, Trip } from '../../types';
import { getDirectionLabel } from '../../data/schedules';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', driver_id: '', assigned_trip_id: '' });
  const [toast, setToast] = useState('');

  const load = () => {
    setDrivers(getUsers().filter(u => u.role === 'driver'));
    setTrips(getTrips());
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = getUsers();
    if (editId) {
      const updated = all.map(u => u.id === editId ? { ...u, name: form.name, driver_id: form.driver_id, assigned_trip_id: form.assigned_trip_id || undefined } : u);
      // Update trip driver assignments
      const allTrips = getTrips();
      const updatedTrips = allTrips.map(t => {
        if (t.id === form.assigned_trip_id) return { ...t, driver_id: editId };
        if (t.driver_id === editId && t.id !== form.assigned_trip_id) return { ...t, driver_id: undefined };
        return t;
      });
      require('../../data/mockData').saveTrips(updatedTrips);
      saveUsers(updated);
      showToast('✅ Data driver diperbarui');
    } else {
      const newUser: User = { id: `d-${Date.now()}`, role: 'driver', name: form.name, driver_id: form.driver_id, assigned_trip_id: form.assigned_trip_id || undefined };
      saveUsers([...all, newUser]);
      showToast('✅ Driver ditambahkan');
    }
    setForm({ name: '', driver_id: '', assigned_trip_id: '' });
    setShowForm(false);
    setEditId(null);
    load();
  };

  const handleEdit = (u: User) => {
    setForm({ name: u.name, driver_id: u.driver_id || '', assigned_trip_id: u.assigned_trip_id || '' });
    setEditId(u.id);
    setShowForm(true);
  };

  const getAssignedTrip = (tripId?: string) => tripId ? trips.find(t => t.id === tripId) : undefined;

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manajemen Driver</h1>
          <p className="text-sm text-muted-foreground">{drivers.length} driver terdaftar</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', driver_id: '', assigned_trip_id: '' }); }} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah
        </button>
      </div>

      <div className="space-y-3">
        {drivers.map(driver => {
          const assignedTrip = getAssignedTrip(driver.assigned_trip_id);
          return (
            <div key={driver.id} className="card-binus">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-black text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
                  {driver.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{driver.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {driver.driver_id}</p>
                </div>
                <button onClick={() => handleEdit(driver)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              {assignedTrip ? (
                <div className="bg-primary/8 rounded-xl p-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <div>
                    <p className="text-xs text-primary font-semibold">Trip Ditugaskan</p>
                    <p className="text-xs text-muted-foreground">{assignedTrip.departure_time} · {getDirectionLabel(assignedTrip.direction)}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Belum ada trip yang ditugaskan</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-5 w-full max-w-md animate-slide-up">
            <h3 className="font-bold text-foreground text-lg mb-4">{editId ? 'Edit Driver' : 'Tambah Driver'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Nama Driver</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" className="input-binus" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Driver ID</label>
                <input required value={form.driver_id} onChange={e => setForm(f => ({ ...f, driver_id: e.target.value }))} placeholder="Contoh: DRV003" className="input-binus" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Tugaskan ke Trip (Opsional)</label>
                <select value={form.assigned_trip_id} onChange={e => setForm(f => ({ ...f, assigned_trip_id: e.target.value }))} className="input-binus">
                  <option value="">— Tidak ada —</option>
                  {trips.filter(t => t.status !== 'completed').map(t => (
                    <option key={t.id} value={t.id}>{t.departure_time} · {getDirectionLabel(t.direction)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold">Batal</button>
                <button type="submit" className="flex-1 btn-primary py-2.5">{editId ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
