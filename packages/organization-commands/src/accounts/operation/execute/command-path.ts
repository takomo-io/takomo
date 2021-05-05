import { CredentialManager } from "@takomo/aws-clients"
import {
  ConfigSetCommandPathOperationResult,
  ConfigSetName,
  ConfigSetType,
} from "@takomo/config-sets"
import { InternalCommandContext } from "@takomo/core"
import {
  OrganizationAccountConfig,
  OrganizationConfig,
} from "@takomo/organization-config"
import {
  deployStacksCommand,
  StacksOperationInput,
  StacksOperationOutput,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { StacksConfigRepository } from "@takomo/stacks-context"
import {
  CommandPath,
  DeploymentOperation,
  OperationState,
} from "@takomo/stacks-model"
import { createTimer, deepCopy, Timer } from "@takomo/util"
import merge from "lodash.merge"
import {
  AccountsOperationIO,
  PlannedAccountDeploymentOrganizationalUnit,
  PlannedLaunchableAccount,
} from "../model"
import { AccountsOperationPlanHolder } from "../states"

const executeOperation = async (
  operation: DeploymentOperation,
  input: StacksOperationInput,
  account: OrganizationAccountConfig,
  credentialManager: CredentialManager,
  io: AccountsOperationIO,
  ctx: InternalCommandContext,
  configRepository: StacksConfigRepository,
): Promise<StacksOperationOutput> => {
  switch (operation) {
    case "deploy":
      return deployStacksCommand({
        input,
        ctx,
        credentialManager,
        configRepository,
        io: io.createStackDeployIO(account.id),
      })
    case "undeploy":
      return undeployStacksCommand({
        input,
        ctx,
        credentialManager,
        configRepository,
        io: io.createStackUndeployIO(account.id),
      })
    default:
      throw new Error(`Unsupported operation: ${operation}`)
  }
}

const getRoleName = (
  configSetType: ConfigSetType,
  ou: PlannedAccountDeploymentOrganizationalUnit,
  account: OrganizationAccountConfig,
  organizationConfigFile: OrganizationConfig,
): string => {
  switch (configSetType) {
    case "bootstrap":
      return (
        account.accountBootstrapRoleName ||
        ou.accountBootstrapRoleName ||
        organizationConfigFile.accountBootstrapRoleName ||
        organizationConfigFile.accountCreation.defaults.roleName
      )
    case "standard":
      return (
        account.accountAdminRoleName ||
        ou.accountAdminRoleName ||
        organizationConfigFile.accountAdminRoleName ||
        organizationConfigFile.accountCreation.defaults.roleName
      )
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

export const processCommandPath = async (
  holder: AccountsOperationPlanHolder,
  ou: PlannedAccountDeploymentOrganizationalUnit,
  plannedAccount: PlannedLaunchableAccount,
  configSetName: ConfigSetName,
  commandPath: CommandPath,
  commandPathTimer: Timer,
  state: OperationState,
  configSetType: ConfigSetType,
  stacksConfigRepository: StacksConfigRepository,
): Promise<ConfigSetCommandPathOperationResult> => {
  const {
    io,
    ctx,
    input: { operation },
  } = holder
  const account = plannedAccount.config
  const credentialManager = ctx.credentialManager
  const organizationConfig = ctx.organizationConfig

  io.info(`Process command path: '${commandPath}'`)

  if (state.failed) {
    const timer = createTimer("total")
    timer.stop()

    return {
      commandPath,
      result: {
        timer,
        message: "Cancelled",
        status: "CANCELLED",
        success: false,
        results: [],
      },
      status: "CANCELLED",
      message: "Cancelled",
      success: false,
    }
  }

  const roleName = getRoleName(configSetType, ou, account, organizationConfig)

  io.info(`Using role name: ${roleName}`)

  const mergedVars = deepCopy(ctx.variables.var)
  merge(mergedVars, organizationConfig.vars, ou.vars, account.vars)

  const input = {
    commandPath,
    timer: createTimer("total"),
    ignoreDependencies: false,
    interactive: false,
  }

  const variables = {
    env: ctx.variables.env,
    var: mergedVars,
    context: ctx.variables.context,
  }

  const cm = await credentialManager.createCredentialManagerForRole(
    `arn:aws:iam::${account.id}:role/${roleName}`,
  )

  try {
    const result = await executeOperation(
      operation,
      input,
      account,
      cm,
      io,
      {
        ...ctx.commandContext,
        variables,
      },
      stacksConfigRepository,
    )

    return {
      result,
      commandPath,
      status: result.status,
      success: result.success,
      message: result.message,
    }
  } catch (error) {
    io.error(
      `An error occurred when deploying account: '${account.id}', config set: '${configSetName}', command path: '${commandPath}'`,
      error,
    )

    const timer = createTimer("total")
    timer.stop()

    return {
      commandPath,
      error,
      result: {
        timer,
        message: "Error",
        status: "FAILED",
        success: false,
        results: [],
      },
      success: false,
      status: "FAILED",
      message: "Failed",
    }
  }
}
