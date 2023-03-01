import {
  initDefaultCredentialManager,
  InternalCredentialManager,
} from "../../../../src/aws/common/credentials.js"
import { InternalCommandContext } from "../../../../src/context/command-context.js"
import { DeploymentTargetsConfigRepository } from "../../../../src/context/targets-context.js"
import { FileSystemCommandContext } from "../../../../src/takomo-config-repository-fs/context/create-file-system-command-context.js"
import { createFileSystemDeploymentTargetsConfigRepository } from "../../../../src/takomo-config-repository-fs/deployment-targets/config-repository.js"
import {
  createConsoleLogger,
  TkmLogger,
} from "../../../../src/utils/logging.js"
import { createTestCommandContext } from "../common.js"
import { CreateCtxAndConfigRepositoryProps } from "../stacks.js"

interface CtxAndConfigRepository {
  readonly ctx: InternalCommandContext
  readonly configRepository: DeploymentTargetsConfigRepository
  readonly credentialManager: InternalCredentialManager
}

export interface CreateDeploymentTargetsCtxAndConfigRepositoryProps
  extends CreateCtxAndConfigRepositoryProps {
  readonly pathToDeploymentConfigFile?: string
  readonly logger: TkmLogger
}

export interface CreateTestDeploymentTargetsConfigRepositoryProps {
  readonly ctx: FileSystemCommandContext
  readonly credentialManager: InternalCredentialManager
  readonly pathToDeploymentConfigFile?: string
}

export const createTestDeploymentTargetsConfigRepository = async ({
  ctx,
  pathToDeploymentConfigFile,
  credentialManager,
}: CreateTestDeploymentTargetsConfigRepositoryProps): Promise<DeploymentTargetsConfigRepository> =>
  createFileSystemDeploymentTargetsConfigRepository({
    ...ctx.filePaths,
    ctx,
    pathToDeploymentConfigFile,
    credentialManager,
    logger: createConsoleLogger({
      logLevel: ctx.logLevel,
    }),
  })

export const createCtxAndConfigRepository = async (
  props: CreateDeploymentTargetsCtxAndConfigRepositoryProps,
): Promise<CtxAndConfigRepository> => {
  const ctx = await createTestCommandContext(props)

  const credentialManager = await initDefaultCredentialManager(
    () => Promise.resolve(""),
    props.logger,
    ctx.awsClientProvider,
    ctx.credentials,
  )

  const configRepository = await createTestDeploymentTargetsConfigRepository({
    ctx,
    credentialManager,
    pathToDeploymentConfigFile: props.pathToDeploymentConfigFile,
  })
  return {
    ctx,
    configRepository,
    credentialManager,
  }
}
