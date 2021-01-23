import { AccountsOperationIO } from "@takomo/organization-commands"
import { IOProps } from "../../stacks/common"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createDeployAccountsIO = (props: IOProps): AccountsOperationIO =>
  createAccountsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Accounts deployment plan",
      confirmQuestion: "Continue to deploy accounts?",
      outputHeader: "Accounts deployment summary",
      outputNoAccounts: "No accounts deployed",
    },
  })
