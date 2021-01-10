import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createDeployTargetsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO(
    logger,
    {
      confirmHeader: "Targets deployment plan",
      confirmQuestion: "Continue to deploy targets?",
      outputHeader: "Targets deployment summary",
      outputNoTargets: "No targets deployed",
    },
    writer,
  )
