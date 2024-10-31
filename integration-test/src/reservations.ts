import { AwsCredentialIdentity } from "@aws-sdk/types"
import { AccountId } from "../../src/aws/common/model.js"

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

export const getReservation = (): Reservation => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return global.reservation as Reservation
}

export interface TestReservation {
  readonly credentials: AwsCredentialIdentity
  readonly accountIds: ReadonlyArray<AccountId>
}

export interface SingleAccountTestReservation {
  readonly credentials: AwsCredentialIdentity
  readonly accountId: AccountId
}

export const withReservation = (
  testFn: (reservation: TestReservation) => Promise<unknown>,
): (() => Promise<unknown>) => {
  const reservation = getReservation()
  const credentials = reservation.credentials
  const accountIds = reservation.accounts.map((a) => a.id)
  return () => testFn({ credentials, accountIds })
}

export const withSingleAccountReservation = (
  testFn: (reservation: SingleAccountTestReservation) => Promise<unknown>,
): (() => Promise<unknown>) => {
  const reservation = getReservation()
  const credentials = reservation.credentials
  const accountIds = reservation.accounts.map((a) => a.id)
  if (accountIds.length !== 1) {
    throw new Error(`Expected only one account but got ${accountIds.length}`)
  }

  return () => testFn({ credentials, accountId: accountIds[0] })
}
