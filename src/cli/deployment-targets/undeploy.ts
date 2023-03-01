import { createUndeployTargetsIO } from "../../cli-io/index.js"
import { undeployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy.js"
import { GROUPS_OPT, targetsOperationCommand } from "./common.js"

const command = `undeploy [${GROUPS_OPT}..]`
const describe = "Undeploy deployment targets"

export const undeployTargetsCmd = targetsOperationCommand({
  command,
  describe,
  operation: "undeploy",
  iamPolicyProvider: undeployTargetsOperationCommandIamPolicy,
  io: createUndeployTargetsIO,
})
