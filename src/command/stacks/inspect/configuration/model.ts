import { Region, StackName } from "../../../../takomo-aws-model"
import { CommandInput, CommandOutput, IO } from "../../../../takomo-core"
import {
  CommandPath,
  StackGroup,
  StackPath,
} from "../../../../takomo-stacks-model"

export interface ShowConfigurationInput extends CommandInput {
  readonly commandPath: CommandPath
  readonly interactive: boolean
}

export interface StackConfiguration {
  readonly path: StackPath
  readonly name: StackName
  readonly region: Region
  readonly data: Record<string, unknown>
}

export interface ShowConfigurationOutput extends CommandOutput {
  readonly stacks: ReadonlyArray<StackConfiguration>
}

export interface ShowConfigurationIO extends IO<ShowConfigurationOutput> {
  readonly chooseCommandPath: (
    rootStackGroup: StackGroup,
  ) => Promise<CommandPath>
}
