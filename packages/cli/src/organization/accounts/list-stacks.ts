import { createListAccountsStacksIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  listAccountsStacksCommand,
  listAccountsStacksCommandIamPolicy,
} from "@takomo/organization-commands"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle, RunProps } from "../../common"

type CommandArgs = unknown

const command = "list-stacks"
const describe = "List stacks in accounts"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(listAccountsStacksCommandIamPolicy))

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    io: (ctx, logger) => createListAccountsStacksIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: listAccountsStacksCommand,
  })

export const listAccountsStacksCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
