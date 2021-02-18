import { CliCommandContext } from "@takomo/cli"
import { createFileSystemStacksConfigRepository } from "@takomo/config-repository-fs"
import { CommandContext } from "@takomo/core"
import {
  deployStacksCommand,
  listStacksCommand,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { StacksConfigRepository } from "@takomo/stacks-context"
import { ROOT_STACK_GROUP_PATH } from "@takomo/stacks-model"
import {
  createConsoleLogger,
  createTimer,
  FilePath,
  LogLevel,
} from "@takomo/util"
import {
  createListStacksOutputMatcher,
  createStacksOperationOutputMatcher,
  ListStacksOutputMatcher,
  StacksOperationOutputMatcher,
} from "../assertions/stacks"
import {
  createTestDeployStacksIO,
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
}

export interface CreateTestStacksConfigRepositoryProps {
  readonly ctx: CliCommandContext
}

export const createTestStacksConfigRepository = async ({
  ctx,
}: CreateTestStacksConfigRepositoryProps): Promise<StacksConfigRepository> =>
  createFileSystemStacksConfigRepository({
    ...ctx.filePaths,
    ctx,
    logger: createConsoleLogger({
      logLevel: ctx.logLevel,
    }),
  })

interface CtxAndConfigRepository {
  ctx: CommandContext
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
}

export interface ExecuteUndeployStacksCommandProps extends ExecuteCommandProps {
  readonly answers?: TestUndeployStacksIOAnswers
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
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return deployStacksCommand({
      ...ctxAndConfig,
      io: createTestDeployStacksIO(
        logger,
        props.autoConfirmEnabled,
        props.answers,
      ),
      input: {
        ignoreDependencies,
        commandPath: props.commandPath ?? ROOT_STACK_GROUP_PATH,
        timer: createTimer("total"),
        interactive: false,
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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return undeployStacksCommand({
      ...ctxAndConfig,
      io: createTestUndeployStacksIO(
        logger,
        props.autoConfirmEnabled,
        props.answers,
      ),
      input: {
        commandPath: props.commandPath ?? ROOT_STACK_GROUP_PATH,
        timer: createTimer("total"),
        ignoreDependencies: props.ignoreDependencies ?? false,
        interactive: false,
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
      logLevel,
    })

    const logger = createConsoleLogger({
      logLevel,
    })

    return listStacksCommand({
      ...ctxAndConfig,
      io: createTestListStacksIO(logger),
      input: {
        commandPath: props.commandPath ?? ROOT_STACK_GROUP_PATH,
        timer: createTimer("total"),
      },
    })
  })
