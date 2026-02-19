import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, getTrips, saveBookings, getBookings } from '../../data/mockData';
import { Booking, Trip } from '../../types';
import { getDirectionLabel } from '../../data/schedules';

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    booked: 'Dipesan',
    checked_in: 'Check-in',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return map[status] || status;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    booked: 'bg-primary/10 text-primary border-primary/20',
    checked_in: 'bg-success/10 text-success border-success/20',
    completed: 'bg-muted text-muted-foreground border-border',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return (
    <span className={`badge-status border ${colors[status] || 'bg-muted text-muted-foreground'}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function QRPlaceholder({ bookingId }: { bookingId: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl">
      <div className="w-28 h-28 bg-card border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center">
        <div className="grid grid-cols-6 gap-0.5 p-1.5">
          {Array.from({ length: 36 }, (_, i) => (
            <div key={i} className={`w-2 h-2 rounded-[1px] ${[0,1,2,3,4,6,12,18,24,30,31,32,33,34,5,11,17,23,29,35,7,8,9,14,15,21,22,28].includes(i) ? 'bg-foreground' : ''}`} />
          ))}
        </div>
      </div>
      <p className="text-xs font-mono font-bold text-foreground">{bookingId.slice(-8).toUpperCase()}</p>
      <p className="text-xs text-muted-foreground">Tunjukkan kepada pengemudi</p>
    </div>
  );
}

export default function StudentBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expandedQR, setExpandedQR] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const load = () => {
    setBookings(getBookingsForUser(user!.id));
    setTrips(getTrips());
  };

  useEffect(() => { load(); }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCancel = (bookingId: string) => {
    const allBookings = getBookings();
    const updated = allBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
    saveBookings(updated);
    load();
    setCancelConfirm(null);
    showToast('Pemesanan berhasil dibatalkan');
  };

  const getTrip = (tripId: string) => trips.find(t => t.id === tripId);

  const upcoming = bookings.filter(b => {
    const trip = getTrip(b.trip_id);
    return trip && trip.status !== 'completed' && b.status === 'booked';
  });

  const past = bookings.filter(b => {
    const trip = getTrip(b.trip_id);
    return !trip || trip.status === 'completed' || b.status !== 'booked';
  });

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Tiket Saya</h1>
        <p className="text-sm text-muted-foreground">Riwayat pemesanan shuttle</p>
      </div>

      {/* Upcoming */}
      <div className="mb-5">
        <h2 className="section-title">Tiket Aktif</h2>
        {upcoming.length === 0 ? (
          <div className="card-binus text-center py-8">
            <div className="text-3xl mb-2">🎫</div>
            <p className="font-semibold text-foreground">Belum ada tiket aktif</p>
            <p className="text-sm text-muted-foreground mt-1">Pesan shuttle dari halaman Jadwal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(booking => {
              const trip = getTrip(booking.trip_id);
              if (!trip) return null;
              return (
                <div key={booking.id} className="card-binus">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground text-base">{trip.departure_time}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{getDirectionLabel(trip.direction)}</p>
                      {trip.via_base && <span className="text-xs text-accent font-semibold">via BASE</span>}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="flex items-center gap-3 text-sm mb-3">
                    <div className="flex items-center gap-1.5 bg-primary/8 rounded-lg px-3 py-1.5">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold text-primary">Kursi #{booking.seat_number}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                      <span className="text-muted-foreground text-xs">
                        {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedQR(expandedQR === booking.id ? null : booking.id)}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                    >
                      {expandedQR === booking.id ? 'Tutup QR' : 'Tampilkan QR'}
                    </button>
                    {trip.status === 'waiting' && (
                      <button
                        onClick={() => setCancelConfirm(booking.id)}
                        className="py-2 px-4 text-xs font-semibold rounded-xl border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-all"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>

                  {expandedQR === booking.id && (
                    <div className="mt-3">
                      <QRPlaceholder bookingId={booking.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="section-title">Riwayat</h2>
          <div className="space-y-2">
            {past.map(booking => {
              const trip = getTrip(booking.trip_id);
              return (
                <div key={booking.id} className="card-binus opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{trip?.departure_time || '—'}</p>
                      <p className="text-xs text-muted-foreground">{trip ? getDirectionLabel(trip.direction) : '—'} · Kursi #{booking.seat_number}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-bold text-foreground text-lg mb-2">Batalkan Pemesanan?</h3>
            <p className="text-muted-foreground text-sm mb-4">Kursi yang dibatalkan tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold">Tidak</button>
              <button onClick={() => handleCancel(cancelConfirm)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">Ya, Batalkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
