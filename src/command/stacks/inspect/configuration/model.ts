import { StackName } from "../../../../aws/cloudformation/model.js"
import { Region } from "../../../../aws/common/model.js"
import { StackGroup } from "../../../../stacks/stack-group.js"
import { StackPath } from "../../../../stacks/stack.js"
import {
  CommandInput,
  CommandOutput,
  IO,
} from "../../../../takomo-core/command.js"
import { CommandPath } from "../../../command-model.js"

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
