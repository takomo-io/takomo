import { basename } from "path"
import { initProjectCommand } from "../../../src/command/init/command"
import { ProjectConfigRepository } from "../../../src/command/init/model"
import { InternalCommandContext } from "../../../src/context/command-context"
import { initDefaultCredentialManager } from "../../../src/takomo-aws-clients"
import { Region } from "../../../src/takomo-aws-model"
import { createFileSystemProjectConfigRepository } from "../../../src/takomo-config-repository-fs"
import { Project } from "../../../src/takomo-core/command"
import { createConsoleLogger } from "../../../src/utils/logging"
import { Timer } from "../../../src/utils/timer"
import {
  createInitProjectOutputMatcher,
  InitProjectOutputMatcher,
} from "../assertions/init"
import { createTestInitProjectIO } from "../io"
import { createTestCommandContext, ExecuteCommandProps } from "./common"
import {
  CreateCtxAndConfigRepositoryProps,
  CreateTestStacksConfigRepositoryProps,
} from "./stacks"

export const createTestProjectConfigRepository = async ({
  ctx,
}: CreateTestStacksConfigRepositoryProps): Promise<ProjectConfigRepository> =>
  createFileSystemProjectConfigRepository({
    ...ctx.filePaths,
    ctx,
    logger: createConsoleLogger({
      logLevel: ctx.logLevel,
      name: basename(expect.getState().testPath),
    }),
  })

interface CtxAndConfigRepository {
  ctx: InternalCommandContext
  configRepository: ProjectConfigRepository
}

const createCtxAndConfigRepository = async (
  props: CreateCtxAndConfigRepositoryProps,
): Promise<CtxAndConfigRepository> => {
  const ctx = await createTestCommandContext(props)
  const configRepository = await createTestProjectConfigRepository({ ctx })
  return {
    ctx,
    configRepository,
  }
}

interface ExecuteInitProjectProps extends ExecuteCommandProps {
  readonly createSamples?: boolean
  readonly project?: Project
  readonly regions?: ReadonlyArray<Region>
}

export const executeInitProjectCommand = (
  props: ExecuteInitProjectProps,
): InitProjectOutputMatcher =>
  createInitProjectOutputMatcher(async () => {
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

    const { project, createSamples, regions } = props

    const credentialManager = await initDefaultCredentialManager(
      () => Promise.resolve(""),
      logger,
      ctxAndConfig.ctx.awsClientProvider,
      ctxAndConfig.ctx.credentials,
    )

    return initProjectCommand({
      ...ctxAndConfig,
      credentialManager,
      io: createTestInitProjectIO(logger),
      input: {
        timer: new Timer("total"),
        outputFormat: "text",
        project,
        createSamples,
        regions,
      },
    })
  })
