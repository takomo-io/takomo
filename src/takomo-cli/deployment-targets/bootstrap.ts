import { createBootstrapTargetsIO } from "../../takomo-cli-io"
import { deployTargetsOperationCommandIamPolicy } from "../../takomo-deployment-targets-commands"
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
