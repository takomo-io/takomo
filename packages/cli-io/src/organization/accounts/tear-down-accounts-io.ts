import { AccountsOperationIO } from "@takomo/organization-commands"
import { IOProps } from "../../stacks/common"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createTearDownAccountsIO = (props: IOProps): AccountsOperationIO =>
  createAccountsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Accounts tear down plan",
      confirmQuestion: "Continue to tear down accounts?",
      outputHeader: "Accounts tear down summary",
      outputNoAccounts: "No accounts teared down",
    },
  })
