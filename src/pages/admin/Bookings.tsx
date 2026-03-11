import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrips, getUsers, getBookings, saveBookings, getBusUnits } from '../../data/mockData';
import { Trip, User, Booking, BusUnit, TripType } from '../../types';
import { getDirectionLabel } from '../../data/schedules';
import { multiRoutes, getMultiRouteById } from '../../data/multiRoutes';

function SeatPicker({
  totalSeats,
  occupiedSeats,
  selectedSeat,
  onSelect,
}: {
  totalSeats: number;
  occupiedSeats: number[];
  selectedSeat: number | null;
  onSelect: (seat: number) => void;
}) {
  const cols = 4;
  const rows = Math.ceil(totalSeats / cols);

  return (
    <div className="mt-1 mb-2">
      <p className="text-xs font-semibold text-foreground mb-2">Pilih Kursi:</p>
      <div className="flex gap-3 mb-3 justify-center">
        {[
          { color: 'bg-muted border-border', label: 'Tersedia' },
          { color: 'bg-primary border-primary', label: 'Dipilih' },
          { color: 'bg-destructive/20 border-destructive/30', label: 'Terisi' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-md border ${l.color}`} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center mb-2">
        <div className="bg-muted text-muted-foreground text-[10px] font-semibold px-4 py-1 rounded-t-xl border border-b-0 border-border">
          🚌 Depan Bus
        </div>
      </div>
      <div className="bg-muted/30 border border-border rounded-xl p-3">
        <div className="space-y-1.5">
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="flex items-center justify-center gap-1">
              {Array.from({ length: cols }, (_, col) => {
                const seatNum = row * cols + col + 1;
                if (seatNum > totalSeats) return <div key={col} className="w-9 h-9" />;
                const isOccupied = occupiedSeats.includes(seatNum);
                const isSelected = selectedSeat === seatNum;
                const isAisle = col === 1;

                return (
                  <div key={col} className={`flex items-center ${isAisle ? 'mr-3' : ''}`}>
                    <button
                      type="button"
                      disabled={isOccupied}
                      onClick={() => onSelect(seatNum)}
                      className={`w-9 h-9 rounded-lg text-[11px] font-bold border-2 transition-all flex items-center justify-center ${
                        isOccupied
                          ? 'bg-destructive/15 border-destructive/30 text-destructive/50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-md'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {isOccupied ? '✕' : seatNum}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const { user: staffUser } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busUnits, setBusUnits] = useState<BusUnit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [tripType, setTripType] = useState<TripType>('single');
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedMultiRoute, setSelectedMultiRoute] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => {
    setTrips(getTrips());
    setStudents(getUsers().filter(u => u.role === 'student'));
    setBookings(getBookings());
    setBusUnits(getBusUnits());
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const getBusUnit = (id?: string) => busUnits.find(b => b.id === id);

  const resetForm = () => {
    setShowForm(true);
    setSelectedStudent('');
    setTripType('single');
    setSelectedTrip('');
    setSelectedSeat(null);
    setSelectedMultiRoute('');
  };

  const selectedTripObj = trips.find(t => t.id === selectedTrip);
  const tripBusUnit = selectedTripObj ? getBusUnit(selectedTripObj.bus_unit_id) : undefined;
  const capacity = tripBusUnit?.seat_capacity || 20;
  const occupiedSeats = bookings
    .filter(b => b.trip_id === selectedTrip && b.status !== 'cancelled')
    .map(b => b.seat_number);

  const canSubmit = selectedStudent && selectedTrip && selectedSeat !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const existing = bookings.find(b => b.user_id === selectedStudent && b.trip_id === selectedTrip && b.status !== 'cancelled');
    if (existing) {
      showToast('❌ Mahasiswa sudah memiliki tiket untuk trip ini');
      return;
    }

    if (occupiedSeats.length >= capacity) {
      showToast('❌ Kursi penuh!');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      user_id: selectedStudent,
      trip_id: selectedTrip,
      seat_number: selectedSeat!,
      status: 'booked',
      created_at: new Date().toISOString(),
      booked_by: staffUser!.id,
      trip_type: tripType,
      multi_route_id: tripType === 'multi' ? selectedMultiRoute : undefined,
    };

    const allBookings = getBookings();
    saveBookings([...allBookings, newBooking]);
    setLoading(false);
    setShowForm(false);
    load();
    showToast('✅ Tiket berhasil dipesan!');
  };

  const handleCancelBooking = (bookingId: string) => {
    const allBookings = getBookings();
    const updated = allBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
    saveBookings(updated);
    load();
    showToast('Tiket dibatalkan');
  };

  const activeBookings = bookings.filter(b => b.status !== 'cancelled');

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pemesanan Tiket</h1>
          <p className="text-sm text-muted-foreground">{activeBookings.length} tiket aktif</p>
        </div>
        <button onClick={resetForm} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Pesan Tiket
        </button>
      </div>

      {/* Active Bookings */}
      <div className="space-y-2">
        {activeBookings.map(b => {
          const student = students.find(u => u.id === b.user_id) || getUsers().find(u => u.id === b.user_id);
          const trip = trips.find(t => t.id === b.trip_id);
          const bUnit = trip ? getBusUnit(trip.bus_unit_id) : undefined;
          const multiRoute = b.multi_route_id ? getMultiRouteById(b.multi_route_id) : undefined;

          return (
            <div key={b.id} className="card-binus">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                  {student?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{student?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {student?.nim} · {trip?.departure_time} · {trip ? getDirectionLabel(trip.direction) : '—'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] bg-primary/8 text-primary px-1.5 py-0.5 rounded-md font-semibold">Kursi #{b.seat_number}</span>
                    {bUnit && <span className="text-[10px] text-muted-foreground">🚌 {bUnit.plate_number}</span>}
                    {b.trip_type === 'multi' && multiRoute && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        🔄 {multiRoute.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                    b.status === 'booked' ? 'bg-primary/10 text-primary border-primary/20' :
                    b.status === 'checked_in' ? 'bg-success/10 text-success border-success/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {b.status === 'booked' ? 'Dipesan' : b.status === 'checked_in' ? 'Check-in' : 'Selesai'}
                  </span>
                  {b.status === 'booked' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-[10px] text-destructive font-semibold hover:underline"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {activeBookings.length === 0 && (
          <div className="card-binus text-center py-8 text-muted-foreground text-sm">
            Belum ada pemesanan
          </div>
        )}
      </div>

      {/* Booking Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-5 w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-foreground text-lg mb-4">Pesan Tiket untuk Mahasiswa</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Pilih Mahasiswa</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="input-binus">
                  <option value="">— Pilih Mahasiswa —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nim})</option>
                  ))}
                </select>
              </div>

              {/* Trip Type Toggle */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">Jenis Perjalanan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setTripType('single'); setSelectedMultiRoute(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      tripType === 'single'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    🎫 Single Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('multi')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      tripType === 'multi'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-card text-muted-foreground hover:border-accent/30'
                    }`}
                  >
                    🔄 Multi Trip
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {tripType === 'single'
                    ? 'Satu perjalanan langsung tanpa transit'
                    : 'Perjalanan dengan transit ke beberapa pemberhentian'}
                </p>
              </div>

              {/* Trip & Seat Selection */}
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  {tripType === 'multi' ? 'Pilih Jadwal Keberangkatan' : 'Pilih Trip'}
                </label>
                <select
                  value={selectedTrip}
                  onChange={e => { setSelectedTrip(e.target.value); setSelectedSeat(null); }}
                  className="input-binus"
                >
                  <option value="">— {tripType === 'multi' ? 'Pilih Jadwal' : 'Pilih Trip'} —</option>
                  {trips
                    .filter(t => t.status !== 'completed')
                    .filter(t => tripType === 'single' ? !t.via_binus_square : t.via_binus_square)
                    .map(t => {
                      const bUnit = getBusUnit(t.bus_unit_id);
                      const booked = bookings.filter(b => b.trip_id === t.id && b.status !== 'cancelled').length;
                      const cap = bUnit?.seat_capacity || 20;
                      return (
                        <option key={t.id} value={t.id} disabled={booked >= cap}>
                          {t.departure_time} · {getDirectionLabel(t.direction)} ({booked}/{cap} kursi)
                          {t.via_binus_square ? ' · via BS' : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              {selectedTrip && selectedTripObj && (
                <>
                  <div className="bg-muted rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Rute</span>
                      <span className="font-semibold text-foreground">{getDirectionLabel(selectedTripObj.direction)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Jam</span>
                      <span className="font-black text-primary">{selectedTripObj.departure_time}</span>
                    </div>
                    {tripBusUnit && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Bus</span>
                        <span className="font-semibold text-foreground">{tripBusUnit.plate_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Kursi Tersedia</span>
                      <span className="font-semibold text-foreground">{capacity - occupiedSeats.length}/{capacity}</span>
                    </div>
                  </div>

                  <SeatPicker
                    totalSeats={capacity}
                    occupiedSeats={occupiedSeats}
                    selectedSeat={selectedSeat}
                    onSelect={setSelectedSeat}
                  />

                  {selectedSeat && (
                    <div className="bg-success/10 border border-success/30 rounded-xl px-3 py-2 text-center">
                      <p className="text-success font-bold text-sm">💺 Kursi #{selectedSeat} dipilih</p>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !canSubmit}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    !canSubmit
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : '🎫'} Pesan Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
