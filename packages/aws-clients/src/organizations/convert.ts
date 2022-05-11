import * as CF from "@aws-sdk/client-organizations"
import { Account, AccountStatus, OU, OUPath } from "@takomo/aws-model"

/**
 * @hidden
 */
export const convertOU = (
  ou: CF.OrganizationalUnit,
  parentPath: OUPath,
): OU => ({
  path: parentPath + "/" + ou.Name!,
  id: ou.Id!,
  arn: ou.Arn!,
  name: ou.Name!,
})

/**
 * @hidden
 */
export const convertRoot = (ou: CF.Root): OU => ({
  path: "ROOT",
  id: ou.Id!,
  arn: ou.Arn!,
  name: ou.Name!,
})

/**
 * @hidden
 */
export const convertAccount = (account: CF.Account): Account => ({
  arn: account.Arn!,
  id: account.Id!,
  email: account.Email!,
  name: account.Name!,
  status: account.Status as AccountStatus,
})
