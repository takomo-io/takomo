import { DeploymentTargetsOperationIO } from "@takomo/deployment-targets-commands"
import { IOProps } from "../stacks/common"
import { createDeploymentTargetsOperationIO } from "./deployment-operation-io"

export const createBootstrapTargetsIO = (
  props: IOProps,
): DeploymentTargetsOperationIO =>
  createDeploymentTargetsOperationIO({
    ...props,
    messages: {
      confirmHeader: "Targets bootstrap plan",
      confirmQuestion: "Continue to bootstrap targets?",
      outputHeader: "Targets bootstrap summary",
      outputNoTargets: "No targets bootstrapped",
    },
  })
