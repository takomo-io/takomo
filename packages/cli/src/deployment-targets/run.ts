import { createRunTargetsIO } from "@takomo/cli-io"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { parseStringArray } from "@takomo/core"
import { deploymentTargetsRunCommand } from "@takomo/deployment-targets-commands"
import { commonEpilog, handle } from "../common"

const CONCURRENT_TARGETS_OPT = "concurrent-targets"
const EXCLUDE_TARGET_OPT = "exclude-target"
const TARGET_OPT = "target"
const EXCLUDE_LABEL_OPT = "exclude-label"
const LABEL_OPT = "label"
const CONFIG_FILE_OPT = "config-file"
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
const desc =
  "For each deployment target, run a map command, then optionally invoke a " +
  "reduce command with the results from the map command."

export const runTargetsCmd = {
  command: "run [groups..]",
  desc,
  builder: (yargs: any) =>
    yargs
      .epilog(commonEpilog(() => ""))
      .option(CONCURRENT_TARGETS_OPT, {
        description: "Max number of targets to run concurrently",
        number: true,
        global: false,
        demandOption: false,
        default: 1,
      })
      .option(TARGET_OPT, {
        description:
          "Target to include in run. Use multiple times to include more than one target.",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(EXCLUDE_TARGET_OPT, {
        description:
          "Target to exclude from run. Use multiple times to exclude more than one target.",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(LABEL_OPT, {
        description:
          "Label to include in run. Use multiple times to include more than one label.",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(EXCLUDE_LABEL_OPT, {
        description:
          "Label to exclude from run. Use multiple times to exclude more than one label.",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(MAP_OPT, {
        description:
          "Map command to run for each target. To invoke a function in a JavaScript file, give path to the file prefixed with js:",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(REDUCE_OPT, {
        description:
          "Reduce command to be invoked with results from the map command. To invoke a function in a JavaScript file, give path to the file prefixed with js:",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(CAPTURE_LAST_LINE_OPT, {
        description:
          "If the map command is a shell command, capture only the last line printed to stdout for each target",
        boolean: true,
        default: false,
        global: false,
        demandOption: false,
      })
      .option(CAPTURE_AFTER_OPT, {
        description:
          "If the map command is a shell command, capture everything printed to stdout after this line for each target",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(CAPTURE_BEFORE_OPT, {
        description:
          "If the map command is a shell command, capture everything printed to stdout before this line for each target",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(MAP_ROLE_NAME_OPT, {
        description:
          "Name of an IAM role to assume from each target when executing the map command",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(MAP_ARGS_OPT, {
        description: "Additional arguments passed to the map command",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(REDUCE_ROLE_ARN_OPT, {
        description:
          "ARN of an IAM role to use when executing the reduce command",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(OUTPUT_OPT, {
        description: "Output format",
        choices: ["text", "json", "yaml"],
        default: "text",
        string: true,
        global: false,
        demandOption: false,
      })
      .option(DISABLE_MAP_ROLE_OPT, {
        description:
          "Do not assume role from each target when executing the map command",
        boolean: true,
        default: false,
        global: false,
        demandOption: false,
      })
      .option(CONFIG_FILE_OPT, {
        description: "Deployment config file",
        string: true,
        global: false,
        demandOption: false,
      }),
  handler: (argv: any) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        targets: parseStringArray(argv[TARGET_OPT]),
        excludeTargets: parseStringArray(argv[EXCLUDE_TARGET_OPT]),
        groups: argv.groups ?? [],
        configFile: argv[CONFIG_FILE_OPT] ?? null,
        concurrentTargets: argv[CONCURRENT_TARGETS_OPT],
        labels: parseStringArray(argv[LABEL_OPT]),
        excludeLabels: parseStringArray(argv[EXCLUDE_LABEL_OPT]),
        mapRoleName: argv[MAP_ROLE_NAME_OPT],
        disableMapRole: argv[DISABLE_MAP_ROLE_OPT],
        captureBeforeLine: argv[CAPTURE_BEFORE_OPT],
        captureAfterLine: argv[CAPTURE_AFTER_OPT],
        captureLastLine: argv[CAPTURE_LAST_LINE_OPT],
        mapCommand: argv[MAP_OPT],
        mapArgs: argv[MAP_ARGS_OPT],
        reduceRoleArn: argv[REDUCE_ROLE_ARN_OPT],
        reduceCommand: argv[REDUCE_OPT],
        outputFormat: argv[OUTPUT_OPT],
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
    }),
}
