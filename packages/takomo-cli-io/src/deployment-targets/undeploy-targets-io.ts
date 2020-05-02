import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks"
import { CliDeploymentOperationIO } from "./deployment-operation-io"

export class CliUndeployTargetsIO extends CliDeploymentOperationIO {
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
        confirmHeader: "Targets undeployment plan",
        confirmQuestion: "Continue to undeploy targets?",
        outputHeader: "Targets undeployment summary",
        outputNoTargets: "No targets undeployed",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
