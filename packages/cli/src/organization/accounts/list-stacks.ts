import { AccountId } from "@takomo/aws-model"
import { createListAccountsStacksIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import {
  listAccountsStacksCommand,
  listAccountsStacksCommandIamPolicy,
} from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { CommandPath } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle, RunProps } from "../../common"
import {
  ACCOUNT_ID_ALIAS_OPT,
  ACCOUNT_ID_OPT,
  COMMAND_PATH_OPT,
  CONCURRENT_ACCOUNTS_OPT,
  CONFIG_SET_OPT,
  CONFIG_SET_TYPE_OPT,
  ORGANIZATIONAL_UNITS_OPT,
} from "../../constants"

interface CommandArgs {
  readonly [ORGANIZATIONAL_UNITS_OPT]: ReadonlyArray<OrganizationalUnitPath>
  readonly [ACCOUNT_ID_OPT]: ReadonlyArray<AccountId>
  readonly [CONCURRENT_ACCOUNTS_OPT]: number
  readonly [CONFIG_SET_TYPE_OPT]: string
  readonly [COMMAND_PATH_OPT]: CommandPath | undefined
  readonly [CONFIG_SET_OPT]: ConfigSetName | undefined
}

const command = `list-stacks [${ORGANIZATIONAL_UNITS_OPT}..]`
const describe = "List stacks in accounts"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(listAccountsStacksCommandIamPolicy))
    .positional(ORGANIZATIONAL_UNITS_OPT, {
      describe: "Include accounts that belong to this OU",
      string: true,
      default: [],
    })
    .options({
      [CONFIG_SET_TYPE_OPT]: {
        description: "Config set type to use in the operation",
        string: true,
        global: false,
        demandOption: true,
      },
      [CONCURRENT_ACCOUNTS_OPT]: {
        description: "Number of accounts to process concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 30,
      },
      [ACCOUNT_ID_OPT]: {
        description: "Account to include in the operation",
        alias: ACCOUNT_ID_ALIAS_OPT,
        array: true,
        string: true,
        global: false,
        demandOption: false,
        default: [],
      },
      [CONFIG_SET_OPT]: {
        description: "Config set to use in the operation",
        string: true,
        global: false,
        demandOption: false,
      },
      [COMMAND_PATH_OPT]: {
        description: "Command path to include in the operation",
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
      organizationalUnits: argv[ORGANIZATIONAL_UNITS_OPT],
      accountIds: argv[ACCOUNT_ID_OPT],
      concurrentAccounts: argv[CONCURRENT_ACCOUNTS_OPT],
      commandPath: argv[COMMAND_PATH_OPT],
      configSetName: argv[CONFIG_SET_OPT],
      configSetType: argv[CONFIG_SET_TYPE_OPT] as ConfigSetType,
    }),
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
