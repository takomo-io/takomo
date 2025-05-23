import Joi from "joi"
import { Arguments, Argv, CommandModule } from "yargs"
import { IamRoleName, Region } from "../../aws/common/model.js"
import { createGenerateIamPoliciesIO } from "../../cli-io/iam/generate-iam-policies-io.js"
import { generateIamPoliciesCommand } from "../../command/iam/generate-iam-policies-command.js"
import { handle, RunProps } from "../common.js"
import { ROLE_NAME_OPT } from "../constants.js"

const START_TIME_OPT = "start-time"
const END_TIME_OPT = "end-time"
const REGION_OPT = "region"
const IDENTITY_OPT = "identity"

type CommandArgs = {
  readonly [START_TIME_OPT]: string
  readonly [END_TIME_OPT]: string
  readonly [REGION_OPT]: ReadonlyArray<Region>
  readonly [IDENTITY_OPT]: ReadonlyArray<string>
  readonly [ROLE_NAME_OPT]: IamRoleName | undefined
}

const dateSchema = Joi.string().isoDate().required()
const validateDate = (optionName: string, d: string): void => {
  if (dateSchema.validate(d).error) {
    throw new Error(
      `option --${optionName} has invalid value - '${d}' is not a valid ISO 8601 date`,
    )
  }
}

const command = "generate-policies"
const describe =
  "Generate IAM policies based on CloudTrail events occurred between " +
  "the given start and end times, in the given regions, by the given identities.\n\n" +
  "The IAM policies generated by this command are based on events found from " +
  "CloudTrail at the time the command is executed. There are a few things to " +
  "keep in mind when generating policies:\n\n1) You need to have CloudTrail enabled, " +
  "preferably in all regions.\n\n2) The IAM policies generated by this command can " +
  "contain invalid IAM actions because not all events logged in CloudTrail can " +
  "be mapped directly to valid IAM actions. You should use the generated policies " +
  "as a starting point for your own handcrafted and fine-tuned policies.\n\n3) Typically, " +
  "the performed actions become visible in CloudTrail within 15 minutes. You should " +
  "wait at least that time before running the command shown above to ensure the " +
  "generated policies contain all actions. If you suspect that not all actions " +
  "were included in the generated policy, you should 5 minutes more and then " +
  "rerun the command."

const builder = (args: Argv) =>
  args
    .options({
      [ROLE_NAME_OPT]: {
        description: "Name of an IAM role used to read events from CloudTrail",
        string: true,
        global: false,
        requiresArg: true,
        demandOption: false,
      },
      [IDENTITY_OPT]: {
        description: "Include events by this identity",
        array: true,
        string: true,
        global: false,
        requiresArg: true,
        demandOption: true,
      },
      [START_TIME_OPT]: {
        description:
          "Include events occurred after this time, must be in ISO 8601 format, e.g. 2021-10-05T16:48:00.000Z",
        string: true,
        global: false,
        demandOption: true,
        requiresArg: true,
      },
      [END_TIME_OPT]: {
        description:
          "Include events occurred before this time, must be in ISO 8601 format, e.g. 2021-10-05T16:48:00.000Z",
        string: true,
        global: false,
        demandOption: true,
        requiresArg: true,
      },
      [REGION_OPT]: {
        description: "Include events from a trail located in this region",
        array: true,
        string: true,
        global: false,
        requiresArg: true,
        demandOption: true,
      },
    })
    .check((argv) => {
      validateDate(START_TIME_OPT, argv[START_TIME_OPT])
      validateDate(END_TIME_OPT, argv[END_TIME_OPT])
      return true
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      ...ctx.filePaths,
      identities: argv.identity,
      regions: argv.region,
      startTime: new Date(argv[START_TIME_OPT]),
      endTime: new Date(argv[END_TIME_OPT]),
      roleName: argv[ROLE_NAME_OPT],
    }),
    io: (ctx, logger) => createGenerateIamPoliciesIO({ logger }),
    configRepository: async () => "",
    executor: generateIamPoliciesCommand,
  })

export const generateIamPoliciesCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
