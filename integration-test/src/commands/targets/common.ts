import {
  initDefaultCredentialManager,
  InternalCredentialManager,
} from "../../../../src/takomo-aws-clients"
import {
  createFileSystemDeploymentTargetsConfigRepository,
  FileSystemCommandContext,
} from "../../../../src/takomo-config-repository-fs"
import { InternalCommandContext } from "../../../../src/takomo-core"
import { DeploymentTargetsConfigRepository } from "../../../../src/takomo-deployment-targets-context"
import { createConsoleLogger, TkmLogger } from "../../../../src/utils/logging"
import { createTestCommandContext } from "../common"
import { CreateCtxAndConfigRepositoryProps } from "../stacks"

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
