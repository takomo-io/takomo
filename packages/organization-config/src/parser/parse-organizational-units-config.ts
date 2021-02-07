import { OrganizationalUnitPath } from "@takomo/organization-model"
import { TkmLogger } from "@takomo/util"
import { OrganizationalUnitsConfig } from "../model"
import { parseOrganizationalUnit } from "./parse-organizational-unit"

export const parseOrganizationalUnitsConfig = async (
  logger: TkmLogger,
  externallyLoadedAccounts: Map<OrganizationalUnitPath, ReadonlyArray<unknown>>,
  value: any,
): Promise<OrganizationalUnitsConfig> => ({
  Root: await parseOrganizationalUnit(
    logger,
    externallyLoadedAccounts,
    "Root",
    value,
    [],
    [],
    [],
    [],
    [],
    [],
  ),
})
