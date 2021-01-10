import { StackEvent } from "@takomo/aws-model"
import {
  ConfirmUndeployAnswer,
  StacksOperationOutput,
  StacksUndeployPlan,
  UndeployStacksIO,
} from "@takomo/stacks-commands"
import {
  CommandPath,
  InternalStack,
  StackGroup,
  StackPath,
} from "@takomo/stacks-model"
import {
  collectFromHierarchy,
  grey,
  LogWriter,
  red,
  TkmLogger,
} from "@takomo/util"
import { createBaseIO } from "../cli-io"
import { formatStackEvent, formatStackStatus } from "../formatters"
import { printStacksOperationOutput } from "./common"

interface ConfirmUndeployAnswerOption {
  readonly name: string
  readonly value: ConfirmUndeployAnswer
}

const CONFIRM_UNDEPLOY_ANSWER_CANCEL: ConfirmUndeployAnswerOption = {
  name: "no",
  value: "CANCEL",
}

const CONFIRM_UNDEPLOY_ANSWER_CONTINUE: ConfirmUndeployAnswerOption = {
  name: "yes",
  value: "CONTINUE",
}

export const createUndeployStacksIO = (
  logger: TkmLogger,
  writer: LogWriter = console.log,
): UndeployStacksIO => {
  const io = createBaseIO(writer)

  const chooseCommandPath = async (
    rootStackGroup: StackGroup,
  ): Promise<CommandPath> => {
    const allStackGroups = collectFromHierarchy(
      rootStackGroup,
      (s) => s.children,
    )

    const allCommandPaths = allStackGroups.reduce(
      (collected, stackGroup) => [
        ...collected,
        stackGroup.path,
        ...stackGroup.stacks.map((s) => s.path),
      ],
      new Array<string>(),
    )

    const source = async (
      answersSoFar: any,
      input: string,
    ): Promise<string[]> => {
      return input
        ? allCommandPaths.filter((p) => p.includes(input))
        : allCommandPaths
    }

    return io.autocomplete("Choose command path", source)
  }

  const confirmUndeploy = async ({
    operations,
  }: StacksUndeployPlan): Promise<ConfirmUndeployAnswer> => {
    io.subheader({ text: "Review stacks undeployment plan:", marginTop: true })
    io.longMessage(
      [
        "A stacks undeployment plan has been created and is shown below.",
        "Stacks will be undeployed in the order they are listed, and in parallel",
        "when possible.",
        "",
        "Stack operations are indicated with the following symbols:",
        "",
        `  ${red("- delete")}           Stack exists and will be deleted`,
        `  ${grey("* skip")}             Stack does not exist and will skipped`,
        "",
        `Following ${operations.length} stack(s) will be undeployed:`,
      ],
      false,
      false,
      0,
    )

    const stacksMap = new Map(
      operations.map((o) => o.stack).map((s) => [s.path, s]),
    )

    for (const { stack, currentStack, type } of operations) {
      const stackIdentity = await stack.credentialManager.getCallerIdentity()

      const stackOperation =
        type === "DELETE" ? red(`- ${stack.path}:`) : grey(`* ${stack.path}:`)

      io.longMessage(
        [
          `  ${stackOperation}`,
          `      name:          ${stack.name}`,
          `      status:        ${formatStackStatus(currentStack?.status)}`,
          `      account id:    ${stackIdentity.accountId}`,
          `      region:        ${stack.region}`,
          "      credentials:",
          `        user id:     ${stackIdentity.userId}`,
          `        account id:  ${stackIdentity.accountId}`,
          `        arn:         ${stackIdentity.arn}`,
        ],
        true,
        false,
        0,
      )

      if (stack.dependants.length > 0) {
        io.message({ text: "      dependents:" })
        printStackDependents(stack, stacksMap, 8)
      } else {
        io.message({ text: "      dependents:    []" })
      }
    }

    return await io.choose(
      "Continue to undeploy the stacks?",
      [CONFIRM_UNDEPLOY_ANSWER_CANCEL, CONFIRM_UNDEPLOY_ANSWER_CONTINUE],
      true,
    )
  }

  const printStackEvent = (stackPath: StackPath, e: StackEvent): void =>
    logger.info(stackPath + " - " + formatStackEvent(e))

  const printOutput = (output: StacksOperationOutput): StacksOperationOutput =>
    printStacksOperationOutput(io, output)
  // {
  //   const succeeded = output.results.filter((r) => r.success)
  //   const failed = output.results.filter((r) => !r.success)
  //   const all = [...succeeded, ...failed]
  //
  //   const table = new Table()
  //
  //   all.forEach((r) => {
  //     table.cell("Stack path", r.stack.path)
  //     table.cell("Stack name", r.stack.name)
  //     table.cell("Status", formatCommandStatus(r.status))
  //     table.cell("Time", prettyMs(r.timer.getSecondsElapsed()))
  //     table.cell("Message", r.message)
  //     table.newRow()
  //   })
  //
  //   io.message({ text: table.toString(), marginTop: true })
  //
  //   if (failed.length > 0) {
  //     io.message({ text: "Events for failed stacks", marginTop: true })
  //     io.message({ text: "------------------------" })
  //
  //     failed.forEach((r) => {
  //       io.message({
  //         text: r.stack.path,
  //         marginTop: true,
  //         marginBottom: true,
  //       })
  //
  //       if (r.events.length === 0) {
  //         io.message({ text: "  <No events>" })
  //       } else {
  //         const fn = (e: StackEvent) =>
  //           io.message({ text: "  " + formatStackEvent(e) })
  //         r.events.forEach(fn)
  //       }
  //     })
  //   }
  //
  //   return output
  // }

  const printStackDependents = (
    stack: InternalStack,
    stacksMap: Map<StackPath, InternalStack>,
    depth: number,
  ) => {
    stack.dependants.forEach((dependentPath) => {
      const dependent = stacksMap.get(dependentPath)
      if (!dependent) {
        throw new Error(`Dependency ${dependentPath} was not found`)
      }

      const padding = " ".repeat(depth)
      const end = dependent.dependencies.length > 0 ? ":" : ""
      io.message({ text: `${padding}- ${dependentPath}${end}` })
      printStackDependents(dependent, stacksMap, depth + 2)
    })
  }

  return {
    ...logger,
    ...io,
    printOutput,
    chooseCommandPath,
    printStackEvent,
    confirmUndeploy,
  }
}
