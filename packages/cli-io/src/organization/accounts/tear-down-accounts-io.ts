import { AccountsOperationIO } from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createTearDownAccountsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): AccountsOperationIO =>
  createAccountsOperationIO(
    logger,
    {
      confirmHeader: "Accounts tear down plan",
      confirmQuestion: "Continue to tear down accounts?",
      outputHeader: "Accounts tear down summary",
      outputNoAccounts: "No accounts teared down",
    },
    writer,
  )
