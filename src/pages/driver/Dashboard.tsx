import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrips, getBookings, saveTrips, getUsers } from '../../data/mockData';
import { Trip, Booking, User } from '../../types';
import { getDirectionLabel } from '../../data/schedules';

const STATUS_FLOW: Record<string, { next: string; label: string; color: string } | null> = {
  waiting: { next: 'arrived', label: '🛑 Tiba di Shelter', color: 'bg-warning text-warning-foreground rounded-xl px-4 py-2.5 font-bold text-sm w-full' },
  arrived: { next: 'otw', label: '🚌 Berangkat (OTW)', color: 'btn-primary w-full' },
  otw: { next: 'completed', label: '✅ Trip Selesai', color: 'bg-success text-success-foreground rounded-xl px-4 py-2.5 font-bold text-sm w-full' },
  completed: null,
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string; dot: string }> = {
    waiting: { label: 'Stand By', cls: 'bg-warning/15 text-warning border-warning/30', dot: 'bg-warning' },
    otw: { label: 'OTW', cls: 'bg-info/15 text-info border-info/30', dot: 'bg-info' },
    arrived: { label: 'Di Shelter', cls: 'bg-success/15 text-success border-success/30', dot: 'bg-success' },
    completed: { label: 'Selesai', cls: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
  };
  const c = config[status] || config.completed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      {c.label}
    </span>
  );
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { key: 'waiting', label: 'Stand By', icon: '🅿️' },
    { key: 'arrived', label: 'Di Shelter', icon: '🛑' },
    { key: 'otw', label: 'OTW', icon: '🚌' },
    { key: 'completed', label: 'Selesai', icon: '✅' },
  ];
  const currentIdx = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className={`flex flex-col items-center flex-1`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
              i < currentIdx ? 'bg-success border-success text-white' :
              i === currentIdx ? 'bg-primary border-primary text-white' :
              'bg-muted border-border text-muted-foreground'
            }`}>
              {i < currentIdx ? '✓' : step.icon}
            </div>
            <p className={`text-[9px] mt-1 font-medium text-center leading-tight ${i <= currentIdx ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mb-4 transition-all ${i < currentIdx ? 'bg-success' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [checkedIn, setCheckedIn] = useState(0);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const load = () => {
    const trips = getTrips();
    const driverTrip = trips.find(t => t.driver_id === user!.id);
    setTrip(driverTrip || null);
    setAllUsers(getUsers());
    if (driverTrip) {
      const allBookings = getBookings();
      const tripBookings = allBookings.filter(b => b.trip_id === driverTrip.id && b.status !== 'cancelled');
      setBookings(tripBookings);
      setCheckedIn(tripBookings.filter(b => b.status === 'checked_in').length);
    }
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = (newStatus: string) => {
    const trips = getTrips();
    const updated = trips.map(t => t.id === trip!.id ? { ...t, status: newStatus as any } : t);
    saveTrips(updated);
    load();
  };

  const nextAction = trip ? STATUS_FLOW[trip.status] : null;

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      <div className="mb-5">
        <p className="text-muted-foreground text-sm">Selamat bertugas,</p>
        <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">ID: {user?.driver_id}</span>
          {user?.bus_unit && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">🚌 Unit: {user.bus_unit}</span>
          )}
        </div>
      </div>

      {trip ? (
        <>
          {/* Trip Card */}
          <div className="card-primary mb-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider font-medium">Trip Aktif Hari Ini</p>
                <p className="text-4xl font-black mt-0.5">{trip.departure_time}</p>
                <p className="text-sm opacity-80 mt-1">{getDirectionLabel(trip.direction)}</p>
                {trip.via_base && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">via BASE</span>
                )}
              </div>
              <StatusBadge status={trip.status} />
            </div>
            <StatusTimeline currentStatus={trip.status} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Pesan', value: bookings.length, emoji: '🎫', color: 'text-primary' },
              { label: 'Check-in', value: checkedIn, emoji: '✅', color: 'text-success' },
              { label: 'Kapasitas', value: trip.seat_capacity, emoji: '💺', color: 'text-foreground' },
            ].map((s, i) => (
              <div key={i} className="card-binus text-center py-3">
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Status Update */}
          <div className="card-binus mb-5">
            <h3 className="font-bold text-foreground text-sm mb-1">Update Status Perjalanan</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {trip.status === 'waiting' && 'Tekan tombol saat tiba di shelter penjemputan.'}
              {trip.status === 'arrived' && 'Tekan tombol saat bus mulai berangkat.'}
              {trip.status === 'otw' && 'Tekan tombol saat tiba di tujuan.'}
              {trip.status === 'completed' && 'Trip hari ini telah selesai. Terima kasih!'}
            </p>
            {nextAction ? (
              <button
                onClick={() => updateStatus(nextAction.next)}
                className={nextAction.color}
              >
                {nextAction.label}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-4 py-3">
                <span className="text-success text-lg">✅</span>
                <div>
                  <p className="text-success font-bold text-sm">Trip Selesai</p>
                  <p className="text-success/70 text-xs">Semua penumpang telah tiba</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Passenger Preview */}
          {bookings.length > 0 && (
            <div className="card-binus">
              <h3 className="font-bold text-foreground text-sm mb-3">
                Penumpang ({checkedIn}/{bookings.length} check-in)
              </h3>
              <div className="space-y-2">
                {bookings.slice(0, 3).map(b => {
                  const student = allUsers.find(u => u.id === b.user_id);
                  return (
                    <div key={b.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {student?.name.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{student?.name}</p>
                        <p className="text-[10px] text-muted-foreground">Kursi #{b.seat_number}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.status === 'checked_in' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {b.status === 'checked_in' ? '✓ Check-in' : 'Menunggu'}
                      </span>
                    </div>
                  );
                })}
                {bookings.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">+{bookings.length - 3} penumpang lainnya</p>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card-binus text-center py-10">
          <div className="text-4xl mb-3">🚌</div>
          <p className="font-semibold text-foreground">Tidak ada trip yang ditugaskan</p>
          <p className="text-sm text-muted-foreground mt-1">Hubungi admin untuk penugasan trip</p>
        </div>
      )}
    </div>
  );
}
