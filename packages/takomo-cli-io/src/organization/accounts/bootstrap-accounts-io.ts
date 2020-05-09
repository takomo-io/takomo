import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CliAccountsOperationIO } from "./accounts-operation-io"

export class CliBootstrapAccountsIO extends CliAccountsOperationIO {
  constructor(
    options: Options,
    stacksDeployIO: (options: Options, accountId: string) => DeployStacksIO,
    stacksUndeployIO: (options: Options, accountId: string) => UndeployStacksIO,
  ) {
    super(
      options,
      {
        confirmHeader: "Accounts bootstrap plan",
        confirmQuestion: "Continue to bootstrap accounts?",
        outputHeader: "Accounts bootstrap summary",
        outputNoAccounts: "No accounts bootstrapped",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
