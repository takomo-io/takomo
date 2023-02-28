import { CommandPath } from "../command/command-model"
import { Vars } from "../common/model"

export type ConfigSetName = string
export type StageName = string

export const DEFAULT_STAGE_NAME = "default"

export interface ConfigSetInstruction {
  readonly name: ConfigSetName
  readonly stage: StageName
}

export interface ConfigSet {
  readonly description: string
  readonly name: ConfigSetName
  readonly vars: Vars
  readonly commandPaths: ReadonlyArray<CommandPath>
  readonly legacy: boolean
}

export interface ConfigSetContext {
  readonly getConfigSet: (name: ConfigSetName) => ConfigSet
  readonly hasConfigSet: (name: ConfigSetName) => boolean
  readonly getStages: () => ReadonlyArray<StageName>
}

export interface ConfigSetInstructionsHolder {
  readonly configSets: ReadonlyArray<ConfigSetInstruction>
}
