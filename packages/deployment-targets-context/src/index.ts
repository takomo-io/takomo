import {
  CredentialManager,
  initDefaultCredentialManager,
} from "@takomo/aws-clients"
import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import { CommandContext } from "@takomo/core"
import {
  DeploymentConfig,
  DeploymentGroupConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentGroupPath } from "@takomo/deployment-targets-model"
import { StacksConfigRepository } from "@takomo/stacks-context"
import { collectFromHierarchy, deepFreeze, TkmLogger } from "@takomo/util"
import flatten from "lodash.flatten"

export interface DeploymentTargetsConfigRepository
  extends StacksConfigRepository {
  loadDeploymentConfigFileContents: () => Promise<DeploymentConfig>
}

export interface DeploymentTargetsContext extends CommandContext {
  readonly deploymentConfig: DeploymentConfig
  readonly rootDeploymentGroups: ReadonlyArray<DeploymentGroupConfig>
  readonly logger: TkmLogger
  readonly credentialManager: CredentialManager
  readonly getDeploymentGroup: (
    path: DeploymentGroupPath,
  ) => DeploymentGroupConfig
  readonly hasDeploymentGroup: (path: DeploymentGroupPath) => boolean
  readonly getConfigSet: (name: ConfigSetName) => ConfigSet
  readonly commandContext: CommandContext
  readonly configRepository: DeploymentTargetsConfigRepository
}

interface CreateDeploymentTargetsContextProps {
  readonly ctx: CommandContext
  readonly logger: TkmLogger
  readonly configRepository: DeploymentTargetsConfigRepository
}

export const createDeploymentTargetsContext = async ({
  logger,
  ctx,
  configRepository,
}: CreateDeploymentTargetsContextProps): Promise<DeploymentTargetsContext> => {
  const { autoConfirmEnabled, variables, credentials } = ctx
  const credentialManager = await initDefaultCredentialManager(credentials)

  const deploymentConfig = await configRepository.loadDeploymentConfigFileContents()

  const deploymentGroups = flatten(
    deploymentConfig.deploymentGroups.map((group) =>
      collectFromHierarchy(group, (o) => o.children),
    ),
  )

  const rootDeploymentGroups = deploymentConfig.deploymentGroups

  return deepFreeze({
    ...ctx,
    deploymentConfig: deploymentConfig,
    rootDeploymentGroups,
    logger,
    credentialManager,
    autoConfirmEnabled,
    variables,
    configRepository,
    commandContext: ctx,

    getDeploymentGroup: (path: DeploymentGroupPath): DeploymentGroupConfig => {
      const group = deploymentGroups.find((group) => group.path === path)
      if (!group) {
        throw new Error(`No such deployment group: '${path}'`)
      }

      return group
    },

    hasDeploymentGroup: (path: DeploymentGroupPath): boolean =>
      deploymentGroups.find((group) => group.path === path) !== undefined,

    getConfigSet: (name: ConfigSetName): ConfigSet => {
      const configSet = deploymentConfig.configSets.find((r) => r.name === name)
      if (!configSet) {
        throw new Error(`No such config set: ${name}`)
      }

      return configSet
    },
  })
}
