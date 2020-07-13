import { CliSyncSecretsIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import {
  syncSecretsCommand,
  syncSecretsCommandIamPolicy,
} from "@takomo/stacks-commands"
import { commonEpilog, handle } from "../../common"

export const syncSecretsCmd = {
  command: "sync [commandPath]",
  desc: "Sync stack secrets within the given command path",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(syncSecretsCommandIamPolicy))
      .positional("commandPath", {
        describe: "Sync stack secrets within this path",
        default: Constants.ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        commandPath: argv.commandPath,
      }),
      (input) => syncSecretsCommand(input, new CliSyncSecretsIO(input.options)),
    ),
}
