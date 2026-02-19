import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrips, getBookings, getUsers, saveBookings } from '../../data/mockData';
import { Booking, Trip, User } from '../../types';

export default function DriverPassengers() {
  const { user } = useAuth();
  const [passengers, setPassengers] = useState<Array<{ booking: Booking; student: User | undefined }>>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [toast, setToast] = useState('');

  const load = () => {
    const trips = getTrips();
    const driverTrip = trips.find(t => t.driver_id === user!.id);
    setTrip(driverTrip || null);
    if (driverTrip) {
      const allBookings = getBookings().filter(b => b.trip_id === driverTrip.id && b.status !== 'cancelled');
      const users = getUsers();
      setPassengers(allBookings.map(b => ({ booking: b, student: users.find(u => u.id === b.user_id) })));
    }
  };

  useEffect(() => { load(); }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCheckin = (bookingId: string) => {
    const allBookings = getBookings();
    const updated = allBookings.map(b => b.id === bookingId ? { ...b, status: 'checked_in' as const } : b);
    saveBookings(updated);
    load();
    showToast('✅ Check-in berhasil!');
  };

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Daftar Penumpang</h1>
        {trip && (
          <p className="text-sm text-muted-foreground">Trip {trip.departure_time} · {passengers.length} penumpang</p>
        )}
      </div>

      {passengers.length === 0 ? (
        <div className="card-binus text-center py-10">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-semibold text-foreground">Belum ada penumpang</p>
        </div>
      ) : (
        <div className="space-y-2">
          {passengers.map(({ booking, student }) => (
            <div key={booking.id} className="card-binus flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
                {student?.name.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{student?.name || 'Tidak diketahui'}</p>
                <p className="text-xs text-muted-foreground">{student?.nim} · Kursi #{booking.seat_number}</p>
              </div>
              {booking.status === 'checked_in' ? (
                <span className="badge-status bg-success/10 text-success border border-success/20">✓ Check-in</span>
              ) : (
                <button
                  onClick={() => handleCheckin(booking.id)}
                  className="btn-primary text-xs py-2 px-3"
                >
                  Check-in
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
