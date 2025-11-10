import { StackOperationStep } from "../../common/steps.js"
import {
  defaultStackOperationTransitions,
  inProgress,
  StackOperationTransitions,
} from "../../common/transitions.js"
import { waitDependentsToComplete } from "../steps/wait-dependents-to-complete.js"
import { InitialUndeployCustomStackState } from "./states.js"
import { deleteStack } from "./steps/delete-stack.js"

export interface UndeployCustomStackTransitions
  extends StackOperationTransitions {
  deleteStack: StackOperationStep<InitialUndeployCustomStackState>
}

export const createUndeployCustomStackTransitions =
  (): UndeployCustomStackTransitions => ({
    ...defaultStackOperationTransitions,
    deleteStack: inProgress("delete-stack", deleteStack),
    start: inProgress("wait-dependents-to-complete", waitDependentsToComplete),
  })
