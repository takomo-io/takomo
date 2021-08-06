import { AccountAlias, AccountId } from "@takomo/aws-model"
import { createCreateAccountAliasIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createAccountAliasCommand,
  createAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle, RunProps } from "../../common"
import { ACCOUNT_ID_OPT, ALIAS_OPT } from "../../constants"

type CommandArgs = {
  readonly [ALIAS_OPT]: AccountAlias
  readonly [ACCOUNT_ID_OPT]: AccountId
}

const command = "create-alias"
const describe = "Create account alias"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs.epilog(commonEpilog(createAccountAliasCommandIamPolicy)).options({
    [ALIAS_OPT]: {
      description: "Account alias",
      string: true,
      global: false,
      demandOption: true,
    },
    [ACCOUNT_ID_OPT]: {
      description: "Account id",
      string: true,
      global: false,
      demandOption: true,
    },
  })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      accountId: argv[ACCOUNT_ID_OPT],
      alias: argv.alias,
    }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    io: (ctx, logger) => createCreateAccountAliasIO({ logger }),
    executor: createAccountAliasCommand,
  })

export const createAccountAliasCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
