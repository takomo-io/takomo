import { CliCreateAliasIO } from "@takomo/cli-io"
import {
  createAliasCommand,
  createAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

export const createAliasCmd = {
  command: "create-alias",
  desc: "Create account alias",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(createAliasCommandIamPolicy))
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
      (input) => createAliasCommand(input, new CliCreateAliasIO(input.options)),
    ),
}
