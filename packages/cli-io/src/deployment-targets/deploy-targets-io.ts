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
      confirmQuestion: "Continue to deploy targets?",
      outputHeader: "Targets deployment summary",
      outputNoTargets: "No targets deployed",
    },
  })
