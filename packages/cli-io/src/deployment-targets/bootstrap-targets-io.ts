import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createBootstrapTargetsIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO(
    logger,
    {
      confirmHeader: "Targets bootstrap plan",
      confirmQuestion: "Continue to bootstrap targets?",
      outputHeader: "Targets bootstrap summary",
      outputNoTargets: "No targets bootstrapped",
    },
    writer,
  )
