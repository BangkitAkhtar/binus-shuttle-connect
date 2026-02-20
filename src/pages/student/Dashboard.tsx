import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrips, getBookingsForUser, getBookings, getUsers, getBusUnits } from '../../data/mockData';
import { Trip, Booking, BusUnit } from '../../types';
import { getDirectionLabel, getDayType } from '../../data/schedules';

function getStatusLabel(status: string) {
  const map: Record<string, string> = { waiting: 'Menunggu', otw: 'Dalam Perjalanan', arrived: 'Tiba di Shelter', completed: 'Selesai' };
  return map[status] || status;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    waiting: 'bg-warning/15 text-warning border-warning/30',
    otw: 'bg-info/15 text-info border-info/30',
    arrived: 'bg-success/15 text-success border-success/30',
    completed: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <span className={`badge-status border ${colors[status] || 'bg-muted text-muted-foreground'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {getStatusLabel(status)}
    </span>
  );
}

function CountdownTimer({ targetTime }: { targetTime: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const [h, m] = targetTime.split(':').map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setRemaining('Sedang Berjalan'); return; }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(hours > 0 ? `${hours}j ${mins}m ${secs}d` : `${mins}m ${secs}d`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return <span className="font-mono text-lg font-bold text-accent animate-pulse-soft">{remaining}</span>;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [nextTrip, setNextTrip] = useState<Trip | null>(null);
  const [nextTripBookings, setNextTripBookings] = useState(0);
  const [busUnits, setBusUnits] = useState<BusUnit[]>([]);

  const loadData = () => {
    const allTrips = getTrips();
    setTrips(allTrips);
    setBusUnits(getBusUnits());
    const bookings = getBookingsForUser(user!.id);
    setUserBookings(bookings);

    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const upcoming = allTrips
      .filter(t => {
        const [h, m] = t.departure_time.split(':').map(Number);
        return (h * 60 + m) > nowMins && t.status !== 'completed';
      })
      .sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    
    const next = upcoming[0] || null;
    setNextTrip(next);
    if (next) {
      const allBookings = getBookings();
      setNextTripBookings(allBookings.filter(b => b.trip_id === next.id && b.status !== 'cancelled').length);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  // Poll for driver status updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const getBusUnit = (id?: string) => busUnits.find(b => b.id === id);

  const dayType = getDayType(new Date());
  const dayLabel: Record<string, string> = { senin_kamis: 'Senin–Kamis', jumat: 'Jumat', sabtu: 'Sabtu' };

  const todayTrips = trips.filter(t => t.status !== 'completed').length;
  const bookedCount = userBookings.length;
  const nextBusUnit = nextTrip ? getBusUnit(nextTrip.bus_unit_id) : undefined;
  const nextCapacity = nextBusUnit?.seat_capacity || 20;

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      <div className="mb-5">
        <p className="text-muted-foreground text-sm">Selamat datang,</p>
        <h1 className="text-2xl font-bold text-foreground">{user?.name} 👋</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Jadwal {dayLabel[dayType]}
        </p>
      </div>

      {nextTrip ? (
        <div className="card-primary mb-5 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs opacity-70 font-medium uppercase tracking-wider">Shuttle Berikutnya</p>
              <p className="text-3xl font-black mt-0.5">{nextTrip.departure_time}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={nextTrip.status} />
              <div className="mt-2">
                <CountdownTimer targetTime={nextTrip.departure_time} />
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-3 mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs opacity-70 mb-0.5">Rute</p>
              <p className="text-sm font-semibold">{getDirectionLabel(nextTrip.direction)}</p>
              {nextTrip.via_binus_square && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">via Binus Square</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70 mb-0.5">Kursi Tersedia</p>
              <p className="text-sm font-bold">{nextCapacity - nextTripBookings}/{nextCapacity}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-binus mb-5 text-center py-8">
          <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-foreground">Tidak ada shuttle tersedia</p>
          <p className="text-sm text-muted-foreground mt-1">Semua jadwal hari ini sudah selesai</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Trip Hari Ini', value: trips.length, icon: '🚌' },
          { label: 'Tiket Saya', value: bookedCount, icon: '🎫' },
          { label: 'Tersisa', value: todayTrips, icon: '⏳' },
        ].map((stat, i) => (
          <div key={i} className="card-binus text-center py-3">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-xl font-black text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="section-title">Jadwal Mendatang</h2>
        <div className="space-y-2">
          {trips
            .filter(t => {
              const [h, m] = t.departure_time.split(':').map(Number);
              const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
              return (h * 60 + m) > nowMins;
            })
            .slice(0, 5)
            .map(trip => {
              const allBookings = getBookings();
              const booked = allBookings.filter(b => b.trip_id === trip.id && b.status !== 'cancelled').length;
              const tripBusUnit = getBusUnit(trip.bus_unit_id);
              const capacity = tripBusUnit?.seat_capacity || 20;
              return (
                <div key={trip.id} className="schedule-card">
                  <div className="flex items-center gap-3">
                    <div className="text-center bg-primary/10 rounded-xl px-3 py-2 min-w-[56px]">
                      <span className="text-base font-black text-primary">{trip.departure_time}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{getDirectionLabel(trip.direction)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {trip.via_binus_square && <span className="text-xs text-accent font-medium">via Binus Square</span>}
                        <span className="text-xs text-muted-foreground">{capacity - booked} kursi</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              );
            })}
          {trips.filter(t => {
            const [h, m] = t.departure_time.split(':').map(Number);
            return (h * 60 + m) > (new Date().getHours() * 60 + new Date().getMinutes());
          }).length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">Tidak ada jadwal mendatang</div>
          )}
        </div>
      </div>
    </div>
  );
}
