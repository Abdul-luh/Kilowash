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
  day: 'today' | 'tomorrow'
  dayLabel: string
  timeLabel: string
  startTime: string
  endTime: string
  hour24: number // for daylight calculations (e.g. 8.0, 8.5, 9.0 ...)
  isAvailable: boolean
  isPast?: boolean
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
    name: 'Bay Node 01',
    subname: 'Inverter Master A',
    hall: 'Hostel Block C & D Laundry Corridor',
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
    id: 'BAY-02',
    name: 'Bay Node 02',
    subname: 'Inverter Master B',
    hall: 'Hostel Block C & D Laundry Corridor',
    capacity: '10kg Drum • Active Spin Cycle',
    type: 'standard',
    status: 'busy',
    statusLabel: 'Busy (14m)',
    rate: 1500,
    cycleDurationMinutes: 30,
    bufferMinutes: 10,
    remainingMinutes: 14,
    waterTemp: 'Cold Eco',
    solarBatteryLevel: 94,
  },
]

// Generate 30-minute interval slots from 07:00 AM to 09:30 PM
function generate30MinSlots(day: 'today' | 'tomorrow', dayLabel: string): BookingSlot[] {
  const slots: BookingSlot[] = []
  const now = new Date()
  const currentHourDecimal = now.getHours() + now.getMinutes() / 60

  // From 7:00 AM (7.0) to 9:30 PM (21.5)
  for (let h = 7; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m > 30) continue // stop at 21:30

      const startH = h
      const startM = m
      const endTotalM = h * 60 + m + 30
      const endH = Math.floor(endTotalM / 60)
      const endM = endTotalM % 60

      const formatTime = (hour: number, minute: number) => {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayH = hour % 12 === 0 ? 12 : hour % 12
        return `${String(displayH).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
      }

      const startStr = formatTime(startH, startM)
      const endStr = formatTime(endH, endM)
      const hourDecimal = h + m / 60

      // A slot is past if it's today and the time has already passed
      const isPast = day === 'today' && hourDecimal <= currentHourDecimal
      // Simulate a couple occupied slots among future slots
      const isAvailable = !isPast && !(day === 'today' && (hourDecimal === 19.0 || hourDecimal === 20.0))

      slots.push({
        id: `${day}-${h}-${m}`,
        day,
        dayLabel,
        timeLabel: `${startStr} – ${endStr}`,
        startTime: startStr,
        endTime: endStr,
        hour24: hourDecimal,
        isAvailable,
        isPast,
      })
    }
  }
  return slots
}

export const MULTI_DAY_SLOTS: BookingSlot[] = [
  ...generate30MinSlots('today', 'Today'),
  ...generate30MinSlots('tomorrow', 'Tomorrow'),
]

export const MOCK_HISTORY: WashHistoryItem[] = [
  {
    id: 'BK-9482',
    bayId: 'BAY-01',
    bayName: 'Inverter Master A',
    date: 'Today, 22 Nov',
    time: '01:00 PM – 01:30 PM',
    pin: '7394',
    amount: 1500,
    status: 'Active',
  },
  {
    id: 'BK-8291',
    bayId: 'BAY-01',
    bayName: 'Inverter Master A',
    date: '18 Nov 2026',
    time: '04:00 PM – 04:30 PM',
    pin: '4829',
    amount: 1500,
    status: 'Completed',
  },
  {
    id: 'BK-7104',
    bayId: 'BAY-02',
    bayName: 'Inverter Master B',
    date: '14 Nov 2026',
    time: '11:00 AM – 11:30 AM',
    pin: '2105',
    amount: 1700,
    status: 'Completed',
  },
]

export { machineImg, foldedTsImg, foldedShirtsImg, pinImg }
