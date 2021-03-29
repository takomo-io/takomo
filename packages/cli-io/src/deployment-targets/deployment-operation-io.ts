import {
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
  TargetsExecutionPlan,
} from "@takomo/deployment-targets-commands"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { splitTextInLines } from "@takomo/util"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import { createBaseIO } from "../cli-io"
import { formatCommandStatus } from "../formatters"
import { IOProps } from "../stacks/common"
import { createDeployStacksIO } from "../stacks/deploy-stacks/deploy-stacks-io"
import { createUndeployStacksIO } from "../stacks/undeploy-stacks-io"

export interface Messages {
  confirmHeader: string
  confirmDescription: string
  confirmSubheader: string
  confirmQuestion: string
  outputHeader: string
  outputNoTargets: string
}

interface DeploymentOperationIOProps extends IOProps {
  readonly messages: Messages
}

export const createDeploymentTargetsOperationIO = (
  props: DeploymentOperationIOProps,
): DeploymentTargetsOperationIO => {
  const { logger, messages } = props
  const io = createBaseIO(props)

  const createStackDeployIO = (loggerName: string): DeployStacksIO =>
    createDeployStacksIO({ logger: logger.childLogger(loggerName) })

  const createStackUndeployIO = (loggerName: string): UndeployStacksIO =>
    createUndeployStacksIO({ logger: logger.childLogger(loggerName) })

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
                targetsTable.cell("Group", group.path)
                targetsTable.cell("Target", target.name)
                targetsTable.cell("Config set", configSet.configSetName)
                targetsTable.cell("Command path", result.commandPath)
                targetsTable.cell("Stack path", stackResult.stack.path)
                targetsTable.cell("Stack name", stackResult.stack.name)
                targetsTable.cell(
                  "Status",
                  formatCommandStatus(stackResult.status),
                )
                targetsTable.cell(
                  "Time",
                  prettyMs(stackResult.timer.getSecondsElapsed()),
                )
                targetsTable.cell("Message", stackResult.message)
                targetsTable.newRow()
              })
            } else {
              targetsTable.cell("Group", group.path)
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
    io.subheader({ text: messages.confirmHeader, marginTop: true })
    io.longMessage(
      splitTextInLines(70, messages.confirmDescription),
      false,
      false,
      0,
    )

    io.message({
      text: messages.confirmSubheader,
      marginTop: true,
    })

    plan.groups.forEach((group) => {
      io.message({ text: `${group.path}:`, marginTop: true, indent: 2 })
      group.targets.forEach((target) => {
        io.message({
          text: `- name:                 ${target.name}`,
          marginTop: true,
          indent: 4,
        })
        if (target.accountId) {
          io.message({
            text: `account id:           ${target.accountId}`,
            indent: 6,
          })
        }
        if (target.description) {
          io.message({
            text: `description:          ${target.description}`,
            indent: 6,
          })
        }
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
