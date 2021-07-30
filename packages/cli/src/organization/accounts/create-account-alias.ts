import { createCreateAccountAliasIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createAccountAliasCommand,
  createAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"
import { ACCOUNT_ID_OPT } from "../../constants"

const command = "create-alias"
const desc = "Create account alias"

const builder = (yargs: any) =>
  yargs
    .epilog(commonEpilog(createAccountAliasCommandIamPolicy))
    .option("alias", {
      description: "Account alias",
      string: true,
      global: false,
    })
    .option(ACCOUNT_ID_OPT, {
      description: "Account id",
      string: true,
      global: false,
    })

const handler = (argv: any) =>
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

export const createAccountAliasCmd = {
  command,
  desc,
  builder,
  handler,
}
