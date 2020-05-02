import { CliListSecretsIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import { listSecretsCommand } from "@takomo/stacks"
import { handle } from "../../common"

export const listSecretsCmd = {
  command: "list [commandPath]",
  desc: "List stack secrets within the given command path",
  builder: {
    commandPath: {
      default: Constants.ROOT_STACK_GROUP_PATH,
    },
  },
  handler: (argv: any) =>
    handle(
      argv,
      ov => ({
        ...ov,
        commandPath: argv.commandPath,
      }),
      input => listSecretsCommand(input, new CliListSecretsIO(input.options)),
    ),
}
