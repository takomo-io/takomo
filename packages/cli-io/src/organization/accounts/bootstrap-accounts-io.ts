import { AccountsOperationIO } from "@takomo/organization-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createAccountsOperationIO } from "./accounts-operation-io"

export const createBootstrapAccountsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): AccountsOperationIO =>
  createAccountsOperationIO(
    logger,
    {
      confirmHeader: "Accounts bootstrap plan",
      confirmQuestion: "Continue to bootstrap accounts?",
      outputHeader: "Accounts bootstrap summary",
      outputNoAccounts: "No accounts bootstrapped",
    },
    writer,
  )
