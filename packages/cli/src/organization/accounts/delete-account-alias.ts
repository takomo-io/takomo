import { createDeleteAccountAliasIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  deleteAccountAliasCommand,
  deleteAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"
import { ACCOUNT_ID_OPT } from "../../constants"

const command = "delete-alias"
const desc = "Delete account alias"

const builder = (yargs: any) =>
  yargs
    .epilog(commonEpilog(deleteAccountAliasCommandIamPolicy))
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

export const deleteAccountAliasCmd = {
  command,
  desc,
  builder,
  handler,
}
