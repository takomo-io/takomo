import { Credentials } from "@aws-sdk/types"
import {
  AwsClientProvider,
  CredentialManager,
  InternalAwsClientProvider,
  InternalCredentialManager,
} from "../takomo-aws-clients"
import { IamRoleArn, Region } from "../takomo-aws-model"
import { FilePath, LogLevel, Timer, TkmLogger } from "../takomo-util"
import { InternalTakomoProjectConfig, TakomoProjectConfig } from "./config"
import { Variables } from "./variables"

export type Project = string

/**
 * @hidden
 */
export interface OperationState {
  failed: boolean
}

/**
 * @hidden
 */
export enum ConfirmResult {
  YES,
  NO,
}

export interface CommandRole {
  readonly iamRoleArn: IamRoleArn
}

export type OutputFormat = "text" | "json" | "yaml"

/**
 * @hidden
 */
export type CommandStatus = "SUCCESS" | "FAILED" | "CANCELLED" | "SKIPPED"

/**
 * @hidden
 */
export const SUCCESS: CommandStatus = "SUCCESS"

/**
 * @hidden
 */
export const FAILED: CommandStatus = "FAILED"

/**
 * @hidden
 */
export const CANCELLED: CommandStatus = "CANCELLED"

/**
 * @hidden
 */
export const SKIPPED: CommandStatus = "SKIPPED"

/**
 * @hidden
 */
export interface SuccessHolder {
  readonly success: boolean
}

/**
 * @hidden
 */
export interface CommandOutputBase extends SuccessHolder {
  readonly message: string
  readonly status: CommandStatus
  readonly error?: Error
}

/**
 * @hidden
 */
export interface CommandOutput extends CommandOutputBase {
  readonly timer: Timer
  readonly outputFormat: OutputFormat
}

/**
 * @hidden
 */
export interface ResultsOutput<T> extends CommandOutput {
  readonly results: ReadonlyArray<T>
}

/**
 * @hidden
 */
export interface CommandInput {
  readonly timer: Timer
  readonly outputFormat: OutputFormat
}

/**
 * @hidden
 */
export interface IO<O extends CommandOutput> extends TkmLogger {
  readonly printOutput: (output: O) => O
}

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export interface TakomoBuildInfo {
  readonly version: string
}

/**
 * @hidden
 */
export interface InternalCommandContext extends CommandContext {
  readonly buildInfo: TakomoBuildInfo
  readonly projectConfig: InternalTakomoProjectConfig
  readonly awsClientProvider: InternalAwsClientProvider
}

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export type CommandHandler<
  C,
  I extends IO<OUT>,
  IN extends CommandInput,
  OUT extends CommandOutput,
> = (args: CommandHandlerArgs<C, I, IN, OUT>) => Promise<OUT>
