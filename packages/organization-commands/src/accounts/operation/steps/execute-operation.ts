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
import { deepCopy } from "@takomo/util"
import merge from "lodash.merge"
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
  return async (
    props: TargetExecutorProps<PlannedOrganizationAccount>,
  ): Promise<StacksOperationOutput> => {
    if (props.state.failed) {
      props.timer.stop()

      return {
        outputFormat,
        timer: props.timer,
        status: "CANCELLED",
        message: "Cancelled",
        success: false,
        results: [],
      }
    }

    try {
      const executorInput = {
        outputFormat,
        commandPath: props.commandPath,
        timer: props.timer,
        ignoreDependencies: false,
        interactive: false,
      }

      const stacksConfigRepository =
        await configRepository.createStacksConfigRepository(
          props.configSet.name,
          props.configSet.legacy,
        )

      const mergedVars = deepCopy(ctx.variables.var)
      merge(mergedVars, ctx.organizationConfig.vars, props.target.vars)

      const variables = {
        env: ctx.variables.env,
        var: mergedVars,
        context: ctx.variables.context,
      }

      const credentialManager =
        await props.defaultCredentialManager.createCredentialManagerForRole(
          props.target.data.executionRoleArn,
        )

      return executeOperationInternal(
        operation,
        executorInput,
        props.target.data,
        credentialManager,
        io,
        {
          ...ctx.commandContext,
          variables,
        },
        stacksConfigRepository,
      )
    } catch (e) {
      props.timer.stop()

      return {
        outputFormat,
        timer: props.timer,
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
      input: {
        commandPath,
        concurrentAccounts,
        outputFormat,
        configSetType,
        operation,
      },
      io,
      accountsLaunchPlan,
      totalTimer,
      transitions,
      configRepository,
    } = state
    // const {
    //   transitions,
    //   io,
    //   accountsLaunchPlan: plan,
    //   input: { configSetType, configSetName },
    //   totalTimer,
    // } = state1
    // const results = new Array<OrganizationalUnitAccountsOperationResult>()
    //
    // io.info("Process operation")
    //
    // const state = { failed: false }
    // const stageCount = plan.stages.length
    //
    // for (const [i, stage] of plan.stages.entries()) {
    //   const stageName = stage.stage ?? "default"
    //   io.info(`Begin stage '${stageName}'`)
    //   const timer = createTimer(stageName)
    //
    //   const accountCount = stage.organizationalUnits
    //     .map((g) => g.accounts)
    //     .flat().length
    //
    //   const accountsListener = createAccountsListener({
    //     io,
    //     accountCount,
    //     stageCount,
    //     currentStageNumber: i + 1,
    //     stageName,
    //   })
    //
    //   for (const organizationalUnit of stage.organizationalUnits) {
    //     const result = await processOrganizationalUnit(
    //       accountsListener,
    //       state1,
    //       organizationalUnit,
    //       totalTimer.startChild(organizationalUnit.path),
    //       state,
    //       configSetType,
    //       stage.stage,
    //       configSetName,
    //     )
    //
    //     results.push(result)
    //   }
    //
    //   timer.stop()
    //
    //   io.info(
    //     `Completed stage '${stageName}' in ${timer.getFormattedTimeElapsed()}`,
    //   )
    // }

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
      commandPath,
      concurrentAccounts,
      configSetType,
      logger: io,
      plan: accountsLaunchPlan,
      timer: totalTimer.startChild("execute"),
      state: { failed: false },
      defaultCredentialManager: ctx.credentialManager,
      targetListenerProvider: io.createTargetListener,
    })

    return transitions.completeAccountsOperation({
      ...state,
      ...result,
    })
  }
