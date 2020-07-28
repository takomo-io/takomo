import { AccountId } from "@takomo/core"
import { TakomoError } from "@takomo/util"
import { Account } from "aws-sdk/clients/organizations"

export class AccountsMissingFromLocalConfigError extends TakomoError {
  constructor(accounts: Account[]) {
    super(
      `The organization has ${
        accounts.length
      } active account(s) that are not found from the local configuration:\n\n${accounts
        .map(
          (account) =>
            `  - id: ${account.Id}, email: ${account.Email}, name: ${account.Name}`,
        )
        .join("\n")}`,
      {
        info:
          "All active organization accounts need to be present in the local configuration.",
        instructions: [
          "Add missing accounts under the appropriate organizational units.",
        ],
      },
    )
  }
}

export class SuspendedAccountsInLocalConfigError extends TakomoError {
  constructor(accountIds: AccountId[]) {
    super(
      `The local configuration contains ${
        accountIds.length
      } account id(s) that refer to suspended accounts but are not marked as suspended:\n\n${accountIds
        .map((id) => `  - ${id}`)
        .join("\n")}`,
      {
        info:
          "All suspended accounts must be marked as suspended in the local configuration.",
        instructions: [
          "Mark the suspended accounts in the local configuration with 'suspended: true'",
        ],
      },
    )
  }
}

export class NonExistingAccountsInLocalConfigError extends TakomoError {
  constructor(accountIds: AccountId[]) {
    super(
      `The local configuration contains ${
        accountIds.length
      } account id(s) that refer to accounts not found from the organization:\n\n${accountIds
        .map((id) => `  - ${id}`)
        .join("\n")}`,
      {
        info:
          "The local configuration must contain only accounts that are found from the organization.",
        instructions: ["Remove unknown accounts from the local configuration."],
      },
    )
  }
}
