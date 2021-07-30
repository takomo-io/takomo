import { createDetectDriftIO } from "@takomo/cli-io"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import {
  detectDriftCommand,
  detectDriftCommandIamPolicy,
} from "@takomo/stacks-commands"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import { commonEpilog, handle } from "../common"
import { COMMAND_PATH_POSITIONAL } from "../constants"

export const detectDriftCmd = {
  command: `detect-drift [${COMMAND_PATH_POSITIONAL}]`,
  desc: "Detect drift within the given command path",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(detectDriftCommandIamPolicy))
      .positional(COMMAND_PATH_POSITIONAL, {
        describe: "Detect drift from stacks within this path",
        default: ROOT_STACK_GROUP_PATH,
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        commandPath: argv.commandPath,
      }),
      io: (ctx, logger) => createDetectDriftIO({ logger }),
      configRepository: (ctx, logger) =>
        createFileSystemStacksConfigRepository({
          ctx,
          logger,
          ...ctx.filePaths,
        }),
      executor: detectDriftCommand,
    }),
}
