import { createUndeployTargetsIO } from "../../cli-io"
import { undeployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy"
import { GROUPS_OPT, targetsOperationCommand } from "./common"

const command = `undeploy [${GROUPS_OPT}..]`
const describe = "Undeploy deployment targets"

export const undeployTargetsCmd = targetsOperationCommand({
  command,
  describe,
  operation: "undeploy",
  iamPolicyProvider: undeployTargetsOperationCommandIamPolicy,
  io: createUndeployTargetsIO,
})
