import { createDeployTargetsIO } from "../../cli-io"
import { deployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy"
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
