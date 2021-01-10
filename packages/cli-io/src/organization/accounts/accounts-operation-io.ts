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
import { LogWriter, TkmLogger } from "@takomo/util"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import { createBaseIO } from "../../cli-io"
import { formatCommandStatus } from "../../formatters"
import { createDeployStacksIO } from "../../stacks/deploy-stacks-io"
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

export const createAccountsOperationIO = (
  logger: TkmLogger,
  messages: Messages,
  writer: LogWriter = console.log,
): AccountsOperationIO => {
  const io = createBaseIO(writer)

  const createStackDeployIO = (accountId: AccountId): DeployStacksIO =>
    createDeployStacksIO(logger.childLogger(accountId))

  const createStackUndeployIO = (accountId: AccountId): UndeployStacksIO =>
    createUndeployStacksIO(logger.childLogger(accountId))

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
