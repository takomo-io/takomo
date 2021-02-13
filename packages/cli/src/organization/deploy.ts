import { createDeployOrganizationIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  deployOrganizationCommand,
  deployOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../common"

const command = "deploy"
const desc = "Deploy organization"

const builder = (yargs: any) =>
  yargs.epilog(commonEpilog(deployOrganizationCommandIamPolicy))

const handler = (argv: any) =>
  handle({
    argv,
    input: async (ctx, input) => input,
    io: (ctx, logger) => createDeployOrganizationIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: deployOrganizationCommand,
  })

export const deployOrganizationCmd = {
  command,
  desc,
  builder,
  handler,
}
