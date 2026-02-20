export type Role = 'student' | 'driver' | 'admin';
export type DayType = 'senin_kamis' | 'jumat' | 'sabtu';
export type TripStatus = 'waiting' | 'arrived' | 'otw' | 'completed';
export type BookingStatus = 'booked' | 'checked_in' | 'completed' | 'cancelled';
export type RouteDirection = 'anggrek_to_as' | 'as_to_anggrek';
export type BusUnitStatus = 'active' | 'maintenance';

export interface BusUnit {
  id: string;
  plate_number: string;
  seat_capacity: number;
  status: BusUnitStatus;
}

export interface User {
  id: string;
  name: string;
  nim?: string;
  driver_id?: string;
  admin_id?: string;
  role: Role;
  faculty?: string;
  assigned_trip_id?: string;
  password?: string;
  bus_unit_id?: string; // FK to BusUnit.id (driver only)
}

export interface Trip {
  id: string;
  bus_unit_id?: string; // FK to BusUnit.id
  driver_id?: string; // FK to User.id (driver)
  route_from: string;
  route_to: string;
  direction: RouteDirection;
  departure_time: string; // HH:MM
  day_type: DayType;
  via_binus_square: boolean;
  status: TripStatus;
  date?: string; // YYYY-MM-DD
}

export interface Booking {
  id: string;
  user_id: string; // FK to User.id
  trip_id: string; // FK to Trip.id
  seat_number: number;
  status: BookingStatus;
  created_at: string;
}

export interface ScheduleItem {
  time: string;
  via_binus_square: boolean;
  direction: RouteDirection;
  day_type: DayType;
}
