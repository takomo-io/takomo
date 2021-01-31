import { createCreateAccountAliasIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createAccountAliasCommand,
  createAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

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
    .option("account-id", {
      description: "Account id",
      string: true,
      global: false,
    })

const handler = (argv: any) =>
  handle({
    argv,
    input: (ctx, input) => ({
      ...input,
      accountId: argv["account-id"],
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
