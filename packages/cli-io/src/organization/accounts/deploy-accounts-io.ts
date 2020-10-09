import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CliAccountsOperationIO } from "./accounts-operation-io"
import { LogWriter } from "@takomo/util"

export class CliDeployAccountsIO extends CliAccountsOperationIO {
  constructor(
    options: Options,
    stacksDeployIO: (options: Options, accountId: string) => DeployStacksIO,
    stacksUndeployIO: (options: Options, accountId: string) => UndeployStacksIO,
    logWriter: LogWriter = console.log,
  ) {
    super(
      logWriter,
      options,
      {
        confirmHeader: "Accounts deployment plan",
        confirmQuestion: "Continue to deploy accounts?",
        outputHeader: "Accounts deployment summary",
        outputNoAccounts: "No accounts deployed",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
