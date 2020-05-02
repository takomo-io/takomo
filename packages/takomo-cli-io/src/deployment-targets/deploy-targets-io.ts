import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks"
import { CliDeploymentOperationIO } from "./deployment-operation-io"

export class CliDeployTargetsIO extends CliDeploymentOperationIO {
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
        confirmHeader: "Targets deployment plan",
        confirmQuestion: "Continue to deploy targets?",
        outputHeader: "Targets deployment summary",
        outputNoTargets: "No targets deployed",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
