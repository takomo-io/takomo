import { CliListStacksIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import { listStacksCommand } from "@takomo/stacks"
import { handle } from "../common"

export const listStacksCmd = {
  command: "list [commandPath]",
  desc: "List stack within the given command path",
  builder: {
    commandPath: {
      default: Constants.ROOT_STACK_GROUP_PATH,
    },
  },
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
