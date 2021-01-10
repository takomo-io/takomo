import { AccountsOperationIO } from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createUndeployAccountsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): AccountsOperationIO =>
  createAccountsOperationIO(
    logger,
    {
      confirmHeader: "Accounts undeployment plan",
      confirmQuestion: "Continue to undeploy accounts?",
      outputHeader: "Accounts undeployment summary",
      outputNoAccounts: "No accounts undeployed",
    },
    writer,
  )
