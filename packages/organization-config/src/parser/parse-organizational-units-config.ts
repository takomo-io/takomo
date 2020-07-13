import { Logger } from "@takomo/util"
import { OrganizationalUnitsConfig } from "../model"
import { parseOrganizationalUnit } from "./parse-organizational-unit"

export const parseOrganizationalUnitsConfig = (
  logger: Logger,
  value: any,
): OrganizationalUnitsConfig => ({
  Root: parseOrganizationalUnit(logger, "Root", value, [], [], [], [], [], []),
})
