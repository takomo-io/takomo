import { AccountId } from "@takomo/aws-model"
import { createDeleteAccountAliasIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  deleteAccountAliasCommand,
  deleteAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle, RunProps } from "../../common"
import { ACCOUNT_ID_OPT } from "../../constants"

type CommandArgs = {
  readonly [ACCOUNT_ID_OPT]: AccountId
}

const command = "delete-alias"
const describe = "Delete account alias"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(deleteAccountAliasCommandIamPolicy)).options({
    [ACCOUNT_ID_OPT]: {
      description: "Account id",
      demandOption: true,
      string: true,
      global: false,
    },
  })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      accountId: argv[ACCOUNT_ID_OPT],
    }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    io: (ctx, logger) => createDeleteAccountAliasIO({ logger }),
    executor: deleteAccountAliasCommand,
  })

export const deleteAccountAliasCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
