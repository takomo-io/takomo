import { StackOperationStep } from "../../common/steps.js"
import {
  defaultStackOperationTransitions,
  inProgress,
  StackOperationTransitions,
} from "../../common/transitions.js"
import { CurrentStateHolder, CustomConfigHolder } from "./states.js"
import { deleteStack } from "./steps/delete-stack.js"
import { getCurrentState } from "./steps/get-current-state.js"
import { parseConfig } from "./steps/parse-config.js"
import { waitDependentsToComplete } from "./steps/wait-dependents-to-complete.js"

export interface UndeployCustomStackTransitions
  extends StackOperationTransitions {
  getCurrentState: StackOperationStep<CustomConfigHolder>
  waitDependentsToComplete: StackOperationStep<CurrentStateHolder>
  deleteStack: StackOperationStep<CurrentStateHolder>
}

export const createUndeployCustomStackTransitions =
  (): UndeployCustomStackTransitions => ({
    ...defaultStackOperationTransitions,
    start: inProgress("parse-config", parseConfig),
    getCurrentState: inProgress("get-current-state", getCurrentState),
    deleteStack: inProgress("delete-stack", deleteStack),
    waitDependentsToComplete: inProgress(
      "wait-dependents-to-complete",
      waitDependentsToComplete,
    ),
  })
