import { CliDiffSecretsIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import { diffSecretsCommand } from "@takomo/stacks"
import { handle } from "../../common"

export const diffSecretsCmd = {
  command: "diff [commandPath]",
  desc:
    "Show differences between the locally configured secrets and the ones in parameter store",
  builder: {
    path: {
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
      input => diffSecretsCommand(input, new CliDiffSecretsIO(input.options)),
    ),
}
