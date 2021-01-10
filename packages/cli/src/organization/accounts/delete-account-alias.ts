import { createDeleteAccountAliasIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  deleteAccountAliasCommand,
  deleteAccountAliasCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

const command = "delete-alias"
const desc = "Delete account alias"

const builder = (yargs: any) =>
  yargs
    .epilog(commonEpilog(deleteAccountAliasCommandIamPolicy))
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
    }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    io: (ctx, logger) => createDeleteAccountAliasIO(logger),
    executor: deleteAccountAliasCommand,
  })

export const deleteAccountAliasCmd = {
  command,
  desc,
  builder,
  handler,
}
