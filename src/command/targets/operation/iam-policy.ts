import { deployStacksCommandIamPolicy } from "../../stacks/deploy/iam-policy.js"
import { undeployStacksCommandIamPolicy } from "../../stacks/undeploy/iam-policy.js"

export const deployTargetsOperationCommandIamPolicy = (): string =>
  deployStacksCommandIamPolicy()

export const undeployTargetsOperationCommandIamPolicy = (): string =>
  undeployStacksCommandIamPolicy()
