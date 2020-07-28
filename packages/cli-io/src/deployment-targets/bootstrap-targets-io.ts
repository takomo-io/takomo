import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CliDeploymentOperationIO } from "./deployment-operation-io"

export class CliBootstrapTargetsIO extends CliDeploymentOperationIO {
  constructor(
    options: Options,
    stacksDeployIO: (options: Options, loggerName: string) => DeployStacksIO,
    stacksUndeployIO: (
      options: Options,
      loggerName: string,
    ) => UndeployStacksIO,
  ) {
    super(
      options,
      {
        confirmHeader: "Targets bootstrap plan",
        confirmQuestion: "Continue to bootstrap targets?",
        outputHeader: "Targets bootstrap summary",
        outputNoTargets: "No targets bootstrapped",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
