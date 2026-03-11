import { Booking, BusUnit, Trip, User } from '../types';
import { generateTripsForDay } from './schedules';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// ===== BUS UNITS =====
export const mockBusUnits: BusUnit[] = [
  { id: 'bus1', plate_number: 'B 1234 ABC', seat_capacity: 20, status: 'active' },
  { id: 'bus2', plate_number: 'B 5678 DEF', seat_capacity: 20, status: 'active' },
  { id: 'bus3', plate_number: 'B 9012 GHI', seat_capacity: 20, status: 'maintenance' },
];

// ===== USERS =====
export const mockUsers: User[] = [
  { id: 'u1', name: 'Andi Pratama', nim: '2501234567', role: 'student', faculty: 'School of Computer Science', password: 'binus123' },
  { id: 'u2', name: 'Sari Dewi', nim: '2501234568', role: 'student', faculty: 'School of Business Management', password: 'binus123' },
  { id: 'u3', name: 'Budi Santoso', nim: '2501234569', role: 'student', faculty: 'School of Design', password: 'binus123' },
  { id: 'u6', name: 'Staff Admin', admin_id: 'ADM001', role: 'admin', password: 'admin123' },
];

// ===== TRIPS =====
export const initialTrips: Trip[] = generateTripsForDay(today);

// Update some trip statuses for realism
initialTrips.forEach((t) => {
  const [h, m] = t.departure_time.split(':').map(Number);
  const tripMinutes = h * 60 + m;
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  if (tripMinutes < nowMinutes - 90) t.status = 'completed';
  else if (tripMinutes < nowMinutes - 30) t.status = 'arrived';
  else if (tripMinutes < nowMinutes) t.status = 'otw';
});

// Assign bus units to some trips
const firstWaiting = initialTrips.find(t => t.status === 'waiting');
if (firstWaiting) firstWaiting.bus_unit_id = 'bus1';
const secondWaiting = initialTrips.find(t => t.status === 'waiting' && t.id !== firstWaiting?.id);
if (secondWaiting) secondWaiting.bus_unit_id = 'bus2';

// ===== BOOKINGS =====
export const initialBookings: Booking[] = [
  {
    id: 'b1',
    user_id: 'u1',
    trip_id: initialTrips[1]?.id || '',
    seat_number: 3,
    status: 'booked',
    created_at: new Date().toISOString(),
    booked_by: 'u6',
  },
];

// Schema version - increment to auto-reset localStorage on schema changes
const SCHEMA_VERSION = '4';
const SCHEMA_KEY = 'binus_schema_version';

const STORAGE_KEYS = {
  users: 'binus_users',
  trips: 'binus_trips',
  bookings: 'binus_bookings',
  busUnits: 'binus_bus_units',
  currentUser: 'binus_current_user',
};

function initStorage() {
  if (localStorage.getItem(SCHEMA_KEY) !== SCHEMA_VERSION) {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION);
  }
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.trips)) {
    localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(initialTrips));
  }
  if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(initialBookings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.busUnits)) {
    localStorage.setItem(STORAGE_KEYS.busUnits, JSON.stringify(mockBusUnits));
  }
}

export function getBusUnits(): BusUnit[] {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.busUnits) || '[]');
}

export function saveBusUnits(units: BusUnit[]) {
  localStorage.setItem(STORAGE_KEYS.busUnits, JSON.stringify(units));
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

export function getBusUnitById(id: string): BusUnit | undefined {
  return getBusUnits().find(u => u.id === id);
}

export function resetStorage() {
  localStorage.removeItem(STORAGE_KEYS.users);
  localStorage.removeItem(STORAGE_KEYS.trips);
  localStorage.removeItem(STORAGE_KEYS.bookings);
  localStorage.removeItem(STORAGE_KEYS.busUnits);
}
