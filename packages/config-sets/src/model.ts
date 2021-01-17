import { CommandOutput, CommandOutputBase, Vars } from "@takomo/core"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { CommandPath } from "@takomo/stacks-model"

export type ConfigSetName = string

export interface ConfigSet {
  readonly description: string
  readonly name: ConfigSetName
  readonly vars: Vars
  readonly commandPaths: ReadonlyArray<CommandPath>
}

export type ConfigSetType = "standard" | "bootstrap"

export interface ConfigSetCommandPathOperationResult extends CommandOutputBase {
  readonly commandPath: CommandPath
  readonly result: StacksOperationOutput
}

export interface ConfigSetOperationResult extends CommandOutput {
  readonly configSetName: ConfigSetName
  readonly results: ReadonlyArray<ConfigSetCommandPathOperationResult>
}
