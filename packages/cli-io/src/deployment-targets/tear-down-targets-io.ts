import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createTearDownTargetsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO(
    logger,
    {
      confirmHeader: "Targets tear down plan",
      confirmQuestion: "Continue to tear down targets?",
      outputHeader: "Targets tear down summary",
      outputNoTargets: "No targets teared down",
    },
    writer,
  )
