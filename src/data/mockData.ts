import { Booking, Trip, User } from '../types';
import { generateTripsForDay } from './schedules';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Andi Pratama', nim: '2501234567', role: 'student', faculty: 'School of Computer Science' },
  { id: 'u2', name: 'Sari Dewi', nim: '2501234568', role: 'student', faculty: 'School of Business Management' },
  { id: 'u3', name: 'Budi Santoso', nim: '2501234569', role: 'student', faculty: 'School of Design' },
  { id: 'u4', name: 'Ahmad Driver', driver_id: 'DRV001', role: 'driver', assigned_trip_id: `${todayStr}-ang-1` },
  { id: 'u5', name: 'Hendra Kusuma', driver_id: 'DRV002', role: 'driver', assigned_trip_id: `${todayStr}-as-0` },
  { id: 'u6', name: 'Super Admin', admin_id: 'ADM001', role: 'admin' },
];

export const initialTrips: Trip[] = generateTripsForDay(today);

// Update some trip statuses for realism
initialTrips.forEach((t, i) => {
  const [h, m] = t.departure_time.split(':').map(Number);
  const tripMinutes = h * 60 + m;
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  if (tripMinutes < nowMinutes - 90) t.status = 'completed';
  else if (tripMinutes < nowMinutes - 30) t.status = 'arrived';
  else if (tripMinutes < nowMinutes) t.status = 'otw';
});

// Assign drivers to first 2 trips
if (initialTrips[0]) initialTrips[0].driver_id = 'u4';
if (initialTrips.find(t => t.direction === 'as_to_anggrek')) {
  const t = initialTrips.find(t => t.direction === 'as_to_anggrek')!;
  t.driver_id = 'u5';
}

export const initialBookings: Booking[] = [
  {
    id: 'b1',
    user_id: 'u1',
    trip_id: initialTrips[1]?.id || '',
    seat_number: 3,
    status: 'booked',
    created_at: new Date().toISOString(),
  },
];

// Storage keys
const STORAGE_KEYS = {
  users: 'binus_users',
  trips: 'binus_trips',
  bookings: 'binus_bookings',
  currentUser: 'binus_current_user',
};

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.trips)) {
    localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(initialTrips));
  }
  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(initialBookings));
  }
}

export function getUsers(): User[] {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
}

export function getTrips(): Trip[] {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.trips) || '[]');
}

export function getBookings(): Booking[] {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]');
}

export function saveTrips(trips: Trip[]) {
  localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(trips));
}

export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  const u = localStorage.getItem(STORAGE_KEYS.currentUser);
  return u ? JSON.parse(u) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export function getBookingsForTrip(tripId: string): Booking[] {
  return getBookings().filter(b => b.trip_id === tripId && b.status !== 'cancelled');
}

export function getBookingsForUser(userId: string): Booking[] {
  return getBookings().filter(b => b.user_id === userId && b.status !== 'cancelled');
}

export function resetStorage() {
  localStorage.removeItem(STORAGE_KEYS.users);
  localStorage.removeItem(STORAGE_KEYS.trips);
  localStorage.removeItem(STORAGE_KEYS.bookings);
}
