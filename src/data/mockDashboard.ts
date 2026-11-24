import machineImg from '../assets/the machine.png'
import foldedTsImg from '../assets/folded Ts.png'
import foldedShirtsImg from '../assets/folded-shirts.png'
import pinImg from '../assets/pin.png'

export interface Bay {
  id: string
  name: string
  subname: string
  hall: string
  capacity: string
  type: 'standard' | 'heavy'
  status: 'available' | 'busy' | 'buffer'
  statusLabel: string
  rate: number
  cycleDurationMinutes: number
  bufferMinutes: number
  remainingMinutes?: number
  waterTemp: string
  solarBatteryLevel: number
}

export interface BookingSlot {
  id: string
  day: 'today' | 'tomorrow' | string
  dateStr?: string
  dayLabel: string
  timeLabel: string
  startTime: string
  endTime: string
  hour24: number // 0.0 to 23.5
  isAvailable: boolean
  isPast?: boolean
  isBooked?: boolean
}

export interface ActiveCycle {
  bookingId: string
  bayId: string
  bayName: string
  pin: string
  remainingSeconds: number
  totalSeconds: number
  stage: 'Wash' | 'Rinse' | 'Spin' | 'Buffer / Unload'
  washType: string
  powerSource: '100% Inverter Solar' | 'Battery Buffer'
}

export interface WashHistoryItem {
  id: string
  bayId: string
  bayName: string
  date: string
  time: string
  pin: string
  amount: number
  status: 'Completed' | 'Forfeited' | 'Active'
}

export const INITIAL_BAYS: Bay[] = [
  {
    id: 'BAY-01',
    name: 'Female Hostel',
    subname: 'Machine 01',
    hall: 'Female Hostel',
    capacity: '10kg Drum • Clean & Primed',
    type: 'standard',
    status: 'available',
    statusLabel: 'Available',
    rate: 1500,
    cycleDurationMinutes: 30,
    bufferMinutes: 10,
    waterTemp: 'Cold Eco',
    solarBatteryLevel: 96,
  },
  {
    id: 'BAY-02',
    name: 'Front-Middle Block',
    subname: 'Machine 02',
    hall: 'Front-middle block',
    capacity: '10kg Drum • Clean & Primed',
    type: 'standard',
    status: 'available',
    statusLabel: 'Available',
    rate: 1500,
    cycleDurationMinutes: 30,
    bufferMinutes: 10,
    waterTemp: 'Cold Eco',
    solarBatteryLevel: 94,
  },
  {
    id: 'BAY-03',
    name: 'PDS Male Hostel',
    subname: 'Machine 03',
    hall: 'PDS Male Hostel',
    capacity: '10kg Drum • Active Spin Cycle',
    type: 'standard',
    status: 'busy',
    statusLabel: 'Busy (12m)',
    rate: 1500,
    cycleDurationMinutes: 30,
    bufferMinutes: 10,
    remainingMinutes: 12,
    waterTemp: 'Cold Eco',
    solarBatteryLevel: 92,
  },
  {
    id: 'BAY-04',
    name: 'PDS Female Hostel',
    subname: 'Machine 04',
    hall: 'PDS Female Hostel',
    capacity: '10kg Drum • Clean & Primed',
    type: 'standard',
    status: 'available',
    statusLabel: 'Available',
    rate: 1500,
    cycleDurationMinutes: 30,
    bufferMinutes: 10,
    waterTemp: 'Cold Eco',
    solarBatteryLevel: 95,
  },
]

// Generate full 24-hour slots (every 30 mins, 48 total slots) for any given target date
export function generate24HourSlotsForDate(targetDate: Date): BookingSlot[] {
  const slots: BookingSlot[] = []
  const now = new Date()

  // Compare year, month, date to determine if targetDate is today
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate()

  const currentHourDecimal = now.getHours() + now.getMinutes() / 60
  const dateStr = targetDate.toISOString().split('T')[0]

  const dayLabel = isToday
    ? `Today, ${targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    : targetDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  // 24 hours: 00:00 to 23:30 (48 half-hour slots)
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const startH = h
      const startM = m
      const endTotalM = h * 60 + m + 30
      const endH = Math.floor(endTotalM / 60) % 24
      const endM = endTotalM % 60

      const formatTime = (hour: number, minute: number) => {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayH = hour % 12 === 0 ? 12 : hour % 12
        return `${String(displayH).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
      }

      const startStr = formatTime(startH, startM)
      const endStr = formatTime(endH, endM)
      const hourDecimal = h + m / 60

      // A slot has passed if date is today and time has already passed
      const isPast = isToday && hourDecimal <= currentHourDecimal

      // Deterministic booked slots for realistic hostel simulation
      const daySeed = targetDate.getDate()
      const isBooked =
        !isPast &&
        ((h === 13 && m === 0) ||
          (h === 18 && m === 30) ||
          (h === 11 && m === 30 && daySeed % 2 === 0) ||
          (h === 15 && m === 0 && daySeed % 3 === 0) ||
          (h === 20 && m === 0))

      const isAvailable = !isPast && !isBooked

      slots.push({
        id: `${dateStr}-${h}-${m}`,
        day: isToday ? 'today' : 'future',
        dateStr,
        dayLabel,
        timeLabel: `${startStr} – ${endStr}`,
        startTime: startStr,
        endTime: endStr,
        hour24: hourDecimal,
        isAvailable,
        isPast,
        isBooked,
      })
    }
  }

  return slots
}

export const MULTI_DAY_SLOTS: BookingSlot[] = [
  ...generate24HourSlotsForDate(new Date()),
]

export const MOCK_HISTORY: WashHistoryItem[] = [
  {
    id: 'BK-9482',
    bayId: 'BAY-01',
    bayName: 'Machine 01',
    date: 'Today, 22 Nov',
    time: '01:00 PM – 01:30 PM',
    pin: '7394',
    amount: 1500,
    status: 'Active',
  },
  {
    id: 'BK-8291',
    bayId: 'BAY-01',
    bayName: 'Machine 01',
    date: '18 Nov 2026',
    time: '04:00 PM – 04:30 PM',
    pin: '4829',
    amount: 1500,
    status: 'Completed',
  },
  {
    id: 'BK-7104',
    bayId: 'BAY-02',
    bayName: 'Machine 02',
    date: '14 Nov 2026',
    time: '11:00 AM – 11:30 AM',
    pin: '2105',
    amount: 1700,
    status: 'Completed',
  },
]

export { machineImg, foldedTsImg, foldedShirtsImg, pinImg }
