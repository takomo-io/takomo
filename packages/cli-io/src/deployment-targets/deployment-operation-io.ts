import {
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
  TargetsExecutionPlan,
} from "@takomo/deployment-targets-commands"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { LogWriter, TkmLogger } from "@takomo/util"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import { createBaseIO } from "../cli-io"
import { formatCommandStatus } from "../formatters"
import { createDeployStacksIO } from "../stacks/deploy-stacks-io"
import { createUndeployStacksIO } from "../stacks/undeploy-stacks-io"

export interface Messages {
  confirmHeader: string
  confirmQuestion: string
  outputHeader: string
  outputNoTargets: string
}

export const createDeploymentTargetsOperationIO = (
  logger: TkmLogger,
  messages: Messages,
  writer: LogWriter = console.log,
): DeploymentTargetsOperationIO => {
  const io = createBaseIO(writer)

  const createStackDeployIO = (loggerName: string): DeployStacksIO =>
    createDeployStacksIO(logger.childLogger(loggerName))

  const createStackUndeployIO = (loggerName: string): UndeployStacksIO =>
    createUndeployStacksIO(logger.childLogger(loggerName))

  const printOutput = (
    output: DeploymentTargetsOperationOutput,
  ): DeploymentTargetsOperationOutput => {
    io.header({ text: messages.outputHeader, marginTop: true })

    if (output.results.length === 0) {
      io.message({ text: messages.outputNoTargets, marginTop: true })
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
                targetsTable.cell("Stack path", stackResult.stack.path)
                targetsTable.cell("Stack name", stackResult.stack.name)
                targetsTable.cell(
                  "Status",
                  formatCommandStatus(stackResult.status),
                )
                // targetsTable.cell("Reason", stackResult.reason)
                targetsTable.cell(
                  "Time",
                  prettyMs(stackResult.timer.getSecondsElapsed()),
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
              targetsTable.cell(
                "Time",
                prettyMs(result.result.timer.getSecondsElapsed()),
              )
              targetsTable.cell("Message", result.result.message)
              targetsTable.newRow()
            }
          })
        })
      })
    })

    io.message({ text: targetsTable.toString(), marginTop: true })

    return output
  }

  const confirmOperation = async (
    plan: TargetsExecutionPlan,
  ): Promise<boolean> => {
    io.header({ text: messages.confirmHeader, marginTop: true })

    plan.groups.forEach((group) => {
      io.message({ text: `${group.path}:`, marginTop: true, indent: 2 })
      group.targets.forEach((target) => {
        io.message({
          text: `- name: ${target.name}`,
          marginTop: true,
          indent: 4,
        })
        io.message({
          text: `description: ${target.description || "-"}`,
          indent: 6,
        })
        io.message({ text: "config sets:", indent: 6 })
        target.configSets.forEach((configSet) => {
          io.message({ text: `- ${configSet}`, indent: 8 })
        })
      })
    })

    return io.confirm(messages.confirmQuestion, true)
  }

  return {
    ...logger,
    createStackDeployIO,
    createStackUndeployIO,
    confirmOperation,
    printOutput,
  }
}
