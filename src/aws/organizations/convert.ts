import * as CF from "@aws-sdk/client-organizations"
import { AccountStatus } from "../common/model.js"
import { Account, OU, OUPath } from "./model.js"

export const convertOU = (
  ou: CF.OrganizationalUnit,
  parentPath: OUPath,
): OU => ({
  path: parentPath + "/" + ou.Name!,
  id: ou.Id!,
  arn: ou.Arn!,
  name: ou.Name!,
})

export const convertRoot = (ou: CF.Root): OU => ({
  path: "ROOT",
  id: ou.Id!,
  arn: ou.Arn!,
  name: ou.Name!,
})

export const convertAccount = (account: CF.Account): Account => ({
  arn: account.Arn!,
  id: account.Id!,
  email: account.Email!,
  name: account.Name!,
  status: account.Status as AccountStatus,
})
