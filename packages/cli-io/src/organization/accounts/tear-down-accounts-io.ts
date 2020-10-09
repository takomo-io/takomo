import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CliAccountsOperationIO } from "./accounts-operation-io"
import { LogWriter } from "@takomo/util"

export class CliTearDownAccountsIO extends CliAccountsOperationIO {
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
        confirmHeader: "Accounts tear down plan",
        confirmQuestion: "Continue to tear down accounts?",
        outputHeader: "Accounts tear down summary",
        outputNoAccounts: "No accounts teared down",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
