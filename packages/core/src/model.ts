import { LogLevel } from "@takomo/util"

/**
 * Stack group path.
 */
export type StackGroupPath = string

/**
 * Stack path.
 */
export type StackPath = string

export type StackGroupName = string

/**
 * Stack name.
 */
export type StackName = string

/**
 * Command path.
 */
export type CommandPath = StackGroupPath | StackPath

/**
 * Project.
 */
export type Project = string

export enum ConfirmResult {
  YES,
  NO,
}

/**
 * AWS region
 */
export type Region = string

/**
 * AWS account id
 */
export type AccountId = string

/**
 * IAM role arn
 */
export type IamRoleArn = string

/**
 * A collection of variables where variable name must be string..
 */
export interface Vars {
  [key: string]: any
}

/**
 * Environment variables.
 */
export interface EnvVars {
  [key: string]: string
}

/**
 * Context variables.
 */
export interface ContextVars {
  /**
   * Project directory
   */
  readonly projectDir: string
}

/**
 * Current command variables.
 */
export interface Variables {
  /**
   * Environment variables
   */
  readonly env: EnvVars

  /**
   * Variables
   */
  readonly var: Vars

  /**
   * Context information
   */
  readonly context: ContextVars
}

/**
 * IAM role used to invoke AWS APIs.
 */
export interface CommandRole {
  /**
   * IAM role ARN
   */
  readonly iamRoleArn: IamRoleArn
}

export interface OptionsProps {
  readonly projectDir: string
  readonly autoConfirm: boolean
  readonly logLevel: LogLevel
  readonly logConfidentialInfo: boolean
  readonly stats: boolean
}

/**
 * Options.
 */
export class Options {
  private readonly projectDir: string
  private readonly autoConfirm: boolean
  private readonly logLevel: LogLevel
  private readonly logConfidentialInfo: boolean
  private readonly stats: boolean

  constructor(props: OptionsProps) {
    this.projectDir = props.projectDir
    this.autoConfirm = props.autoConfirm
    this.logLevel = props.logLevel
    this.logConfidentialInfo = props.logConfidentialInfo
    this.stats = props.stats
  }

  /**
   * @returns Project directory
   */
  getProjectDir = (): string => this.projectDir

  /**
   * @returns Logging level
   */
  getLogLevel = (): LogLevel => this.logLevel

  /**
   * @returns Should confidential information be logged in plain text
   */
  isConfidentialInfoLoggingEnabled = (): boolean => this.logConfidentialInfo

  /**
   * @returns Is auto-confirm enabled
   */
  isAutoConfirmEnabled = (): boolean => this.autoConfirm

  /**
   * @returns Should statistics be collected
   */
  isStatsEnabled = (): boolean => this.stats

  toProps = (): OptionsProps => ({
    projectDir: this.projectDir,
    autoConfirm: this.autoConfirm,
    logLevel: this.logLevel,
    logConfidentialInfo: this.logConfidentialInfo,
    stats: this.stats,
  })
}

export interface OperationState {
  failed: boolean
}

export enum DeploymentOperation {
  DEPLOY = "deploy",
  UNDEPLOY = "undeploy",
}
