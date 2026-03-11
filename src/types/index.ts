export type Role = 'student' | 'admin';
export type DayType = 'senin_kamis' | 'jumat' | 'sabtu';
export type TripStatus = 'waiting' | 'arrived' | 'otw' | 'completed';
export type BookingStatus = 'booked' | 'checked_in' | 'completed' | 'cancelled';
export type TripType = 'single' | 'multi';
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
  admin_id?: string;
  role: Role;
  faculty?: string;
  password?: string;
}

export interface Trip {
  id: string;
  bus_unit_id?: string;
  route_from: string;
  route_to: string;
  direction: RouteDirection;
  departure_time: string;
  day_type: DayType;
  via_binus_square: boolean;
  status: TripStatus;
  date?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  seat_number: number;
  status: BookingStatus;
  created_at: string;
  booked_by?: string; // admin/staff user id who booked
}
