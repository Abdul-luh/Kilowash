import machineImg from '../assets/the machine.png'

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
    statusLabel: 'AVAILABLE',
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
    statusLabel: 'BUSY • 14M',
    rate: 1500,
    cycleDurationMinutes: 35,
    bufferMinutes: 10,
    remainingMinutes: 14,
    waterTemp: 'Cold Eco',
    solarBatteryLevel: 94,
  },
]

export const TODAY_SLOTS: BookingSlot[] = [
  { id: 'slot-1', timeLabel: '10:00 AM – 10:45 AM', startTime: '10:00 AM', endTime: '10:45 AM', isAvailable: false, isPast: true },
  { id: 'slot-2', timeLabel: '11:00 AM – 11:45 AM', startTime: '11:00 AM', endTime: '11:45 AM', isAvailable: false, isPast: true },
  { id: 'slot-3', timeLabel: '12:00 PM – 12:45 PM', startTime: '12:00 PM', endTime: '12:45 PM', isAvailable: false, isPast: false },
  { id: 'slot-4', timeLabel: '01:00 PM – 01:45 PM', startTime: '01:00 PM', endTime: '01:45 PM', isAvailable: true, isPast: false },
  { id: 'slot-5', timeLabel: '02:00 PM – 02:45 PM', startTime: '02:00 PM', endTime: '02:45 PM', isAvailable: true, isPast: false },
  { id: 'slot-6', timeLabel: '03:00 PM – 03:45 PM', startTime: '03:00 PM', endTime: '03:45 PM', isAvailable: true, isPast: false },
  { id: 'slot-7', timeLabel: '04:00 PM – 04:45 PM', startTime: '04:00 PM', endTime: '04:45 PM', isAvailable: true, isPast: false },
  { id: 'slot-8', timeLabel: '05:00 PM – 05:45 PM', startTime: '05:00 PM', endTime: '05:45 PM', isAvailable: true, isPast: false },
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

export { machineImg }
