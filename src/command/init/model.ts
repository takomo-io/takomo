import { Region } from "../../takomo-aws-model"
import {
  CommandContext,
  CommandInput,
  CommandOutput,
  IO,
  Project,
} from "../../takomo-core"

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
