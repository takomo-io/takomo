import { CliCommandContext } from "@takomo/cli"
import { createFileSystemDeploymentTargetsConfigRepository } from "@takomo/config-repository-fs"
import { InternalCommandContext } from "@takomo/core"
import { deploymentTargetsOperationCommand } from "@takomo/deployment-targets-commands"
import { DeploymentTargetsConfigRepository } from "@takomo/deployment-targets-context"
import { createConsoleLogger, createTimer } from "@takomo/util"
import {
  createTargetsOperationOutputMatcher,
  TargetsOperationOutputMatcher,
} from "../assertions/targets"
import {
  createTestBootstrapTargetsIO,
  createTestDeployTargetsIO,
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
}: CreateTestDeploymentTargetsConfigRepositoryProps): Promise<
  DeploymentTargetsConfigRepository
> =>
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
  readonly configFile?: string
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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      io: createTestDeployTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "standard",
        operation: "deploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      io: createTestUndeployTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "standard",
        operation: "undeploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      io: createTestBootstrapTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "bootstrap",
        operation: "deploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return deploymentTargetsOperationCommand({
      ...ctxAndConfig,
      io: createTestTeardownTargetsIO(logger),
      input: {
        timer: createTimer("total"),
        configSetType: "bootstrap",
        operation: "undeploy",
        groups: props.groups ?? [],
        targets: props.targets ?? [],
      },
    })
  })
