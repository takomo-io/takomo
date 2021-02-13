import { createListAccountsIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  listAccountsCommand,
  listAccountsCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../../common"

const command = "list"
const desc = "List accounts"

const builder = (yargs: any) =>
  yargs.epilog(commonEpilog(listAccountsCommandIamPolicy))

const handler = (argv: any) =>
  handle({
    argv,
    input: async (ctx, input) => input,
    io: (ctx, logger) => createListAccountsIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: listAccountsCommand,
  })

export const listAccountsCmd = {
  command,
  desc,
  builder,
  handler,
}
