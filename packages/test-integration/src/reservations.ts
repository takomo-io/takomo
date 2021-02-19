import { AccountId } from "@takomo/aws-model"

export const withTestAccountIds = (
  testFn: (...accountIds: AccountId[]) => Promise<any>,
): (() => Promise<any>) => {
  const ids = global.reservation.accounts.map((a) => a.accountId as AccountId)
  return () => testFn(...ids)
}
