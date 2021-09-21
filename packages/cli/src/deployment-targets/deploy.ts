import { createDeployTargetsIO } from "@takomo/cli-io"
import { deployTargetsOperationCommandIamPolicy } from "@takomo/deployment-targets-commands"
import { GROUPS_OPT } from "./common"
import { targetsDeployCommand } from "./common-deploy"

const command = `deploy [${GROUPS_OPT}..]`
const describe = "Deploy deployment targets"

export const deployTargetsCmd = targetsDeployCommand({
  command,
  describe,
  configSetType: "standard",
  iamPolicyProvider: deployTargetsOperationCommandIamPolicy,
  io: createDeployTargetsIO,
})
