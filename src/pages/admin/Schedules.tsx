import { useState, useEffect } from 'react';
import { getTrips, saveTrips } from '../../data/mockData';
import { Trip, DayType, RouteDirection } from '../../types';
import { getDirectionLabel, getDayTypeLabel } from '../../data/schedules';

const emptyForm = {
  route_from: 'Kampus Anggrek',
  route_to: 'Main Campus Alam Sutera',
  direction: 'anggrek_to_as' as RouteDirection,
  departure_time: '',
  day_type: 'senin_kamis' as DayType,
  via_base: false,
  seat_capacity: 20,
  status: 'waiting' as const,
};

export default function AdminSchedules() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterDay, setFilterDay] = useState<DayType | 'all'>('all');
  const [toast, setToast] = useState('');

  const load = () => setTrips(getTrips());
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = getTrips();
    if (editId) {
      const updated = all.map(t => t.id === editId ? { ...t, ...form } : t);
      saveTrips(updated);
      showToast('✅ Jadwal diperbarui');
    } else {
      const newTrip: Trip = {
        ...form,
        id: `custom-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        driver_id: undefined,
      };
      saveTrips([...all, newTrip]);
      showToast('✅ Jadwal ditambahkan');
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditId(null);
    load();
  };

  const handleEdit = (trip: Trip) => {
    setForm({
      route_from: trip.route_from,
      route_to: trip.route_to,
      direction: trip.direction,
      departure_time: trip.departure_time,
      day_type: trip.day_type,
      via_base: trip.via_base,
      seat_capacity: trip.seat_capacity,
      status: trip.status as any,
    });
    setEditId(trip.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = getTrips().filter(t => t.id !== id);
    saveTrips(updated);
    setDeleteConfirm(null);
    load();
    showToast('Jadwal dihapus');
  };

  const filtered = filterDay === 'all' ? trips : trips.filter(t => t.day_type === filterDay);
  const dayTypes: DayType[] = ['senin_kamis', 'jumat', 'sabtu'];

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Manajemen Jadwal</h1>
          <p className="text-sm text-muted-foreground">{trips.length} total jadwal</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFilterDay('all')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterDay === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Semua</button>
        {dayTypes.map(dt => (
          <button key={dt} onClick={() => setFilterDay(dt)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterDay === dt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {getDayTypeLabel(dt)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(trip => (
          <div key={trip.id} className="card-binus flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl px-3 py-2 text-center min-w-[60px]">
              <span className="font-black text-primary text-sm">{trip.departure_time}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{getDirectionLabel(trip.direction)}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{getDayTypeLabel(trip.day_type)}</span>
                <span className="text-xs text-muted-foreground">· {trip.seat_capacity} kursi</span>
                {trip.via_base && <span className="text-xs text-accent font-semibold">via Binus Square</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(trip)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => setDeleteConfirm(trip.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-5 w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-foreground text-lg mb-4">{editId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Rute</label>
                <select value={form.direction} onChange={e => {
                  const dir = e.target.value as RouteDirection;
                  setForm(f => ({
                    ...f, direction: dir,
                    route_from: dir === 'anggrek_to_as' ? 'Kampus Anggrek' : 'Main Campus Alam Sutera',
                    route_to: dir === 'anggrek_to_as' ? 'Main Campus Alam Sutera' : 'Kampus Anggrek',
                  }));
                }} className="input-binus">
                  <option value="anggrek_to_as">Anggrek → Alam Sutera</option>
                  <option value="as_to_anggrek">Alam Sutera → Anggrek</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Jam Keberangkatan</label>
                <input type="time" value={form.departure_time} onChange={e => setForm(f => ({ ...f, departure_time: e.target.value }))} required className="input-binus" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Hari</label>
                <select value={form.day_type} onChange={e => setForm(f => ({ ...f, day_type: e.target.value as DayType }))} className="input-binus">
                  <option value="senin_kamis">Senin – Kamis</option>
                  <option value="jumat">Jumat</option>
                  <option value="sabtu">Sabtu</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Kapasitas Kursi</label>
                <input type="number" min={1} max={60} value={form.seat_capacity} onChange={e => setForm(f => ({ ...f, seat_capacity: +e.target.value }))} required className="input-binus" />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="via_base" checked={form.via_base} onChange={e => setForm(f => ({ ...f, via_base: e.target.checked }))} className="w-4 h-4 rounded" />
                <label htmlFor="via_base" className="text-sm font-medium text-foreground">Melewati Binus Square</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold">Batal</button>
                <button type="submit" className="flex-1 btn-primary py-2.5">{editId ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-bold text-foreground text-lg mb-2">Hapus Jadwal?</h3>
            <p className="text-muted-foreground text-sm mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
