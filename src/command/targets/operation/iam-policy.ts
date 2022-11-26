import { deployStacksCommandIamPolicy } from "../../../command/stacks/deploy/iam-policy"
import { undeployStacksCommandIamPolicy } from "../../../command/stacks/undeploy/iam-policy"

export const deployTargetsOperationCommandIamPolicy = (): string =>
  deployStacksCommandIamPolicy()

export const undeployTargetsOperationCommandIamPolicy = (): string =>
  undeployStacksCommandIamPolicy()
