import { AccountId } from "@takomo/aws-model"
import {
  ConfigSetName,
  ConfigSetStage,
  ConfigSetType,
} from "@takomo/config-sets"
import { ConfirmResult } from "@takomo/core"
import {
  AccountsLaunchPlan,
  AccountsListener,
  AccountsOperationIO,
  AccountsOperationOutput,
} from "@takomo/organization-commands"
import { OrganizationAccountConfig } from "@takomo/organization-config"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import { createBaseIO } from "../../cli-io"
import { printError } from "../../common"
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

const getConfigSets = (
  configSetType: ConfigSetType,
  account: OrganizationAccountConfig,
  stage?: ConfigSetStage,
): ReadonlyArray<ConfigSetName> => {
  switch (configSetType) {
    case "standard":
      return account.configSets
        .filter((c) => c.stage === stage)
        .map((c) => c.name)
    case "bootstrap":
      return account.bootstrapConfigSets
        .filter((c) => c.stage === stage)
        .map((c) => c.name)
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
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

  const createStackDeployIO = (accountId: AccountId): DeployStacksIO =>
    createDeployStacksIO({ logger: logger.childLogger(accountId) })

  const createStackUndeployIO = (accountId: AccountId): UndeployStacksIO =>
    createUndeployStacksIO({ logger: logger.childLogger(accountId) })

  const confirmLaunch = async (
    plan: AccountsLaunchPlan,
  ): Promise<ConfirmResult> => {
    io.header({ text: messages.confirmHeader, marginTop: true })

    plan.stages.forEach((stage) => {
      io.message({
        text: `stage: ${stage.stage ?? "default"}`,
        indent: 2,
        marginTop: true,
      })
      stage.organizationalUnits.forEach((ou) => {
        io.message({ text: `${ou.path}:`, indent: 4, marginTop: true })
        ou.accounts.forEach(({ account, config }) => {
          io.message({
            text: `- id:       ${config.id}`,
            marginTop: true,
            indent: 6,
          })
          io.message({ text: `name:     ${account.name}`, indent: 8 })
          io.message({ text: `email:    ${account.email}`, indent: 8 })
          io.message({
            text: `${getConfigSetsName(plan.configSetType)}:`,
            indent: 8,
          })

          getConfigSets(plan.configSetType, config, stage.stage).forEach(
            (configSet) => {
              io.message({ text: `- ${configSet}`, indent: 10 })
            },
          )
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

    if (!output.results) {
      io.message({ text: messages.outputNoAccounts, marginTop: true })
      return output
    }

    const targetsTable = new Table()
    output.results.forEach((ou) => {
      ou.results.forEach((account) => {
        account.results.forEach((configSet) => {
          configSet.results.forEach((result) => {
            if (result.result.results.length > 0) {
              result.result.results.forEach((stackResult) => {
                targetsTable.cell("stage", ou.stage ?? "default")
                targetsTable.cell("OU", ou.path)
                targetsTable.cell("Account", account.accountId)
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
              targetsTable.cell("stage", ou.stage ?? "default")
              targetsTable.cell("OU", ou.path)
              targetsTable.cell("Account", account.accountId)
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

    const failed = output.results.filter((r) => !r.success)

    if (failed.length > 0) {
      io.subheader({
        text: "More information about the failed accounts",
        marginTop: true,
      })

      failed.forEach((ou) => {
        ou.results
          .filter((a) => !a.success)
          .forEach((accountResult) => {
            accountResult.results
              .filter((c) => !c.success)
              .forEach((configSetResult) => {
                configSetResult.results
                  .filter((cp) => !cp.success)
                  .forEach((commandPathResult) => {
                    io.message({
                      text: `- Organizational unit path:     ${ou.path}`,
                      marginTop: true,
                    })
                    io.message({
                      text: `  Account id:                   ${accountResult.accountId}`,
                    })
                    io.message({
                      text: `  Config set:                   ${configSetResult.configSetName}`,
                    })
                    io.message({
                      text: `  Command path:                 ${commandPathResult.commandPath}`,
                    })

                    const { error, result } = commandPathResult
                    if (error) {
                      printError(io, error, logger.logLevel, 0)
                    }

                    const failedStacks = result.results.filter(
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
    }

    return output
  }

  const createAccountsListener = (
    stageInfo: string,
    accountCount: number,
  ): AccountsListener => {
    let accountsInProgress = 0
    let accountsCompleted = 0
    return {
      onAccountBegin: async () => {
        accountsInProgress++
      },
      onAccountComplete: async () => {
        accountsInProgress--
        accountsCompleted++
        const waitingCount =
          accountCount - accountsInProgress - accountsCompleted
        const percentage = ((accountsCompleted / accountCount) * 100).toFixed(1)
        logger.info(
          `${stageInfo} accounts waiting: ${waitingCount}, in progress: ${accountsInProgress}, completed: ${accountsCompleted}/${accountCount} (${percentage}%)`,
        )
      },
    }
  }

  return {
    ...logger,
    printOutput,
    confirmLaunch,
    createStackDeployIO,
    createStackUndeployIO,
    createAccountsListener,
  }
}
