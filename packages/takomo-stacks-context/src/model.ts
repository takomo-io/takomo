import {
  CommandPath,
  Options,
  StackPath,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import { CommandContext, Stack } from "@takomo/stacks-model"
import { deepCopy, Logger, TemplateEngine } from "@takomo/util"
import { CloudFormation } from "aws-sdk"

export interface StdCommandContextProps {
  readonly stacksToProcess: Stack[]
  readonly allStacks: Stack[]
  readonly options: Options
  readonly credentialProvider: TakomoCredentialProvider
  readonly logger: Logger
  readonly variables: Variables
  readonly templateEngine: TemplateEngine
  readonly existingStacks: Map<StackPath, CloudFormation.Stack>
}

export class StdCommandContext implements CommandContext {
  private readonly stacksToProcess: Stack[]
  private readonly allStacks: Stack[]
  private readonly options: Options
  private readonly variables: Variables
  private readonly logger: Logger
  private readonly stacksMap: Map<CommandPath, Stack>
  private readonly credentialProvider: TakomoCredentialProvider
  private readonly templateEngine: TemplateEngine
  private readonly existingStacks: Map<StackPath, CloudFormation.Stack>

  constructor(props: StdCommandContextProps) {
    this.credentialProvider = props.credentialProvider
    this.options = props.options
    this.stacksToProcess = props.stacksToProcess
    this.allStacks = props.allStacks
    this.logger = props.logger
    this.variables = props.variables
    this.templateEngine = props.templateEngine
    this.existingStacks = props.existingStacks
    this.stacksMap = new Map(props.allStacks.map((s) => [s.getPath(), s]))
  }

  getStacksToProcess = (): Stack[] => [...this.stacksToProcess]
  getLogger = (): Logger => this.logger
  getOptions = (): Options => this.options
  getVariables = (): Variables => deepCopy(this.variables)
  getTemplateEngine = (): TemplateEngine => this.templateEngine

  getCredentialProvider = (): TakomoCredentialProvider =>
    this.credentialProvider

  getStacksByPath = (path: CommandPath): Stack[] =>
    this.getAllStacks().filter((s) => s.getPath().startsWith(path))

  getAllStacks = (): Stack[] => this.allStacks.slice()

  getExistingStack = async (
    stackPath: StackPath,
  ): Promise<CloudFormation.Stack | null> =>
    this.existingStacks.get(stackPath) || null
}
