import { CommandInput, CommandOutput, IO, Region } from "@takomo/core"

export interface ProjectInformation {
  readonly project: string | null
  readonly regions: Region[]
  readonly createSamples: boolean
}

export interface InitProjectInput extends CommandInput {
  readonly project: string | null
  readonly regions: Region[] | null
  readonly createSamples: boolean | null
}

export interface InitProjectOutput extends CommandOutput {
  readonly projectDir: string
  readonly description: string
}

export interface InitProjectIO extends IO {
  promptProjectInformation: (
    input: InitProjectInput,
  ) => Promise<ProjectInformation>

  printOutput: (output: InitProjectOutput) => InitProjectOutput
}
