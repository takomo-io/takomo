import { createTearDownTargetsIO } from "../../cli-io"
import { undeployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy"
import { GROUPS_OPT, targetsOperationCommand } from "./common"

const command = `tear-down [${GROUPS_OPT}..]`
const describe = "Tear down deployment targets"

export const tearDownTargetsCmd = targetsOperationCommand({
  command,
  describe,
  configSetType: "bootstrap",
  operation: "undeploy",
  iamPolicyProvider: undeployTargetsOperationCommandIamPolicy,
  io: createTearDownTargetsIO,
})
