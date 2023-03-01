import { Arguments, Argv, CommandModule } from "yargs"
import { IOProps } from "../../cli-io/index.js"
import {
  CommandPath,
  DeploymentOperation,
} from "../../command/command-model.js"
import { deploymentTargetsOperationCommand } from "../../command/targets/operation/command.js"
import { DeploymentTargetsOperationIO } from "../../command/targets/operation/model.js"
import { ConfigSetName } from "../../config-sets/config-set-model.js"
import { createFileSystemDeploymentTargetsConfigRepository } from "../../takomo-config-repository-fs/deployment-targets/config-repository.js"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
  Label,
} from "../../targets/targets-model.js"
import { FilePath } from "../../utils/files.js"
import { commonEpilog, handle, RunProps } from "../common.js"
import {
  COMMAND_PATH_OPT,
  CONCURRENT_TARGETS_OPT,
  CONFIG_FILE_OPT,
  CONFIG_SET_OPT,
  EXCLUDE_LABEL_OPT,
  EXCLUDE_TARGET_OPT,
  LABEL_OPT,
  RESET_CACHE_OPT,
  TARGET_OPT,
} from "../constants.js"

export const GROUPS_OPT = "groups"

export interface DeploymentTargetsOperationCommandArgs {
  readonly [GROUPS_OPT]: ReadonlyArray<DeploymentGroupPath>
  readonly [TARGET_OPT]: ReadonlyArray<DeploymentTargetName>
  readonly [EXCLUDE_TARGET_OPT]: ReadonlyArray<DeploymentTargetName>
  readonly [LABEL_OPT]: ReadonlyArray<Label>
  readonly [EXCLUDE_LABEL_OPT]: ReadonlyArray<Label>
  readonly [CONCURRENT_TARGETS_OPT]: number
  readonly [COMMAND_PATH_OPT]: CommandPath | undefined
  readonly [CONFIG_SET_OPT]: ConfigSetName | undefined
  readonly [CONFIG_FILE_OPT]: FilePath | undefined
  readonly [RESET_CACHE_OPT]: boolean
}

export const deploymentTargetsOperationBuilder = (
  yargs: Argv<DeploymentTargetsOperationCommandArgs>,
) =>
  yargs
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
      [CONFIG_SET_OPT]: {
        description: "Config set to use in the operation",
        string: true,
        global: false,
        demandOption: false,
      },
      [COMMAND_PATH_OPT]: {
        description: "Command path to include in the operation",
        string: true,
        global: false,
        demandOption: false,
      },
      [CONFIG_FILE_OPT]: {
        description: "Deployment config file",
        string: true,
        global: false,
        demandOption: false,
      },
      [RESET_CACHE_OPT]: {
        description: "Reset cache before executing the operation",
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

const createTargetsOperationBuilder =
  (iamPolicyProvider: () => string) =>
  (yargs: Argv<DeploymentTargetsOperationCommandArgs>) =>
    deploymentTargetsOperationBuilder(yargs).epilog(
      commonEpilog(iamPolicyProvider),
    )

const createTargetsOperationHandler =
  (
    operation: DeploymentOperation,
    io: (props: IOProps) => DeploymentTargetsOperationIO,
  ) =>
  (argv: Arguments<DeploymentTargetsOperationCommandArgs>) =>
    handle({
      argv,
      input: async (ctx, input) => ({
        ...input,
        operation,
        targets: argv.target,
        excludeTargets: argv[EXCLUDE_TARGET_OPT],
        groups: argv.groups,
        configFile: argv[CONFIG_FILE_OPT],
        concurrentTargets: argv[CONCURRENT_TARGETS_OPT],
        labels: argv.label,
        excludeLabels: argv[EXCLUDE_LABEL_OPT],
        commandPath: argv[COMMAND_PATH_OPT],
        configSetName: argv[CONFIG_SET_OPT],
        resetCache: argv[RESET_CACHE_OPT],
        expectNoChanges: false,
        prune: false,
      }),
      io: (ctx, logger) => io({ logger }),
      configRepository: (ctx, logger, credentialManager) =>
        createFileSystemDeploymentTargetsConfigRepository({
          ctx,
          logger,
          credentialManager,
          pathToDeploymentConfigFile: argv[CONFIG_FILE_OPT],
          ...ctx.filePaths,
        }),
      executor: deploymentTargetsOperationCommand,
    })

interface DeploymentTargetsOperationCommandProps {
  readonly command: string
  readonly describe: string
  readonly operation: DeploymentOperation
  readonly iamPolicyProvider: () => string
  readonly io: (props: IOProps) => DeploymentTargetsOperationIO
}

type DeploymentTargetsCommandModule = CommandModule<
  DeploymentTargetsOperationCommandArgs,
  DeploymentTargetsOperationCommandArgs
>

export const targetsOperationCommand =
  ({
    command,
    describe,
    operation,
    io,
    iamPolicyProvider,
  }: DeploymentTargetsOperationCommandProps) =>
  ({ overridingHandler }: RunProps): DeploymentTargetsCommandModule => ({
    command,
    describe,
    builder: createTargetsOperationBuilder(iamPolicyProvider),
    handler: overridingHandler ?? createTargetsOperationHandler(operation, io),
  })
