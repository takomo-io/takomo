import { CliListAccountsIO } from "@takomo/cli-io"
import {
  describeAccountCommand,
  describeAccountCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

export default {
  command: "describe <accountId>",
  desc: "Describe account",
  builder: (yargs: any) =>
    yargs.epilog(commonEpilog(describeAccountCommandIamPolicy)),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ov,
      (input) =>
        describeAccountCommand(input, new CliListAccountsIO(input.options)),
    ),
}
