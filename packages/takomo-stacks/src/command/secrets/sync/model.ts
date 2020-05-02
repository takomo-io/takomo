import { CommandInput, CommandOutput, CommandPath, IO } from "@takomo/core"
import { Secret, StackSecretsDiff } from "../../../model"

export interface SyncSecretsInput extends CommandInput {
  commandPath: CommandPath
}

export interface SyncSecretsOutput extends CommandOutput {
  stacks: StackSecretsDiff[]
}

export interface SyncSecretsIO extends IO {
  printOutput(output: SyncSecretsOutput): SyncSecretsOutput
  promptSecretValue(secret: Secret): Promise<string>
  confirmSync(stacks: StackSecretsDiff[]): Promise<boolean>
}
