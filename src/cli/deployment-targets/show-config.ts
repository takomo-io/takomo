import { Arguments, Argv, CommandModule } from "yargs"
import { createShowDeploymentTargetsConfigurationIO } from "../../cli-io/deployment-targets/show-config-io.js"
import { showDeploymentTargetsConfigurationCommand } from "../../command/targets/show-config/command.js"
import { createFileSystemDeploymentTargetsConfigRepository } from "../../takomo-config-repository-fs/deployment-targets/config-repository.js"
import { FilePath } from "../../utils/files.js"
import { commonEpilog, handle, RunProps } from "../common.js"
import { CONFIG_FILE_OPT, outputFormatOptions } from "../constants.js"

type CommandArgs = {
  readonly [CONFIG_FILE_OPT]: FilePath | undefined
}

const command = "show-config"
const describe = "Show deployment targets configuration"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(() => "")).options({
    ...outputFormatOptions,
    [CONFIG_FILE_OPT]: {
      description: "Deployment config file",
      string: true,
      global: false,
      demandOption: false,
    },
  })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
    }),
    io: (ctx, logger) =>
      createShowDeploymentTargetsConfigurationIO({
        logger,
        quiet: ctx.quiet,
      }),
    configRepository: (ctx, logger, credentialManager) =>
      createFileSystemDeploymentTargetsConfigRepository({
        ctx,
        logger,
        credentialManager,
        pathToDeploymentConfigFile: argv[CONFIG_FILE_OPT],
        ...ctx.filePaths,
      }),
    executor: showDeploymentTargetsConfigurationCommand,
  })

export const showDeploymentTargetsConfigCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
