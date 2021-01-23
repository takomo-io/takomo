import { AccountsOperationIO } from "@takomo/organization-commands"
import { IOProps } from "../../stacks/common"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createUndeployAccountsIO = (props: IOProps): AccountsOperationIO =>
  createAccountsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Accounts undeployment plan",
      confirmQuestion: "Continue to undeploy accounts?",
      outputHeader: "Accounts undeployment summary",
      outputNoAccounts: "No accounts undeployed",
    },
  })
