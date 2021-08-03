import {
  AccountAlias,
  AccountEmail,
  AccountName,
  IamRoleName,
} from "@takomo/aws-model"
import { createCreateAccountIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createAccountCommand,
  createAccountCommandIamPolicy,
} from "@takomo/organization-commands"
import {
  DEFAULT_ORGANIZATION_ROLE_NAME,
  OrganizationalUnitPath,
} from "@takomo/organization-model"
import { Arguments, Argv, CommandModule } from "yargs"
import {
  commonEpilog,
  handle,
  readConfigurationFromFiles,
  RunProps,
} from "../../common"
import { ALIAS_OPT, CONFIG_FILE_OPT, ROLE_NAME_OPT } from "../../constants"

export const NAME_OPT = "name"
export const EMAIL_OPT = "email"
export const OU_OPT = "ou"
export const IAM_USER_ACCESS_TO_BILLING_OPT = "iam-user-access-to-billing"

type CommandArgs = {
  readonly [NAME_OPT]: AccountName
  readonly [EMAIL_OPT]: AccountEmail
  readonly [IAM_USER_ACCESS_TO_BILLING_OPT]: boolean
  readonly [ROLE_NAME_OPT]: IamRoleName
  readonly [ALIAS_OPT]?: AccountAlias
  readonly [OU_OPT]?: OrganizationalUnitPath
}

const command = "create"
const describe = "Create account"
const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(createAccountCommandIamPolicy))
    .option(NAME_OPT, {
      description: "Account name",
      type: "string",
      global: false,
      demandOption: true,
    })
    .option(EMAIL_OPT, {
      description: "Account email",
      type: "string",
      global: false,
      demandOption: true,
    })
    .option(IAM_USER_ACCESS_TO_BILLING_OPT, {
      description: "Enable IAM users to access account billing information",
      type: "boolean",
      global: false,
      default: true,
    })
    .option(ROLE_NAME_OPT, {
      description: "Name of the IAM role used to manage the new account",
      type: "string",
      global: false,
      default: DEFAULT_ORGANIZATION_ROLE_NAME,
    })
    .option(ALIAS_OPT, {
      description: "Account alias",
      type: "string",
      global: false,
    })
    .option(OU_OPT, {
      description: "Organizational unit",
      type: "string",
      global: false,
    })
    .option(CONFIG_FILE_OPT, {
      description: "Config file",
      type: "string",
      global: false,
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      email: argv.email,
      name: argv.name,
      iamUserAccessToBilling: argv[IAM_USER_ACCESS_TO_BILLING_OPT],
      roleName: argv[ROLE_NAME_OPT],
      alias: argv.alias,
      ou: argv.ou,
      config: await readConfigurationFromFiles(
        ctx.projectDir,
        argv[CONFIG_FILE_OPT],
      ),
    }),
    io: (ctx, logger) => createCreateAccountIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: createAccountCommand,
  })

export const createAccountCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
