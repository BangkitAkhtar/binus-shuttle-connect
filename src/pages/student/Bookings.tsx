import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForUser, getTrips, getBusUnits } from '../../data/mockData';
import { Booking, Trip, BusUnit } from '../../types';
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

function BookingReceipt({ bookings, trip, userName, nim, faculty, busUnit }: {
  bookings: Booking[];
  trip: Trip;
  userName: string;
  nim?: string;
  faculty?: string;
  busUnit?: BusUnit;
}) {
  const booking = bookings[0];
  const isMulti = bookings.length > 1;
  const dateStr = new Date(booking.created_at).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStr = new Date(booking.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/30 overflow-hidden">
      <div className="bg-primary px-4 py-3 text-center">
        <p className="text-primary-foreground font-black text-sm tracking-widest uppercase">🎫 BINUS Shuttle</p>
        <p className="text-primary-foreground/70 text-xs">
          {isMulti ? `E-Tiket Multi-Trip · ${bookings.length} Leg` : 'E-Tiket Perjalanan'}
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
        </div>
        <div className="border-t border-dashed border-border pt-2.5 space-y-1.5 text-xs">
          {isMulti ? (
            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">Rute Perjalanan (Multi-Trip)</p>
              {bookings.map((b, i) => {
                const t = trip; // we'll need trips lookup
                return (
                  <div key={b.id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold text-foreground">Kursi #{b.seat_number}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div>
                <p className="text-muted-foreground font-medium">Rute Perjalanan</p>
                <p className="font-bold text-primary">{getDirectionLabel(trip.direction)}</p>
                {trip.via_binus_square && <span className="text-[10px] text-accent font-semibold">via Binus Square</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground font-medium">Jam Berangkat</p>
                  <p className="font-black text-foreground text-base">{trip.departure_time}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">No. Kursi</p>
                  <p className="font-bold text-foreground">#{booking.seat_number}</p>
                </div>
              </div>
            </>
          )}
          {busUnit && (
            <div>
              <p className="text-muted-foreground font-medium">Unit Bus</p>
              <p className="font-bold text-foreground">{busUnit.plate_number}</p>
            </div>
          )}
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

  // Group bookings by booking_group_id for multi-trip
  const groupedBookings: { groupId: string | null; bookings: Booking[] }[] = [];
  const processed = new Set<string>();

  bookings.forEach(b => {
    if (processed.has(b.id)) return;
    if (b.booking_group_id) {
      const group = bookings
        .filter(x => x.booking_group_id === b.booking_group_id)
        .sort((a, c) => (a.leg_order || 0) - (c.leg_order || 0));
      group.forEach(x => processed.add(x.id));
      groupedBookings.push({ groupId: b.booking_group_id, bookings: group });
    } else {
      processed.add(b.id);
      groupedBookings.push({ groupId: null, bookings: [b] });
    }
  });

  const upcoming = groupedBookings.filter(g => {
    const trip = getTrip(g.bookings[0].trip_id);
    return trip && trip.status !== 'completed' && g.bookings[0].status === 'booked';
  });

  const past = groupedBookings.filter(g => {
    const trip = getTrip(g.bookings[0].trip_id);
    return !trip || trip.status === 'completed' || g.bookings[0].status !== 'booked';
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
            {upcoming.map(group => {
              const firstBooking = group.bookings[0];
              const trip = getTrip(firstBooking.trip_id);
              if (!trip) return null;
              const tripBusUnit = getBusUnit(trip.bus_unit_id);
              const isMulti = group.bookings.length > 1;
              const groupKey = group.groupId || firstBooking.id;

              return (
                <div key={groupKey} className="card-binus">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {isMulti ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                              🔄 Multi-Trip · {group.bookings.length} Leg
                            </span>
                          </div>
                          <div className="space-y-1">
                            {group.bookings.map((b, i) => {
                              const t = getTrip(b.trip_id);
                              return (
                                <div key={b.id} className="flex items-center gap-2 text-xs">
                                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                                    {i + 1}
                                  </span>
                                  <span className="font-semibold text-foreground">{t?.departure_time || '—'}</span>
                                  <span className="text-muted-foreground">{t ? getDirectionLabel(t.direction) : '—'}</span>
                                  <span className="text-primary font-semibold">Kursi #{b.seat_number}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="font-black text-foreground text-xl">{trip.departure_time}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{getDirectionLabel(trip.direction)}</p>
                          {trip.via_binus_square && <span className="text-xs text-accent font-semibold">via Binus Square</span>}
                          {tripBusUnit && <p className="text-[10px] text-muted-foreground mt-0.5">🚌 {tripBusUnit.plate_number}</p>}
                        </>
                      )}
                    </div>
                    <StatusBadge status={firstBooking.status} />
                  </div>

                  {!isMulti && (
                    <div className="flex items-center gap-3 text-sm mb-3">
                      <div className="flex items-center gap-1.5 bg-primary/8 rounded-lg px-3 py-1.5">
                        <span className="font-semibold text-primary text-xs">💺 Kursi #{firstBooking.seat_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                        <span className="text-muted-foreground text-xs">
                          {new Date(firstBooking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedReceipt(expandedReceipt === groupKey ? null : groupKey)}
                    className="w-full py-2 text-xs font-semibold rounded-xl border border-primary text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    {expandedReceipt === groupKey ? '✕ Tutup E-Tiket' : '🎫 Tampilkan E-Tiket'}
                  </button>

                  {expandedReceipt === groupKey && (
                    <BookingReceipt
                      bookings={group.bookings}
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
            {past.map(group => {
              const firstBooking = group.bookings[0];
              const trip = getTrip(firstBooking.trip_id);
              const isMulti = group.bookings.length > 1;
              return (
                <div key={group.groupId || firstBooking.id} className="card-binus opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      {isMulti ? (
                        <p className="font-semibold text-foreground text-sm">🔄 Multi-Trip · {group.bookings.length} Leg</p>
                      ) : (
                        <p className="font-semibold text-foreground text-sm">{trip?.departure_time || '—'}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {trip ? getDirectionLabel(trip.direction) : '—'} · Kursi #{firstBooking.seat_number}
                      </p>
                    </div>
                    <StatusBadge status={firstBooking.status} />
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
