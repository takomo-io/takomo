import { AccountsOperationIO } from "@takomo/organization-commands"
import { IOProps } from "../../stacks/common"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createBootstrapAccountsIO = (
  props: IOProps,
): AccountsOperationIO =>
  createAccountsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Accounts bootstrap plan",
      confirmQuestion: "Continue to bootstrap accounts?",
      outputHeader: "Accounts bootstrap summary",
      outputNoAccounts: "No accounts bootstrapped",
    },
  })
