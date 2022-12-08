import { AccountId, IamRoleArn, IamRoleName } from "./model"

export const makeIamRoleArn = (
  accountId: AccountId,
  roleName: IamRoleName,
): IamRoleArn => `arn:aws:iam::${accountId}:role/${roleName}`
