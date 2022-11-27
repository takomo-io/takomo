import { deployStacksCommandIamPolicy } from "../../stacks/deploy/iam-policy"
import { undeployStacksCommandIamPolicy } from "../../stacks/undeploy/iam-policy"

export const deployTargetsOperationCommandIamPolicy = (): string =>
  deployStacksCommandIamPolicy()

export const undeployTargetsOperationCommandIamPolicy = (): string =>
  undeployStacksCommandIamPolicy()
