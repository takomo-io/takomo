import { basename } from "path"
import { initDefaultCredentialManager } from "../../../src/aws/common/credentials"
import { deployStacksCommand } from "../../../src/command/stacks/deploy/command"
import { detectDriftCommand } from "../../../src/command/stacks/drift/command"
import { listStacksCommand } from "../../../src/command/stacks/list/command"
import { undeployStacksCommand } from "../../../src/command/stacks/undeploy/command"
import { InternalCommandContext } from "../../../src/context/command-context"
import { FileSystemCommandContext } from "../../../src/takomo-config-repository-fs/context/create-file-system-command-context"
import { createFileSystemStacksConfigRepository } from "../../../src/takomo-config-repository-fs/stacks/config-repository"
import { StacksConfigRepository } from "../../../src/takomo-stacks-context"
import { ROOT_STACK_GROUP_PATH } from "../../../src/takomo-stacks-model/constants"
import { FilePath } from "../../../src/utils/files"
import { createConsoleLogger, LogLevel } from "../../../src/utils/logging"
import { Timer } from "../../../src/utils/timer"
import {
  createDetectDriftOutputMatcher,
  createListStacksOutputMatcher,
  createStacksOperationOutputMatcher,
  DetectDriftOutputMatcher,
  ListStacksOutputMatcher,
  StacksOperationOutputMatcher,
} from "../assertions/stacks"
import {
  createTestDeployStacksIO,
  createTestDetectDriftIO,
  createTestListStacksIO,
  createTestUndeployStacksIO,
  TestDeployStacksIOAnswers,
  TestUndeployStacksIOAnswers,
} from "../io"
import { createTestCommandContext, ExecuteCommandProps } from "./common"

export interface CreateCtxAndConfigRepositoryProps {
  readonly projectDir: FilePath
  readonly var: ReadonlyArray<string>
  readonly varFile: ReadonlyArray<string>
  readonly autoConfirmEnabled: boolean
  readonly ignoreDependencies: boolean
  readonly logLevel: LogLevel
  readonly feature: ReadonlyArray<string>
}

export interface CreateTestStacksConfigRepositoryProps {
  readonly ctx: FileSystemCommandContext
}

export const createTestStacksConfigRepository = async ({
  ctx,
}: CreateTestStacksConfigRepositoryProps): Promise<StacksConfigRepository> =>
  createFileSystemStacksConfigRepository({
    ...ctx.filePaths,
    ctx,
    logger: createConsoleLogger({
      logLevel: ctx.logLevel,
      name: basename(expect.getState().testPath),
    }),
  })

interface CtxAndConfigRepository {
  ctx: InternalCommandContext
  configRepository: StacksConfigRepository
}

const createCtxAndConfigRepository = async (
  props: CreateCtxAndConfigRepositoryProps,
): Promise<CtxAndConfigRepository> => {
  const ctx = await createTestCommandContext(props)

  const configRepository = await createTestStacksConfigRepository({ ctx })
  return {
    ctx,
    configRepository,
  }
}

export interface ExecuteDeployStacksCommandProps extends ExecuteCommandProps {
  readonly answers?: TestDeployStacksIOAnswers
  readonly interactive?: boolean
  readonly expectNoChanges?: boolean
}

export interface ExecuteUndeployStacksCommandProps extends ExecuteCommandProps {
  readonly answers?: TestUndeployStacksIOAnswers
  readonly interactive?: boolean
  readonly prune?: boolean
}

export const executeDeployStacksCommand = (
  props: ExecuteDeployStacksCommandProps,
): StacksOperationOutputMatcher =>
  createStacksOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"
    const ignoreDependencies = props.ignoreDependencies ?? false

    const ctxAndConfig = await createCtxAndConfigRepository({
      ignoreDependencies,
      logLevel,
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      feature: props.feature ?? [],
    })

    const logger = createConsoleLogger({
      logLevel,
      name: basename(expect.getState().testPath),
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return deployStacksCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestDeployStacksIO(logger, props.answers),
      input: {
        ignoreDependencies,
        expectNoChanges: props.expectNoChanges ?? false,
        commandPath: props.commandPath ?? ROOT_STACK_GROUP_PATH,
        timer: new Timer("total"),
        interactive: props.interactive ?? false,
        outputFormat: "text",
      },
    })
  })

export const executeUndeployStacksCommand = (
  props: ExecuteUndeployStacksCommandProps,
): StacksOperationOutputMatcher =>
  createStacksOperationOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
      name: basename(expect.getState().testPath),
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return undeployStacksCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestUndeployStacksIO(
        logger,
        props.autoConfirmEnabled,
        props.answers,
      ),
      input: {
        commandPath: props.commandPath ?? ROOT_STACK_GROUP_PATH,
        timer: new Timer("total"),
        ignoreDependencies: props.ignoreDependencies ?? false,
        interactive: props.interactive ?? false,
        prune: props.prune ?? false,
        outputFormat: "text",
      },
    })
  })

export const executeListStacksCommand = (
  props: ExecuteCommandProps,
): ListStacksOutputMatcher =>
  createListStacksOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
      name: basename(expect.getState().testPath),
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return listStacksCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestListStacksIO(logger),
      input: {
        commandPath: props.commandPath ?? ROOT_STACK_GROUP_PATH,
        timer: new Timer("total"),
        outputFormat: "text",
      },
    })
  })

export const executeDetectDriftCommand = (
  props: ExecuteCommandProps,
): DetectDriftOutputMatcher =>
  createDetectDriftOutputMatcher(async () => {
    const logLevel = props.logLevel ?? "info"

    const ctxAndConfig = await createCtxAndConfigRepository({
      projectDir: props.projectDir,
      autoConfirmEnabled: props.autoConfirmEnabled ?? true,
      ignoreDependencies: props.ignoreDependencies ?? false,
      var: props.var ?? [],
      varFile: props.varFile ?? [],
      feature: props.feature ?? [],
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
      name: basename(expect.getState().testPath),
    })

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return detectDriftCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestDetectDriftIO(logger),
      input: {
        commandPath: props.commandPath ?? ROOT_STACK_GROUP_PATH,
        timer: new Timer("total"),
        outputFormat: "text",
      },
    })
  })
