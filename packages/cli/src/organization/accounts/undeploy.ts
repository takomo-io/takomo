import { createUndeployAccountsIO } from "@takomo/cli-io"
import { accountsUndeployOperationCommandIamPolicy } from "@takomo/organization-commands"
import { ORGANIZATIONAL_UNITS_OPT } from "../../constants"
import { orgAccountsOperationCommand } from "./common"

const command = `undeploy [${ORGANIZATIONAL_UNITS_OPT}..]`
const describe = "Undeploy accounts"

export const undeployAccountsCmd = orgAccountsOperationCommand({
  command,
  describe,
  configSetType: "standard",
  operation: "undeploy",
  iamPolicyProvider: accountsUndeployOperationCommandIamPolicy,
  io: createUndeployAccountsIO,
})
