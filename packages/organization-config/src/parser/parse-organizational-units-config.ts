import { TkmLogger } from "@takomo/util"
import { OrganizationalUnitsConfig } from "../model"
import { parseOrganizationalUnit } from "./parse-organizational-unit"

export const parseOrganizationalUnitsConfig = (
  logger: TkmLogger,
  value: any,
): OrganizationalUnitsConfig => ({
  Root: parseOrganizationalUnit(logger, "Root", value, [], [], [], [], [], []),
})
