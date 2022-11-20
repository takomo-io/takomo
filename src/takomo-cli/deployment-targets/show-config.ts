import { Arguments, Argv, CommandModule } from "yargs"
import { createShowDeploymentTargetsConfigurationIO } from "../../takomo-cli-io/deployment-targets/show-config-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "../../takomo-config-repository-fs"
import { showDeploymentTargetsConfigurationCommand } from "../../takomo-deployment-targets-commands/show-config/command"
import { FilePath } from "../../takomo-util"
import { commonEpilog, handle, RunProps } from "../common"
import { CONFIG_FILE_OPT, outputFormatOptions } from "../constants"

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