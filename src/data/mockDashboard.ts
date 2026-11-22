import machineImg from '../assets/the machine.png'
import foldedTsImg from '../assets/folded Ts.png'
import foldedShirtsImg from '../assets/folded-shirts.png'

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
    cycleDurationMinutes: 35,
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
    cycleDurationMinutes: 35,
    bufferMinutes: 10,
    remainingMinutes: 14,
    waterTemp: 'Cold Eco',
    solarBatteryLevel: 94,
  },
]

export const MULTI_DAY_SLOTS: BookingSlot[] = [
  // Today's Slots
  { id: 'today-1', day: 'today', dayLabel: 'Today', timeLabel: '10:00 AM – 10:45 AM', startTime: '10:00 AM', endTime: '10:45 AM', isAvailable: false, isPast: true },
  { id: 'today-2', day: 'today', dayLabel: 'Today', timeLabel: '11:00 AM – 11:45 AM', startTime: '11:00 AM', endTime: '11:45 AM', isAvailable: false, isPast: true },
  { id: 'today-3', day: 'today', dayLabel: 'Today', timeLabel: '12:00 PM – 12:45 PM', startTime: '12:00 PM', endTime: '12:45 PM', isAvailable: false, isPast: false },
  { id: 'today-4', day: 'today', dayLabel: 'Today', timeLabel: '01:00 PM – 01:45 PM', startTime: '01:00 PM', endTime: '01:45 PM', isAvailable: true, isPast: false },
  { id: 'today-5', day: 'today', dayLabel: 'Today', timeLabel: '02:00 PM – 02:45 PM', startTime: '02:00 PM', endTime: '02:45 PM', isAvailable: true, isPast: false },
  { id: 'today-6', day: 'today', dayLabel: 'Today', timeLabel: '03:00 PM – 03:45 PM', startTime: '03:00 PM', endTime: '03:45 PM', isAvailable: true, isPast: false },
  { id: 'today-7', day: 'today', dayLabel: 'Today', timeLabel: '04:00 PM – 04:45 PM', startTime: '04:00 PM', endTime: '04:45 PM', isAvailable: true, isPast: false },
  { id: 'today-8', day: 'today', dayLabel: 'Today', timeLabel: '05:00 PM – 05:45 PM', startTime: '05:00 PM', endTime: '05:45 PM', isAvailable: true, isPast: false },

  // Tomorrow's Slots (1 day ahead advance booking)
  { id: 'tmr-1', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '08:00 AM – 08:45 AM', startTime: '08:00 AM', endTime: '08:45 AM', isAvailable: true, isPast: false },
  { id: 'tmr-2', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '09:00 AM – 09:45 AM', startTime: '09:00 AM', endTime: '09:45 AM', isAvailable: true, isPast: false },
  { id: 'tmr-3', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '10:00 AM – 10:45 AM', startTime: '10:00 AM', endTime: '10:45 AM', isAvailable: true, isPast: false },
  { id: 'tmr-4', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '11:00 AM – 11:45 AM', startTime: '11:00 AM', endTime: '11:45 AM', isAvailable: true, isPast: false },
  { id: 'tmr-5', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '12:00 PM – 12:45 PM', startTime: '12:00 PM', endTime: '12:45 PM', isAvailable: false, isPast: false },
  { id: 'tmr-6', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '01:00 PM – 01:45 PM', startTime: '01:00 PM', endTime: '01:45 PM', isAvailable: true, isPast: false },
  { id: 'tmr-7', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '02:00 PM – 02:45 PM', startTime: '02:00 PM', endTime: '02:45 PM', isAvailable: true, isPast: false },
  { id: 'tmr-8', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '03:00 PM – 03:45 PM', startTime: '03:00 PM', endTime: '03:45 PM', isAvailable: true, isPast: false },
  { id: 'tmr-9', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '04:00 PM – 04:45 PM', startTime: '04:00 PM', endTime: '04:45 PM', isAvailable: true, isPast: false },
  { id: 'tmr-10', day: 'tomorrow', dayLabel: 'Tomorrow', timeLabel: '05:00 PM – 05:45 PM', startTime: '05:00 PM', endTime: '05:45 PM', isAvailable: true, isPast: false },
]

export const MOCK_HISTORY: WashHistoryItem[] = [
  {
    id: 'BK-9482',
    bayId: 'BAY-01',
    bayName: 'Inverter Master A',
    date: 'Today, 22 Nov',
    time: '01:00 PM – 01:45 PM',
    pin: '7394',
    amount: 1500,
    status: 'Active',
  },
  {
    id: 'BK-8291',
    bayId: 'BAY-01',
    bayName: 'Inverter Master A',
    date: '18 Nov 2026',
    time: '04:00 PM – 04:45 PM',
    pin: '4829',
    amount: 1500,
    status: 'Completed',
  },
  {
    id: 'BK-7104',
    bayId: 'BAY-02',
    bayName: 'Inverter Master B',
    date: '14 Nov 2026',
    time: '11:00 AM – 11:45 AM',
    pin: '2105',
    amount: 1700,
    status: 'Completed',
  },
]

export { machineImg, foldedTsImg, foldedShirtsImg }
