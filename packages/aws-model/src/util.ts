import { AccountId, IamRoleArn, IamRoleName } from "./common"

export const makeIamRoleArn = (
  accountId: AccountId,
  roleName: IamRoleName,
): IamRoleArn => `arn:aws:iam::${accountId}:role/${roleName}`
