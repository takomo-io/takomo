import { CommandInput, CommandOutput, CommandPath } from "@takomo/core"
import {
  Secret,
  SecretWithValue,
  Stack,
  StackResult,
} from "@takomo/stacks-model"

export interface StackSecrets {
  readonly stack: Stack
  readonly secrets: SecretWithValue[]
}

export interface StackSecretsDiff {
  readonly stack: Stack
  readonly add: Secret[]
  readonly remove: Secret[]
}

export interface StacksOperationInput extends CommandInput {
  readonly commandPath: CommandPath
  readonly ignoreDependencies: boolean
  readonly interactive: boolean
}

export interface StacksOperationOutput extends CommandOutput {
  readonly results: StackResult[]
}
