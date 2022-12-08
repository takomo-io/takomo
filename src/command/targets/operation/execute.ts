import { InternalCredentialManager } from "../../../aws/common/credentials"
import { InternalCommandContext } from "../../../context/command-context"
import {
  DeploymentTargetsConfigRepository,
  DeploymentTargetsContext,
} from "../../../context/targets-context"
import { OutputFormat } from "../../../takomo-core/command"
import {
  ConfigSetTargetExecutorProps,
  executeConfigSetPlan,
} from "../../../takomo-execution-plans"
import { StacksConfigRepository } from "../../../takomo-stacks-context"
import { TakomoError } from "../../../utils/errors"
import { TkmLogger } from "../../../utils/logging"
import { DeploymentOperation } from "../../command-model"
import { deployStacksCommand } from "../../stacks/deploy/command"
import { StacksOperationInput, StacksOperationOutput } from "../../stacks/model"
import { undeployStacksCommand } from "../../stacks/undeploy/command"
import { PlannedDeploymentTarget } from "../common/plan/model"
import { createDeploymentTargetVariables } from "./create-deployment-target-variables"
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
  readonly prune: boolean
}

const executeOperationInternal = async (
  operation: DeploymentOperation,
  input: StacksOperationInput,
  target: PlannedDeploymentTarget,
  credentialManager: InternalCredentialManager,
  io: DeploymentTargetsOperationIO,
  ctx: InternalCommandContext,
  configRepository: StacksConfigRepository,
  logger: TkmLogger,
  expectNoChanges: boolean,
  prune: boolean,
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
        io: io.createStackDeployIO(logger, target),
      })
    case "undeploy":
      return undeployStacksCommand({
        input: {
          ...input,
          prune,
        },
        ctx,
        credentialManager,
        configRepository,
        io: io.createStackUndeployIO(logger, target),
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
  prune,
}: CreateExecutorProps) => {
  return async ({
    timer,
    logger,
    state,
    commandPath,
    configSet,
    target,
    defaultCredentialManager,
  }: ConfigSetTargetExecutorProps<PlannedDeploymentTarget>): Promise<StacksOperationOutput> => {
    if (state.failed) {
      logger.debug("Cancel operation")

      return {
        outputFormat,
        timer: timer.stop(),
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

      const variables = createDeploymentTargetVariables({ target, ctx })

      const credentialManager = target.data.executionRoleArn
        ? await defaultCredentialManager.createCredentialManagerForRole(
            target.data.executionRoleArn,
          )
        : defaultCredentialManager

      if (target.data.accountId) {
        const identity = await credentialManager.getCallerIdentity()
        if (identity.accountId !== target.data.accountId) {
          throw new TakomoError(
            `Current credentials belong to AWS account ${identity.accountId}, but the deployment target can be deployed only to account: ${target.data.accountId}`,
          )
        }
      }

      return await executeOperationInternal(
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
        prune,
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

export const executeOperation = async (
  holder: PlanHolder,
): Promise<DeploymentTargetsOperationOutput> => {
  const {
    timer,
    io,
    plan,
    input: {
      concurrentTargets,
      outputFormat,
      operation,
      expectNoChanges,
      prune,
    },
    ctx,
  } = holder

  io.info("Execute operation")

  const executor = createExecutor({
    outputFormat,
    configRepository: ctx.configRepository,
    ctx,
    operation,
    io,
    expectNoChanges,
    prune,
  })

  return executeConfigSetPlan({
    ctx,
    plan,
    executor,
    concurrentTargets,
    logger: io,
    state: { failed: false },
    timer: timer.startChild("execute"),
    defaultCredentialManager: ctx.credentialManager,
    targetListenerProvider: io.createTargetListener,
  })
}
