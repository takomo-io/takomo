import { OrganizationFeatureSet } from "@takomo/aws-model"
import { createCreateOrganizationIO } from "@takomo/cli-io"
import { createFileSystemOrganizationConfigRepository } from "@takomo/config-repository-fs"
import {
  createOrganizationCommand,
  createOrganizationCommandIamPolicy,
} from "@takomo/organization-commands"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle } from "../common"
import { FEATURE_SET_OPT } from "../constants"

type CommandArgs = {
  readonly [FEATURE_SET_OPT]: string
}

const command = "create"
const describe = "Create a new organization"

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(createOrganizationCommandIamPolicy))
    .option(FEATURE_SET_OPT, {
      description: "Feature set",
      type: "string",
      global: false,
      default: "ALL",
      demandOption: false,
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      featureSet: argv[FEATURE_SET_OPT] as OrganizationFeatureSet,
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

export const createOrganizationCmd: CommandModule<CommandArgs, CommandArgs> = {
  command,
  describe,
  builder,
  handler,
}
