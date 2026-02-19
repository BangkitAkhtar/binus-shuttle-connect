export type Role = 'student' | 'driver' | 'admin';
export type DayType = 'senin_kamis' | 'jumat' | 'sabtu';
export type TripStatus = 'waiting' | 'otw' | 'arrived' | 'completed';
export type BookingStatus = 'booked' | 'checked_in' | 'completed' | 'cancelled';
export type RouteDirection = 'anggrek_to_as' | 'as_to_anggrek';

export interface User {
  id: string;
  name: string;
  nim?: string;
  driver_id?: string;
  admin_id?: string;
  role: Role;
  faculty?: string;
  assigned_trip_id?: string;
}

export interface Trip {
  id: string;
  route_from: string;
  route_to: string;
  direction: RouteDirection;
  departure_time: string; // HH:MM
  day_type: DayType;
  via_base: boolean;
  status: TripStatus;
  seat_capacity: number;
  driver_id?: string;
  date?: string; // YYYY-MM-DD untuk hari ini
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  seat_number: number;
  status: BookingStatus;
  created_at: string;
}

export interface ScheduleItem {
  time: string;
  via_base: boolean;
  direction: RouteDirection;
  day_type: DayType;
}
