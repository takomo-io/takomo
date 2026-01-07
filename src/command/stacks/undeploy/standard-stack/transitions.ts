import { StackOperationStep } from "../../common/steps.js"
import {
  defaultStackOperationTransitions,
  inProgress,
  StackOperationTransitions,
} from "../../common/transitions.js"
import {
  ClientTokenHolder,
  CurrentStackHolder,
  InitialUndeployStandardStackState,
  StackOperationResultHolder,
} from "./states.js"
import { executeAfterUndeployHooks } from "./steps/execute-after-undeploy-hooks.js"
import { initiateStackDeletion } from "./steps/initiate-stack-delete.js"
import { executeBeforeUndeployHooks } from "./steps/execute-before-undeploy-hooks.js"
import { waitDependentsToComplete } from "./steps/wait-dependents-to-complete.js"
import { waitStackDeleteToComplete } from "./steps/wait-stack-delete-to-complete.js"

export interface UndeployStackTransitions extends StackOperationTransitions {
  executeBeforeUndeployHooks: StackOperationStep<CurrentStackHolder>
  initiateStackDelete: StackOperationStep<CurrentStackHolder>
  waitStackDeleteToComplete: StackOperationStep<ClientTokenHolder>
  executeAfterUndeployHooks: StackOperationStep<StackOperationResultHolder>
}

export const createUndeployStackTransitions = (): UndeployStackTransitions => ({
  ...defaultStackOperationTransitions,
  executeAfterUndeployHooks: inProgress(
    "execute-after-hooks",
    executeAfterUndeployHooks,
  ),
  executeBeforeUndeployHooks: inProgress(
    "execute-before-hooks",
    executeBeforeUndeployHooks,
  ),
  initiateStackDelete: inProgress(
    "initiate-stack-delete",
    executeAfterUndeployHooksOnError(initiateStackDeletion),
  ),
  waitStackDeleteToComplete: inProgress(
    "wait-stack-delete-complete",
    executeAfterUndeployHooksOnError(waitStackDeleteToComplete),
  ),
  start: inProgress("wait-dependents-to-complete", waitDependentsToComplete),
})

export const executeAfterUndeployHooksOnError =
  <S extends InitialUndeployStandardStackState>(
    step: StackOperationStep<S>,
  ): StackOperationStep<S> =>
  async (state: S) => {
    try {
      return await step(state)
    } catch (error: any) {
      state.logger.error("An error occurred", error)
      return state.transitions.executeAfterUndeployHooks({
        events: [],
        ...state,
        error,
        success: false,
        status: "FAILED",
        message: "Error",
      })
    }
  }
