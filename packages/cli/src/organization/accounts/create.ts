import { createCreateAccountIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createAccountCommand,
  createAccountCommandIamPolicy,
} from "@takomo/organization-commands"
import { DEFAULT_ORGANIZATION_ROLE_NAME } from "@takomo/organization-model"
import { commonEpilog, handle, readConfigurationFromFiles } from "../../common"

export const createAccountCmd = {
  command: "create",
  desc: "Create account",
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(createAccountCommandIamPolicy))
      .option("name", {
        description: "Account name",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("email", {
        description: "Account email",
        string: true,
        global: false,
        demandOption: true,
      })
      .option("iam-user-access-to-billing", {
        description: "Enable IAM users to access account billing information",
        boolean: true,
        global: false,
        default: true,
      })
      .option("role-name", {
        description: "Name of the IAM role used to manage the new account",
        string: true,
        global: false,
        default: DEFAULT_ORGANIZATION_ROLE_NAME,
      })
      .option("alias", {
        description: "Account alias",
        string: true,
        global: false,
      })
      .option("ou", {
        description: "Organizational unit",
        string: true,
        global: false,
      })
      .option("config-file", {
        description: "Config file",
        string: true,
        global: false,
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        email: argv.email,
        name: argv.name,
        iamUserAccessToBilling: argv["iam-user-access-to-billing"],
        roleName: argv["role-name"],
        alias: argv.alias,
        ou: argv.ou,
        config: await readConfigurationFromFiles(
          ctx.projectDir,
          argv["config-file"],
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
    }),
}
