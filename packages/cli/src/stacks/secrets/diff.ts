import { CliDiffSecretsIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import {
  diffSecretsCommand,
  diffSecretsCommandIamPolicy,
} from "@takomo/stacks-commands"
import { commonEpilog, handle } from "../../common"

export const diffSecretsCmd = {
  command: "diff [commandPath]",
  desc:
    "Show differences between the locally configured secrets and the ones in parameter store",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(diffSecretsCommandIamPolicy))
      .positional("commandPath", {
        describe: "Show differences within this path",
        default: Constants.ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        commandPath: argv.commandPath,
      }),
      (input) => diffSecretsCommand(input, new CliDiffSecretsIO(input.options)),
    ),
}
