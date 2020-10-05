import {
  Options,
  StackGroupPath,
  StackPath,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import { Stack, StackGroup } from "@takomo/stacks-model"
import { Logger, TemplateEngine } from "@takomo/util"

export interface ConfigContextProps {
  readonly credentialProvider: TakomoCredentialProvider
  readonly rootStackGroup: StackGroup
  readonly stackGroups: Map<StackGroupPath, StackGroup>
  readonly stacksByPath: Map<StackPath, Stack>
  readonly options: Options
  readonly variables: Variables
  readonly logger: Logger
  readonly templateEngine: TemplateEngine
}

export class ConfigContext {
  readonly #rootStackGroup: StackGroup
  readonly #stackGroups: Map<StackGroupPath, StackGroup>
  readonly #stacksByPath: Map<StackPath, Stack>

  readonly credentialProvider: TakomoCredentialProvider
  readonly logger: Logger
  readonly options: Options
  readonly variables: Variables
  readonly templateEngine: TemplateEngine

  constructor(props: ConfigContextProps) {
    this.options = props.options
    this.variables = props.variables
    this.credentialProvider = props.credentialProvider
    this.#rootStackGroup = props.rootStackGroup
    this.#stackGroups = props.stackGroups
    this.#stacksByPath = props.stacksByPath
    this.logger = props.logger
    this.templateEngine = props.templateEngine
  }

  getRootStackGroup = (): StackGroup => this.#rootStackGroup

  getStackGroup = (stackGroupPath: StackGroupPath): StackGroup | undefined =>
    this.#stackGroups.get(stackGroupPath)

  getStackByExactPath = (path: StackPath): Stack => {
    const stackConfig = this.#stacksByPath.get(path)
    if (!stackConfig) {
      throw new Error(`No stack config found with path: ${path}`)
    }

    return stackConfig
  }

  getStacksByPath = (path: StackPath): Stack[] =>
    this.getStacks().filter((s) => s.getPath().startsWith(path))

  getStacks = (): Stack[] => Array.from(this.#stacksByPath.values())
}
