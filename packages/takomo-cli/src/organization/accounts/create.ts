import { CliCreateAccountIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import {
  createAccountCommand,
  createAccountCommandIamPolicy,
} from "@takomo/organization"
import { commonEpilog, handle } from "../../common"

export const createAccountCmd = {
  command: "create",
  desc: "Create account",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(createAccountCommandIamPolicy))
      .option("name", {
        description: "Account name",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("email", {
        description: "Account email",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("iam-user-access-to-billing", {
        description: "Enable IAM users to access account billing information",
        boolean: true,
        global: false,
        default: true,
      })
      .option("role-name", {
        description: "Name of the IAM role used to manage the new account",
        string: true,
        global: false,
        default: Constants.DEFAULT_ORGANIZATION_ROLE_NAME,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        email: argv.email,
        name: argv.name,
        iamUserAccessToBilling: argv["iam-user-access-to-billing"],
        roleName: argv["role-name"],
      }),
      (input) =>
        createAccountCommand(input, new CliCreateAccountIO(input.options)),
    ),
}
