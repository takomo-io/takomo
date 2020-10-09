import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CliDeploymentOperationIO } from "./deployment-operation-io"
import { LogWriter } from "@takomo/util"

export class CliDeployTargetsIO extends CliDeploymentOperationIO {
  constructor(
    options: Options,
    stacksDeployIO: (options: Options, loggerName: string) => DeployStacksIO,
    stacksUndeployIO: (
      options: Options,
      loggerName: string,
    ) => UndeployStacksIO,
    logWriter: LogWriter = console.log,
  ) {
    super(
      logWriter,
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
