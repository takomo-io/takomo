import { createTearDownAccountsIO } from "@takomo/cli-io"
import { accountsUndeployOperationCommandIamPolicy } from "@takomo/organization-commands"
import { ORGANIZATIONAL_UNITS_OPT } from "../../constants"
import { orgAccountsOperationCommand } from "./common"

const command = `tear-down [${ORGANIZATIONAL_UNITS_OPT}..]`
const describe = "Tear down accounts"

export const tearDownAccountsCmd = orgAccountsOperationCommand({
  command,
  describe,
  configSetType: "bootstrap",
  operation: "undeploy",
  iamPolicyProvider: accountsUndeployOperationCommandIamPolicy,
  io: createTearDownAccountsIO,
})
