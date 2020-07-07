import {
  ConfigSet,
  ConfigSetCommandPathOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import {
  CommandPath,
  CommandRole,
  CommandStatus,
  DeploymentOperation,
  OperationState,
  Options,
  TakomoCredentialProvider,
  Variables,
} from "@takomo/core"
import {
  deployStacksCommand,
  StacksOperationInput,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { deepCopy, StopWatch, TakomoError } from "@takomo/util"
import merge from "lodash.merge"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
  DeploymentTargetName,
} from "../../../model"
import { DeploymentTargetsOperationIO, PlanHolder } from "../model"

const getRoleName = (
  configSetType: ConfigSetType,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
): CommandRole | null => {
  switch (configSetType) {
    case ConfigSetType.BOOTSTRAP:
      return target.bootstrapRole || group.bootstrapRole
    case ConfigSetType.STANDARD:
      return target.deploymentRole || group.deploymentRole
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

const deploy = async (
  options: Options,
  credentialProvider: TakomoCredentialProvider,
  commandPath: CommandPath,
  groupPath: string,
  targetName: string,
  input: StacksOperationInput,
  io: DeploymentTargetsOperationIO,
): Promise<ConfigSetCommandPathOperationResult> => {
  const result = await deployStacksCommand(
    input,
    io.createStackDeployIO(options, `${groupPath}/${targetName}`),
    credentialProvider,
  )

  return {
    commandPath,
    result,
    status: result.status,
    success: result.success,
    message: result.message,
  }
}

const undeploy = async (
  options: Options,
  credentialProvider: TakomoCredentialProvider,
  commandPath: CommandPath,
  groupPath: string,
  targetName: string,
  input: StacksOperationInput,
  io: DeploymentTargetsOperationIO,
): Promise<ConfigSetCommandPathOperationResult> => {
  const result = await undeployStacksCommand(
    input,
    io.createStackUndeployIO(options, `${groupPath}/${targetName}`),
    credentialProvider,
  )

  return {
    commandPath,
    result,
    status: result.status,
    success: result.success,
    message: result.message,
  }
}

const deployOrUndeploy = async (
  variables: Variables,
  options: Options,
  credentialProvider: TakomoCredentialProvider,
  operation: DeploymentOperation,
  commandPath: CommandPath,
  groupPath: string,
  target: DeploymentTargetName,
  watch: StopWatch,
  io: DeploymentTargetsOperationIO,
): Promise<ConfigSetCommandPathOperationResult> => {
  const input = {
    variables,
    watch,
    options,
    commandPath,
    ignoreDependencies: false,
    interactive: false,
  }

  switch (operation) {
    case DeploymentOperation.DEPLOY:
      return deploy(
        options,
        credentialProvider,
        commandPath,
        groupPath,
        target,
        input,
        io,
      )
    case DeploymentOperation.UNDEPLOY:
      return undeploy(
        options,
        credentialProvider,
        commandPath,
        groupPath,
        target,
        input,
        io,
      )
    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

export const processCommandPath = async (
  holder: PlanHolder,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
  configSet: ConfigSet,
  options: Options,
  commandPath: CommandPath,
  watch: StopWatch,
  state: OperationState,
): Promise<ConfigSetCommandPathOperationResult> => {
  const {
    io,
    ctx,
    input: { operation, configSetType },
  } = holder

  const configFile = ctx.getConfigFile()
  const variables = ctx.getVariables()

  io.info(`Execute command path: ${commandPath}`)

  if (state.failed) {
    return {
      commandPath,
      result: {
        message: "Cancelled",
        status: CommandStatus.CANCELLED,
        watch: watch.startChild("total").stop(),
        success: false,
        results: [],
      },
      status: CommandStatus.CANCELLED,
      success: false,
      message: "Cancelled",
    }
  }

  const mergedVars = deepCopy(variables.var)
  merge(mergedVars, configFile.vars, group.vars, target.vars)

  const commandPathVariables = {
    env: variables.env,
    var: mergedVars,
    context: variables.context,
  }

  const deploymentRole = getRoleName(configSetType, group, target)

  const credentialProvider = deploymentRole
    ? await ctx
        .getCredentialProvider()
        .createCredentialProviderForRole(deploymentRole.iamRoleArn)
    : ctx.getCredentialProvider()

  if (target.accountId) {
    const identity = await credentialProvider.getCallerIdentity()
    if (identity.accountId !== target.accountId) {
      throw new TakomoError(
        `Current credentials belong to AWS account ${identity.accountId}, but the deployment target can be deployed only to account: ${target.accountId}`,
      )
    }
  }

  try {
    return deployOrUndeploy(
      commandPathVariables,
      options,
      credentialProvider,
      operation,
      commandPath,
      group.path,
      target.name,
      watch.startChild("total"),
      io,
    )
  } catch (e) {
    io.error(
      `Unhandled error when executing group: ${group.path}, target: ${target.name}, config set: ${configSet.name}, command path: ${commandPath}`,
      e,
    )

    return {
      commandPath,
      result: {
        message: e.message,
        status: CommandStatus.FAILED,
        watch: watch.startChild("total").stop(),
        success: false,
        results: [],
      },
      success: false,
      status: CommandStatus.FAILED,
      message: "Failed",
    }
  }
}
