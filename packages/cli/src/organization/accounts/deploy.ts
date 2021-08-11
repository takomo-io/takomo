import { createDeployAccountsIO } from "@takomo/cli-io"
import { accountsDeployOperationCommandIamPolicy } from "@takomo/organization-commands"
import { ORGANIZATIONAL_UNITS_OPT } from "../../constants"
import { orgAccountsOperationCommand } from "./common"

const command = `deploy [${ORGANIZATIONAL_UNITS_OPT}..]`
const describe = "Deploy accounts"

export const deployAccountsCmd = orgAccountsOperationCommand({
  command,
  describe,
  configSetType: "standard",
  operation: "deploy",
  iamPolicyProvider: accountsDeployOperationCommandIamPolicy,
  io: createDeployAccountsIO,
})
