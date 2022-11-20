import { Credentials } from "@aws-sdk/types"
import {
  InternalAwsClientProvider,
  InternalCredentialManager,
} from "../takomo-aws-clients"
import { IamRoleArn, Region } from "../takomo-aws-model"
import { FilePath, LogLevel, Timer, TkmLogger } from "../takomo-util"
import { InternalTakomoProjectConfig, TakomoProjectConfig } from "./config"
import { Variables } from "./variables"

export type Project = string

export interface OperationState {
  failed: boolean
}

export enum ConfirmResult {
  YES,
  NO,
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

/**
 * Provides access to the current project configuration.
 */
export interface CommandContext {
  /**
   * Reset cache before executing operation.
   */
  readonly resetCache: boolean

  /**
   * No confirmation to operations is asked if auto-confirm is enabled.
   */
  readonly autoConfirmEnabled: boolean

  /**
   * Show statistics collected during operations.
   */
  readonly statisticsEnabled: boolean

  /**
   * Log confidential information during operations.
   */
  readonly confidentialValuesLoggingEnabled: boolean

  /**
   * Variables available in operations.
   */
  readonly variables: Variables

  /**
   * Supported AWS regions.
   */
  readonly regions: ReadonlyArray<Region>

  /**
   * Credentials used to invoke the current operation.
   */
  readonly credentials?: Credentials

  /**
   * Current project directory containing configuration files.
   */
  readonly projectDir: FilePath

  /**
   * Logging level.
   */
  readonly logLevel: LogLevel

  /**
   * Suppress all logging but the actual command results.
   */
  readonly quiet: boolean

  /**
   * Output format.
   */
  readonly outputFormat: OutputFormat

  /**
   * Project configuration.
   */
  readonly projectConfig: TakomoProjectConfig

  /**
   * Show command to generate IAM policies.
   */
  readonly iamGeneratePoliciesInstructionsEnabled: boolean
}

export interface TakomoBuildInfo {
  readonly version: string
}

export interface InternalCommandContext extends CommandContext {
  readonly buildInfo: TakomoBuildInfo
  readonly projectConfig: InternalTakomoProjectConfig
  readonly awsClientProvider: InternalAwsClientProvider
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
