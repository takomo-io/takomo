import { createUndeployTargetsIO } from "../../takomo-cli-io"
import { undeployTargetsOperationCommandIamPolicy } from "../../takomo-deployment-targets-commands"
import { GROUPS_OPT, targetsOperationCommand } from "./common"

const command = `undeploy [${GROUPS_OPT}..]`
const describe = "Undeploy deployment targets"

export const undeployTargetsCmd = targetsOperationCommand({
  command,
  describe,
  configSetType: "standard",
  operation: "undeploy",
  iamPolicyProvider: undeployTargetsOperationCommandIamPolicy,
  io: createUndeployTargetsIO,
})
