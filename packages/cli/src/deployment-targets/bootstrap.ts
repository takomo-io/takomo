import { createBootstrapTargetsIO } from "@takomo/cli-io"
import { deployTargetsOperationCommandIamPolicy } from "@takomo/deployment-targets-commands"
import { GROUPS_OPT, targetsOperationCommand } from "./common"

const command = `bootstrap [${GROUPS_OPT}..]`
const describe = "Bootstrap deployment targets"

export const bootstrapTargetsCmd = targetsOperationCommand({
  command,
  describe,
  configSetType: "bootstrap",
  operation: "deploy",
  iamPolicyProvider: deployTargetsOperationCommandIamPolicy,
  io: createBootstrapTargetsIO,
})
