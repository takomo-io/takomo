import { AccountId, IamRoleArn, IamRoleName } from "./model.js"

export const makeIamRoleArn = (
  accountId: AccountId,
  roleName: IamRoleName,
): IamRoleArn => `arn:aws:iam::${accountId}:role/${roleName}`
