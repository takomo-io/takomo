import { Credentials } from "@aws-sdk/types"
import { Variables } from "../common/model"
import {
  InternalTakomoProjectConfig,
  TakomoProjectConfig,
} from "../config/project-config"
import { InternalAwsClientProvider } from "../takomo-aws-clients"
import { Region } from "../takomo-aws-model"
import { OutputFormat } from "../takomo-core/command"
import { FilePath } from "../utils/files"
import { LogLevel } from "../utils/logging"

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
