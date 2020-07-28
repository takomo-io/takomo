import { OrganizationalUnitStatus } from "../model"

export const parseOrganizationalUnitStatus = (
  value: any,
): OrganizationalUnitStatus => {
  switch (value) {
    case "active":
      return OrganizationalUnitStatus.ACTIVE
    case "disabled":
      return OrganizationalUnitStatus.DISABLED
    default:
      return OrganizationalUnitStatus.ACTIVE
  }
}
