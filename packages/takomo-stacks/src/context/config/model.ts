import {
  Options,
  StackGroupPath,
  StackPath,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import { Logger, TemplateEngine } from "@takomo/util"
import { Stack, StackGroup } from "../../model"

export interface ConfigContextProps {
  credentialProvider: TakomoCredentialProvider
  rootStackGroup: StackGroup
  stackGroups: Map<StackGroupPath, StackGroup>
  stackConfigsByPath: Map<StackPath, Stack>
  options: Options
  variables: Variables
  logger: Logger
  templateEngine: TemplateEngine
}

export class ConfigContext {
  private readonly rootStackGroup: StackGroup
  private readonly stackGroups: Map<StackGroupPath, StackGroup>
  private readonly stackConfigsByPath: Map<StackPath, Stack>

  readonly credentialProvider: TakomoCredentialProvider
  readonly logger: Logger
  readonly options: Options
  readonly variables: Variables
  readonly templateEngine: TemplateEngine

  constructor(props: ConfigContextProps) {
    this.options = props.options
    this.variables = props.variables
    this.credentialProvider = props.credentialProvider
    this.rootStackGroup = props.rootStackGroup
    this.stackGroups = props.stackGroups
    this.stackConfigsByPath = props.stackConfigsByPath
    this.logger = props.logger
    this.templateEngine = props.templateEngine
  }

  getRootStackGroup = (): StackGroup => this.rootStackGroup

  getStackGroup = (stackGroupPath: StackGroupPath): StackGroup | undefined =>
    this.stackGroups.get(stackGroupPath)

  getStackByExactPath = (path: StackPath): Stack => {
    const stackConfig = this.stackConfigsByPath.get(path)
    if (!stackConfig) {
      throw new Error(`No stack config found with path: ${path}`)
    }

    return stackConfig
  }

  getStacksByPath = (path: StackPath): Stack[] =>
    this.getStacks().filter((s) => s.getPath().startsWith(path))

  getStacks = (): Stack[] => Array.from(this.stackConfigsByPath.values())
}
