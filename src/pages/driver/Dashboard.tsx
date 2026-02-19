import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrips, getBookings, saveTrips, getUsers } from '../../data/mockData';
import { Trip, Booking, User } from '../../types';
import { getDirectionLabel } from '../../data/schedules';

function StatusButton({ currentStatus, onUpdate }: { currentStatus: string; onUpdate: (status: string) => void }) {
  const next = currentStatus === 'waiting' ? { status: 'arrived', label: 'Tiba di Shelter', color: 'btn-accent' }
    : currentStatus === 'arrived' ? { status: 'otw', label: 'Berangkat (OTW)', color: 'btn-primary' }
    : currentStatus === 'otw' ? { status: 'completed', label: 'Trip Selesai', color: 'bg-success text-success-foreground rounded-xl px-4 py-2.5 font-semibold text-sm' }
    : null;
  if (!next) return <span className="badge-status bg-muted text-muted-foreground">Trip Selesai</span>;
  return (
    <button onClick={() => onUpdate(next.status)} className={next.color}>
      {next.label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    waiting: { label: 'Menunggu', cls: 'bg-warning/15 text-warning border-warning/30' },
    otw: { label: 'OTW', cls: 'bg-info/15 text-info border-info/30' },
    arrived: { label: 'Di Shelter', cls: 'bg-success/15 text-success border-success/30' },
    completed: { label: 'Selesai', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const c = config[status] || config.completed;
  return <span className={`badge-status border ${c.cls}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{c.label}</span>;
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [checkedIn, setCheckedIn] = useState(0);

  const load = () => {
    const trips = getTrips();
    const driverTrip = trips.find(t => t.driver_id === user!.id);
    setTrip(driverTrip || null);
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

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      <div className="mb-5">
        <p className="text-muted-foreground text-sm">Selamat bertugas,</p>
        <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
        <p className="text-xs text-muted-foreground">ID: {user?.driver_id}</p>
      </div>

      {trip ? (
        <>
          {/* Trip Card */}
          <div className="card-primary mb-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider font-medium">Trip Aktif</p>
                <p className="text-3xl font-black mt-0.5">{trip.departure_time}</p>
              </div>
              <StatusBadge status={trip.status} />
            </div>
            <div className="border-t border-white/20 pt-3">
              <p className="text-sm opacity-80">{getDirectionLabel(trip.direction)}</p>
              {trip.via_base && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">via BASE</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Pesan', value: bookings.length, emoji: '🎫' },
              { label: 'Check-in', value: checkedIn, emoji: '✅' },
              { label: 'Kapasitas', value: trip.seat_capacity, emoji: '💺' },
            ].map((s, i) => (
              <div key={i} className="card-binus text-center py-3">
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-black text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Status Update */}
          <div className="card-binus mb-5">
            <h3 className="font-bold text-foreground text-sm mb-3">Update Status Trip</h3>
            <StatusButton currentStatus={trip.status} onUpdate={updateStatus} />
          </div>
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
