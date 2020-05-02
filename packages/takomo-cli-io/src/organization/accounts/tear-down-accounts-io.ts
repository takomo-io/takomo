import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks"
import { CliAccountsOperationIO } from "./accounts-operation-io"

export class CliTearDownAccountsIO extends CliAccountsOperationIO {
  constructor(
    options: Options,
    stacksDeployIO: (options: Options, accountId: string) => DeployStacksIO,
    stacksUndeployIO: (options: Options, accountId: string) => UndeployStacksIO,
  ) {
    super(
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
