import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks"
import { CliAccountsOperationIO } from "./accounts-operation-io"

export class CliUndeployAccountsIO extends CliAccountsOperationIO {
  constructor(
    options: Options,
    stacksDeployIO: (options: Options, accountId: string) => DeployStacksIO,
    stacksUndeployIO: (options: Options, accountId: string) => UndeployStacksIO,
  ) {
    super(
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
