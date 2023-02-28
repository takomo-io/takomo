import Table from "easy-table"
import R from "ramda"
import { DeployStacksIO } from "../../command/stacks/deploy/model"
import { UndeployStacksIO } from "../../command/stacks/undeploy/model"
import { PlannedDeploymentTarget } from "../../command/targets/common/plan/model"
import {
  ConfirmOperationAnswer,
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
  TargetsExecutionPlan,
} from "../../command/targets/operation/model"
import { TkmLogger } from "../../utils/logging"
import { splitTextInLines } from "../../utils/strings"
import { createBaseIO } from "../cli-io"
import { createTargetListenerInternal } from "../config-set/target-listener"
import { formatCommandStatus } from "../formatters"
import { IOProps } from "../stacks/common"
import { createDeployStacksIO } from "../stacks/deploy-stacks/deploy-stacks-io"
import { createUndeployStacksIO } from "../stacks/undeploy-stacks-io"

export interface Messages {
  confirmHeader: string
  confirmDescription: string
  confirmSubheader: string
  confirmAnswerCancel: string
  confirmAnswerContinueAndReview: string
  confirmAnswerContinueNoReview: string
  outputHeader: string
  outputNoTargets: string
}

interface ConfirmOperationAnswerChoice {
  readonly name: string
  readonly value: ConfirmOperationAnswer
}

const makeChoices = ({
  confirmAnswerCancel,
  confirmAnswerContinueAndReview,
  confirmAnswerContinueNoReview,
}: Messages): Array<ConfirmOperationAnswerChoice> => [
  {
    name: confirmAnswerCancel,
    value: "CANCEL",
  },
  {
    name: confirmAnswerContinueAndReview,
    value: "CONTINUE_AND_REVIEW",
  },
  {
    name: confirmAnswerContinueNoReview,
    value: "CONTINUE_NO_REVIEW",
  },
]

interface DeploymentOperationIOProps extends IOProps {
  readonly messages: Messages
}

export const createDeploymentTargetsOperationIO = (
  props: DeploymentOperationIOProps,
): DeploymentTargetsOperationIO => {
  const { logger, messages } = props
  const io = createBaseIO(props)

  const createStackDeployIO = (
    logger: TkmLogger,
    target: PlannedDeploymentTarget,
  ): DeployStacksIO => createDeployStacksIO({ logger, target: target.name })

  const createStackUndeployIO = (
    logger: TkmLogger,
    target: PlannedDeploymentTarget,
  ): UndeployStacksIO => createUndeployStacksIO({ logger, target: target.name })

  const printOutput = (
    output: DeploymentTargetsOperationOutput,
  ): DeploymentTargetsOperationOutput => {
    io.header({ text: messages.outputHeader, marginTop: true })

    if (output.results.length === 0) {
      io.message({ text: messages.outputNoTargets, marginTop: true })
      return output
    }

    const targetsTable = new Table()

    output.results.forEach((stage) => {
      stage.results.forEach((group) => {
        group.results.forEach((target) => {
          target.results.forEach((configSet) => {
            configSet.results.forEach((result) => {
              if (result.result.results.length > 0) {
                result.result.results.forEach((stackResult) => {
                  targetsTable
                    .cell("Group", group.groupId)
                    .cell("Target", target.targetId)
                    .cell("Config set", configSet.configSetName)
                    .cell("Command path", result.commandPath)
                    .cell("Stack path", stackResult.stack.path)
                    .cell("Stack name", stackResult.stack.name)
                    .cell("Status", formatCommandStatus(stackResult.status))
                    .cell("Time", stackResult.timer.getFormattedTimeElapsed())
                    .cell("Message", stackResult.message)
                    .newRow()
                })
              } else {
                targetsTable
                  .cell("Group", group.groupId)
                  .cell("Target", target.targetId)
                  .cell("Config set", configSet.configSetName)
                  .cell("Command path", result.commandPath)
                  .cell("Stack path", "-")
                  .cell("Stack name", "-")
                  .cell("Status", formatCommandStatus(result.status))
                  .cell("Time", result.result.timer.getFormattedTimeElapsed())
                  .cell("Message", result.result.message)
                  .newRow()
              }
            })
          })
        })
      })
    })

    io.message({ text: targetsTable.toString(), marginTop: true })

    return output
  }

  const confirmOperation = async (
    plan: TargetsExecutionPlan,
  ): Promise<ConfirmOperationAnswer> => {
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

    plan.stages.forEach((stage) => {
      io.message({
        text: `stage: ${stage.stageName}`,
        indent: 2,
        marginTop: true,
      })
      stage.groups.forEach((ou) => {
        io.message({ text: `${ou.id}:`, indent: 4, marginTop: true })
        ou.targets.forEach(({ data, configSets }) => {
          io.message({
            text: `- name:               ${data.name}`,
            marginTop: true,
            indent: 6,
          })

          if (data.accountId) {
            io.message({
              text: `account id:         ${data.accountId}`,
              indent: 8,
            })
          }
          if (data.description) {
            io.message({
              text: `description:        ${data.description}`,
              indent: 8,
            })
          }

          io.message({
            text: "config sets:",
            indent: 8,
          })

          configSets.forEach((configSet) => {
            io.message({ text: `- ${configSet.name}`, indent: 10 })
          })
        })
      })
    })

    const choices = makeChoices(messages)

    return io.choose("How do you want to continue?", choices, true)
  }

  const createTargetListener = R.curry(createTargetListenerInternal)(
    "group",
    "targets",
    logger,
  )

  return {
    ...logger,
    createStackDeployIO,
    createStackUndeployIO,
    confirmOperation,
    printOutput,
    createTargetListener,
  }
}
