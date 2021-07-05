import { AccountId } from "@takomo/aws-model"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import R from "ramda"
import { OrganizationAccountConfig, OrganizationalUnitConfig } from "./model"

/**
 * @hidden
 */
export const getOUPaths: (
  ous: ReadonlyArray<OrganizationalUnitConfig>,
) => ReadonlyArray<OrganizationalUnitPath> = R.map(R.prop("path"))

/**
 * @hidden
 */
export const getAccountIds: (
  accounts: ReadonlyArray<OrganizationAccountConfig>,
) => ReadonlyArray<AccountId> = R.map(R.prop("id"))
