import { CliDependencyGraphIO } from "@takomo/cli-io"
import { Constants } from "@takomo/core"
import { dependencyGraphCommand } from "@takomo/stacks-commands"
import { handle } from "../../common"

export const dependencyGraphCmd = {
  command: "dependency-graph [commandPath]",
  desc: "Show dependency graph of stacks within the given command path",
  builder: (yargs: any) =>
    yargs.positional("commandPath", {
      describe: "Show dependency graph within this path",
      default: Constants.ROOT_STACK_GROUP_PATH,
    }),
  handler: (argv: any) =>
    handle(
      argv,
      (ov) => ({
        ...ov,
        commandPath: argv.commandPath,
      }),
      (input) =>
        dependencyGraphCommand(input, new CliDependencyGraphIO(input.options)),
    ),
}
