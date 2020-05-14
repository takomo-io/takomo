import { CliListAccountsIO } from "@takomo/cli-io"
import {
  listAccountsCommand,
  listAccountsCommandIamPolicy,
} from "@takomo/organization"
import { commonEpilog, handle } from "../../common"

export const listAccountsCmd = {
  command: "list",
  desc: "List accounts",
  builder: (yargs: any) =>
    yargs.epilog(commonEpilog(listAccountsCommandIamPolicy)),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ov,
      (input) =>
        listAccountsCommand(input, new CliListAccountsIO(input.options)),
    ),
}
