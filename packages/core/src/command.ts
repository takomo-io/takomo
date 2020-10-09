import { Logger, StopWatch } from "@takomo/util"
import { Options, Variables } from "./model"

export enum CommandStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  SKIPPED = "SKIPPED",
}

export interface SuccessHolder {
  readonly success: boolean
}

export interface CommandOutputBase extends SuccessHolder {
  readonly message: string
  readonly status: CommandStatus
}

export interface CommandOutput extends CommandOutputBase {
  readonly watch: StopWatch
}

export interface CommandInput {
  readonly options: Options
  readonly variables: Variables
  readonly watch: StopWatch
}

export type IO = Logger

export const resolveCommandOutputBase = (
  items: CommandOutputBase[],
): CommandOutputBase => {
  if (items.length === 0) {
    return {
      status: CommandStatus.SUCCESS,
      message: "Success",
      success: true,
    }
  }

  const success = items.every((i) => i.success)

  if (items.every((i) => i.status === CommandStatus.CANCELLED)) {
    return {
      status: CommandStatus.CANCELLED,
      message: "Cancelled",
      success,
    }
  }

  if (items.every((i) => i.status === CommandStatus.SKIPPED)) {
    return {
      status: CommandStatus.SKIPPED,
      message: "Skipped",
      success,
    }
  }

  const status = success ? CommandStatus.SUCCESS : CommandStatus.FAILED
  const message = success ? "Success" : "Failed"
  return {
    status,
    message,
    success,
  }
}
