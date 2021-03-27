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
      confirmDescription:
        "A targets bootstrap plan has been created and is shown below. " +
        "Targets will be bootstrapped in the order they are listed.",
      confirmSubheader: "Following targets will be bootstrapped:",
      confirmQuestion: "Continue to bootstrap targets?",
      outputHeader: "Targets bootstrap summary",
      outputNoTargets: "No targets bootstrapped",
    },
  })
