import { OrganizationAccount } from "@takomo/aws-model"
import { ConfigSetType, ExecutionPlan } from "@takomo/config-sets"
import { ConfirmResult } from "@takomo/core"
import {
  AccountsOperationIO,
  AccountsOperationOutput,
} from "@takomo/organization-commands"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import { TkmLogger } from "@takomo/util"
import Table from "easy-table"
import R from "ramda"
import { createBaseIO } from "../../cli-io"
import { printError } from "../../common"
import { createTargetListenerInternal } from "../../config-set/target-listener"
import { formatCommandStatus } from "../../formatters"
import { IOProps, printFailedStackResults } from "../../stacks/common"
import { createDeployStacksIO } from "../../stacks/deploy-stacks/deploy-stacks-io"
import { createUndeployStacksIO } from "../../stacks/undeploy-stacks-io"

export interface Messages {
  readonly confirmHeader: string
  readonly confirmQuestion: string
  readonly outputHeader: string
  readonly outputNoAccounts: string
}

const getConfigSetsName = (configSetType: ConfigSetType): string => {
  switch (configSetType) {
    case "standard":
      return "config sets"
    case "bootstrap":
      return "bootstrap config sets"
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

interface AccountsOperationIOProps extends IOProps {
  readonly messages: Messages
}

export const createAccountsOperationIO = (
  props: AccountsOperationIOProps,
): AccountsOperationIO => {
  const { logger, messages } = props
  const io = createBaseIO(props)

  const createStackDeployIO = (logger: TkmLogger): DeployStacksIO =>
    createDeployStacksIO({ logger })

  const createStackUndeployIO = (logger: TkmLogger): UndeployStacksIO =>
    createUndeployStacksIO({ logger })

  const confirmLaunch = async (
    plan: ExecutionPlan<OrganizationAccount>,
  ): Promise<ConfirmResult> => {
    io.header({ text: messages.confirmHeader, marginTop: true })

    plan.stages.forEach((stage) => {
      io.message({
        text: `stage: ${stage.stageName}`,
        indent: 2,
        marginTop: true,
      })
      stage.groups.forEach((ou) => {
        io.message({ text: `${ou.path}:`, indent: 4, marginTop: true })
        ou.targets.forEach(({ data, configSets }) => {
          io.message({
            text: `- id:       ${data.id}`,
            marginTop: true,
            indent: 6,
          })
          io.message({ text: `name:     ${data.name}`, indent: 8 })
          io.message({ text: `email:    ${data.email}`, indent: 8 })
          io.message({
            text: `${getConfigSetsName(plan.configSetType)}:`,
            indent: 8,
          })

          configSets.forEach((configSet) => {
            io.message({ text: `- ${configSet.name}`, indent: 10 })
          })
        })
      })
    })

    if (await io.confirm(messages.confirmQuestion, true)) {
      return ConfirmResult.YES
    }

    return ConfirmResult.NO
  }

  const printOutput = (
    output: AccountsOperationOutput,
  ): AccountsOperationOutput => {
    io.header({ text: messages.outputHeader, marginTop: true })

    if (output.error) {
      io.message({ marginTop: true, text: "An unhandled error occurred:" })
      printError(io, output.error, logger.logLevel, 0)
    }

    if (output.results.length === 0) {
      io.message({ text: messages.outputNoAccounts, marginTop: true })
      return output
    }

    const targetsTable = new Table()

    output.results.forEach((stage) => {
      stage.results.forEach((group) => {
        group.results.forEach((target) => {
          target.results.forEach((configSet) => {
            configSet.results.forEach((commandPathResult) => {
              if (commandPathResult.result.results.length > 0) {
                commandPathResult.result.results.forEach((stackResult) => {
                  targetsTable.cell("stage", stage.stageName)
                  targetsTable.cell("OU", group.groupId)
                  targetsTable.cell("Account", target.targetId)
                  targetsTable.cell("Config set", configSet.configSetName)
                  targetsTable.cell(
                    "Command path",
                    commandPathResult.commandPath,
                  )
                  targetsTable.cell("Stack path", stackResult.stack.path)
                  targetsTable.cell("Stack name", stackResult.stack.name)
                  targetsTable.cell(
                    "Status",
                    formatCommandStatus(stackResult.status),
                  )
                  targetsTable.cell(
                    "Time",
                    stackResult.timer.getFormattedTimeElapsed(),
                  )
                  targetsTable.cell("Message", stackResult.message)
                  targetsTable.newRow()
                })
              } else {
                targetsTable.cell("stage", stage.stageName)
                targetsTable.cell("OU", group.groupId)
                targetsTable.cell("Account", target.targetId)
                targetsTable.cell("Config set", configSet.configSetName)
                targetsTable.cell("Command path", commandPathResult.commandPath)
                targetsTable.cell("Stack path", "-")
                targetsTable.cell("Stack name", "-")
                targetsTable.cell(
                  "Status",
                  formatCommandStatus(commandPathResult.status),
                )
                targetsTable.cell(
                  "Time",
                  commandPathResult.timer.getFormattedTimeElapsed(),
                )
                targetsTable.cell("Message", commandPathResult.message)
                targetsTable.newRow()
              }
            })
          })
        })
      })
    })

    io.message({ text: targetsTable.toString(), marginTop: true })

    const failed = output.results.filter(
      (r) => !r.success && r.status === "FAILED",
    )

    if (failed.length > 0) {
      io.subheader({
        text: "More information about the failed accounts",
        marginTop: true,
      })

      failed.forEach((stage) => {
        stage.results
          .filter((a) => !a.success)
          .forEach((groupResult) => {
            groupResult.results
              .filter((c) => !c.success)
              .forEach((targetResult) => {
                targetResult.results
                  .filter((cp) => !cp.success)
                  .forEach((configSetResult) => {
                    configSetResult.results
                      .filter((commandPathResult) => !commandPathResult.success)
                      .forEach((commandPathResult) => {
                        io.message({
                          text: `- Organizational unit path:     ${groupResult.groupId}`,
                          marginTop: true,
                        })
                        io.message({
                          text: `  Account id:                   ${targetResult.targetId}`,
                        })
                        io.message({
                          text: `  Config set:                   ${configSetResult.configSetName}`,
                        })
                        io.message({
                          text: `  Command path:                 ${commandPathResult.commandPath}`,
                        })

                        const { error } = commandPathResult
                        if (error) {
                          printError(io, error, logger.logLevel, 0)
                        }

                        const failedStacks =
                          commandPathResult.result.results.filter(
                            (s) => s.status === "FAILED",
                          )

                        if (failedStacks.length > 0) {
                          io.message({
                            text: "Failed stacks:",
                            marginTop: true,
                            indent: 2,
                          })

                          printFailedStackResults(
                            io,
                            failedStacks,
                            logger.logLevel,
                            2,
                          )
                        }
                      })
                  })
              })
          })
      })
    }

    return output
  }

  const createTargetListener = R.curry(createTargetListenerInternal)(
    "ou",
    "accounts",
    logger,
  )

  return {
    ...logger,
    printOutput,
    confirmLaunch,
    createStackDeployIO,
    createStackUndeployIO,
    createTargetListener,
  }
}
