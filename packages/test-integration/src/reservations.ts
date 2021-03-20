import { AccountId } from "@takomo/aws-model"
import { Credentials } from "aws-sdk"

export const withTestAccountIds = (
  testFn: (...accountIds: AccountId[]) => Promise<any>,
): (() => Promise<any>) => {
  const ids = global.reservation.accounts.map((a) => a.accountId as AccountId)
  return () => testFn(...ids)
}

export interface TestReservation {
  readonly credentials: Credentials
  readonly accountIds: ReadonlyArray<AccountId>
}

export const withTestReservation = (
  testFn: (reservation: TestReservation) => Promise<any>,
): (() => Promise<any>) => {
  const credentials = new Credentials(global.reservation.credentials)
  const accountIds = global.reservation.accounts.map((a) => a.accountId!)
  return () => testFn({ credentials, accountIds })
}
