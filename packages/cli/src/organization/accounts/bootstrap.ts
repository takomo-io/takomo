import { createBootstrapAccountsIO } from "@takomo/cli-io"
import { accountsDeployOperationCommandIamPolicy } from "@takomo/organization-commands"
import { ORGANIZATIONAL_UNITS_OPT } from "../../constants"
import { orgAccountsOperationCommand } from "./common"

const command = `bootstrap [${ORGANIZATIONAL_UNITS_OPT}..]`
const describe = "Bootstrap accounts"

export const bootstrapAccountsCmd = orgAccountsOperationCommand({
  command,
  describe,
  configSetType: "bootstrap",
  operation: "deploy",
  iamPolicyProvider: accountsDeployOperationCommandIamPolicy,
  io: createBootstrapAccountsIO,
})
