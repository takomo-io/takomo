import { deployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy"
import { createBootstrapTargetsIO } from "../../takomo-cli-io"
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
