import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, getTrips, getBusUnits } from '../../data/mockData';
import { Booking, Trip, BusUnit } from '../../types';
import { getDirectionLabel } from '../../data/schedules';
import { getMultiRouteById } from '../../data/multiRoutes';

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

function MultiRouteStops({ routeId }: { routeId: string }) {
  const route = getMultiRouteById(routeId);
  if (!route) return null;
  return (
    <div className="flex items-center gap-1 mt-1.5">
      {route.stops.map((stop, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="flex items-center gap-0.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-[10px] font-semibold text-accent">{stop}</span>
          </span>
          {i < route.stops.length - 1 && (
            <span className="text-muted-foreground text-[10px]">→</span>
          )}
        </span>
      ))}
    </div>
  );
}

function BookingReceipt({ booking, trip, userName, nim, faculty, busUnit }: {
  booking: Booking;
  trip: Trip;
  userName: string;
  nim?: string;
  faculty?: string;
  busUnit?: BusUnit;
}) {
  const multiRoute = booking.multi_route_id ? getMultiRouteById(booking.multi_route_id) : undefined;
  const dateStr = new Date(booking.created_at).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStr = new Date(booking.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/30 overflow-hidden">
      <div className="bg-primary px-4 py-3 text-center">
        <p className="text-primary-foreground font-black text-sm tracking-widest uppercase">🎫 BINUS Shuttle</p>
        <p className="text-primary-foreground/70 text-xs">
          {booking.trip_type === 'multi' ? 'E-Tiket Multi-Trip' : 'E-Tiket Perjalanan'}
        </p>
      </div>
      <div className="relative flex items-center">
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -left-2" />
        <div className="flex-1 border-t-2 border-dashed border-primary/20 mx-2" />
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -right-2" />
      </div>
      <div className="bg-muted/30 px-4 py-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground font-medium">Nama</p>
            <p className="font-bold text-foreground">{userName}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">NIM</p>
            <p className="font-bold text-foreground">{nim || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground font-medium">Fakultas</p>
            <p className="font-bold text-foreground text-[11px] leading-tight">{faculty || '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground font-medium">No. Kursi</p>
            <p className="font-bold text-foreground">#{booking.seat_number}</p>
          </div>
        </div>
        <div className="border-t border-dashed border-border pt-2.5 space-y-1.5 text-xs">
          <div>
            <p className="text-muted-foreground font-medium">Rute Perjalanan</p>
            {multiRoute ? (
              <div className="mt-1">
                <div className="flex items-center gap-1 flex-wrap">
                  {multiRoute.stops.map((stop, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="font-bold text-accent">{stop}</span>
                      {i < multiRoute.stops.length - 1 && <span className="text-muted-foreground">→</span>}
                    </span>
                  ))}
                </div>
                <div className="flex gap-0.5 mt-1.5">
                  {multiRoute.stops.map((_, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      {i < multiRoute.stops.length - 1 && <div className="w-8 h-0.5 bg-accent/30" />}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <p className="font-bold text-primary">{getDirectionLabel(trip.direction)}</p>
                {trip.via_binus_square && <span className="text-[10px] text-accent font-semibold">via Binus Square</span>}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground font-medium">Jam Berangkat</p>
              <p className="font-black text-foreground text-base">{trip.departure_time}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Unit Bus</p>
              <p className="font-bold text-foreground">{busUnit?.plate_number || '—'}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-dashed border-border pt-2.5 text-xs text-muted-foreground">
          <p>Dipesan: {dateStr} · {timeStr}</p>
          <p className="font-mono text-[10px] mt-1 text-muted-foreground/60">ID: {booking.id.slice(-12).toUpperCase()}</p>
        </div>
      </div>
      <div className="relative flex items-center">
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -left-2" />
        <div className="flex-1 border-t-2 border-dashed border-primary/20 mx-2" />
        <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-primary/30 absolute -right-2" />
      </div>
      <div className="bg-primary/5 px-4 py-2 text-center">
        <p className="text-[10px] text-muted-foreground">Tunjukkan e-tiket ini saat boarding</p>
      </div>
    </div>
  );
}

export default function StudentBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [busUnits, setBusUnits] = useState<BusUnit[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);

  const load = () => {
    setBookings(getBookingsForUser(user!.id));
    setTrips(getTrips());
    setBusUnits(getBusUnits());
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setTrips(getTrips()), 3000);
    return () => clearInterval(interval);
  }, []);

  const getBusUnit = (id?: string) => busUnits.find(b => b.id === id);
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
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Tiket Saya</h1>
        <p className="text-sm text-muted-foreground">Riwayat pemesanan shuttle</p>
      </div>

      <div className="mb-5">
        <h2 className="section-title">Tiket Aktif</h2>
        {upcoming.length === 0 ? (
          <div className="card-binus text-center py-8">
            <div className="text-3xl mb-2">🎫</div>
            <p className="font-semibold text-foreground">Belum ada tiket aktif</p>
            <p className="text-sm text-muted-foreground mt-1">Hubungi staff untuk pemesanan tiket</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(booking => {
              const trip = getTrip(booking.trip_id);
              if (!trip) return null;
              const tripBusUnit = getBusUnit(trip.bus_unit_id);

              return (
                <div key={booking.id} className="card-binus">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black text-foreground text-xl">{trip.departure_time}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{getDirectionLabel(trip.direction)}</p>
                      {trip.via_binus_square && <span className="text-xs text-accent font-semibold">via Binus Square</span>}
                      {tripBusUnit && <p className="text-[10px] text-muted-foreground mt-0.5">🚌 {tripBusUnit.plate_number}</p>}
                      {booking.multi_route_id && <MultiRouteStops routeId={booking.multi_route_id} />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={booking.status} />
                      {booking.trip_type === 'multi' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                          🔄 Multi-Trip
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm mb-3">
                    <div className="flex items-center gap-1.5 bg-primary/8 rounded-lg px-3 py-1.5">
                      <span className="font-semibold text-primary text-xs">💺 Kursi #{booking.seat_number}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                      <span className="text-muted-foreground text-xs">
                        {new Date(booking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedReceipt(expandedReceipt === booking.id ? null : booking.id)}
                    className="w-full py-2 text-xs font-semibold rounded-xl border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    {expandedReceipt === booking.id ? '✕ Tutup E-Tiket' : '🎫 Tampilkan E-Tiket'}
                  </button>

                  {expandedReceipt === booking.id && (
                    <BookingReceipt
                      booking={booking}
                      trip={trip}
                      userName={user!.name}
                      nim={user!.nim}
                      faculty={user!.faculty}
                      busUnit={tripBusUnit}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                      {booking.multi_route_id && <MultiRouteStops routeId={booking.multi_route_id} />}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
