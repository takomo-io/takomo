import { CommandPath, ConfirmResult, Options, StackPath } from "@takomo/core"
import {
  CommandContext,
  Stack,
  StackGroup,
  StacksOperationOutput,
  UndeployStacksIO,
} from "@takomo/stacks"
import { collectFromHierarchy } from "@takomo/util"
import { CloudFormation } from "aws-sdk"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import CliIO from "../cli-io"
import { formatCommandStatus, formatStackEvent } from "../formatters"

export class CliUndeployStacksIO extends CliIO implements UndeployStacksIO {
  constructor(options: Options, loggerName: string | null = null) {
    super(options, loggerName)
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

  confirmDelete = async (ctx: CommandContext): Promise<ConfirmResult> => {
    const identity = await ctx.getCredentialProvider().getCallerIdentity()
    this.debugObject("Default credentials:", identity)

    this.subheader("Review stacks undeployment plan:", true)
    this.longMessage([
      "A stacks undeployment plan has been created and is shown below.",
      "",
      "Following stacks will be undeployed:",
    ])

    for (const stack of ctx.getStacksToProcess()) {
      const stackIdentity = await stack
        .getCredentialProvider()
        .getCallerIdentity()

      this.longMessage(
        [
          `  ${stack.getPath()}:`,
          `    name:          ${stack.getName()}`,
          `    account id:    ${stackIdentity.accountId}`,
          `    region:        ${stack.getRegion()}`,
          "    credentials:",
          `      user id:     ${stackIdentity.userId}`,
          `      account id:  ${stackIdentity.accountId}`,
          `      arn:         ${stackIdentity.arn}`,
        ],
        true,
      )

      if (stack.getDependants().length > 0) {
        this.message("    dependants:")
        this.printStackDependants(stack, ctx, 6)
      } else {
        this.message("    dependants:    []")
      }
    }

    return (await this.confirm("Continue to undeploy the stacks?", true))
      ? ConfirmResult.YES
      : ConfirmResult.NO
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
