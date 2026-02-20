import { useState, useEffect } from 'react';
import { DayType } from '../../types';
import { scheduleData, getDayType, getDirectionLabel } from '../../data/schedules';
import { getTrips, getBookings, getBookingsForUser, saveBookings, getUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Trip, Booking, User } from '../../types';

const dayTabs: { key: DayType; label: string; short: string }[] = [
  { key: 'senin_kamis', label: 'Senin – Kamis', short: 'Sen–Kam' },
  { key: 'jumat', label: "Jum'at", short: "Jum'at" },
  { key: 'sabtu', label: 'Sabtu', short: 'Sabtu' },
];

function BookingReceipt({ booking, trip, user: student }: { booking: Booking; trip: Trip; user: User }) {
  const dateStr = new Date(booking.created_at).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStr = new Date(booking.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/30 overflow-hidden">
      {/* Header struk */}
      <div className="bg-primary px-4 py-3 text-center">
        <p className="text-primary-foreground font-black text-sm tracking-widest uppercase">🎫 BINUS Shuttle</p>
        <p className="text-primary-foreground/70 text-xs">E-Tiket Perjalanan</p>
      </div>

      {/* Divider garis putus-putus */}
      <div className="relative flex items-center">
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -left-2" />
        <div className="flex-1 border-t-2 border-dashed border-primary/20 mx-2" />
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -right-2" />
      </div>

      {/* Body struk */}
      <div className="bg-muted/30 px-4 py-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground font-medium">Nama</p>
            <p className="font-bold text-foreground">{student.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">NIM</p>
            <p className="font-bold text-foreground">{student.nim}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Fakultas</p>
            <p className="font-bold text-foreground text-[11px] leading-tight">{student.faculty}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">No. Kursi</p>
            <p className="font-bold text-foreground">#{booking.seat_number}</p>
          </div>
        </div>

        <div className="border-t border-dashed border-border pt-2.5 space-y-1.5 text-xs">
          <div>
            <p className="text-muted-foreground font-medium">Rute Perjalanan</p>
            <p className="font-bold text-primary">{getDirectionLabel(trip.direction)}</p>
            {trip.via_base && <span className="text-[10px] text-accent font-semibold">via Binus Square</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground font-medium">Jam Berangkat</p>
              <p className="font-black text-foreground text-base">{trip.departure_time}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Kapasitas Bus</p>
              <p className="font-bold text-foreground">20 Kursi</p>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-border pt-2.5 text-xs text-muted-foreground">
          <p>Dipesan: {dateStr} · {timeStr}</p>
          <p className="font-mono text-[10px] mt-1 text-muted-foreground/60">ID: {booking.id.slice(-12).toUpperCase()}</p>
        </div>
      </div>

      {/* Footer struk */}
      <div className="relative flex items-center">
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -left-2" />
        <div className="flex-1 border-t-2 border-dashed border-primary/20 mx-2" />
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -right-2" />
      </div>
      <div className="bg-primary/5 px-4 py-2 text-center">
        <p className="text-[10px] text-muted-foreground">Tunjukkan e-tiket ini kepada pengemudi saat boarding</p>
      </div>
    </div>
  );
}

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
  const cols = 4; // 2 seats | aisle | 2 seats
  const rows = Math.ceil(totalSeats / cols);

  return (
    <div className="mt-1 mb-2">
      <p className="text-xs font-semibold text-foreground mb-2">Pilih Kursi:</p>
      {/* Legend */}
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
      {/* Bus front indicator */}
      <div className="flex justify-center mb-2">
        <div className="bg-muted text-muted-foreground text-[10px] font-semibold px-4 py-1 rounded-t-xl border border-b-0 border-border">
          🚌 Depan Bus
        </div>
      </div>
      {/* Seat grid */}
      <div className="bg-muted/30 border border-border rounded-xl p-3">
        <div className="space-y-1.5">
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="flex items-center justify-center gap-1">
              {Array.from({ length: cols }, (_, col) => {
                const seatNum = row * cols + col + 1;
                if (seatNum > totalSeats) return <div key={col} className="w-9 h-9" />;
                const isOccupied = occupiedSeats.includes(seatNum);
                const isSelected = selectedSeat === seatNum;
                const isAisle = col === 1; // gap after 2nd seat

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

function BookingConfirmModal({
  trip,
  occupiedSeats,
  onConfirm,
  onCancel,
  isLoading,
}: {
  trip: Trip;
  occupiedSeats: number[];
  onConfirm: (seatNumber: number) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl w-full max-w-sm animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="font-bold text-foreground text-lg">Konfirmasi Pemesanan</h3>
          <p className="text-muted-foreground text-sm mt-1">Pilih kursi dan konfirmasi pesanan Anda</p>
        </div>

        {/* Detail trip */}
        <div className="p-5 space-y-3">
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Rute</span>
              <span className="font-semibold text-foreground">{getDirectionLabel(trip.direction)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Jam Berangkat</span>
              <span className="font-black text-primary text-base">{trip.departure_time}</span>
            </div>
            {trip.via_base && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Keterangan</span>
                <span className="text-accent font-semibold text-xs">via Binus Square</span>
              </div>
            )}
          </div>

          {/* Seat Picker */}
          <SeatPicker
            totalSeats={trip.seat_capacity}
            occupiedSeats={occupiedSeats}
            selectedSeat={selectedSeat}
            onSelect={setSelectedSeat}
          />

          {selectedSeat && (
            <div className="bg-success/10 border border-success/30 rounded-xl px-3 py-2 text-center">
              <p className="text-success font-bold text-sm">💺 Kursi #{selectedSeat} dipilih</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 flex gap-2.5">
            <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-warning font-bold text-xs">Perhatian!</p>
              <p className="text-warning/80 text-xs mt-0.5 leading-relaxed">
                Kursi yang sudah dipesan <strong>tidak dapat dibatalkan</strong>. Pastikan Anda hadir tepat waktu di shelter keberangkatan.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => selectedSeat && onConfirm(selectedSeat)}
            disabled={isLoading || !selectedSeat}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              !selectedSeat
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : '✓'} {selectedSeat ? 'Ya, Pesan Sekarang' : 'Pilih Kursi Dulu'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentSchedule() {
  const { user } = useAuth();
  const today = new Date();
  const [activeDay, setActiveDay] = useState<DayType>(getDayType(today));
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [booked, setBooked] = useState<string[]>([]);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [confirmTrip, setConfirmTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    setTrips(getTrips());
    setAllUsers(getUsers());
    const userBookings = getBookingsForUser(user!.id);
    setBooked(userBookings.map(b => b.trip_id));
    setBookings(getBookings());
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleConfirmBook = async (seatNumber: number) => {
    if (!confirmTrip) return;
    const allBookings = getBookings();
    const tripBookings = allBookings.filter(b => b.trip_id === confirmTrip.id && b.status !== 'cancelled');
    if (tripBookings.length >= confirmTrip.seat_capacity) {
      showToast('Maaf, kursi penuh!');
      setConfirmTrip(null);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      user_id: user!.id,
      trip_id: confirmTrip.id,
      seat_number: seatNumber,
      status: 'booked',
      created_at: new Date().toISOString(),
    };
    const updated = [...allBookings, newBooking];
    saveBookings(updated);
    setBookings(updated);
    setBooked(prev => [...prev, confirmTrip.id]);
    setConfirmTrip(null);
    setLoading(false);
    showToast('✅ Berhasil memesan! Cek tiket Anda.');
  };

  const getTripsForScheduleEntry = (time: string, direction: string): Trip | undefined => {
    return trips.find(t => t.departure_time === time && t.direction === direction && t.day_type === activeDay);
  };

  const getTripBookingCount = (tripId: string) => {
    return bookings.filter(b => b.trip_id === tripId && b.status !== 'cancelled').length;
  };

  const getUserBookingForTrip = (tripId: string): Booking | undefined => {
    return bookings.find(b => b.trip_id === tripId && b.user_id === user!.id && b.status !== 'cancelled');
  };

  const getDriverForTrip = (tripId: string): User | undefined => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip?.driver_id) return undefined;
    return allUsers.find(u => u.id === trip.driver_id);
  };

  const schedule = scheduleData[activeDay];

  // Determine today's day type for visual indicator
  const todayDayType = getDayType(today);
  const todayDateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const todayDayStr = today.toLocaleDateString('id-ID', { weekday: 'long' });

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      {confirmTrip && (
        <BookingConfirmModal
          trip={confirmTrip}
          occupiedSeats={bookings.filter(b => b.trip_id === confirmTrip.id && b.status !== 'cancelled').map(b => b.seat_number)}
          onConfirm={handleConfirmBook}
          onCancel={() => setConfirmTrip(null)}
          isLoading={loading}
        />
      )}

      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Jadwal Shuttle</h1>
        <p className="text-sm text-muted-foreground">Anggrek ↔ Alam Sutera</p>
      </div>

      {/* Today info banner */}
      <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">Hari ini</p>
          <p className="font-bold text-foreground text-sm">{todayDayStr}, {todayDateStr}</p>
          <p className="text-xs text-primary font-semibold">
            Jadwal berlaku: {dayTabs.find(d => d.key === todayDayType)?.label}
          </p>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="mb-1">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Lihat jadwal berdasarkan hari:</p>
        <div className="flex gap-1.5">
          {dayTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveDay(tab.key)}
              className={`flex-1 py-2.5 px-2 text-xs font-semibold rounded-xl transition-all duration-200 border ${
                activeDay === tab.key
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
              }`}
            >
              <span className="hidden sm:block">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
              {tab.key === todayDayType && (
                <span className={`block text-[9px] mt-0.5 ${activeDay === tab.key ? 'text-primary-foreground/70' : 'text-primary'}`}>
                  hari ini
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeDay !== todayDayType && (
        <div className="mt-3 mb-1 bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
          <p className="text-xs text-warning font-medium">
            ⚠️ Anda sedang melihat jadwal {dayTabs.find(d => d.key === activeDay)?.label}. Jadwal aktif hari ini adalah {dayTabs.find(d => d.key === todayDayType)?.label}.
          </p>
        </div>
      )}

      {/* Two-column schedule */}
      <div className="grid grid-cols-1 gap-4 mt-4">
        {(['anggrek_to_as', 'as_to_anggrek'] as const).map(dir => (
          <div key={dir}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">{getDirectionLabel(dir)}</h2>
                <p className="text-xs text-muted-foreground">{schedule[dir].length} keberangkatan</p>
              </div>
            </div>
            <div className="space-y-2">
              {schedule[dir].map((entry, i) => {
                const trip = getTripsForScheduleEntry(entry.time, dir);
                const isBooked = trip ? booked.includes(trip.id) : false;
                const booking = trip ? getUserBookingForTrip(trip.id) : undefined;
                const bookedCount = trip ? getTripBookingCount(trip.id) : 0;
                const isFull = trip ? bookedCount >= trip.seat_capacity : false;
                const isCompleted = trip?.status === 'completed';
                const driver = trip ? getDriverForTrip(trip.id) : undefined;
                const availableSeats = trip ? trip.seat_capacity - bookedCount : 20;

                return (
                  <div key={i} className={`card-binus ${isCompleted ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      {/* Jam */}
                      <div className={`text-center rounded-xl px-3 py-2.5 min-w-[64px] ${isBooked ? 'bg-success/10' : 'bg-primary/8'}`}>
                        <span className={`text-lg font-black ${isBooked ? 'text-success' : 'text-primary'}`}>{entry.time}</span>
                        <p className="text-[9px] text-muted-foreground mt-0.5">WIB</p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {entry.via_base && (
                            <span className="text-[10px] bg-accent/10 text-accent font-bold px-1.5 py-0.5 rounded-md">via Binus Square</span>
                          )}
                          {isBooked && booking && (
                            <span className="text-[10px] bg-success/10 text-success font-bold px-1.5 py-0.5 rounded-md">✓ Kursi #{booking.seat_number}</span>
                          )}
                        </div>
                        {driver ? (
                          <p className="text-xs text-muted-foreground">
                            🚌 {driver.name}
                            {driver.bus_unit && <span className="ml-1 font-mono text-[10px]">({driver.bus_unit})</span>}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Driver belum ditugaskan</p>
                        )}
                        {trip && !isCompleted && (
                          <p className={`text-[10px] mt-0.5 font-medium ${isFull ? 'text-destructive' : availableSeats <= 5 ? 'text-warning' : 'text-muted-foreground'}`}>
                            {isFull ? '🔴 Kursi penuh' : `🟢 ${availableSeats}/${trip.seat_capacity} kursi tersedia`}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0">
                        {isBooked && booking ? (
                          <button
                            onClick={() => setShowReceipt(showReceipt === booking.id ? null : booking.id)}
                            className="text-xs bg-success/10 text-success border border-success/30 px-3 py-2 rounded-xl font-semibold whitespace-nowrap"
                          >
                            {showReceipt === booking.id ? '✕ Tutup' : '🎫 E-Tiket'}
                          </button>
                        ) : (
                          <button
                            onClick={() => trip && !isCompleted && !isFull && setConfirmTrip(trip)}
                            disabled={!trip || isCompleted || isFull}
                            className={`text-xs px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                              !trip || isCompleted ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                              isFull ? 'bg-destructive/10 text-destructive border border-destructive/20 cursor-not-allowed' :
                              'btn-primary'
                            }`}
                          >
                            {isFull ? 'Penuh' : isCompleted ? 'Selesai' : !trip ? '—' : 'Pesan'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* E-Tiket / Struk */}
                    {showReceipt === booking?.id && booking && trip && (
                      <BookingReceipt booking={booking} trip={trip} user={user!} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
