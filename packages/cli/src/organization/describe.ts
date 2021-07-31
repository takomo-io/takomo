import { createDescribeOrganizationIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  describeOrganizationCommand,
  describeOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"

type CommandArgs = unknown

const command = "describe"
const describe = "Describe organization"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(describeOrganizationCommandIamPolicy))

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    io: (ctx, logger) => createDescribeOrganizationIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: describeOrganizationCommand,
  })

export const describeOrganizationCmd: CommandModule<CommandArgs, CommandArgs> =
  {
    command,
    describe,
    builder,
    handler,
  }
