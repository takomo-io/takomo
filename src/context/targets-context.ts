import { InternalCredentialManager } from "../aws/common/credentials.js"
import {
  ConfigSet,
  ConfigSetContext,
  ConfigSetName,
  DEFAULT_STAGE_NAME,
  StageName,
} from "../config-sets/config-set-model.js"
import {
  DeploymentConfig,
  DeploymentGroupConfig,
} from "../config/targets-config.js"
import { DeploymentGroupPath } from "../targets/targets-model.js"
import { collectFromHierarchy } from "../utils/collections.js"
import { TkmLogger } from "../utils/logging.js"
import { InternalCommandContext } from "./command-context.js"
import { StacksConfigRepository } from "../takomo-stacks-context/model.js"

export interface DeploymentTargetsConfigRepository
  extends StacksConfigRepository {
  readonly getDeploymentConfig: () => Promise<DeploymentConfig>
  readonly createStacksConfigRepository: (
    configSetName: ConfigSetName,
    legacy: boolean,
  ) => Promise<StacksConfigRepository>
}

export interface DeploymentTargetsContext
  extends InternalCommandContext,
    ConfigSetContext {
  readonly deploymentConfig: DeploymentConfig
  readonly rootDeploymentGroups: ReadonlyArray<DeploymentGroupConfig>
  readonly logger: TkmLogger
  readonly credentialManager: InternalCredentialManager
  readonly getDeploymentGroup: (
    path: DeploymentGroupPath,
  ) => DeploymentGroupConfig
  readonly hasDeploymentGroup: (path: DeploymentGroupPath) => boolean
  readonly commandContext: InternalCommandContext
  readonly configRepository: DeploymentTargetsConfigRepository
}

interface CreateDeploymentTargetsContextProps {
  readonly ctx: InternalCommandContext
  readonly logger: TkmLogger
  readonly configRepository: DeploymentTargetsConfigRepository
  readonly credentialManager: InternalCredentialManager
}

export const createDeploymentTargetsContext = async ({
  ctx,
  configRepository,
  credentialManager,
  logger,
}: CreateDeploymentTargetsContextProps): Promise<DeploymentTargetsContext> => {
  const { autoConfirmEnabled, variables } = ctx

  const deploymentConfig = await configRepository.getDeploymentConfig()

  const deploymentGroups = deploymentConfig.deploymentGroups
    .map((group) => collectFromHierarchy(group, (o) => o.children))
    .flat()

  const rootDeploymentGroups = deploymentConfig.deploymentGroups

  return {
    ...ctx,
    deploymentConfig,
    rootDeploymentGroups,
    logger,
    credentialManager,
    autoConfirmEnabled,
    variables,
    configRepository,
    commandContext: ctx,

    getStages: (): ReadonlyArray<StageName> => [DEFAULT_STAGE_NAME],
    getDeploymentGroup: (path: DeploymentGroupPath): DeploymentGroupConfig => {
      const group = deploymentGroups.find((group) => group.path === path)
      if (!group) {
        throw new Error(`No such deployment group: '${path}'`)
      }

      return group
    },

    hasDeploymentGroup: (path: DeploymentGroupPath): boolean =>
      deploymentGroups.some((group) => group.path === path),
    hasConfigSet: (name: ConfigSetName): boolean =>
      deploymentConfig.configSets.some((r) => r.name === name),
    getConfigSet: (name: ConfigSetName): ConfigSet => {
      const configSet = deploymentConfig.configSets.find((r) => r.name === name)
      if (!configSet) {
        throw new Error(`No such config set: ${name}`)
      }

      return configSet
    },
  }
}
