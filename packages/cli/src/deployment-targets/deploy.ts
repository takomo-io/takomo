import { createDeployTargetsIO } from "@takomo/cli-io"
import { deployTargetsOperationCommandIamPolicy } from "@takomo/deployment-targets-commands"
import { GROUPS_OPT, targetsOperationCommand } from "./common"

const command = `deploy [${GROUPS_OPT}..]`
const describe = "Deploy deployment targets"

export const deployTargetsCmd = targetsOperationCommand({
  command,
  describe,
  configSetType: "standard",
  operation: "deploy",
  iamPolicyProvider: deployTargetsOperationCommandIamPolicy,
  io: createDeployTargetsIO,
})
