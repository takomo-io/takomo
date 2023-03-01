import { DeploymentTargetsOperationIO } from "../../command/targets/operation/model.js"
import { IOProps } from "../stacks/common.js"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io.js"

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
      confirmAnswerCancel: "cancel undeployment",
      confirmAnswerContinueAndReview:
        "continue, but let me review changes to each target",
      confirmAnswerContinueNoReview:
        "continue, undeploy all targets without reviewing changes",
      outputHeader: "Targets undeployment summary",
      outputNoTargets: "No targets undeployed",
    },
  })
