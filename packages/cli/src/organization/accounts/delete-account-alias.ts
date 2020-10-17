import { CliDeleteAccountAliasIO } from "@takomo/cli-io"
import {
  deleteAccountAliasCommand,
  deleteAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

export const deleteAccountAliasCmd = {
  command: "delete-alias",
  desc: "Delete account alias",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(deleteAccountAliasCommandIamPolicy))
      .option("account-id", {
        description: "Account id",
        string: true,
        global: false,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({ ...ov, accountId: argv["account-id"] }),
      (input) =>
        deleteAccountAliasCommand(
          input,
          new CliDeleteAccountAliasIO(input.options),
        ),
    ),
}
