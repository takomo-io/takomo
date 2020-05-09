import { CommandOutputBase, CommandPath, Vars } from "@takomo/core"
import { StacksOperationOutput } from "@takomo/stacks-commands"
import { StopWatch } from "@takomo/util"

export type ConfigSetName = string

export interface ConfigSet {
  readonly description: string
  readonly name: ConfigSetName
  readonly vars: Vars
  readonly commandPaths: CommandPath[]
}

export enum ConfigSetType {
  STANDARD = "standard",
  BOOTSTRAP = "bootstrap",
}

export interface ConfigSetCommandPathOperationResult extends CommandOutputBase {
  readonly commandPath: CommandPath
  readonly result: StacksOperationOutput
}

export interface ConfigSetOperationResult extends CommandOutputBase {
  readonly configSetName: ConfigSetName
  readonly results: ConfigSetCommandPathOperationResult[]
  readonly watch: StopWatch
}
