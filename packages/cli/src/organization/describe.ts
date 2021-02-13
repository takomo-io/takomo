import { createDescribeOrganizationIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  describeOrganizationCommand,
  describeOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../common"

const command = "describe"
const desc = "Describe organization"

const builder = (yargs: any) =>
  yargs.epilog(commonEpilog(describeOrganizationCommandIamPolicy))

const handler = (argv: any) =>
  handle({
    argv,
    input: async (ctx, input) => input,
    io: (ctx, logger) => createDescribeOrganizationIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: describeOrganizationCommand,
  })

export const describeOrganizationCmd = {
  command,
  desc,
  builder,
  handler,
}
