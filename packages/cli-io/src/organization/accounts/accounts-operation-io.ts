import { AccountId } from "@takomo/aws-model"
import { ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import { ConfirmResult } from "@takomo/core"
import {
  AccountsLaunchPlan,
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
): ReadonlyArray<ConfigSetName> => {
  switch (configSetType) {
    case "standard":
      return account.configSets
    case "bootstrap":
      return account.bootstrapConfigSets
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

    plan.organizationalUnits.forEach((ou) => {
      io.message({ text: `  ${ou.path}:`, marginTop: true })
      ou.accounts.forEach(({ account, config }) => {
        io.message({ text: `    - id:       ${config.id}`, marginTop: true })
        io.message({ text: `      name:     ${account.name}` })
        io.message({ text: `      email:    ${account.email}` })
        io.message({ text: `      ${getConfigSetsName(plan.configSetType)}:` })

        getConfigSets(plan.configSetType, config).forEach((configSet) => {
          io.message({ text: `        - ${configSet}` })
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
                targetsTable.cell("Organizational unit", ou.path)
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
              targetsTable.cell("Organizational unit", ou.path)
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
    /*
      if (failed.length > 0) {
    io.subheader({
      text: "More information about the failed stacks",
      marginTop: true,
    })

    failed.forEach((r) => {
      io.message({
        text: `- Stack path: ${r.stack.path}`,
        marginTop: true,
      })
      io.message({
        text: `Stack name: ${r.stack.name}`,
        indent: 2,
      })

      if (r.events.length > 0) {
        io.message({
          text: "Stack events:",
          marginTop: true,
          indent: 2,
        })
        const fn = (e: StackEvent) =>
          io.message({ text: formatStackEvent(e), indent: 4 })
        r.events.forEach(fn)
      }

      if (r.error) {
        io.message({
          text: "Error:",
          marginTop: true,
          indent: 2,
        })

        const error = r.error

        if (error instanceof TakomoError) {
          io.message({ text: error.message, indent: 4 })
          if (error.info) {
            io.message({
              text: "Additional info:",
              indent: 4,
              marginTop: true,
            })

            io.message({ text: error.info, indent: 6 })
          }

          if (error.instructions) {
            io.message({
              text: "How to fix:",
              indent: 4,
              marginTop: true,
            })

            error.instructions.forEach((instruction) => {
              io.message({ text: `- ${instruction}`, indent: 6 })
            })
          }
        } else {
          io.message({ text: `${error}`, indent: 4 })
        }

        if ((error.stack && logLevel === "debug") || logLevel === "trace") {
          io.message({
            text: "Stack trace:",
            marginTop: true,
            indent: 4,
          })

          io.message({
            text: indentLines(`${error.stack}`, 6),
          })
        }
      }
    })
  }
     */

    return output
  }

  return {
    ...logger,
    printOutput,
    confirmLaunch,
    createStackDeployIO,
    createStackUndeployIO,
  }
}
