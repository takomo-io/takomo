export {}

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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      reservation: Reservation
    }
  }
}
