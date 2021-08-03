import { createRunTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { OutputFormat } from "@takomo/core"
import { deploymentTargetsRunCommand } from "@takomo/deployment-targets-commands"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
  Label,
} from "@takomo/deployment-targets-model"
import { FilePath } from "@takomo/util"
import { Arguments, Argv, CommandModule } from "yargs"
import { commonEpilog, handle, RunProps } from "../common"
import {
  CONCURRENT_TARGETS_OPT,
  CONFIG_FILE_OPT,
  EXCLUDE_LABEL_OPT,
  EXCLUDE_TARGET_OPT,
  LABEL_OPT,
  TARGET_OPT,
} from "../constants"
import { GROUPS_OPT } from "./common"

const REDUCE_OPT = "reduce"
const MAP_OPT = "map"
const MAP_ARGS_OPT = "map-args"
const MAP_ROLE_NAME_OPT = "map-role-name"
const DISABLE_MAP_ROLE_OPT = "disable-map-role"
const REDUCE_ROLE_ARN_OPT = "reduce-role-arn"
const OUTPUT_OPT = "output"
const CAPTURE_AFTER_OPT = "capture-after"
const CAPTURE_BEFORE_OPT = "capture-before"
const CAPTURE_LAST_LINE_OPT = "capture-last-line"

type CommandArgs = {
  readonly [GROUPS_OPT]: ReadonlyArray<DeploymentGroupPath>
  readonly [TARGET_OPT]: ReadonlyArray<DeploymentTargetName>
  readonly [EXCLUDE_TARGET_OPT]: ReadonlyArray<DeploymentTargetName>
  readonly [LABEL_OPT]: ReadonlyArray<Label>
  readonly [EXCLUDE_LABEL_OPT]: ReadonlyArray<Label>
  readonly [CONCURRENT_TARGETS_OPT]: number
  readonly [CONFIG_FILE_OPT]: FilePath | undefined
  readonly [MAP_OPT]: string
  readonly [REDUCE_OPT]: string | undefined
  readonly [MAP_ARGS_OPT]: string | undefined
  readonly [MAP_ROLE_NAME_OPT]: string | undefined
  readonly [DISABLE_MAP_ROLE_OPT]: boolean
  readonly [REDUCE_ROLE_ARN_OPT]: string | undefined
  readonly [OUTPUT_OPT]: string
  readonly [CAPTURE_AFTER_OPT]: string | undefined
  readonly [CAPTURE_BEFORE_OPT]: string | undefined
  readonly [CAPTURE_LAST_LINE_OPT]: boolean
}

const command = "run [groups..]"
const describe =
  "For each deployment target, run a map command, then optionally invoke a " +
  "reduce command with the results from the map command."

const builder = (yargs: Argv<CommandArgs>) =>
  yargs
    .epilog(commonEpilog(() => ""))
    .options({
      [CONCURRENT_TARGETS_OPT]: {
        description: "Number of targets to process concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      },
      [TARGET_OPT]: {
        description: "Targets to deploy",
        string: true,
        array: true,
        default: [],
        global: false,
        demandOption: false,
      },
      [EXCLUDE_TARGET_OPT]: {
        description: "Targets exclude from the operation",
        string: true,
        array: true,
        default: [],
        global: false,
        demandOption: false,
      },
      [LABEL_OPT]: {
        description: "Labels to include in the operation",
        string: true,
        array: true,
        default: [],
        global: false,
        demandOption: false,
      },
      [EXCLUDE_LABEL_OPT]: {
        description: "Labels to exclude from the operation",
        string: true,
        array: true,
        default: [],
        global: false,
        demandOption: false,
      },
      [CONFIG_FILE_OPT]: {
        description: "Deployment config file",
        string: true,
        global: false,
        demandOption: false,
      },
      [MAP_OPT]: {
        description:
          "Map command to run for each target. To invoke a function in a JavaScript file, give path to the file prefixed with js:",
        string: true,
        global: false,
        demandOption: true,
      },
      [REDUCE_OPT]: {
        description:
          "Reduce command to be invoked with results from the map command. To invoke a function in a JavaScript file, give path to the file prefixed with js:",
        string: true,
        global: false,
        demandOption: false,
      },
      [CAPTURE_LAST_LINE_OPT]: {
        description:
          "If the map command is a shell command, capture only the last line printed to stdout for each target",
        boolean: true,
        default: false,
        global: false,
        demandOption: false,
      },
      [CAPTURE_AFTER_OPT]: {
        description:
          "If the map command is a shell command, capture everything printed to stdout after this line for each target",
        string: true,
        global: false,
        demandOption: false,
      },
      [CAPTURE_BEFORE_OPT]: {
        description:
          "If the map command is a shell command, capture everything printed to stdout before this line for each target",
        string: true,
        global: false,
        demandOption: false,
      },
      [MAP_ROLE_NAME_OPT]: {
        description:
          "Name of an IAM role to assume from each target when executing the map command",
        string: true,
        global: false,
        demandOption: false,
      },
      [MAP_ARGS_OPT]: {
        description: "Additional arguments passed to the map command",
        string: true,
        global: false,
        demandOption: false,
      },
      [REDUCE_ROLE_ARN_OPT]: {
        description:
          "ARN of an IAM role to use when executing the reduce command",
        string: true,
        global: false,
        demandOption: false,
      },
      [OUTPUT_OPT]: {
        description: "Output format",
        choices: ["text", "json", "yaml"],
        default: "text",
        string: true,
        global: false,
        demandOption: false,
      },
      [DISABLE_MAP_ROLE_OPT]: {
        description:
          "Do not assume role from each target when executing the map command",
        boolean: true,
        default: false,
        global: false,
        demandOption: false,
      },
    })
    .positional(GROUPS_OPT, {
      description: "Deployment groups to include in the operation",
      array: true,
      string: true,
      default: [],
    })

const handler = (argv: Arguments<CommandArgs>) =>
  handle({
    argv,
    input: async (ctx, input) => ({
      ...input,
      targets: argv[TARGET_OPT],
      excludeTargets: argv[EXCLUDE_TARGET_OPT],
      groups: argv[GROUPS_OPT],
      configFile: argv[CONFIG_FILE_OPT],
      concurrentTargets: argv[CONCURRENT_TARGETS_OPT],
      labels: argv[LABEL_OPT],
      excludeLabels: argv[EXCLUDE_LABEL_OPT],
      mapRoleName: argv[MAP_ROLE_NAME_OPT],
      disableMapRole: argv[DISABLE_MAP_ROLE_OPT],
      captureBeforeLine: argv[CAPTURE_BEFORE_OPT],
      captureAfterLine: argv[CAPTURE_AFTER_OPT],
      captureLastLine: argv[CAPTURE_LAST_LINE_OPT],
      mapCommand: argv[MAP_OPT],
      mapArgs: argv[MAP_ARGS_OPT],
      reduceRoleArn: argv[REDUCE_ROLE_ARN_OPT],
      reduceCommand: argv[REDUCE_OPT],
      outputFormat: argv[OUTPUT_OPT] as OutputFormat,
    }),
    io: (ctx, logger) => createRunTargetsIO({ logger }),
    configRepository: (ctx, logger) =>
      createFileSystemDeploymentTargetsConfigRepository({
        ctx,
        logger,
        pathToDeploymentConfigFile: argv[CONFIG_FILE_OPT],
        ...ctx.filePaths,
      }),
    executor: deploymentTargetsRunCommand,
  })

export const runTargetsCmd = ({
  overridingHandler,
}: RunProps): CommandModule<CommandArgs, CommandArgs> => ({
  command,
  describe,
  builder,
  handler: overridingHandler ?? handler,
})
