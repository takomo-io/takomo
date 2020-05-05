import { CliListAccountsIO } from "@takomo/cli-io"
import { listAccountsCommand } from "@takomo/organization"
import { handle } from "../../common"

export const listAccountsCmd = {
  command: "list",
  desc: "List accounts",
  builder: {},
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ov,
      (input) =>
        listAccountsCommand(input, new CliListAccountsIO(input.options)),
    ),
}
