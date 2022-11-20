import R from "ramda"
import {
  DeploymentTargetsListener,
  DeploymentTargetsRunIO,
  DeploymentTargetsRunOutput,
  TargetsRunPlan,
} from "../../takomo-deployment-targets-commands"
import { splitTextInLines } from "../../utils/strings"
import { formatYaml } from "../../utils/yaml"
import { createBaseIO } from "../cli-io"
import { IOProps } from "../stacks/common"

const confirmDescription =
  "A targets run plan has been created and is shown below. " +
  "Targets will be run in the order they are listed."

export const createRunTargetsIO = (props: IOProps): DeploymentTargetsRunIO => {
  const { logger, quiet = false } = props

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

  const confirmRun = async ({ groups }: TargetsRunPlan): Promise<boolean> => {
    io.subheader({ text: "Targets run plan", marginTop: true })
    io.longMessage(splitTextInLines(70, confirmDescription), false, false, 0)

    const targetCount = R.sum(groups.map((g) => g.targets.length))

    io.message({
      text: `Following ${targetCount} targets will be run:`,
      marginTop: true,
    })

    groups.forEach((group) => {
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
    if (!quiet) {
      io.header({ text: "Targets run summary", marginTop: true })
    }

    if (output.result) {
      if (typeof output.result === "string") {
        io.message({ text: output.result, marginTop: true })
      } else if (output.outputFormat === "yaml") {
        io.message({
          text: formatYaml(output.result),
          marginTop: true,
        })
      } else if (output.outputFormat === "json") {
        io.message({
          text: JSON.stringify(output.result, undefined, 2),
          marginTop: true,
        })
      } else if (Array.isArray(output.result)) {
        io.message({
          text: output.result.map((r) => `${r}`).join("\n"),
          marginTop: true,
        })
      } else {
        io.message({
          text: `${output.result}`,
          marginTop: true,
        })
      }
    } else {
      io.message({ text: "No output" })
    }

    return output
  }

  return {
    ...logger,
    createDeploymentTargetsListener,
    confirmRun,
    printOutput,
  }
}
