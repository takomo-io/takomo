import { CommandOutput, CommandOutputBase, Vars } from "@takomo/core"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { CommandPath } from "@takomo/stacks-model"

export type ConfigSetName = string
export type ConfigSetStage = string

export interface ConfigSetInstruction {
  readonly name: ConfigSetName
  readonly stage?: ConfigSetStage
}

export interface ConfigSet {
  readonly description: string
  readonly name: ConfigSetName
  readonly vars: Vars
  readonly commandPaths: ReadonlyArray<CommandPath>
  readonly legacy: boolean
}

export type ConfigSetType = "standard" | "bootstrap"

export interface ConfigSetCommandPathOperationResult extends CommandOutputBase {
  readonly commandPath: CommandPath
  readonly stage?: ConfigSetStage
  readonly result: StacksOperationOutput
}

export interface ConfigSetOperationResult extends CommandOutput {
  readonly configSetName: ConfigSetName
  readonly results: ReadonlyArray<ConfigSetCommandPathOperationResult>
}
