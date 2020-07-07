import { ConfigSet, ConfigSetName } from "@takomo/config-sets"
import {
  AccountId,
  CommandRole,
  Options,
  TakomoCredentialProvider,
  Variables,
  Vars,
} from "@takomo/core"
import { collectFromHierarchy, deepCopy, Logger } from "@takomo/util"
import flatten from "lodash.flatten"

export type DeploymentGroupName = string
export type DeploymentTargetName = string
export type DeploymentGroupPath = string

export enum DeploymentStatus {
  ACTIVE,
  DISABLED,
}
export interface DeploymentTargetConfig {
  readonly status: DeploymentStatus
  readonly name: DeploymentTargetName
  readonly description: string
  readonly vars: Vars
  readonly configSets: ConfigSetName[]
  readonly bootstrapConfigSets: ConfigSetName[]
  readonly deploymentRole: CommandRole | null
  readonly bootstrapRole: CommandRole | null
  readonly accountId: AccountId | null
}

export interface DeploymentGroupConfig {
  readonly name: DeploymentGroupName
  readonly path: DeploymentGroupPath
  readonly description: string
  readonly targets: DeploymentTargetConfig[]
  readonly priority: number
  readonly status: DeploymentStatus
  readonly vars: Vars
  readonly configSets: ConfigSetName[]
  readonly bootstrapConfigSets: ConfigSetName[]
  readonly children: DeploymentGroupConfig[]
  readonly deploymentRole: CommandRole | null
  readonly bootstrapRole: CommandRole | null
}

export interface DeploymentConfigFile {
  readonly configSets: ConfigSet[]
  readonly vars: Vars
  readonly deploymentGroups: DeploymentGroupConfig[]
}

export interface DeploymentTargetsContextProps {
  readonly credentialProvider: TakomoCredentialProvider
  readonly logger: Logger
  readonly options: Options
  readonly variables: Variables
  readonly configFile: DeploymentConfigFile
}

export class DeploymentTargetsContext {
  readonly #credentialProvider: TakomoCredentialProvider
  readonly #logger: Logger
  readonly #options: Options
  readonly #variables: Variables
  readonly #configFile: DeploymentConfigFile
  readonly #deploymentGroups: DeploymentGroupConfig[]
  readonly #rootDeploymentGroups: DeploymentGroupConfig[]

  constructor(props: DeploymentTargetsContextProps) {
    this.#credentialProvider = props.credentialProvider
    this.#logger = props.logger
    this.#options = props.options
    this.#variables = props.variables
    this.#configFile = props.configFile
    this.#rootDeploymentGroups = props.configFile.deploymentGroups

    this.#deploymentGroups = flatten(
      this.#rootDeploymentGroups.map((group) =>
        collectFromHierarchy(group, (o) => o.children),
      ),
    )
  }

  getConfigFile = (): DeploymentConfigFile => this.#configFile

  getRootDeploymentGroups = (): DeploymentGroupConfig[] => [
    ...this.#rootDeploymentGroups,
  ]

  getOptions = (): Options => this.#options
  getLogger = (): Logger => this.#logger
  getVariables = (): Variables => deepCopy(this.#variables)

  getCredentialProvider = (): TakomoCredentialProvider =>
    this.#credentialProvider

  getDeploymentGroup = (path: DeploymentGroupPath): DeploymentGroupConfig => {
    const group = this.#deploymentGroups.find((group) => group.path === path)
    if (!group) {
      throw new Error(`No such deployment group: '${path}'`)
    }

    return group
  }

  hasDeploymentGroup = (path: DeploymentGroupPath): boolean =>
    this.#deploymentGroups.find((group) => group.path === path) !== undefined

  getConfigSet = (name: ConfigSetName): ConfigSet => {
    const configSet = this.#configFile.configSets.find((r) => r.name === name)
    if (!configSet) {
      throw new Error(`No such config set: ${name}`)
    }

    return configSet
  }
}
