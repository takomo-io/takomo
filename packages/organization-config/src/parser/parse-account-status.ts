import { OrganizationAccountStatus } from "../model"

export const parseAccountStatus = (value: any): OrganizationAccountStatus => {
  switch (value) {
    case "active":
      return OrganizationAccountStatus.ACTIVE
    case "disabled":
      return OrganizationAccountStatus.DISABLED
    case "suspended":
      return OrganizationAccountStatus.SUSPENDED
    default:
      return OrganizationAccountStatus.ACTIVE
  }
}
