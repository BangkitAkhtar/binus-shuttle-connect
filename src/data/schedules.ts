import { DayType, RouteDirection, Trip } from '../types';

interface ScheduleEntry {
  time: string;
  via_base: boolean;
  direction: RouteDirection;
  day_type: DayType;
}

export const scheduleData: Record<DayType, { anggrek_to_as: ScheduleEntry[]; as_to_anggrek: ScheduleEntry[] }> = {
  senin_kamis: {
    anggrek_to_as: [
      { time: '06:05', via_base: false, direction: 'anggrek_to_as', day_type: 'senin_kamis' },
      { time: '07:30', via_base: true,  direction: 'anggrek_to_as', day_type: 'senin_kamis' },
      { time: '10:10', via_base: false, direction: 'anggrek_to_as', day_type: 'senin_kamis' },
      { time: '12:10', via_base: false, direction: 'anggrek_to_as', day_type: 'senin_kamis' },
      { time: '14:10', via_base: false, direction: 'anggrek_to_as', day_type: 'senin_kamis' },
      { time: '15:30', via_base: false, direction: 'anggrek_to_as', day_type: 'senin_kamis' },
      { time: '17:30', via_base: false, direction: 'anggrek_to_as', day_type: 'senin_kamis' },
    ],
    as_to_anggrek: [
      { time: '07:30', via_base: false, direction: 'as_to_anggrek', day_type: 'senin_kamis' },
      { time: '09:30', via_base: false, direction: 'as_to_anggrek', day_type: 'senin_kamis' },
      { time: '11:30', via_base: false, direction: 'as_to_anggrek', day_type: 'senin_kamis' },
      { time: '13:30', via_base: false, direction: 'as_to_anggrek', day_type: 'senin_kamis' },
      { time: '15:30', via_base: false, direction: 'as_to_anggrek', day_type: 'senin_kamis' },
      { time: '17:30', via_base: false, direction: 'as_to_anggrek', day_type: 'senin_kamis' },
      { time: '19:10', via_base: true,  direction: 'as_to_anggrek', day_type: 'senin_kamis' },
    ],
  },
  jumat: {
    anggrek_to_as: [
      { time: '06:05', via_base: false, direction: 'anggrek_to_as', day_type: 'jumat' },
      { time: '07:30', via_base: true,  direction: 'anggrek_to_as', day_type: 'jumat' },
      { time: '10:10', via_base: false, direction: 'anggrek_to_as', day_type: 'jumat' },
      { time: '12:40', via_base: false, direction: 'anggrek_to_as', day_type: 'jumat' },
      { time: '14:10', via_base: false, direction: 'anggrek_to_as', day_type: 'jumat' },
      { time: '15:30', via_base: false, direction: 'anggrek_to_as', day_type: 'jumat' },
      { time: '17:30', via_base: false, direction: 'anggrek_to_as', day_type: 'jumat' },
    ],
    as_to_anggrek: [
      { time: '07:30', via_base: false, direction: 'as_to_anggrek', day_type: 'jumat' },
      { time: '09:30', via_base: false, direction: 'as_to_anggrek', day_type: 'jumat' },
      { time: '11:10', via_base: false, direction: 'as_to_anggrek', day_type: 'jumat' },
      { time: '13:30', via_base: false, direction: 'as_to_anggrek', day_type: 'jumat' },
      { time: '15:30', via_base: false, direction: 'as_to_anggrek', day_type: 'jumat' },
      { time: '17:30', via_base: false, direction: 'as_to_anggrek', day_type: 'jumat' },
      { time: '19:10', via_base: true,  direction: 'as_to_anggrek', day_type: 'jumat' },
    ],
  },
  sabtu: {
    anggrek_to_as: [
      { time: '06:05', via_base: false, direction: 'anggrek_to_as', day_type: 'sabtu' },
      { time: '07:30', via_base: false, direction: 'anggrek_to_as', day_type: 'sabtu' },
      { time: '10:10', via_base: false, direction: 'anggrek_to_as', day_type: 'sabtu' },
      { time: '12:10', via_base: false, direction: 'anggrek_to_as', day_type: 'sabtu' },
      { time: '15:30', via_base: false, direction: 'anggrek_to_as', day_type: 'sabtu' },
    ],
    as_to_anggrek: [
      { time: '07:30', via_base: false, direction: 'as_to_anggrek', day_type: 'sabtu' },
      { time: '11:30', via_base: false, direction: 'as_to_anggrek', day_type: 'sabtu' },
      { time: '13:30', via_base: false, direction: 'as_to_anggrek', day_type: 'sabtu' },
      { time: '15:30', via_base: false, direction: 'as_to_anggrek', day_type: 'sabtu' },
      { time: '17:10', via_base: false, direction: 'as_to_anggrek', day_type: 'sabtu' },
    ],
  },
};

export function getDayType(date: Date): DayType {
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (day === 5) return 'jumat';
  if (day === 6) return 'sabtu';
  if (day === 0) return 'sabtu'; // Sunday treated as Saturday schedule
  return 'senin_kamis';
}

export function generateTripsForDay(date: Date): Trip[] {
  const dayType = getDayType(date);
  const dateStr = date.toISOString().split('T')[0];
  const schedule = scheduleData[dayType];
  const trips: Trip[] = [];

  schedule.anggrek_to_as.forEach((entry, idx) => {
    trips.push({
      id: `${dateStr}-ang-${idx}`,
      route_from: 'Kampus Anggrek',
      route_to: 'Main Campus Alam Sutera',
      direction: 'anggrek_to_as',
      departure_time: entry.time,
      day_type: dayType,
      via_base: entry.via_base,
      status: 'waiting',
      seat_capacity: 20,
      date: dateStr,
    });
  });

  schedule.as_to_anggrek.forEach((entry, idx) => {
    trips.push({
      id: `${dateStr}-as-${idx}`,
      route_from: 'Main Campus Alam Sutera',
      route_to: 'Kampus Anggrek',
      direction: 'as_to_anggrek',
      departure_time: entry.time,
      day_type: dayType,
      via_base: entry.via_base,
      status: 'waiting',
      seat_capacity: 20,
      date: dateStr,
    });
  });

  return trips;
}

export function getDirectionLabel(direction: string): string {
  return direction === 'anggrek_to_as'
    ? 'Anggrek → Alam Sutera'
    : 'Alam Sutera → Anggrek';
}

export function getDayTypeLabel(dayType: DayType): string {
  const map: Record<DayType, string> = {
    senin_kamis: 'Senin – Kamis',
    jumat: 'Jumat',
    sabtu: 'Sabtu',
  };
  return map[dayType];
}
