import { CredentialManager } from "../takomo-aws-clients"
import {
  ConfigSet,
  ConfigSetContext,
  ConfigSetName,
  DEFAULT_STAGE_NAME,
  StageName,
} from "../takomo-config-sets"
import { InternalCommandContext } from "../takomo-core"
import {
  DeploymentConfig,
  DeploymentGroupConfig,
} from "../takomo-deployment-targets-config"
import { DeploymentGroupPath } from "../takomo-deployment-targets-model"
import { StacksConfigRepository } from "../takomo-stacks-context"
import { collectFromHierarchy, TkmLogger } from "../takomo-util"

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
  readonly credentialManager: CredentialManager
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
  readonly credentialManager: CredentialManager
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
