import { Arguments, Argv, CommandModule } from "yargs"
import { createValidateDeploymentTargetsConfigurationIO } from "../../takomo-cli-io/deployment-targets/validate-config-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "../../takomo-config-repository-fs"
import { validateDeploymentTargetsConfigurationCommand } from "../../takomo-deployment-targets-commands/validate-config/command"
import { FilePath } from "../../utils/files"
import { commonEpilog, handle, RunProps } from "../common"
import { CONFIG_FILE_OPT } from "../constants"

type CommandArgs = {
  readonly [CONFIG_FILE_OPT]: FilePath | undefined
}

const command = "validate-config"
const describe = "Validate deployment targets configuration"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(() => "")).options({
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
      createValidateDeploymentTargetsConfigurationIO({
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
    executor: validateDeploymentTargetsConfigurationCommand,
  })

export const validateDeploymentTargetsCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
