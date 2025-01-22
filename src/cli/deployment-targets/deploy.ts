import { createDeployTargetsIO } from "../../cli-io/deployment-targets/deploy-targets-io.js"
import { deployTargetsOperationCommandIamPolicy } from "../../command/targets/operation/iam-policy.js"
import { targetsDeployCommand } from "./common-deploy.js"
import { GROUPS_OPT } from "./common.js"

const command = `deploy [${GROUPS_OPT}..]`
const describe = "Deploy deployment targets"

export const deployTargetsCmd = targetsDeployCommand({
  command,
  describe,
  iamPolicyProvider: deployTargetsOperationCommandIamPolicy,
  io: createDeployTargetsIO,
})
