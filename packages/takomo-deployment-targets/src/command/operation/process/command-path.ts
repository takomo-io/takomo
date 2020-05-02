import {
  ConfigSet,
  ConfigSetCommandPathOperationResult,
} from "@takomo/config-sets"
import {
  CommandPath,
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
} from "@takomo/stacks"
import { deepCopy, StopWatch } from "@takomo/util"
import merge from "lodash.merge"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
  DeploymentTargetName,
} from "../../../model"
import { DeploymentTargetsOperationIO, PlanHolder } from "../model"

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
  commandPath: CommandPath,
  watch: StopWatch,
  state: OperationState,
): Promise<ConfigSetCommandPathOperationResult> => {
  const {
    io,
    ctx,
    input: { operation },
  } = holder

  const configFile = ctx.getConfigFile()
  const variables = ctx.getVariables()
  const options = ctx.getOptions()

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

  const deploymentRole = target.deploymentRole || group.deploymentRole

  const credentialProvider = deploymentRole
    ? await ctx
        .getCredentialProvider()
        .createCredentialProviderForRole(deploymentRole.iamRoleArn)
    : ctx.getCredentialProvider()

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
