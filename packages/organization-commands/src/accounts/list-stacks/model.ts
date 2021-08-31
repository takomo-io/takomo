import { CommandInput, CommandOutput, IO } from "@takomo/core"

export type ListAccountsStacksInput = CommandInput

export interface ListAccountsStacksOutput extends CommandOutput {
  readonly accounts: ReadonlyArray<string>
}

export type ListAccountsStacksIO = IO<ListAccountsStacksOutput>
