export interface AccountSlot {
  id: string
}

export interface ReservationCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}

export interface Reservation {
  id: string
  accounts: AccountSlot[]
  credentials: ReservationCredentials
}

export interface CustomNodeJsGlobal extends NodeJS.Global {
  reservation: Reservation
}
