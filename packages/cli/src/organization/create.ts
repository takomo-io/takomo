import { createCreateOrganizationIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createOrganizationCommand,
  createOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { commonEpilog, handle } from "../common"

const command = "create"
const desc = "Create a new organization"

const builder = (yargs: any) =>
  yargs
    .epilog(commonEpilog(createOrganizationCommandIamPolicy))
    .option("feature-set", {
      description: "Feature set",
      string: true,
      global: false,
      default: "ALL",
      demandOption: false,
    })

const handler = (argv: any) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      featureSet: argv["feature-set"],
    }),
    io: (ctx, logger) => createCreateOrganizationIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemOrganizationConfigRepository({
        ctx,
        logger,
        ...ctx.filePaths,
      }),
    executor: createOrganizationCommand,
  })

export const createOrganizationCmd = {
  command,
  desc,
  builder,
  handler,
}
