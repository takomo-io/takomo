/**
 * Identity used to invoke AWS APIs.
 */
import { AccountId, UserId } from "./common"

export interface CallerIdentity {
  /**
   * Identity ARN.
   */
  readonly arn: string

  /**
   * User id.
   */
  readonly userId: UserId

  /**
   * Account id.
   */
  readonly accountId: AccountId
}
