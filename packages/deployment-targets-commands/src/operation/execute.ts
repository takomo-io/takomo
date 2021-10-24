import { CredentialManager } from "@takomo/aws-clients"
import { executePlan, TargetExecutorProps } from "@takomo/config-sets"
import { InternalCommandContext, OutputFormat } from "@takomo/core"
import {
  DeploymentTargetsConfigRepository,
  DeploymentTargetsContext,
} from "@takomo/deployment-targets-context"
import {
  deployStacksCommand,
  StacksOperationInput,
  StacksOperationOutput,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { StacksConfigRepository } from "@takomo/stacks-context"
import { DeploymentOperation } from "@takomo/stacks-model"
import { deepCopy, TakomoError, TkmLogger } from "@takomo/util"
import { PlannedDeploymentTarget } from "../common/plan"
import {
  DeploymentTargetsOperationIO,
  DeploymentTargetsOperationOutput,
  PlanHolder,
} from "./model"

interface CreateExecutorProps {
  readonly outputFormat: OutputFormat
  readonly configRepository: DeploymentTargetsConfigRepository
  readonly operation: DeploymentOperation
  readonly ctx: DeploymentTargetsContext
  readonly io: DeploymentTargetsOperationIO
  readonly expectNoChanges: boolean
}

const executeOperationInternal = async (
  operation: DeploymentOperation,
  input: StacksOperationInput,
  account: PlannedDeploymentTarget,
  credentialManager: CredentialManager,
  io: DeploymentTargetsOperationIO,
  ctx: InternalCommandContext,
  configRepository: StacksConfigRepository,
  logger: TkmLogger,
  expectNoChanges: boolean,
): Promise<StacksOperationOutput> => {
  switch (operation) {
    case "deploy":
      return deployStacksCommand({
        input: {
          ...input,
          expectNoChanges,
        },
        ctx,
        credentialManager,
        configRepository,
        io: io.createStackDeployIO(logger),
      })
    case "undeploy":
      return undeployStacksCommand({
        input,
        ctx,
        credentialManager,
        configRepository,
        io: io.createStackUndeployIO(logger),
      })
    default:
      throw new Error(`Unsupported operation: ${operation}`)
  }
}

const createExecutor = ({
  outputFormat,
  configRepository,
  operation,
  ctx,
  io,
  expectNoChanges,
}: CreateExecutorProps) => {
  return async ({
    timer,
    logger,
    state,
    commandPath,
    configSet,
    target,
    defaultCredentialManager,
  }: TargetExecutorProps<PlannedDeploymentTarget>): Promise<StacksOperationOutput> => {
    if (state.failed) {
      logger.debug("Cancel operation")
      timer.stop()

      return {
        outputFormat,
        timer,
        status: "CANCELLED",
        message: "Cancelled",
        success: false,
        results: [],
      }
    }

    try {
      const input = {
        outputFormat,
        timer,
        commandPath,
        ignoreDependencies: false,
        interactive: false,
      }

      const stacksConfigRepository =
        await configRepository.createStacksConfigRepository(
          configSet.name,
          configSet.legacy,
        )

      const variables = {
        env: ctx.variables.env,
        var: deepCopy(target.vars),
        context: ctx.variables.context,
        target: {
          name: target.id,
          accountId: target.accountId,
        },
      }

      const credentialManager = target.data.executionRoleArn
        ? await defaultCredentialManager.createCredentialManagerForRole(
            target.data.executionRoleArn,
          )
        : defaultCredentialManager

      if (target.accountId) {
        const identity = await credentialManager.getCallerIdentity()
        if (identity.accountId !== target.accountId) {
          throw new TakomoError(
            `Current credentials belong to AWS account ${identity.accountId}, but the deployment target can be deployed only to account: ${target.accountId}`,
          )
        }
      }

      return executeOperationInternal(
        operation,
        input,
        target.data,
        credentialManager,
        io,
        {
          ...ctx.commandContext,
          variables,
        },
        stacksConfigRepository,
        logger,
        expectNoChanges,
      )
    } catch (error: any) {
      logger.error("An error occurred", error)
      timer.stop()

      return {
        error,
        outputFormat,
        timer,
        status: "FAILED",
        message: "Failed",
        success: false,
        results: [],
      }
    }
  }
}

export const processOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const {
    timer,
    io,
    plan,
    input: { concurrentTargets, outputFormat, operation, expectNoChanges },
    ctx,
  } = holder

  io.info("Process operation")

  const executor = createExecutor({
    outputFormat,
    configRepository: ctx.configRepository,
    ctx,
    operation,
    io,
    expectNoChanges,
  })

  return executePlan({
    ctx,
    plan,
    logger: io,
    executor,
    state: { failed: false },
    timer: timer.startChild("execute"),
    concurrentAccounts: concurrentTargets,
    defaultCredentialManager: ctx.credentialManager,
    targetListenerProvider: io.createTargetListener,
  })
}
