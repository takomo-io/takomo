import { AccountsOperationIO } from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createDeployAccountsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): AccountsOperationIO =>
  createAccountsOperationIO(
    logger,
    {
      confirmHeader: "Accounts deployment plan",
      confirmQuestion: "Continue to deploy accounts?",
      outputHeader: "Accounts deployment summary",
      outputNoAccounts: "No accounts deployed",
    },
    writer,
  )
