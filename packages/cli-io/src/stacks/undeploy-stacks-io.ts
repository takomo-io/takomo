import { CommandPath, Options, StackPath } from "@takomo/core"
import {
  ConfirmUndeployAnswer,
  StacksOperationOutput,
  UndeployStacksIO,
} from "@takomo/stacks-commands"
import { CommandContext, Stack, StackGroup } from "@takomo/stacks-model"
import { collectFromHierarchy, grey, LogWriter, red } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import CliIO from "../cli-io"
import {
  formatCommandStatus,
  formatStackEvent,
  formatStackStatus,
} from "../formatters"

const CONFIRM_UNDEPLOY_ANSWER_CANCEL = {
  name: "no",
  value: ConfirmUndeployAnswer.CANCEL,
}

const CONFIRM_UNDEPLOY_ANSWER_CONTINUE = {
  name: "yes",
  value: ConfirmUndeployAnswer.CONTINUE,
}

export class CliUndeployStacksIO extends CliIO implements UndeployStacksIO {
  constructor(
    options: Options,
    logWriter: LogWriter = console.log,
    loggerName: string | null = null,
  ) {
    super(logWriter, options, loggerName)
  }

  chooseCommandPath = async (
    rootStackGroup: StackGroup,
  ): Promise<CommandPath> => {
    const allStackGroups = collectFromHierarchy(rootStackGroup, (s) =>
      s.getChildren(),
    )

    const allCommandPaths = allStackGroups.reduce(
      (collected, stackGroup) => [
        ...collected,
        stackGroup.getPath(),
        ...stackGroup.getStacks().map((s) => s.getPath()),
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

    return this.autocomplete("Choose command path", source)
  }

  confirmUndeploy = async (
    ctx: CommandContext,
  ): Promise<ConfirmUndeployAnswer> => {
    const identity = await ctx.getCredentialProvider().getCallerIdentity()
    this.debugObject("Default credentials:", identity)

    const stacks = ctx.getStacksToProcess()

    this.subheader("Review stacks undeployment plan:", true)
    this.longMessage([
      "A stacks undeployment plan has been created and is shown below.",
      "Stacks will be undeployed in the order they are listed, and in parallel",
      "when possible.",
      "",
      "Stack operations are indicated with the following symbols:",
      "",
      `  ${red("- delete")}           Stack exists and will be deleted`,
      `  ${grey("* skip")}             Stack does not exist and will skipped`,
      "",
      `Following ${stacks.length} stack(s) will be undeployed:`,
    ])

    for (const stack of stacks) {
      const stackIdentity = await stack
        .getCredentialProvider()
        .getCallerIdentity()

      const current = await ctx.getExistingStack(stack.getPath())
      const status = current ? current.StackStatus : null
      const stackOperation = current
        ? red(`- ${stack.getPath()}:`)
        : grey(`* ${stack.getPath()}:`)

      this.longMessage(
        [
          `  ${stackOperation}`,
          `      name:          ${stack.getName()}`,
          `      status:        ${formatStackStatus(status)}`,
          `      account id:    ${stackIdentity.accountId}`,
          `      region:        ${stack.getRegion()}`,
          "      credentials:",
          `        user id:     ${stackIdentity.userId}`,
          `        account id:  ${stackIdentity.accountId}`,
          `        arn:         ${stackIdentity.arn}`,
        ],
        true,
      )

      if (stack.getDependants().length > 0) {
        this.message("      dependants:")
        this.printStackDependants(stack, ctx, 8)
      } else {
        this.message("      dependants:    []")
      }
    }

    return await this.choose(
      "Continue to undeploy the stacks?",
      [CONFIRM_UNDEPLOY_ANSWER_CANCEL, CONFIRM_UNDEPLOY_ANSWER_CONTINUE],
      true,
    )
  }

  printStackEvent = (
    stackPath: StackPath,
    e: CloudFormation.StackEvent,
  ): void => this.info(stackPath + " - " + formatStackEvent(e))

  printOutput = (output: StacksOperationOutput): StacksOperationOutput => {
    const succeeded = output.results.filter((r) => r.success)
    const failed = output.results.filter((r) => !r.success)
    const all = [...succeeded, ...failed]

    const table = new Table()

    all.forEach((r) => {
      table.cell("Stack path", r.stack.getPath())
      table.cell("Stack name", r.stack.getName())
      table.cell("Status", formatCommandStatus(r.status))
      table.cell("Reason", r.reason)
      table.cell("Time", prettyMs(r.watch.secondsElapsed))
      table.cell("Message", r.message)
      table.newRow()
    })

    this.message(table.toString(), true)

    if (failed.length > 0) {
      this.message("Events for failed stacks", true)
      this.message("------------------------")

      failed.forEach((r) => {
        this.message(r.stack.getPath(), true, true)

        if (r.events.length === 0) {
          this.message("  <No events>")
        } else {
          const fn = (e: CloudFormation.StackEvent) =>
            this.message("  " + formatStackEvent(e))
          r.events.forEach(fn)
        }
      })
    }

    return output
  }

  private printStackDependants = (
    stack: Stack,
    ctx: CommandContext,
    depth: number,
  ) => {
    stack.getDependants().forEach((dependantPath, index) => {
      const [dependency] = ctx.getStacksByPath(dependantPath)
      const padding = " ".repeat(depth)
      const end = dependency.getDependencies().length > 0 ? ":" : ""
      this.message(`${padding}- ${dependantPath}${end}`)
      this.printStackDependants(dependency, ctx, depth + 2)
    })
  }
}
