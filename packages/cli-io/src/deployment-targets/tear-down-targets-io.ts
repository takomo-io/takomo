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
      confirmQuestion: "Continue to tear down targets?",
      outputHeader: "Targets tear down summary",
      outputNoTargets: "No targets teared down",
    },
  })
