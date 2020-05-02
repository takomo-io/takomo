import {
  ConfigSetCommandPathOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import {
  CommandPath,
  CommandStatus,
  DeploymentOperation,
  OperationState,
  TakomoCredentialProvider,
} from "@takomo/core"
import {
  deployStacksCommand,
  StacksOperationInput,
  StacksOperationOutput,
  undeployStacksCommand,
} from "@takomo/stacks"
import { deepCopy, StopWatch } from "@takomo/util"
import merge from "lodash.merge"
import {
  OrganizationAccount,
  OrganizationConfigFile,
  PlannedAccountDeploymentOrganizationalUnit,
  PlannedLaunchableAccount,
} from "../../../../model"
import { AccountsOperationIO, LaunchAccountsPlanHolder } from "../model"

const executeOperation = async (
  operation: DeploymentOperation,
  input: StacksOperationInput,
  account: OrganizationAccount,
  credentialProvider: TakomoCredentialProvider,
  io: AccountsOperationIO,
): Promise<StacksOperationOutput> => {
  switch (operation) {
    case DeploymentOperation.DEPLOY:
      return deployStacksCommand(
        input,
        io.createStackDeployIO(input.options, account.id),
        //new CliDeployStacksIO(input.options, account.id),
        credentialProvider,
      )
    case DeploymentOperation.UNDEPLOY:
      return undeployStacksCommand(
        input,
        io.createStackUndeployIO(input.options, account.id),
        //new CliUndeployStacksIO(input.options, account.id),
        credentialProvider,
      )
    default:
      throw new Error(`Unsupported operation: ${operation}`)
  }
}

const getRoleName = (
  configSetType: ConfigSetType,
  ou: PlannedAccountDeploymentOrganizationalUnit,
  account: OrganizationAccount,
  organizationConfigFile: OrganizationConfigFile,
): string => {
  switch (configSetType) {
    case ConfigSetType.BOOTSTRAP:
      return (
        account.accountBootstrapRoleName ||
        ou.accountBootstrapRoleName ||
        organizationConfigFile.accountBootstrapRoleName ||
        organizationConfigFile.accountCreation.defaults.roleName
      )
    case ConfigSetType.STANDARD:
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
  holder: LaunchAccountsPlanHolder,
  ou: PlannedAccountDeploymentOrganizationalUnit,
  plannedAccount: PlannedLaunchableAccount,
  configSetName: string,
  commandPath: CommandPath,
  commandPathWatch: StopWatch,
  state: OperationState,
  configSetType: ConfigSetType,
): Promise<ConfigSetCommandPathOperationResult> => {
  const {
    io,
    ctx,
    input: { variables, options, operation },
  } = holder
  const account = plannedAccount.config
  const credentialProvider = ctx.getCredentialProvider()
  const organizationConfigFile = ctx.getOrganizationConfigFile()

  io.info(`Process command path: ${commandPath}`)

  if (state.failed) {
    return {
      commandPath,
      result: {
        message: "Cancelled",
        status: CommandStatus.CANCELLED,
        watch: new StopWatch("total").stop(),
        success: false,
        results: [],
      },
      status: CommandStatus.CANCELLED,
      message: "Cancelled",
      success: false,
    }
  }

  const roleName = getRoleName(
    configSetType,
    ou,
    account,
    organizationConfigFile,
  )

  io.info(`Using role name: ${roleName}`)

  const mergedVars = deepCopy(variables.var)
  merge(mergedVars, organizationConfigFile.vars, ou.vars, account.vars)

  const input = {
    variables: {
      env: variables.env,
      var: mergedVars,
      context: variables.context,
    },
    watch: new StopWatch("total"),
    options,
    commandPath,
    ignoreDependencies: false,
    interactive: false,
  }

  const dc = await credentialProvider.createCredentialProviderForRole(
    `arn:aws:iam::${account.id}:role/${roleName}`,
  )

  try {
    const result = await executeOperation(operation, input, account, dc, io)

    return {
      result,
      commandPath,
      status: result.status,
      success: result.success,
      message: result.message,
    }
  } catch (e) {
    io.error(
      `Unhandled error when deploying account: ${account.id}, config set: ${configSetName}, command path: ${commandPath}`,
      e,
    )

    return {
      commandPath,
      result: {
        message: e.message,
        status: CommandStatus.FAILED,
        watch: new StopWatch("total").stop(),
        success: false,
        results: [],
      },
      success: false,
      status: CommandStatus.FAILED,
      message: "Failed",
    }
  }
}
