import { OrganizationAccountStatus } from "@takomo/organization-model"

export const parseAccountStatus = (value: any): OrganizationAccountStatus => {
  switch (value) {
    case "active":
      return "active"
    case "disabled":
      return "disabled"
    case "suspended":
      return "suspended"
    default:
      return "active"
  }
}
