import { initDefaultCredentialManager } from "@takomo/aws-clients"
import { IamRoleArn, IamRoleName } from "@takomo/aws-model"
import { CliCommandContext } from "@takomo/cli"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { ConfigSetName } from "@takomo/config-sets"
import { InternalCommandContext, OutputFormat } from "@takomo/core"
import {
  deploymentTargetsOperationCommand,
  deploymentTargetsRunCommand,
} from "@takomo/deployment-targets-commands"
import { DeploymentTargetsConfigRepository } from "@takomo/deployment-targets-context"
import { CommandPath } from "@takomo/stacks-model"
import { createConsoleLogger, createTimer } from "@takomo/util"
import {
  createTargetsOperationOutputMatcher,
  createTargetsRunOutputMatcher,
  TargetsOperationOutputMatcher,
  TargetsRunOutputMatcher,
} from "../assertions/targets"
import {
  createTestBootstrapTargetsIO,
  createTestDeployTargetsIO,
  createTestRunTargetsIO,
  createTestTeardownTargetsIO,
  createTestUndeployTargetsIO,
} from "../io"
import { createTestCommandContext, ExecuteCommandProps } from "./common"
import { CreateCtxAndConfigRepositoryProps } from "./stacks"

interface CtxAndConfigRepository {
  readonly ctx: InternalCommandContext
  readonly configRepository: DeploymentTargetsConfigRepository
}

export interface CreateTestDeploymentTargetsConfigRepositoryProps {
  readonly ctx: CliCommandContext
  readonly pathToDeploymentConfigFile?: string
}

export const createTestDeploymentTargetsConfigRepository = async ({
  ctx,
  pathToDeploymentConfigFile,
}: CreateTestDeploymentTargetsConfigRepositoryProps): Promise<DeploymentTargetsConfigRepository> =>
  createFileSystemDeploymentTargetsConfigRepository({
    ...ctx.filePaths,
    ctx,
    pathToDeploymentConfigFile,
    logger: createConsoleLogger({
      logLevel: ctx.logLevel,
    }),
  })

export interface CreateDeploymentTargetsCtxAndConfigRepositoryProps
  extends CreateCtxAndConfigRepositoryProps {
  readonly pathToDeploymentConfigFile?: string
}

const createCtxAndConfigRepository = async (
  props: CreateDeploymentTargetsCtxAndConfigRepositoryProps,
): Promise<CtxAndConfigRepository> => {
  const ctx = await createTestCommandContext(props)
  const configRepository = await createTestDeploymentTargetsConfigRepository({
    ctx,
    pathToDeploymentConfigFile: props.pathToDeploymentConfigFile,
  })
  return {
    ctx,
    configRepository,
  }
}

export interface ExecuteDeployTargetsCommandProps extends ExecuteCommandProps {
  readonly groups?: ReadonlyArray<string>
  readonly targets?: ReadonlyArray<string>
  readonly excludeTargets?: ReadonlyArray<string>
  readonly labels?: ReadonlyArray<string>
  readonly excludeLabels?: ReadonlyArray<string>
  readonly configFile?: string
  readonly concurrentTargets?: number
  readonly commandPath?: CommandPath
  readonly configSetName?: ConfigSetName
  readonly expectNoChanges?: boolean
}

export const executeDeployTargetsCommand = (
  props: ExecuteDeployTargetsCommandProps,
): TargetsOperationOutputMatcher =>
  createTargetsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      pathToDeploymentConfigFile: props.configFile,
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestDeployTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "standard",
        operation: "deploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
        excludeTargets: props.excludeTargets ?? [],
        labels: props.labels ?? [],
        excludeLabels: props.excludeLabels ?? [],
        concurrentTargets: props.concurrentTargets ?? 1,
        commandPath: props.commandPath,
        configSetName: props.configSetName,
        expectNoChanges: props.expectNoChanges ?? false,
        outputFormat: "text",
      },
    })
  })

export const executeUndeployTargetsCommand = (
  props: ExecuteDeployTargetsCommandProps,
): TargetsOperationOutputMatcher =>
  createTargetsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      pathToDeploymentConfigFile: props.configFile,
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestUndeployTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "standard",
        operation: "undeploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
        excludeTargets: props.excludeTargets ?? [],
        labels: props.labels ?? [],
        excludeLabels: props.excludeLabels ?? [],
        concurrentTargets: props.concurrentTargets ?? 1,
        commandPath: props.commandPath,
        configSetName: props.configSetName,
        expectNoChanges: props.expectNoChanges ?? false,
        outputFormat: "text",
      },
    })
  })

export const executeBootstrapTargetsCommand = (
  props: ExecuteDeployTargetsCommandProps,
): TargetsOperationOutputMatcher =>
  createTargetsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      pathToDeploymentConfigFile: props.configFile,
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestBootstrapTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "bootstrap",
        operation: "deploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
        excludeTargets: props.excludeTargets ?? [],
        labels: props.labels ?? [],
        excludeLabels: props.excludeLabels ?? [],
        concurrentTargets: props.concurrentTargets ?? 1,
        commandPath: props.commandPath,
        configSetName: props.configSetName,
        expectNoChanges: props.expectNoChanges ?? false,
        outputFormat: "text",
      },
    })
  })

export const executeTeardownTargetsCommand = (
  props: ExecuteDeployTargetsCommandProps,
): TargetsOperationOutputMatcher =>
  createTargetsOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      pathToDeploymentConfigFile: props.configFile,
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestTeardownTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "bootstrap",
        operation: "undeploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
        excludeTargets: props.excludeTargets ?? [],
        labels: props.labels ?? [],
        excludeLabels: props.excludeLabels ?? [],
        concurrentTargets: props.concurrentTargets ?? 1,
        commandPath: props.commandPath,
        configSetName: props.configSetName,
        expectNoChanges: props.expectNoChanges ?? false,
        outputFormat: "text",
      },
    })
  })

export interface ExecuteRunTargetsCommandProps extends ExecuteCommandProps {
  readonly groups?: ReadonlyArray<string>
  readonly targets?: ReadonlyArray<string>
  readonly excludeTargets?: ReadonlyArray<string>
  readonly labels?: ReadonlyArray<string>
  readonly excludeLabels?: ReadonlyArray<string>
  readonly configFile?: string
  readonly concurrentTargets?: number
  readonly mapCommand: string
  readonly mapArgs?: string
  readonly reduceCommand?: string
  readonly outputFormat?: OutputFormat
  readonly roleName?: IamRoleName
  readonly captureLastLine?: boolean
  readonly captureAfterLine?: string
  readonly captureBeforeLine?: string
  readonly disableMapRole?: boolean
  readonly reduceRoleArn?: IamRoleArn
}

export const executeRunTargetsCommand = (
  props: ExecuteRunTargetsCommandProps,
): TargetsRunOutputMatcher =>
  createTargetsRunOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      pathToDeploymentConfigFile: props.configFile,
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return deploymentTargetsRunCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestRunTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        groups: props.groups ?? [],
        targets: props.targets ?? [],
        excludeTargets: props.excludeTargets ?? [],
        labels: props.labels ?? [],
        excludeLabels: props.excludeLabels ?? [],
        concurrentTargets: props.concurrentTargets ?? 1,
        mapCommand: props.mapCommand,
        mapArgs: props.mapArgs,
        reduceCommand: props.reduceCommand,
        outputFormat: props.outputFormat ?? "text",
        captureLastLine: props.captureLastLine ?? false,
        captureBeforeLine: props.captureBeforeLine,
        captureAfterLine: props.captureAfterLine,
        mapRoleName: props.roleName,
        disableMapRole: props.disableMapRole ?? false,
        reduceRoleArn: props.reduceRoleArn,
      },
    })
  })
