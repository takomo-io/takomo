import { Options } from "@takomo/core"
import {
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
  TargetsExecutionPlan,
} from "@takomo/deployment-targets"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import CliIO from "../cli-io"
import { formatCommandStatus } from "../formatters"

export interface Messages {
  confirmHeader: string
  confirmQuestion: string
  outputHeader: string
  outputNoTargets: string
}

export abstract class CliDeploymentOperationIO
  extends CliIO
  implements DeploymentTargetsOperationIO {
  private readonly messages: Messages
  private readonly stacksDeployIO: (
    options: Options,
    loggerName: string,
  ) => DeployStacksIO
  private readonly stacksUndeployIO: (
    options: Options,
    loggerName: string,
  ) => UndeployStacksIO

  protected constructor(
    options: Options,
    messages: Messages,
    stacksDeployIO: (options: Options, loggerName: string) => DeployStacksIO,
    stacksUndeployIO: (
      options: Options,
      loggerName: string,
    ) => UndeployStacksIO,
  ) {
    super(options)
    this.messages = messages
    this.stacksDeployIO = stacksDeployIO
    this.stacksUndeployIO = stacksUndeployIO
  }

  createStackDeployIO = (
    options: Options,
    loggerName: string,
  ): DeployStacksIO => this.stacksDeployIO(options, loggerName)

  createStackUndeployIO = (
    options: Options,
    loggerName: string,
  ): UndeployStacksIO => this.stacksUndeployIO(options, loggerName)

  printOutput = (
    output: DeploymentTargetsOperationOutput,
  ): DeploymentTargetsOperationOutput => {
    this.header(this.messages.outputHeader, true)

    if (output.results.length === 0) {
      this.message(this.messages.outputNoTargets, true)
      return output
    }

    const targetsTable = new Table()
    output.results.forEach((group) => {
      group.results.forEach((target) => {
        target.results.forEach((configSet) => {
          configSet.results.forEach((result) => {
            if (result.result.results.length > 0) {
              result.result.results.forEach((stackResult) => {
                targetsTable.cell("Deployment group", group.path)
                targetsTable.cell("Target", target.name)
                targetsTable.cell("Config set", configSet.configSetName)
                targetsTable.cell("Command path", result.commandPath)
                targetsTable.cell("Stack path", stackResult.stack.getPath())
                targetsTable.cell("Stack name", stackResult.stack.getName())
                targetsTable.cell(
                  "Status",
                  formatCommandStatus(stackResult.status),
                )
                targetsTable.cell("Reason", stackResult.reason)
                targetsTable.cell(
                  "Time",
                  prettyMs(stackResult.watch.secondsElapsed),
                )
                targetsTable.cell("Message", stackResult.message)
                targetsTable.newRow()
              })
            } else {
              targetsTable.cell("Deployment group", group.path)
              targetsTable.cell("Target", target.name)
              targetsTable.cell("Config set", configSet.configSetName)
              targetsTable.cell("Command path", result.commandPath)
              targetsTable.cell("Stack path", "-")
              targetsTable.cell("Stack name", "-")
              targetsTable.cell("Status", formatCommandStatus(result.status))
              targetsTable.cell("Reason", "-")
              targetsTable.cell(
                "Time",
                prettyMs(result.result.watch.secondsElapsed),
              )
              targetsTable.cell("Message", result.result.message)
              targetsTable.newRow()
            }
          })
        })
      })
    })

    this.message(targetsTable.toString(), true)

    return output
  }

  confirmOperation = async (plan: TargetsExecutionPlan): Promise<boolean> => {
    this.header(this.messages.confirmHeader, true)

    plan.groups.forEach((group) => {
      this.message(`  ${group.path}:`, true)
      group.targets.forEach((target) => {
        this.message(`    - name: ${target.name}`, true)
        this.message(`      description: ${target.description || "-"}`)
        this.message("      config sets:")
        target.configSets.forEach((configSet) => {
          this.message(`        - ${configSet}`)
        })
      })
    })

    return this.confirm(this.messages.confirmQuestion, true)
  }
}
