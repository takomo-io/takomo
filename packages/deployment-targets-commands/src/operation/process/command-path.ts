import { CredentialManager } from "@takomo/aws-clients"
import { CallerIdentity } from "@takomo/aws-model"
import {
  ConfigSet,
  ConfigSetCommandPathOperationResult,
  ConfigSetType,
} from "@takomo/config-sets"
import {
  CommandRole,
  InternalCommandContext,
  OutputFormat,
  Variables,
} from "@takomo/core"
import {
  DeploymentGroupConfig,
  DeploymentTargetConfig,
} from "@takomo/deployment-targets-config"
import { DeploymentTargetsContext } from "@takomo/deployment-targets-context"
import {
  DeploymentGroupPath,
  DeploymentTargetName,
} from "@takomo/deployment-targets-model"
import {
  deployStacksCommand,
  StacksOperationInput,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { StacksConfigRepository } from "@takomo/stacks-context"
import {
  CommandPath,
  DeploymentOperation,
  OperationState,
} from "@takomo/stacks-model"
import { deepCopy, TakomoError, Timer } from "@takomo/util"
import merge from "lodash.merge"
import { DeploymentTargetsOperationIO, PlanHolder } from "../model"

const getDeploymentRole = (
  currentIdentity: CallerIdentity,
  configSetType: ConfigSetType,
  group: DeploymentGroupConfig,
  target: DeploymentTargetConfig,
): CommandRole | undefined => {
  switch (configSetType) {
    case "bootstrap":
      const bootstrapRole = target.bootstrapRole ?? group.bootstrapRole
      if (bootstrapRole) {
        return bootstrapRole
      }

      const bootstrapRoleName =
        target.bootstrapRoleName ?? group.bootstrapRoleName
      if (!bootstrapRoleName) {
        return undefined
      }

      const bootstrapAccountId = target.accountId ?? currentIdentity.accountId

      return {
        iamRoleArn: `arn:aws:iam::${bootstrapAccountId}:role/${bootstrapRoleName}`,
      }
    case "standard":
      const deploymentRole = target.deploymentRole ?? group.deploymentRole
      if (deploymentRole) {
        return deploymentRole
      }

      const deploymentRoleName =
        target.deploymentRoleName ?? group.deploymentRoleName
      if (!deploymentRoleName) {
        return undefined
      }

      const deploymentAccountId = target.accountId ?? currentIdentity.accountId

      return {
        iamRoleArn: `arn:aws:iam::${deploymentAccountId}:role/${deploymentRoleName}`,
      }
    default:
      throw new Error(`Unsupported config set type: ${configSetType}`)
  }
}

const deploy = async (
  credentialManager: CredentialManager,
  commandPath: CommandPath,
  groupPath: DeploymentGroupPath,
  targetName: DeploymentTargetName,
  input: StacksOperationInput,
  io: DeploymentTargetsOperationIO,
  configRepository: StacksConfigRepository,
  ctx: InternalCommandContext,
): Promise<ConfigSetCommandPathOperationResult> => {
  const result = await deployStacksCommand({
    input,
    credentialManager,
    configRepository,
    ctx,
    io: io.createStackDeployIO(`${groupPath}/${targetName}`),
  })

  return {
    commandPath,
    result,
    status: result.status,
    success: result.success,
    message: result.message,
  }
}

const undeploy = async (
  credentialManager: CredentialManager,
  commandPath: CommandPath,
  groupPath: DeploymentGroupPath,
  targetName: DeploymentTargetName,
  input: StacksOperationInput,
  io: DeploymentTargetsOperationIO,
  configRepository: StacksConfigRepository,
  ctx: InternalCommandContext,
): Promise<ConfigSetCommandPathOperationResult> => {
  const result = await undeployStacksCommand({
    input,
    credentialManager,
    configRepository,
    ctx,
    io: io.createStackUndeployIO(`${groupPath}/${targetName}`),
  })

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
  credentialManager: CredentialManager,
  operation: DeploymentOperation,
  commandPath: CommandPath,
  groupPath: DeploymentGroupPath,
  target: DeploymentTargetName,
  timer: Timer,
  io: DeploymentTargetsOperationIO,
  ctx: DeploymentTargetsContext,
  stacksConfigRepository: StacksConfigRepository,
  outputFormat: OutputFormat,
): Promise<ConfigSetCommandPathOperationResult> => {
  const input = {
    timer,
    commandPath,
    ignoreDependencies: false,
    interactive: false,
    outputFormat,
  }

  const commandContext = {
    ...ctx.commandContext,
    variables,
  }

  switch (operation) {
    case "deploy":
      return deploy(
        credentialManager,
        commandPath,
        groupPath,
        target,
        input,
        io,
        stacksConfigRepository,
        commandContext,
      )
    case "undeploy":
      return undeploy(
        credentialManager,
        commandPath,
        groupPath,
        target,
        input,
        io,
        stacksConfigRepository,
        commandContext,
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
  timer: Timer,
  state: OperationState,
  stacksConfigRepository: StacksConfigRepository,
): Promise<ConfigSetCommandPathOperationResult> => {
  const {
    io,
    ctx,
    input: { operation, configSetType, outputFormat },
  } = holder

  const { variables } = ctx

  io.info(`Execute command path: ${commandPath}`)

  if (state.failed) {
    timer.stop()
    return {
      commandPath,
      result: {
        message: "Cancelled",
        status: "CANCELLED",
        outputFormat,
        timer,
        success: false,
        results: [],
      },
      status: "CANCELLED",
      success: false,
      message: "Cancelled",
    }
  }

  const mergedVars = deepCopy(variables.var)
  merge(mergedVars, target.vars)

  const commandPathVariables = {
    env: variables.env,
    var: mergedVars,
    context: variables.context,
    target: {
      name: target.name,
      accountId: target.accountId,
    },
  }

  const currentIdentity = await ctx.credentialManager.getCallerIdentity()
  const deploymentRole = getDeploymentRole(
    currentIdentity,
    configSetType,
    group,
    target,
  )

  const credentialManager = deploymentRole
    ? await ctx.credentialManager.createCredentialManagerForRole(
        deploymentRole.iamRoleArn,
      )
    : ctx.credentialManager

  if (target.accountId) {
    const identity = await credentialManager.getCallerIdentity()
    if (identity.accountId !== target.accountId) {
      throw new TakomoError(
        `Current credentials belong to AWS account ${identity.accountId}, but the deployment target can be deployed only to account: ${target.accountId}`,
      )
    }
  }

  try {
    return deployOrUndeploy(
      commandPathVariables,
      credentialManager,
      operation,
      commandPath,
      group.path,
      target.name,
      timer,
      io,
      ctx,
      stacksConfigRepository,
      outputFormat,
    )
  } catch (e) {
    io.error(
      `Unhandled error when executing group: ${group.path}, target: ${target.name}, config set: ${configSet.name}, command path: ${commandPath}`,
      e,
    )

    timer.stop()

    return {
      commandPath,
      result: {
        message: e.message,
        status: "FAILED",
        outputFormat,
        timer,
        success: false,
        results: [],
      },
      success: false,
      status: "FAILED",
      message: "Failed",
    }
  }
}
