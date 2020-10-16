import { CliDeleteAliasIO } from "@takomo/cli-io"
import {
  deleteAliasCommand,
  deleteAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

export const deleteAliasCmd = {
  command: "delete-alias",
  desc: "Delete account alias",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(deleteAliasCommandIamPolicy))
      .option("account-id", {
        description: "Account id",
        string: true,
        global: false,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({ ...ov, accountId: argv["account-id"] }),
      (input) => deleteAliasCommand(input, new CliDeleteAliasIO(input.options)),
    ),
}
