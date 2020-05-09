import { CommandInput, CommandOutput, CommandPath, IO } from "@takomo/core"
import { Secret } from "@takomo/stacks"
import { StackSecretsDiff } from "../../model"

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
