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
      confirmQuestion: "Continue to deploy targets?",
      outputHeader: "Targets deployment summary",
      outputNoTargets: "No targets deployed",
    },
  })
