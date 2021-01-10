import { OrganizationalUnitStatus } from "@takomo/organization-model"

export const parseOrganizationalUnitStatus = (
  value: any,
): OrganizationalUnitStatus => {
  switch (value) {
    case "active":
      return "active"
    case "disabled":
      return "disabled"
    default:
      return "active"
  }
}
