import { CliListStacksIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import {
  listStacksCommand,
  listStacksCommandIamPolicy,
} from "@takomo/stacks-commands"
import { commonEpilog, handle } from "../common"

export const listStacksCmd = {
  command: "list [commandPath]",
  desc: "List stack within the given command path",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(listStacksCommandIamPolicy))
      .positional("commandPath", {
        describe: "List stacks within this path",
        default: Constants.ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        commandPath: argv.commandPath,
      }),
      (input) => listStacksCommand(input, new CliListStacksIO(input.options)),
    ),
}
