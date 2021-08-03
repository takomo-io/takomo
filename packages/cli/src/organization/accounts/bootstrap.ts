import { createBootstrapAccountsIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import {
  accountsDeployOperationCommandIamPolicy,
  accountsOperationCommand,
} from "@takomo/organization-commands"
import { DeploymentOperation } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle, RunProps } from "../../common"
import {
  ACCOUNT_ID_ALIAS_OPT,
  ACCOUNT_ID_OPT,
  CONCURRENT_ACCOUNTS_OPT,
  ORGANIZATIONAL_UNITS_OPT,
} from "../../constants"
import { AccountOperationCommandArgs } from "./common"

type CommandArgs = AccountOperationCommandArgs

const command = `bootstrap [${ORGANIZATIONAL_UNITS_OPT}..]`
const describe = "Bootstrap accounts"
const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(accountsDeployOperationCommandIamPolicy))
    .option(CONCURRENT_ACCOUNTS_OPT, {
      description: "Number of accounts to bootstrap concurrently",
      type: "number",
      global: false,
      demandOption: false,
      default: 1,
    })
    .option(ACCOUNT_ID_OPT, {
      description: "Account id to bootstrap",
      alias: ACCOUNT_ID_ALIAS_OPT,
      type: "array",
      global: false,
      demandOption: false,
      default: [],
    })
    .positional(ORGANIZATIONAL_UNITS_OPT, {
      describe: "Bootstrap accounts that belong to this OU",
      type: "string",
      default: [],
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      organizationalUnits: argv[ORGANIZATIONAL_UNITS_OPT],
      accountIds: argv[ACCOUNT_ID_OPT],
      concurrentAccounts: argv[CONCURRENT_ACCOUNTS_OPT],
      operation: "deploy" as DeploymentOperation,
      configSetType: "bootstrap" as ConfigSetType,
    }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    io: (ctx, logger) => createBootstrapAccountsIO({ logger }),
    executor: accountsOperationCommand,
  })

export const bootstrapAccountsCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
