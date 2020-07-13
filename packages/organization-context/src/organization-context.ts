import { OrganizationsClient } from "@takomo/aws-clients"
import { ConfigSet } from "@takomo/config-sets"
import { Options, TakomoCredentialProvider, Variables } from "@takomo/core"
import {
  OrganizationalUnit,
  OrganizationConfigFile,
} from "@takomo/organization-config"
import { collectFromHierarchy, deepCopy, Logger } from "@takomo/util"

export interface OrganizationContextProps {
  readonly credentialProvider: TakomoCredentialProvider
  readonly organizationAdminCredentialProvider: TakomoCredentialProvider
  readonly logger: Logger
  readonly options: Options
  readonly variables: Variables
  readonly organizationConfigFile: OrganizationConfigFile
}

export class OrganizationContext {
  private readonly credentialProvider: TakomoCredentialProvider
  private readonly organizationAdminCredentialProvider: TakomoCredentialProvider
  private readonly logger: Logger
  private readonly options: Options
  private readonly variables: Variables
  private readonly organizationConfigFile: OrganizationConfigFile
  private readonly organizationalUnits: OrganizationalUnit[]

  constructor(props: OrganizationContextProps) {
    this.credentialProvider = props.credentialProvider
    this.organizationAdminCredentialProvider =
      props.organizationAdminCredentialProvider
    this.logger = props.logger
    this.options = props.options
    this.variables = props.variables
    this.organizationConfigFile = props.organizationConfigFile
    this.organizationalUnits = collectFromHierarchy(
      props.organizationConfigFile.organizationalUnits.Root,
      (o) => o.children,
    )
  }

  getClient = (): OrganizationsClient =>
    new OrganizationsClient({
      region: "us-east-1",
      credentialProvider: this.organizationAdminCredentialProvider,
      logger: this.logger.childLogger("http"),
    })

  hasOrganizationalUnit = (path: string): boolean =>
    this.organizationalUnits.find((ou) => ou.path === path) !== undefined

  getOrganizationalUnit = (path: string): OrganizationalUnit => {
    const ou = this.organizationalUnits.find((ou) => ou.path === path)
    if (!ou) {
      throw new Error(`No such organizational unit: '${path}'`)
    }

    return ou
  }

  getOptions = (): Options => this.options
  getLogger = (): Logger => this.logger
  getVariables = (): Variables => deepCopy(this.variables)
  getCredentialProvider = (): TakomoCredentialProvider =>
    this.credentialProvider
  getOrganizationConfigFile = (): OrganizationConfigFile =>
    this.organizationConfigFile

  getConfigSet = (name: string): ConfigSet => {
    const configSet = this.organizationConfigFile.configSets.find(
      (r) => r.name === name,
    )
    if (!configSet) {
      throw new Error(`No such config set: ${name}`)
    }

    return configSet
  }
}
