import { AccountId } from "@takomo/aws-model"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import {
  ACCOUNT_ID_OPT,
  CONCURRENT_ACCOUNTS_OPT,
  ORGANIZATIONAL_UNITS_OPT,
} from "../../constants"

export type AccountOperationCommandArgs = {
  readonly [ORGANIZATIONAL_UNITS_OPT]: ReadonlyArray<OrganizationalUnitPath>
  readonly [ACCOUNT_ID_OPT]: ReadonlyArray<AccountId>
  readonly [CONCURRENT_ACCOUNTS_OPT]: number
}
