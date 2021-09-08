import { IamRoleName } from "@takomo/aws-model"
import { Vars } from "@takomo/core"
import {
  OrganizationalUnitPath,
  ORGANIZATION_ROOT_OU,
} from "@takomo/organization-model"
import { TkmLogger } from "@takomo/util"
import { OrganizationalUnitsConfig } from "../model"
import { parseOrganizationalUnit } from "./parse-organizational-unit"

export const parseOrganizationalUnitsConfig = async (
  logger: TkmLogger,
  externallyLoadedAccounts: Map<OrganizationalUnitPath, ReadonlyArray<unknown>>,
  value: any,
  vars: Vars,
  inheritedAccountAdminRoleName: IamRoleName,
  inheritedAccountBootstrapRoleName: IamRoleName,
): Promise<OrganizationalUnitsConfig> => ({
  Root: await parseOrganizationalUnit({
    parentLogger: logger,
    externallyLoadedAccounts,
    ouPath: ORGANIZATION_ROOT_OU,
    config: value,
    inheritedVars: vars,
    inheritedAccountAdminRoleName,
    inheritedAccountBootstrapRoleName,
  }),
})
