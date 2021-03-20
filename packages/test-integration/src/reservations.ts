import { AccountId } from "@takomo/aws-model"
import { Credentials } from "aws-sdk"

export interface TestReservation {
  readonly credentials: Credentials
  readonly accountIds: ReadonlyArray<AccountId>
}

export interface SingleAccountTestReservation {
  readonly credentials: Credentials
  readonly accountId: AccountId
}

export const withReservation = (
  testFn: (reservation: TestReservation) => Promise<any>,
): (() => Promise<any>) => {
  const credentials = new Credentials(global.reservation.credentials)
  const accountIds = global.reservation.accounts.map((a) => a.accountId!)
  return () => testFn({ credentials, accountIds })
}

export const withSingleAccountReservation = (
  testFn: (reservation: SingleAccountTestReservation) => Promise<any>,
): (() => Promise<any>) => {
  const credentials = new Credentials(global.reservation.credentials)
  const accountIds = global.reservation.accounts.map((a) => a.accountId!)
  if (accountIds.length !== 1) {
    throw new Error(`Expected only one account but got ${accountIds.length}`)
  }

  return () => testFn({ credentials, accountId: accountIds[0] })
}
