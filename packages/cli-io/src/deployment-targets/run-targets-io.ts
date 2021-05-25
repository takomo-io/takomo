import {
  DeploymentTargetsListener,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
  TargetsRunPlan,
} from "@takomo/deployment-targets-commands"
import { splitTextInLines } from "@takomo/util"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import { createBaseIO } from "../cli-io"
import { formatCommandStatus } from "../formatters"
import { IOProps } from "../stacks/common"
const confirmDescription =
  "A targets run plan has been created and is shown below. " +
  "Targets will be run in the order they are listed."

export const createRunTargetsIO = (props: IOProps): DeploymentTargetsRunIO => {
  const { logger } = props

  const io = createBaseIO(props)

  let targetsInProgress = 0
  let targetsCompleted = 0
  const createDeploymentTargetsListener = (
    targetCount: number,
  ): DeploymentTargetsListener => ({
    onTargetBegin: async () => {
      targetsInProgress++
    },
    onTargetComplete: async () => {
      targetsInProgress--
      targetsCompleted++
      const waitingCount = targetCount - targetsInProgress - targetsCompleted
      const percentage = ((targetsCompleted / targetCount) * 100).toFixed(1)
      logger.info(
        `Targets waiting: ${waitingCount}, in progress: ${targetsInProgress}, completed: ${targetsCompleted}/${targetCount} (${percentage}%)`,
      )
    },
  })

  const confirmRun = async (plan: TargetsRunPlan): Promise<boolean> => {
    io.subheader({ text: "Targets run plan", marginTop: true })
    io.longMessage(splitTextInLines(70, confirmDescription), false, false, 0)

    io.message({
      text: "Following targets will be run:",
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
      })
    })

    return io.confirm("Do you want to continue?", true)
  }

  const printOutput = (
    output: DeploymentTargetsRunOutput,
  ): DeploymentTargetsRunOutput => {
    io.header({ text: "Targets run summary", marginTop: true })

    if (output.results.length === 0) {
      io.message({ text: "No targets run", marginTop: true })
      return output
    }

    const targetsTable = new Table()
    output.results.forEach((group) => {
      group.results.forEach((target) => {
        targetsTable
          .cell("Group", group.path)
          .cell("Target", target.name)
          .cell("Status", formatCommandStatus(target.status))
          .cell("Time", prettyMs(target.timer.getSecondsElapsed()))
          .newRow()
      })
    })

    io.message({ text: targetsTable.toString(), marginTop: true })

    return output
  }

  return {
    ...logger,
    createDeploymentTargetsListener,
    confirmRun,
    printOutput,
  }
}
