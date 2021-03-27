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
      confirmDescription:
        "A targets undeployment plan has been created and is shown below. " +
        "Targets will be undeployed in the order they are listed.",
      confirmSubheader: "Following targets will be undeployed:",
      confirmQuestion: "Continue to undeploy targets?",
      outputHeader: "Targets undeployment summary",
      outputNoTargets: "No targets undeployed",
    },
  })
