import { StackEvent, StackName } from "@takomo/aws-model"
import { CommandStatus } from "@takomo/core"
import {
  StacksOperationListener,
  StacksOperationOutput,
} from "@takomo/stacks-commands"
import {
  CommandPath,
  StackGroup,
  StackPath,
  StackResult,
} from "@takomo/stacks-model"
import {
  collectFromHierarchy,
  formatYaml,
  LogLevel,
  table,
  TkmLogger,
  toPrettyJson,
} from "@takomo/util"
import date from "date-and-time"
import prettyMs from "pretty-ms"
import { BaseIO, BaseIOProps } from "../cli-io"
import { printError } from "../common"
import { formatCommandStatus, formatStackEvent } from "../formatters"

/**
 * @hidden
 */
export const chooseCommandPathInternal = async (
  io: BaseIO,
  rootStackGroup: StackGroup,
): Promise<CommandPath> => {
  const allStackGroups = collectFromHierarchy(rootStackGroup, (s) => s.children)

  const allCommandPaths = allStackGroups.reduce(
    (collected, stackGroup) => [
      ...collected,
      stackGroup.path,
      ...stackGroup.stacks.map((s) => s.path),
    ],
    new Array<string>(),
  )

  const source = async (answersSoFar: any, input: string): Promise<string[]> =>
    input ? allCommandPaths.filter((p) => p.includes(input)) : allCommandPaths

  return io.autocomplete("Choose command path", source)
}

/**
 * @hidden
 */
export const printFailedStackResults = (
  io: BaseIO,
  failed: ReadonlyArray<StackResult>,
  logLevel: LogLevel,
  indent: number,
): void => {
  failed.forEach((r) => {
    io.message({
      text: `- Stack path: ${r.stack.path}`,
      indent,
    })
    io.message({
      text: `Stack name: ${r.stack.name}`,
      indent: indent + 2,
    })

    if (r.events.length > 0) {
      io.message({
        text: "Stack events:",
        marginTop: true,
        indent: indent + 2,
      })
      const fn = (e: StackEvent) =>
        io.message({ text: formatStackEvent(e), indent: indent + 4 })
      r.events.forEach(fn)
    }

    if (r.error) {
      printError(io, r.error, logLevel, indent)
    }

    io.print()
  })
}

interface OutputStackResult {
  readonly path: StackPath
  readonly name: StackName
  readonly status: CommandStatus
  readonly time: number
  readonly message: string
}

const toOutputStackResult = (result: StackResult): OutputStackResult => ({
  path: result.stack.path,
  name: result.stack.name,
  status: result.status,
  time: result.timer.getSecondsElapsed(),
  message: result.message,
})

/**
 * @hidden
 */
export const printStacksOperationOutput = (
  io: BaseIO,
  output: StacksOperationOutput,
  logLevel: LogLevel,
): StacksOperationOutput => {
  const { outputFormat, results } = output
  const stacks = results.map(toOutputStackResult)

  if (outputFormat === "json") {
    io.message({
      text: toPrettyJson({
        stacks,
        status: output.status,
        success: output.success,
        message: output.message,
        error: output.error,
        time: output.timer.getSecondsElapsed(),
      }),
    })
    return output
  }

  if (outputFormat === "yaml") {
    io.message({
      text: formatYaml({
        stacks,
        status: output.status,
        success: output.success,
        message: output.message,
        error: output.error,
        time: output.timer.getSecondsElapsed(),
      }),
    })
    return output
  }

  if (output.results.length === 0) {
    return output
  }

  const failed = output.results.filter(
    (r) => !r.success && r.status === "FAILED",
  )

  const headers = ["Path", "Name", "Status", "Time", "Message"]
  const resultsTable = output.results.reduce(
    (tbl, r) =>
      tbl.row(
        r.stack.path,
        r.stack.name,
        formatCommandStatus(r.status),
        prettyMs(r.timer.getSecondsElapsed()),
        r.message,
      ),
    table({ headers }),
  )

  io.table({
    marginTop: true,
    marginBottom: true,
    table: resultsTable,
  })

  if (failed.length > 0) {
    io.subheader({
      text: "More information about the failed stacks",
      marginBottom: true,
    })

    printFailedStackResults(io, failed, logLevel, 0)
  }

  return output
}

/**
 * @hidden
 */
export interface IOProps extends BaseIOProps {
  readonly logger: TkmLogger
}

/**
 * @hidden
 */
export const formatDate = (d: any): string =>
  d ? date.format(d, "YYYY-MM-DD HH:mm:ss Z") : "-"

/**
 * @hidden
 */
export const createStacksOperationListenerInternal = (
  logger: TkmLogger,
  operation: string,
  stackCount: number,
): StacksOperationListener => {
  let stacksInProgress = 0
  let stacksCompleted = 0

  return {
    onStackOperationBegin: async (stack) => {
      stack.logger.info(`Begin stack ${operation}`)
      stacksInProgress++
    },
    onStackOperationComplete: async (stack, { timer, success }) => {
      if (success) {
        stack.logger.info(
          `Stack ${operation} succeeded in ${timer.getFormattedTimeElapsed()}`,
        )
      } else {
        stack.logger.info(
          `Stack ${operation} failed in ${timer.getFormattedTimeElapsed()}`,
        )
      }

      stacksInProgress--
      stacksCompleted++
      const waitingCount = stackCount - stacksInProgress - stacksCompleted
      const percentage = ((stacksCompleted / stackCount) * 100).toFixed(1)
      logger.info(
        `Stacks waiting: ${waitingCount}, in progress: ${stacksInProgress}, completed: ${stacksCompleted}/${stackCount} (${percentage}%)`,
      )
    },
  }
}
