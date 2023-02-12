import { createBootstrapTargetsIO } from "../../cli-io"
import { deployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy"
import { GROUPS_OPT } from "./common"
import { targetsDeployCommand } from "./common-deploy"

const command = `bootstrap [${GROUPS_OPT}..]`
const describe = "Bootstrap deployment targets"

export const bootstrapTargetsCmd = targetsDeployCommand({
  command,
  describe,
  configSetType: "bootstrap",
  iamPolicyProvider: deployTargetsOperationCommandIamPolicy,
  io: createBootstrapTargetsIO,
})
