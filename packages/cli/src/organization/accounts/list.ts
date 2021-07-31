import { createListAccountsIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  listAccountsCommand,
  listAccountsCommandIamPolicy,
} from "@takomo/organization-commands"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle } from "../../common"

type CommandArgs = unknown

const command = "list"
const describe = "List accounts"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(listAccountsCommandIamPolicy))

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    io: (ctx, logger) => createListAccountsIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: listAccountsCommand,
  })

export const listAccountsCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
