import { CredentialManager } from "@takomo/aws-clients"
import { executePlan, TargetExecutorProps } from "@takomo/config-sets"
import { InternalCommandContext, OutputFormat } from "@takomo/core"
import {
  OrganizationConfigRepository,
  OrganizationContext,
} from "@takomo/organization-context"
import {
  deployStacksCommand,
  StacksOperationInput,
  StacksOperationOutput,
  undeployStacksCommand,
} from "@takomo/stacks-commands"
import { StacksConfigRepository } from "@takomo/stacks-context"
import { DeploymentOperation } from "@takomo/stacks-model"
import { deepCopy, TkmLogger } from "@takomo/util"
import { PlannedOrganizationAccount } from "../../common/plan"
import { AccountsOperationIO } from "../model"
import { AccountsOperationPlanHolder } from "../states"
import { AccountsOperationStep } from "../steps"

const executeOperationInternal = async (
  operation: DeploymentOperation,
  input: StacksOperationInput,
  account: PlannedOrganizationAccount,
  credentialManager: CredentialManager,
  io: AccountsOperationIO,
  ctx: InternalCommandContext,
  configRepository: StacksConfigRepository,
  logger: TkmLogger,
): Promise<StacksOperationOutput> => {
  switch (operation) {
    case "deploy":
      return deployStacksCommand({
        input: {
          ...input,
          expectNoChanges: false,
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

interface CreateExecutorProps {
  readonly outputFormat: OutputFormat
  readonly configRepository: OrganizationConfigRepository
  readonly operation: DeploymentOperation
  readonly ctx: OrganizationContext
  readonly io: AccountsOperationIO
}

const createExecutor = ({
  outputFormat,
  configRepository,
  operation,
  ctx,
  io,
}: CreateExecutorProps) => {
  return async ({
    timer,
    logger,
    state,
    commandPath,
    configSet,
    target,
    defaultCredentialManager,
  }: TargetExecutorProps<PlannedOrganizationAccount>): Promise<StacksOperationOutput> => {
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
      }

      const credentialManager =
        await defaultCredentialManager.createCredentialManagerForRole(
          target.data.executionRoleArn,
        )

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

export const executeOperation: AccountsOperationStep<AccountsOperationPlanHolder> =
  async (state) => {
    const {
      ctx,
      input: { concurrentAccounts, outputFormat, operation },
      io,
      accountsLaunchPlan,
      totalTimer,
      transitions,
      configRepository,
    } = state

    const executor = createExecutor({
      outputFormat,
      configRepository,
      ctx,
      operation,
      io,
    })

    const result = await executePlan({
      ctx,
      executor,
      concurrentAccounts,
      logger: io,
      plan: accountsLaunchPlan,
      timer: totalTimer.startChild("execute"),
      state: { failed: false },
      defaultCredentialManager: ctx.credentialManager,
      targetListenerProvider: io.createTargetListener,
    })

    return transitions.completeAccountsOperation({
      ...state,
      result,
    })
  }
