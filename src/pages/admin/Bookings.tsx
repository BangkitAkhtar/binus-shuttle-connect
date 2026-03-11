import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrips, getUsers, getBookings, saveBookings, getBusUnits } from '../../data/mockData';
import { Trip, User, Booking, BusUnit, TripType } from '../../types';
import { getDirectionLabel } from '../../data/schedules';

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

interface TripLeg {
  tripId: string;
  seatNumber: number | null;
}

function TripLegForm({
  legIndex,
  leg,
  trips,
  bookings,
  busUnits,
  onUpdate,
  onRemove,
  canRemove,
}: {
  legIndex: number;
  leg: TripLeg;
  trips: Trip[];
  bookings: Booking[];
  busUnits: BusUnit[];
  onUpdate: (leg: TripLeg) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const getBusUnit = (id?: string) => busUnits.find(b => b.id === id);
  const selectedTripObj = trips.find(t => t.id === leg.tripId);
  const tripBusUnit = selectedTripObj ? getBusUnit(selectedTripObj.bus_unit_id) : undefined;
  const capacity = tripBusUnit?.seat_capacity || 20;
  const occupiedSeats = bookings
    .filter(b => b.trip_id === leg.tripId && b.status !== 'cancelled')
    .map(b => b.seat_number);

  return (
    <div className="bg-muted/20 border border-border rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">
          🚌 Leg {legIndex + 1}
        </span>
        {canRemove && (
          <button onClick={onRemove} className="text-[10px] text-destructive font-semibold hover:underline">
            Hapus
          </button>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1 block">Pilih Trip</label>
        <select
          value={leg.tripId}
          onChange={e => onUpdate({ ...leg, tripId: e.target.value, seatNumber: null })}
          className="input-binus"
        >
          <option value="">— Pilih Trip —</option>
          {trips.filter(t => t.status !== 'completed').map(t => {
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

      {leg.tripId && selectedTripObj && (
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
            selectedSeat={leg.seatNumber}
            onSelect={seat => onUpdate({ ...leg, seatNumber: seat })}
          />

          {leg.seatNumber && (
            <div className="bg-success/10 border border-success/30 rounded-xl px-3 py-2 text-center">
              <p className="text-success font-bold text-sm">💺 Kursi #{leg.seatNumber} dipilih</p>
            </div>
          )}
        </>
      )}
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
  const [legs, setLegs] = useState<TripLeg[]>([{ tripId: '', seatNumber: null }]);
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
    setLegs([{ tripId: '', seatNumber: null }]);
  };

  const handleTripTypeChange = (type: TripType) => {
    setTripType(type);
    if (type === 'single') {
      setLegs([{ tripId: '', seatNumber: null }]);
    } else {
      setLegs([{ tripId: '', seatNumber: null }, { tripId: '', seatNumber: null }]);
    }
  };

  const addLeg = () => {
    if (legs.length < 4) setLegs([...legs, { tripId: '', seatNumber: null }]);
  };

  const removeLeg = (index: number) => {
    if (legs.length > 2) setLegs(legs.filter((_, i) => i !== index));
  };

  const updateLeg = (index: number, leg: TripLeg) => {
    setLegs(legs.map((l, i) => i === index ? leg : l));
  };

  const allLegsValid = legs.every(l => l.tripId && l.seatNumber !== null);
  const canSubmit = selectedStudent && allLegsValid;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    // Check duplicates
    for (const leg of legs) {
      const existing = bookings.find(b => b.user_id === selectedStudent && b.trip_id === leg.tripId && b.status !== 'cancelled');
      if (existing) {
        showToast('❌ Mahasiswa sudah memiliki tiket untuk salah satu trip ini');
        return;
      }
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const groupId = tripType === 'multi' ? `grp-${Date.now()}` : undefined;
    const newBookings: Booking[] = legs.map((leg, i) => ({
      id: `b-${Date.now()}-${i}`,
      user_id: selectedStudent,
      trip_id: leg.tripId,
      seat_number: leg.seatNumber!,
      status: 'booked' as const,
      created_at: new Date().toISOString(),
      booked_by: staffUser!.id,
      trip_type: tripType,
      booking_group_id: groupId,
      leg_order: tripType === 'multi' ? i + 1 : undefined,
    }));

    const allBookings = getBookings();
    saveBookings([...allBookings, ...newBookings]);
    setLoading(false);
    setShowForm(false);
    load();
    showToast(`✅ ${tripType === 'multi' ? 'Multi-trip' : 'Tiket'} berhasil dipesan!`);
  };

  const handleCancelBooking = (bookingId: string) => {
    const allBookings = getBookings();
    const target = allBookings.find(b => b.id === bookingId);
    let updated: Booking[];

    // If multi-trip, cancel all legs in the group
    if (target?.booking_group_id) {
      updated = allBookings.map(b =>
        b.booking_group_id === target.booking_group_id ? { ...b, status: 'cancelled' as const } : b
      );
      showToast('Multi-trip dibatalkan');
    } else {
      updated = allBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
      showToast('Tiket dibatalkan');
    }

    saveBookings(updated);
    load();
  };

  const activeBookings = bookings.filter(b => b.status !== 'cancelled');

  // Group bookings: group multi-trip by booking_group_id
  const groupedBookings: { groupId: string | null; bookings: Booking[] }[] = [];
  const processed = new Set<string>();

  activeBookings.forEach(b => {
    if (processed.has(b.id)) return;
    if (b.booking_group_id) {
      const group = activeBookings
        .filter(x => x.booking_group_id === b.booking_group_id)
        .sort((a, c) => (a.leg_order || 0) - (c.leg_order || 0));
      group.forEach(x => processed.add(x.id));
      groupedBookings.push({ groupId: b.booking_group_id, bookings: group });
    } else {
      processed.add(b.id);
      groupedBookings.push({ groupId: null, bookings: [b] });
    }
  });

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
        {groupedBookings.map((group, gi) => {
          const isMulti = group.bookings.length > 1;
          const firstBooking = group.bookings[0];
          const student = students.find(u => u.id === firstBooking.user_id) || getUsers().find(u => u.id === firstBooking.user_id);

          return (
            <div key={group.groupId || firstBooking.id} className="card-binus">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                  {student?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{student?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{student?.nim}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isMulti && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Multi-Trip · {group.bookings.length} Leg
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                    firstBooking.status === 'booked' ? 'bg-primary/10 text-primary border-primary/20' :
                    firstBooking.status === 'checked_in' ? 'bg-success/10 text-success border-success/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {firstBooking.status === 'booked' ? 'Dipesan' : firstBooking.status === 'checked_in' ? 'Check-in' : 'Selesai'}
                  </span>
                </div>
              </div>

              {/* Legs */}
              <div className={`space-y-1.5 ${isMulti ? 'ml-13 pl-3 border-l-2 border-primary/20' : ''}`}>
                {group.bookings.map((b, li) => {
                  const trip = trips.find(t => t.id === b.trip_id);
                  const bUnit = trip ? getBusUnit(trip.bus_unit_id) : undefined;
                  return (
                    <div key={b.id} className={`flex items-center gap-2 text-xs ${isMulti ? 'py-1' : ''}`}>
                      {isMulti && (
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {li + 1}
                        </span>
                      )}
                      <div className="flex-1">
                        <span className="font-semibold text-foreground">{trip?.departure_time || '—'}</span>
                        <span className="text-muted-foreground"> · {trip ? getDirectionLabel(trip.direction) : '—'}</span>
                      </div>
                      <span className="text-[10px] bg-primary/8 text-primary px-1.5 py-0.5 rounded-md font-semibold">Kursi #{b.seat_number}</span>
                      {bUnit && <span className="text-[10px] text-muted-foreground">🚌 {bUnit.plate_number}</span>}
                    </div>
                  );
                })}
              </div>

              {firstBooking.status === 'booked' && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleCancelBooking(firstBooking.id)}
                    className="text-[10px] text-destructive font-semibold hover:underline"
                  >
                    {isMulti ? 'Batalkan Semua' : 'Batalkan'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {groupedBookings.length === 0 && (
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
                <select
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  className="input-binus"
                >
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
                    onClick={() => handleTripTypeChange('single')}
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
                    onClick={() => handleTripTypeChange('multi')}
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
                    : 'Perjalanan dengan transit atau lebih dari satu rute'}
                </p>
              </div>

              {/* Trip Legs */}
              {tripType === 'single' ? (
                <TripLegForm
                  legIndex={0}
                  leg={legs[0]}
                  trips={trips}
                  bookings={bookings}
                  busUnits={busUnits}
                  onUpdate={leg => updateLeg(0, leg)}
                  onRemove={() => {}}
                  canRemove={false}
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {legs.map((leg, i) => (
                      <TripLegForm
                        key={i}
                        legIndex={i}
                        leg={leg}
                        trips={trips}
                        bookings={bookings}
                        busUnits={busUnits}
                        onUpdate={l => updateLeg(i, l)}
                        onRemove={() => removeLeg(i)}
                        canRemove={legs.length > 2}
                      />
                    ))}
                  </div>
                  {legs.length < 4 && (
                    <button
                      type="button"
                      onClick={addLeg}
                      className="w-full py-2 rounded-xl border-2 border-dashed border-border text-muted-foreground text-xs font-semibold hover:border-accent/50 hover:text-accent transition-all"
                    >
                      + Tambah Leg Transit
                    </button>
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
                  ) : '🎫'} Pesan {tripType === 'multi' ? 'Multi-Trip' : 'Tiket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
