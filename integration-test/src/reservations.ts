import { Credentials } from "@aws-sdk/types"
import { AccountId } from "../../src/aws/common/model"
import { CustomNodeJsGlobal } from "./global"

// Make references to global namespace work
declare const global: CustomNodeJsGlobal

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
  const credentials = global.reservation.credentials
  const accountIds = global.reservation.accounts.map((a) => a.id)
  return () => testFn({ credentials, accountIds })
}

export const withSingleAccountReservation = (
  testFn: (reservation: SingleAccountTestReservation) => Promise<any>,
): (() => Promise<any>) => {
  const credentials = global.reservation.credentials
  const accountIds = global.reservation.accounts.map((a) => a.id)
  if (accountIds.length !== 1) {
    throw new Error(`Expected only one account but got ${accountIds.length}`)
  }

  return () => testFn({ credentials, accountId: accountIds[0] })
}
