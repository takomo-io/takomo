import { Region } from "../../aws/common/model"
import { CommandContext } from "../../context/command-context"
import {
  CommandInput,
  CommandOutput,
  IO,
  Project,
} from "../../takomo-core/command"

export interface ProjectInformation {
  readonly project?: Project
  readonly regions: ReadonlyArray<Region>
  readonly createSamples: boolean
}

export interface InitProjectInput extends CommandInput {
  readonly project?: Project
  readonly regions?: ReadonlyArray<Region>
  readonly createSamples?: boolean
}

export interface InitProjectOutput extends CommandOutput {
  readonly description: string
}

export interface InitProjectIO extends IO<InitProjectOutput> {
  readonly promptProjectInformation: (
    ctx: CommandContext,
    input: InitProjectInput,
  ) => Promise<ProjectInformation>
}

export interface ProjectConfigRepository {
  readonly putProjectConfig: (info: ProjectInformation) => Promise<string>
}
