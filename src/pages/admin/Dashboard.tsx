import { useState, useEffect } from 'react';
import { getTrips, getUsers, getBookings, getBusUnits } from '../../data/mockData';
import { Trip, User, Booking, BusUnit } from '../../types';
import { getDirectionLabel } from '../../data/schedules';

function StatCard({ label, value, emoji, sub }: { label: string; value: number; emoji: string; sub?: string }) {
  return (
    <div className="card-binus flex items-center gap-3 py-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-primary/8 flex-shrink-0">
        {emoji}
      </div>
      <div>
        <div className="text-2xl font-black text-foreground leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-primary font-semibold mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function TripStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    waiting: { label: 'Stand By', cls: 'bg-warning/10 text-warning border-warning/20' },
    otw: { label: 'OTW', cls: 'bg-info/10 text-info border-info/20' },
    arrived: { label: 'Di Shelter', cls: 'bg-success/10 text-success border-success/20' },
    completed: { label: 'Selesai', cls: 'bg-muted text-muted-foreground border-border' },
  };
  const c = config[status] || config.completed;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {c.label}
    </span>
  );
}

export default function AdminDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busUnits, setBusUnits] = useState<BusUnit[]>([]);

  useEffect(() => {
    setTrips(getTrips());
    setUsers(getUsers());
    setBookings(getBookings());
    setBusUnits(getBusUnits());
  }, []);

  const getBusUnit = (id?: string) => busUnits.find(b => b.id === id);

  const students = users.filter(u => u.role === 'student');
  const drivers = users.filter(u => u.role === 'driver');
  const activeTrips = trips.filter(t => t.status === 'otw' || t.status === 'arrived');
  const totalBookings = bookings.filter(b => b.status !== 'cancelled').length;
  const checkedIn = bookings.filter(b => b.status === 'checked_in').length;

  const today = new Date();
  const todayStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page-container max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">{todayStr}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard label="Mahasiswa Terdaftar" value={students.length} emoji="🎓" />
        <StatCard label="Pengemudi Aktif" value={drivers.length} emoji="🚌" />
        <StatCard label="Trip Hari Ini" value={trips.length} emoji="📅" sub={`${activeTrips.length} sedang aktif`} />
        <StatCard label="Total Pemesanan" value={totalBookings} emoji="🎫" sub={`${checkedIn} sudah check-in`} />
        <StatCard label="Unit Bus" value={busUnits.filter(b => b.status === 'active').length} emoji="🚐" sub={`${busUnits.length} total unit`} />
        <StatCard label="Trip Selesai" value={trips.filter(t => t.status === 'completed').length} emoji="✅" />
      </div>

      {/* Bus Units */}
      <div className="mb-6">
        <h2 className="section-title">Unit Bus</h2>
        <div className="space-y-2">
          {busUnits.map(unit => {
            const assignedDriver = users.find(u => u.bus_unit_id === unit.id);
            const assignedTrip = trips.find(t => t.bus_unit_id === unit.id);
            return (
              <div key={unit.id} className="card-binus flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">🚐</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{unit.plate_number}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{unit.seat_capacity} kursi</span>
                    {assignedDriver && <span className="text-xs text-muted-foreground">· 👤 {assignedDriver.name}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    unit.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {unit.status === 'active' ? 'Aktif' : 'Maintenance'}
                  </span>
                  {assignedTrip && (
                    <div className="mt-1">
                      <TripStatusBadge status={assignedTrip.status} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver & Bus Units */}
      <div className="mb-6">
        <h2 className="section-title">Status Pengemudi</h2>
        <div className="space-y-2">
          {drivers.map(driver => {
            const assignedTrip = trips.find(t => t.driver_id === driver.id);
            const driverBusUnit = getBusUnit(driver.bus_unit_id);
            return (
              <div key={driver.id} className="card-binus flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                  {driver.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{driver.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">{driver.driver_id}</span>
                    {driverBusUnit && (
                      <span className="text-[10px] bg-primary/8 text-primary px-1.5 py-0.5 rounded-md font-semibold">
                        🚌 {driverBusUnit.plate_number}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {assignedTrip ? (
                    <div>
                      <TripStatusBadge status={assignedTrip.status} />
                      <p className="text-[10px] text-muted-foreground mt-1">{assignedTrip.departure_time} · {getDirectionLabel(assignedTrip.direction).split(' ')[0]}→</p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Tidak ada trip</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trip List Today */}
      <div className="mb-6">
        <h2 className="section-title">Trip Hari Ini ({trips.length})</h2>
        <div className="space-y-2">
          {trips.map(trip => {
            const tripBookings = bookings.filter(b => b.trip_id === trip.id && b.status !== 'cancelled');
            const driver = users.find(u => u.id === trip.driver_id);
            const tripBusUnit = getBusUnit(trip.bus_unit_id);
            const capacity = tripBusUnit?.seat_capacity || 20;
            const fillPct = Math.round((tripBookings.length / capacity) * 100);
            return (
              <div key={trip.id} className="card-binus">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl px-3 py-2 text-center min-w-[60px] flex-shrink-0 ${
                    trip.status === 'completed' ? 'bg-muted' : 'bg-primary/8'
                  }`}>
                    <span className={`font-black text-sm ${trip.status === 'completed' ? 'text-muted-foreground' : 'text-primary'}`}>
                      {trip.departure_time}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{getDirectionLabel(trip.direction)}</p>
                      {trip.via_binus_square && (
                        <span className="text-[10px] bg-accent/10 text-accent font-bold px-1.5 py-0.5 rounded-md">via Binus Square</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>{tripBookings.length}/{capacity} penumpang</span>
                      {driver && <span>· 👤 {driver.name}</span>}
                      {tripBusUnit && <span className="font-mono text-[10px]">({tripBusUnit.plate_number})</span>}
                    </div>
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden w-32">
                      <div
                        className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-destructive' : fillPct >= 60 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                  <TripStatusBadge status={trip.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="section-title">Pemesanan Terbaru</h2>
        <div className="space-y-2">
          {bookings.filter(b => b.status !== 'cancelled').slice(0, 5).map(b => {
            const student = users.find(u => u.id === b.user_id);
            const trip = trips.find(t => t.id === b.trip_id);
            return (
              <div key={b.id} className="card-binus flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {student?.name.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{student?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {trip?.departure_time} · {trip ? getDirectionLabel(trip.direction).split(' ')[0] : '—'} · Kursi #{b.seat_number}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                  b.status === 'checked_in'
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}>
                  {b.status === 'checked_in' ? '✓ Check-in' : 'Dipesan'}
                </span>
              </div>
            );
          })}
          {bookings.filter(b => b.status !== 'cancelled').length === 0 && (
            <div className="card-binus text-center py-6 text-muted-foreground text-sm">
              Belum ada pemesanan hari ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
