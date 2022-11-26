import { undeployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy"
import { createTearDownTargetsIO } from "../../takomo-cli-io"
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
