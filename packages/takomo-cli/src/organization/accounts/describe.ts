import { CliListAccountsIO } from "@takomo/cli-io"
import { describeAccountCommand } from "@takomo/organization"
import { handle } from "../../common"

export default {
  command: "describe <accountId>",
  desc: "Describe account",
  builder: {},
  handler: (argv: any) =>
    handle(
      argv,
      ov => ov,
      input =>
        describeAccountCommand(input, new CliListAccountsIO(input.options)),
    ),
}
