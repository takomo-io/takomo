import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { IOProps } from "../stacks/common"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createDeployTargetsIO = (
  props: IOProps,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Targets deployment plan",
      confirmDescription:
        "A targets deployment plan has been created and is shown below. " +
        "Targets will be deployed in the order they are listed.",
      confirmSubheader: "Following targets will be deployed:",
      confirmAnswerCancel: "cancel deployment",
      confirmAnswerContinueAndReview:
        "continue, but let me review changes to each target",
      confirmAnswerContinueNoReview:
        "continue, deploy all targets without reviewing changes",
      outputHeader: "Targets deployment summary",
      outputNoTargets: "No targets deployed",
    },
  })
