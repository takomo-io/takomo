/**
 * Identity used to invoke AWS APIs.
 */
import { AccountId, UserId } from "./common"

/**
 * An interface representing caller identity that is bound to AWS credentials.
 */
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
