import { createDeployOrganizationIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  deployOrganizationCommand,
  deployOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"

type CommandArgs = unknown

const command = "deploy"
const describe = "Deploy organization"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(deployOrganizationCommandIamPolicy))

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    io: (ctx, logger) => createDeployOrganizationIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: deployOrganizationCommand,
  })

export const deployOrganizationCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
