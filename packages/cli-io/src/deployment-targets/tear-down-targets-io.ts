import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { IOProps } from "../stacks/common"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createTearDownTargetsIO = (
  props: IOProps,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Targets tear down plan",
      confirmDescription:
        "A targets tear down plan has been created and is shown below. " +
        "Targets will be teared down in the order they are listed.",
      confirmSubheader: "Following targets will be teared down:",
      confirmAnswerCancel: "cancel tear down",
      confirmAnswerContinueAndReview:
        "continue, but let me review changes to each target",
      confirmAnswerContinueNoReview:
        "continue, tear down all targets without reviewing changes",
      outputHeader: "Targets tear down summary",
      outputNoTargets: "No targets teared down",
    },
  })
