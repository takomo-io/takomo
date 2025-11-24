import { StackOperationStep } from "../../common/steps.js"
import {
  defaultStackOperationTransitions,
  inProgress,
  StackOperationTransitions,
} from "../../common/transitions.js"
import {
  ChangesHolder,
  InitialDeployCustomStackState,
  ParametersHolder,
  TagsHolder,
} from "./states.js"
import { createOrUpdateStack } from "./steps/create-or-update-stack.js"
import { createStack } from "./steps/create-stack.js"
import { getChanges } from "./steps/get-changes.js"
import { prepareParameters } from "./steps/prepare-parameters.js"
import { prepareTags } from "./steps/prepare-tags.js"
import { reviewDeployment } from "./steps/review-deployment.js"
import { updateStack } from "./steps/update-stack.js"
import { waitDependenciesToComplete } from "./steps/wait-dependencies-to-complete.js"

export interface DeployCustomStackTransitions
  extends StackOperationTransitions {
  prepareParameters: StackOperationStep<InitialDeployCustomStackState>
  prepareTags: StackOperationStep<ParametersHolder>
  getChanges: StackOperationStep<TagsHolder>
  reviewDeployment: StackOperationStep<ChangesHolder>
  createOrUpdateStack: StackOperationStep<ChangesHolder>
  createStack: StackOperationStep<ChangesHolder>
  updateStack: StackOperationStep<ChangesHolder>
}

export const createDeployCustomStackTransitions =
  (): DeployCustomStackTransitions => ({
    ...defaultStackOperationTransitions,

    start: inProgress(
      "wait-dependencies-to-complete",
      waitDependenciesToComplete,
    ),

    prepareParameters: inProgress("prepare-parameters", prepareParameters),

    prepareTags: inProgress("prepare-tags", prepareTags),

    getChanges: inProgress("get-changes", getChanges),

    reviewDeployment: inProgress("review-deployment", reviewDeployment),

    createOrUpdateStack: inProgress(
      "create-or-update-stack",
      createOrUpdateStack,
    ),

    createStack: inProgress("create-stack", createStack),
    updateStack: inProgress("update-stack", updateStack),
  })
