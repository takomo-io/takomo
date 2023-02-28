import { Arguments, Argv, CommandModule } from "yargs"
import { IOProps } from "../../cli-io"
import { DeploymentOperation } from "../../command/command-model"
import { deploymentTargetsOperationCommand } from "../../command/targets/operation/command"
import { DeploymentTargetsOperationIO } from "../../command/targets/operation/model"
import { createFileSystemDeploymentTargetsConfigRepository } from "../../takomo-config-repository-fs/deployment-targets/config-repository"
import { commonEpilog, handle, RunProps } from "../common"
import {
  COMMAND_PATH_OPT,
  CONCURRENT_TARGETS_OPT,
  CONFIG_FILE_OPT,
  CONFIG_SET_OPT,
  EXCLUDE_LABEL_OPT,
  EXCLUDE_TARGET_OPT,
  EXPECT_NO_CHANGES_OPT,
  LABEL_OPT,
  RESET_CACHE_OPT,
  TARGET_OPT,
} from "../constants"
import { DeploymentTargetsOperationCommandArgs, GROUPS_OPT } from "./common"

export interface DeploymentTargetsDeployCommandArgs
  extends DeploymentTargetsOperationCommandArgs {
  readonly [EXPECT_NO_CHANGES_OPT]: boolean
}

interface DeploymentTargetsDeployCommandProps {
  readonly command: string
  readonly describe: string
  readonly iamPolicyProvider: () => string
  readonly io: (props: IOProps) => DeploymentTargetsOperationIO
}

const deploymentTargetsDeployBuilder = (
  yargs: Argv<DeploymentTargetsDeployCommandArgs>,
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
      [EXPECT_NO_CHANGES_OPT]: {
        description: "Expect no changes to stacks",
        boolean: true,
        global: false,
        default: false,
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

const createTargetsDeployBuilder =
  (iamPolicyProvider: () => string) =>
  (yargs: Argv<DeploymentTargetsDeployCommandArgs>) =>
    deploymentTargetsDeployBuilder(yargs).epilog(
      commonEpilog(iamPolicyProvider),
    )

const createTargetsDeployHandler =
  (
    operation: DeploymentOperation,
    io: (props: IOProps) => DeploymentTargetsOperationIO,
  ) =>
  (argv: Arguments<DeploymentTargetsDeployCommandArgs>) =>
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
        expectNoChanges: argv[EXPECT_NO_CHANGES_OPT],
        resetCache: argv[RESET_CACHE_OPT],
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

type DeploymentTargetsCommandModule = CommandModule<
  DeploymentTargetsDeployCommandArgs,
  DeploymentTargetsDeployCommandArgs
>

export const targetsDeployCommand =
  ({
    command,
    describe,
    io,
    iamPolicyProvider,
  }: DeploymentTargetsDeployCommandProps) =>
  ({ overridingHandler }: RunProps): DeploymentTargetsCommandModule => ({
    command,
    describe,
    builder: createTargetsDeployBuilder(iamPolicyProvider),
    handler: overridingHandler ?? createTargetsDeployHandler("deploy", io),
  })
