import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CliAccountsOperationIO } from "./accounts-operation-io"
import { LogWriter } from "@takomo/util"

export class CliUndeployAccountsIO extends CliAccountsOperationIO {
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
        confirmHeader: "Accounts undeployment plan",
        confirmQuestion: "Continue to undeploy accounts?",
        outputHeader: "Accounts undeployment summary",
        outputNoAccounts: "No accounts undeployed",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
