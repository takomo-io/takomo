import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createUndeployTargetsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO(
    logger,
    {
      confirmHeader: "Targets undeployment plan",
      confirmQuestion: "Continue to undeploy targets?",
      outputHeader: "Targets undeployment summary",
      outputNoTargets: "No targets undeployed",
    },
    writer,
  )
