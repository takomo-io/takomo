import { StackOperationStep } from "../common/steps"
import {
  defaultStackOperationTransitions,
  inProgress,
  StackOperationTransitions,
} from "../common/transitions"
import {
  ClientTokenHolder,
  CurrentStackHolder,
  InitialUndeployStackState,
  StackOperationResultHolder,
} from "./states"
import { executeAfterUndeployHooks } from "./steps/execute-after-undeploy-hooks"
import { executeBeforeUndeployHooks } from "./steps/execute-before-undeploy-hooks"
import { initiateStackDeletion } from "./steps/initiate-stack-delete"
import { waitDependentsToComplete } from "./steps/wait-dependents-to-complete"
import { waitStackDeleteToComplete } from "./steps/wait-stack-delete-to-complete"

/**
 * @hidden
 */
export interface UndeployStackTransitions extends StackOperationTransitions {
  executeBeforeUndeployHooks: StackOperationStep<CurrentStackHolder>
  initiateStackDelete: StackOperationStep<CurrentStackHolder>
  waitStackDeleteToComplete: StackOperationStep<ClientTokenHolder>
  executeAfterUndeployHooks: StackOperationStep<StackOperationResultHolder>
}

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export const executeAfterUndeployHooksOnError =
  <S extends InitialUndeployStackState>(
    step: StackOperationStep<S>,
  ): StackOperationStep<S> =>
  async (state: S) => {
    try {
      return await step(state)
    } catch (error) {
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
