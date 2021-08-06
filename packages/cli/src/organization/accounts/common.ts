import { AccountId } from "@takomo/aws-model"
import { IOProps } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetType } from "@takomo/config-sets"
import {
  accountsOperationCommand,
  AccountsOperationIO,
} from "@takomo/organization-commands"
import { OrganizationalUnitPath } from "@takomo/organization-model"
import { DeploymentOperation } from "@takomo/stacks-model"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle, RunProps } from "../../common"
import {
  ACCOUNT_ID_ALIAS_OPT,
  ACCOUNT_ID_OPT,
  CONCURRENT_ACCOUNTS_OPT,
  ORGANIZATIONAL_UNITS_OPT,
} from "../../constants"

export type AccountOperationCommandArgs = {
  readonly [ORGANIZATIONAL_UNITS_OPT]: ReadonlyArray<OrganizationalUnitPath>
  readonly [ACCOUNT_ID_OPT]: ReadonlyArray<AccountId>
  readonly [CONCURRENT_ACCOUNTS_OPT]: number
}

const accountsOperationBuilder = (yargs: Argv<AccountOperationCommandArgs>) =>
  yargs
    .options({
      [CONCURRENT_ACCOUNTS_OPT]: {
        description: "Number of accounts to process concurrently",
        type: "number",
        global: false,
        demandOption: false,
        default: 1,
      },
      [ACCOUNT_ID_OPT]: {
        description: "Account to include in the operation",
        alias: ACCOUNT_ID_ALIAS_OPT,
        type: "array",
        global: false,
        demandOption: false,
        default: [],
      },
    })
    .positional(ORGANIZATIONAL_UNITS_OPT, {
      describe: "Include accounts that belong to this OU",
      type: "string",
      default: [],
    })

const createAccountsOperationBuilder =
  (iamPolicyProvider: () => string) =>
  (yargs: Argv<AccountOperationCommandArgs>) =>
    accountsOperationBuilder(yargs).epilog(commonEpilog(iamPolicyProvider))

const createAccountsOperationHandler =
  (
    configSetType: ConfigSetType,
    operation: DeploymentOperation,
    io: (props: IOProps) => AccountsOperationIO,
  ) =>
  (argv: Arguments<AccountOperationCommandArgs>) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        operation,
        configSetType,
        organizationalUnits: argv[ORGANIZATIONAL_UNITS_OPT],
        accountIds: argv[ACCOUNT_ID_OPT],
        concurrentAccounts: argv[CONCURRENT_ACCOUNTS_OPT],
      }),
      configRepository: (ctx, logger) =>
        createFileSystemOrganizationConfigRepository({
          ctx,
          logger,
          ...ctx.filePaths,
        }),
      io: (ctx, logger) => io({ logger }),
      executor: accountsOperationCommand,
    })

interface AccountsOperationCommandProps {
  readonly command: string
  readonly describe: string
  readonly operation: DeploymentOperation
  readonly configSetType: ConfigSetType
  readonly iamPolicyProvider: () => string
  readonly io: (props: IOProps) => AccountsOperationIO
}

type AccountsOperationCommandModule = CommandModule<
  AccountOperationCommandArgs,
  AccountOperationCommandArgs
>

export const orgAccountsOperationCommand =
  ({
    command,
    describe,
    operation,
    configSetType,
    io,
    iamPolicyProvider,
  }: AccountsOperationCommandProps) =>
  ({ overridingHandler }: RunProps): AccountsOperationCommandModule => ({
    command,
    describe,
    builder: createAccountsOperationBuilder(iamPolicyProvider),
    handler:
      overridingHandler ??
      createAccountsOperationHandler(configSetType, operation, io),
  })
