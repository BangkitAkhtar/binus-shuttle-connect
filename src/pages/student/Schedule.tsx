import { useState, useEffect } from 'react';
import { DayType } from '../../types';
import { scheduleData, getDayType, getDirectionLabel } from '../../data/schedules';
import { getTrips, getBookings, getBookingsForUser, saveBookings, getUsers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Trip, Booking } from '../../types';

const dayTabs: { key: DayType; label: string }[] = [
  { key: 'senin_kamis', label: 'Senin–Kamis' },
  { key: 'jumat', label: "Jum'at" },
  { key: 'sabtu', label: 'Sabtu' },
];

function QRPlaceholder({ bookingId }: { bookingId: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl">
      <div className="w-24 h-24 bg-foreground/5 border-2 border-dashed border-border rounded-lg flex items-center justify-center relative">
        {/* QR Pattern */}
        <div className="grid grid-cols-7 gap-px p-1">
          {Array.from({ length: 49 }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-[1px] ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-mono">{bookingId.slice(0, 8).toUpperCase()}</p>
      <p className="text-xs text-muted-foreground">Tunjukkan saat boarding</p>
    </div>
  );
}

export default function StudentSchedule() {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState<DayType>(getDayType(new Date()));
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [booked, setBooked] = useState<string[]>([]);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setTrips(getTrips());
    const userBookings = getBookingsForUser(user!.id);
    setBooked(userBookings.map(b => b.trip_id));
    setBookings(getBookings());
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBook = async (trip: Trip) => {
    const allBookings = getBookings();
    const tripBookings = allBookings.filter(b => b.trip_id === trip.id && b.status !== 'cancelled');
    if (tripBookings.length >= trip.seat_capacity) { showToast('Maaf, kursi penuh!'); return; }
    
    setLoading(trip.id);
    await new Promise(r => setTimeout(r, 500));

    const nextSeat = Math.max(0, ...tripBookings.map(b => b.seat_number)) + 1;
    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      user_id: user!.id,
      trip_id: trip.id,
      seat_number: nextSeat,
      status: 'booked',
      created_at: new Date().toISOString(),
    };
    const updated = [...allBookings, newBooking];
    saveBookings(updated);
    setBookings(updated);
    setBooked(prev => [...prev, trip.id]);
    setLoading(null);
    showToast('✅ Berhasil memesan kursi!');
  };

  const getTripsForScheduleEntry = (time: string, direction: string): Trip | undefined => {
    return trips.find(t => t.departure_time === time && t.direction === direction && t.day_type === activeDay);
  };

  const getTripBookingCount = (tripId: string) => {
    return bookings.filter(b => b.trip_id === tripId && b.status !== 'cancelled').length;
  };

  const getUserBookingForTrip = (tripId: string): Booking | undefined => {
    return bookings.find(b => b.trip_id === tripId && b.user_id === user!.id && b.status !== 'cancelled');
  };

  const schedule = scheduleData[activeDay];

  return (
    <div className="page-container max-w-2xl mx-auto animate-fade-in">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Jadwal Shuttle</h1>
        <p className="text-sm text-muted-foreground">Anggrek ↔ Alam Sutera</p>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 mb-5">
        {dayTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveDay(tab.key)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${activeDay === tab.key ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-column schedule */}
      <div className="grid grid-cols-1 gap-4">
        {(['anggrek_to_as', 'as_to_anggrek'] as const).map(dir => (
          <div key={dir}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ background: 'var(--gradient-primary)' }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-foreground">{getDirectionLabel(dir)}</h2>
            </div>
            <div className="space-y-2">
              {schedule[dir].map((entry, i) => {
                const trip = getTripsForScheduleEntry(entry.time, dir);
                const isBooked = trip ? booked.includes(trip.id) : false;
                const booking = trip ? getUserBookingForTrip(trip.id) : undefined;
                const bookedCount = trip ? getTripBookingCount(trip.id) : 0;
                const isFull = trip ? bookedCount >= trip.seat_capacity : false;
                const isCompleted = trip?.status === 'completed';

                return (
                  <div key={i} className={`schedule-card ${isCompleted ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`text-center rounded-xl px-3 py-2 min-w-[60px] ${isBooked ? 'bg-success/10' : 'bg-primary/8'}`}>
                        <span className={`text-base font-black ${isBooked ? 'text-success' : 'text-primary'}`}>{entry.time}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {entry.via_base && (
                            <span className="text-xs bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded-md">via BASE</span>
                          )}
                          {trip && (
                            <span className="text-xs text-muted-foreground">
                              {trip.seat_capacity - bookedCount}/{trip.seat_capacity} kursi
                            </span>
                          )}
                        </div>
                        {isBooked && booking && (
                          <p className="text-xs text-success font-medium mt-0.5">Kursi #{booking.seat_number}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isBooked && booking ? (
                        <button
                          onClick={() => setShowQR(showQR === booking.id ? null : booking.id)}
                          className="text-xs bg-success/10 text-success border border-success/30 px-3 py-1.5 rounded-lg font-semibold"
                        >
                          QR Code
                        </button>
                      ) : (
                        <button
                          onClick={() => trip && !isCompleted && !isFull && handleBook(trip)}
                          disabled={!trip || isCompleted || isFull || loading === trip?.id}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            !trip || isCompleted ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                            isFull ? 'bg-destructive/10 text-destructive border border-destructive/20 cursor-not-allowed' :
                            'btn-primary'
                          }`}
                        >
                          {loading === trip?.id ? '...' : isFull ? 'Penuh' : 'Pesan'}
                        </button>
                      )}
                    </div>
                    {showQR === booking?.id && (
                      <div className="w-full mt-3 col-span-2">
                        <QRPlaceholder bookingId={booking.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
