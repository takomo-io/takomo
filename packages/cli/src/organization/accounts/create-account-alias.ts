import { CliCreateAccountAliasIO } from "@takomo/cli-io"
import {
  createAccountAliasCommand,
  createAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

export const createAccountAliasCmd = {
  command: "create-alias",
  desc: "Create account alias",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(createAccountAliasCommandIamPolicy))
      .option("alias", {
        description: "Account alias",
        string: true,
        global: false,
      })
      .option("account-id", {
        description: "Account id",
        string: true,
        global: false,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({ ...ov, accountId: argv["account-id"], alias: argv.alias }),
      (input) =>
        createAccountAliasCommand(
          input,
          new CliCreateAccountAliasIO(input.options),
        ),
    ),
}
