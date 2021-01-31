import { createDependencyGraphIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import { dependencyGraphCommand } from "@takomo/stacks-commands"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { handle } from "../../common"

const command = "dependency-graph [commandPath]"
const desc = "Show dependency graph of stacks within the given command path"

const builder = (yargs: any) =>
  yargs.positional("commandPath", {
    describe: "Show dependency graph within this path",
    default: ROOT_STACK_GROUP_PATH,
  })

const handler = (argv: any) =>
  handle({
    argv,
    io: (ctx, logger) => createDependencyGraphIO({ logger }),
    input: (ctx, input) => ({
      ...input,
      commandPath: argv.commandPath,
    }),
    configRepository: (ctx, logger) =>
      createFileSystemStacksConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: dependencyGraphCommand,
  })

export const dependencyGraphCmd = {
  command,
  desc,
  builder,
  handler,
}
