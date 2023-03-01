import { InternalCredentialManager } from "../aws/common/credentials.js"
import { IamRoleArn } from "../aws/common/model.js"
import { InternalCommandContext } from "../context/command-context.js"
import { TkmLogger } from "../utils/logging.js"
import { Timer } from "../utils/timer.js"

export type Project = string

export interface OperationState {
  failed: boolean
}

export interface CommandRole {
  readonly iamRoleArn: IamRoleArn
}

export type OutputFormat = "text" | "json" | "yaml"

export type CommandStatus = "SUCCESS" | "FAILED" | "CANCELLED" | "SKIPPED"

export const SUCCESS: CommandStatus = "SUCCESS"

export const FAILED: CommandStatus = "FAILED"

export const CANCELLED: CommandStatus = "CANCELLED"

export const SKIPPED: CommandStatus = "SKIPPED"

export interface SuccessHolder {
  readonly success: boolean
}

export interface CommandOutputBase extends SuccessHolder {
  readonly message: string
  readonly status: CommandStatus
  readonly error?: Error
}

export interface CommandOutput extends CommandOutputBase {
  readonly timer: Timer
  readonly outputFormat: OutputFormat
}

export interface ResultsOutput<T> extends CommandOutput {
  readonly results: ReadonlyArray<T>
}

export interface CommandInput {
  readonly timer: Timer
  readonly outputFormat: OutputFormat
}

export interface IO<O extends CommandOutput> extends TkmLogger {
  readonly printOutput: (output: O) => O
}

export const resolveCommandOutputBase = (
  items: ReadonlyArray<CommandOutputBase>,
): CommandOutputBase => {
  if (items.length === 0) {
    return {
      status: "SUCCESS",
      message: "Success",
      success: true,
    }
  }

  const success = items.every((i) => i.success)

  if (items.every((i) => i.status === "CANCELLED")) {
    return {
      status: "CANCELLED",
      message: "Cancelled",
      success,
    }
  }

  if (items.every((i) => i.status === "SKIPPED")) {
    return {
      status: "SKIPPED",
      message: "Skipped",
      success,
    }
  }

  const status = success ? "SUCCESS" : "FAILED"
  const message = success ? "Success" : "Failed"
  return {
    status,
    message,
    success,
  }
}

export interface CommandHandlerArgs<
  C,
  I extends IO<OUT>,
  IN extends CommandInput,
  OUT extends CommandOutput,
> {
  readonly ctx: InternalCommandContext
  readonly configRepository: C
  readonly io: I
  readonly input: IN
  readonly credentialManager: InternalCredentialManager
}

export type CommandHandler<
  C,
  I extends IO<OUT>,
  IN extends CommandInput,
  OUT extends CommandOutput,
> = (args: CommandHandlerArgs<C, I, IN, OUT>) => Promise<OUT>
