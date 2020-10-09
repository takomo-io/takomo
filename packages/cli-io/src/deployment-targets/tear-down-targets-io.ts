import { Options } from "@takomo/core"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { CliDeploymentOperationIO } from "./deployment-operation-io"
import { LogWriter } from "@takomo/util"

export class CliTearDownTargetsIO extends CliDeploymentOperationIO {
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
        confirmHeader: "Targets tear down plan",
        confirmQuestion: "Continue to tear down targets?",
        outputHeader: "Targets tear down summary",
        outputNoTargets: "No targets teared down",
      },
      stacksDeployIO,
      stacksUndeployIO,
    )
  }
}
