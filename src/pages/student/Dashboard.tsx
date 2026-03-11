import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, getTrips, getBusUnits } from '../../data/mockData';
import { Trip, Booking, BusUnit } from '../../types';
import { getDirectionLabel, getDayType } from '../../data/schedules';

function getStatusLabel(status: string) {
  const map: Record<string, string> = { booked: 'Dipesan', checked_in: 'Check-in', completed: 'Selesai', cancelled: 'Dibatalkan' };
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [busUnits, setBusUnits] = useState<BusUnit[]>([]);

  useEffect(() => {
    setTrips(getTrips());
    setBusUnits(getBusUnits());
    setUserBookings(getBookingsForUser(user!.id));
  }, [user]);

  const getBusUnit = (id?: string) => busUnits.find(b => b.id === id);
  const getTrip = (tripId: string) => trips.find(t => t.id === tripId);

  const dayType = getDayType(new Date());
  const dayLabel: Record<string, string> = { senin_kamis: 'Senin–Kamis', jumat: 'Jumat', sabtu: 'Sabtu' };

  const activeBookings = userBookings.filter(b => {
    const trip = getTrip(b.trip_id);
    return trip && trip.status !== 'completed' && b.status === 'booked';
  });

  const completedBookings = userBookings.filter(b => {
    const trip = getTrip(b.trip_id);
    return !trip || trip.status === 'completed' || b.status !== 'booked';
  });

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      <div className="mb-5">
        <p className="text-muted-foreground text-sm">Selamat datang,</p>
        <h1 className="text-2xl font-bold text-foreground">{user?.name} 👋</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Jadwal {dayLabel[dayType]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card-binus text-center py-4">
          <div className="text-xl mb-1">🎫</div>
          <div className="text-2xl font-black text-primary">{activeBookings.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Tiket Aktif</div>
        </div>
        <div className="card-binus text-center py-4">
          <div className="text-xl mb-1">✅</div>
          <div className="text-2xl font-black text-primary">{completedBookings.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Riwayat</div>
        </div>
      </div>

      {activeBookings.length > 0 ? (
        <div className="mb-5">
          <h2 className="section-title">Tiket Aktif</h2>
          <div className="space-y-3">
            {activeBookings.map(booking => {
              const trip = getTrip(booking.trip_id);
              if (!trip) return null;
              const tripBusUnit = getBusUnit(trip.bus_unit_id);
              return (
                <div key={booking.id} className="card-binus">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-black text-foreground text-xl">{trip.departure_time}</p>
                      <p className="text-sm text-muted-foreground">{getDirectionLabel(trip.direction)}</p>
                      {trip.via_binus_square && <span className="text-xs text-accent font-semibold">via Binus Square</span>}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 bg-primary/8 rounded-lg px-3 py-1.5">
                      <span className="font-semibold text-primary text-xs">💺 Kursi #{booking.seat_number}</span>
                    </div>
                    {tripBusUnit && (
                      <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                        <span className="text-muted-foreground text-xs">🚌 {tripBusUnit.plate_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card-binus text-center py-8 mb-5">
          <div className="text-3xl mb-2">🎫</div>
          <p className="font-semibold text-foreground">Belum ada tiket aktif</p>
          <p className="text-sm text-muted-foreground mt-1">Tiket Anda akan muncul setelah staff melakukan pemesanan</p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-1">ℹ️ Informasi</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pemesanan tiket shuttle dilakukan oleh staff. Hubungi staff untuk memesan tiket shuttle Anda. 
          Tiket yang sudah dipesan akan otomatis muncul di halaman ini.
        </p>
      </div>
    </div>
  );
}
