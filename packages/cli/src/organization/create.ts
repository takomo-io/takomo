import { createCreateOrganizationIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createOrganizationCommand,
  createOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"
import { FEATURE_SET_OPT } from "../constants"

const command = "create"
const describe = "Create a new organization"

const builder = (yargs: any) =>
  yargs
    .epilog(commonEpilog(createOrganizationCommandIamPolicy))
    .option(FEATURE_SET_OPT, {
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
      featureSet: argv[FEATURE_SET_OPT],
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

export const createOrganizationCmd: CommandModule = {
  command,
  describe,
  builder,
  handler,
}
