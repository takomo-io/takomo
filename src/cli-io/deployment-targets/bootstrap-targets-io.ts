import { DeploymentTargetsOperationIO } from "../../command/targets/operation/model"
import { IOProps } from "../stacks/common"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createBootstrapTargetsIO = (
  props: IOProps,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Targets bootstrap plan",
      confirmDescription:
        "A targets bootstrap plan has been created and is shown below. " +
        "Targets will be bootstrapped in the order they are listed.",
      confirmSubheader: "Following targets will be bootstrapped:",
      confirmAnswerCancel: "cancel bootstrapping",
      confirmAnswerContinueAndReview:
        "continue, but let me review changes to each target",
      confirmAnswerContinueNoReview:
        "continue, bootstrap all targets without reviewing changes",
      outputHeader: "Targets bootstrap summary",
      outputNoTargets: "No targets bootstrapped",
    },
  })
