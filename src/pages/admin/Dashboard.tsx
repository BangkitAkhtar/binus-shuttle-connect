import { useState, useEffect } from 'react';
import { getTrips, getUsers, getBookings } from '../../data/mockData';
import { Trip, User, Booking } from '../../types';
import { getDirectionLabel } from '../../data/schedules';

function StatCard({ label, value, emoji, color }: { label: string; value: number; emoji: string; color?: string }) {
  return (
    <div className="card-binus flex items-center gap-4 py-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color || 'bg-primary/10'}`}>
        {emoji}
      </div>
      <div>
        <div className="text-2xl font-black text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    waiting: { label: 'Menunggu', cls: 'bg-warning/10 text-warning border-warning/20' },
    otw: { label: 'OTW', cls: 'bg-info/10 text-info border-info/20' },
    arrived: { label: 'Di Shelter', cls: 'bg-success/10 text-success border-success/20' },
    completed: { label: 'Selesai', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const c = config[status] || config.completed;
  return <span className={`badge-status border ${c.cls}`}>{c.label}</span>;
}

export default function AdminDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setTrips(getTrips());
    setUsers(getUsers());
    setBookings(getBookings());
  }, []);

  const students = users.filter(u => u.role === 'student');
  const drivers = users.filter(u => u.role === 'driver');
  const todayTrips = trips;
  const activeTrips = trips.filter(t => t.status === 'otw' || t.status === 'arrived');

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Mahasiswa" value={students.length} emoji="🎓" />
        <StatCard label="Total Driver" value={drivers.length} emoji="🚌" />
        <StatCard label="Trip Hari Ini" value={todayTrips.length} emoji="📅" />
        <StatCard label="Trip Aktif" value={activeTrips.length} emoji="🟢" />
      </div>

      {/* Active Trips */}
      <div className="mb-6">
        <h2 className="section-title">Trip Hari Ini</h2>
        <div className="space-y-2">
          {todayTrips.slice(0, 8).map(trip => {
            const tripBookings = bookings.filter(b => b.trip_id === trip.id && b.status !== 'cancelled');
            const driver = users.find(u => u.id === trip.driver_id);
            return (
              <div key={trip.id} className="card-binus flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl px-3 py-2 text-center min-w-[56px]">
                  <span className="font-black text-primary text-sm">{trip.departure_time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{getDirectionLabel(trip.direction)}</p>
                  <p className="text-xs text-muted-foreground">
                    {tripBookings.length}/{trip.seat_capacity} penumpang
                    {driver && ` · ${driver.name}`}
                    {trip.via_base && ' · via BASE'}
                  </p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="section-title">Pemesanan Terbaru</h2>
        <div className="space-y-2">
          {bookings.filter(b => b.status !== 'cancelled').slice(0, 5).map(b => {
            const student = users.find(u => u.id === b.user_id);
            const trip = trips.find(t => t.id === b.trip_id);
            return (
              <div key={b.id} className="card-binus flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {student?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{student?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{trip?.departure_time} · Kursi #{b.seat_number}</p>
                </div>
                <span className={`badge-status border ${b.status === 'checked_in' ? 'bg-success/10 text-success border-success/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                  {b.status === 'checked_in' ? 'Check-in' : 'Dipesan'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
