import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { IOProps } from "../stacks/common"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createUndeployTargetsIO = (
  props: IOProps,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Targets undeployment plan",
      confirmQuestion: "Continue to undeploy targets?",
      outputHeader: "Targets undeployment summary",
      outputNoTargets: "No targets undeployed",
    },
  })
