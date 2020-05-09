import { ConfigSetName, ConfigSetType } from "@takomo/config-sets"
import { ConfirmResult, Options } from "@takomo/core"
import {
  AccountsLaunchPlan,
  AccountsOperationIO,
  AccountsOperationOutput,
  OrganizationAccount,
} from "@takomo/organization"
import { DeployStacksIO, UndeployStacksIO } from "@takomo/stacks-commands"
import Table from "easy-table"
import prettyMs from "pretty-ms"
import CliIO from "../../cli-io"
import { formatCommandStatus } from "../../formatters"

export interface Messages {
  confirmHeader: string
  confirmQuestion: string
  outputHeader: string
  outputNoAccounts: string
}

const getConfigSets = (
  configSetType: ConfigSetType,
  account: OrganizationAccount,
): ConfigSetName[] => {
  switch (configSetType) {
    case ConfigSetType.STANDARD:
      return account.configSets
    case ConfigSetType.BOOTSTRAP:
      return account.bootstrapConfigSets
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

const getConfigSetsName = (configSetType: ConfigSetType): string => {
  switch (configSetType) {
    case ConfigSetType.STANDARD:
      return "config sets"
    case ConfigSetType.BOOTSTRAP:
      return "bootstrap config sets"
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

export abstract class CliAccountsOperationIO extends CliIO
  implements AccountsOperationIO {
  private messages: Messages
  private readonly stacksDeployIO: (
    options: Options,
    accountId: string,
  ) => DeployStacksIO
  private readonly stacksUndeployIO: (
    options: Options,
    accountId: string,
  ) => UndeployStacksIO

  protected constructor(
    options: Options,
    messages: Messages,
    stacksDeployIO: (options: Options, accountId: string) => DeployStacksIO,
    stacksUndeployIO: (options: Options, accountId: string) => UndeployStacksIO,
  ) {
    super(options)
    this.messages = messages
    this.stacksDeployIO = stacksDeployIO
    this.stacksUndeployIO = stacksUndeployIO
  }

  createStackDeployIO = (options: Options, accountId: string): DeployStacksIO =>
    this.stacksDeployIO(options, accountId)

  createStackUndeployIO = (
    options: Options,
    accountId: string,
  ): UndeployStacksIO => this.stacksUndeployIO(options, accountId)

  confirmLaunch = async (plan: AccountsLaunchPlan): Promise<ConfirmResult> => {
    this.header(this.messages.confirmHeader, true)

    plan.organizationalUnits.forEach((ou) => {
      this.message(`  ${ou.path}:`, true)
      ou.accounts.forEach(({ account, config }) => {
        this.message(`    - id:       ${config.id}`, true)
        this.message(`      name:     ${account.Name}`)
        this.message(`      email:    ${account.Email}`)
        this.message(`      ${getConfigSetsName(plan.configSetType)}:`)

        getConfigSets(plan.configSetType, config).forEach((configSet) => {
          this.message(`        - ${configSet}`)
        })
      })
    })

    if (await this.confirm(this.messages.confirmQuestion, true)) {
      return ConfirmResult.YES
    }

    return ConfirmResult.NO
  }

  printOutput = (output: AccountsOperationOutput): AccountsOperationOutput => {
    this.header(this.messages.outputHeader, true)

    if (output.results.length === 0) {
      this.message(this.messages.outputNoAccounts, true)
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
              targetsTable.cell("Organizational unit", ou.path)
              targetsTable.cell("Account", account.accountId)
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
}
