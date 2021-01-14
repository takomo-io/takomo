import { StackOperationStep } from "../common/steps"
import {
  defaultStackOperationTransitions,
  inProgress,
  StackOperationTransitions,
} from "../common/transitions"
import { resolveResultMessage } from "./common"
import {
  ChangeSetHolder,
  ChangeSetNameHolder,
  CurrentStackHolder,
  DeleteFailedStackClientTokenHolder,
  DetailedCurrentStackHolder,
  InitialDeployStackState,
  ParametersHolder,
  StackOperationClientTokenHolder,
  StackOperationResultHolder,
  TagsHolder,
  TemplateBodyHolder,
  TemplateLocationHolder,
  TemplateSummaryHolder,
  UpdateStackHolder,
} from "./states"
import { enrichCurrentStack } from "./steps/enrich-current-stack"
import { executeAfterDeployHooks } from "./steps/execute-after-deploy-hooks"
import { executeBeforeDeployHooks } from "./steps/execute-before-deploy-hooks"
import { initiateChangeSetCreate } from "./steps/initiate-change-set-create"
import { initiateFailedStackDelete } from "./steps/initiate-failed-stack-delete"
import { initiateStackCreate } from "./steps/initiate-stack-create"
import { initiateStackCreateOrUpdate } from "./steps/initiate-stack-create-or-update"
import { initiateStackUpdate } from "./steps/initiate-stack-update"
import { prepareParameters } from "./steps/prepare-parameters"
import { prepareTags } from "./steps/prepare-tags"
import { prepareTemplate } from "./steps/prepare-template"
import { reviewChangeSet } from "./steps/review-change-set"
import { summarizeTemplate } from "./steps/summarize-template"
import { updateTerminationProtection } from "./steps/update-termination-protection"
import { uploadTemplate } from "./steps/upload-template"
import { validateParameters } from "./steps/validate-parameters"
import { validateTemplate } from "./steps/validate-template"
import { waitChangeSetToBeReady } from "./steps/wait-change-set-to-be-ready"
import { waitDependenciesToComplete } from "./steps/wait-dependencies-to-complete"
import { waitFailedStackDeleteToComplete } from "./steps/wait-failed-stack-delete-to-complete"
import { waitStackCreateOrUpdateToComplete } from "./steps/wait-stack-create-or-update-to-complete"

/**
 * @hidden
 */
export interface DeployStackTransitions extends StackOperationTransitions {
  initiateFailedStackDelete: StackOperationStep<CurrentStackHolder>

  waitFailedStackDeleteToComplete: StackOperationStep<
    DeleteFailedStackClientTokenHolder
  >

  enrichCurrentStack: StackOperationStep<CurrentStackHolder>

  executeBeforeDeployHooks: StackOperationStep<DetailedCurrentStackHolder>

  prepareParameters: StackOperationStep<DetailedCurrentStackHolder>

  prepareTags: StackOperationStep<ParametersHolder>

  prepareTemplate: StackOperationStep<TagsHolder>

  uploadTemplate: StackOperationStep<TemplateBodyHolder>

  validateTemplate: StackOperationStep<TemplateLocationHolder>

  summarizeTemplate: StackOperationStep<TemplateLocationHolder>

  initiateChangeSetCreate: StackOperationStep<TemplateSummaryHolder>

  waitChangeSetToBeReady: StackOperationStep<ChangeSetNameHolder>

  reviewChangeSet: StackOperationStep<ChangeSetHolder>

  initiateStackCreateOrUpdate: StackOperationStep<TemplateSummaryHolder>

  validateParameters: StackOperationStep<TemplateSummaryHolder>

  initiateStackCreate: StackOperationStep<TemplateSummaryHolder>

  updateTerminationProtection: StackOperationStep<UpdateStackHolder>

  initiateStackUpdate: StackOperationStep<UpdateStackHolder>

  waitStackCreateOrUpdateToComplete: StackOperationStep<
    StackOperationClientTokenHolder
  >

  executeAfterDeployHooks: StackOperationStep<StackOperationResultHolder>
}

/**
 * @hidden
 */
export const createDeployStackTransitions = (): DeployStackTransitions => ({
  ...defaultStackOperationTransitions,

  start: inProgress(
    "wait-dependencies-to-complete",
    waitDependenciesToComplete,
  ),

  executeAfterDeployHooks: inProgress(
    "execute-after-deploy-hooks",
    executeAfterDeployHooks,
  ),

  executeBeforeDeployHooks: inProgress(
    "execute-before-deploy-hooks",
    executeBeforeDeployHooks,
  ),

  initiateChangeSetCreate: inProgress(
    "initiate-change-set-create",
    executeAfterDeployHooksOnError(initiateChangeSetCreate),
  ),

  initiateStackCreate: inProgress(
    "initiate-stack-create",
    executeAfterDeployHooksOnError(initiateStackCreate),
  ),

  initiateStackCreateOrUpdate: inProgress(
    "initiate-stack-create-or-update",
    executeAfterDeployHooksOnError(initiateStackCreateOrUpdate),
  ),

  validateParameters: inProgress(
    "validate-parameters",
    executeAfterDeployHooksOnError(validateParameters),
  ),

  initiateStackUpdate: inProgress(
    "initiate-stack-update",
    executeAfterDeployHooksOnError(initiateStackUpdate),
  ),

  prepareTemplate: inProgress(
    "prepare-template",
    executeAfterDeployHooksOnError(prepareTemplate),
  ),

  reviewChangeSet: inProgress(
    "review-change-set",
    executeAfterDeployHooksOnError(reviewChangeSet),
  ),

  summarizeTemplate: inProgress(
    "summarize-template",
    executeAfterDeployHooksOnError(summarizeTemplate),
  ),

  uploadTemplate: inProgress(
    "upload-template",
    executeAfterDeployHooksOnError(uploadTemplate),
  ),

  validateTemplate: inProgress(
    "validate-template",
    executeAfterDeployHooksOnError(validateTemplate),
  ),

  waitChangeSetToBeReady: inProgress(
    "wait-change-set-to-be-ready",
    executeAfterDeployHooksOnError(waitChangeSetToBeReady),
  ),

  waitStackCreateOrUpdateToComplete: inProgress(
    "wait-stack-create-or-update-complete",
    executeAfterDeployHooksOnError(waitStackCreateOrUpdateToComplete),
  ),

  prepareParameters: inProgress(
    "prepare-parameters",
    executeAfterDeployHooksOnError(prepareParameters),
  ),

  prepareTags: inProgress(
    "prepare-tags",
    executeAfterDeployHooksOnError(prepareTags),
  ),

  initiateFailedStackDelete: inProgress(
    "initiate-failed-stack-delete",
    initiateFailedStackDelete,
  ),

  waitFailedStackDeleteToComplete: inProgress(
    "wait-failed-stack-delete-to-complete",
    waitFailedStackDeleteToComplete,
  ),

  enrichCurrentStack: inProgress("enrich-current-stack", enrichCurrentStack),

  updateTerminationProtection: inProgress(
    "update-termination-protection",
    executeAfterDeployHooksOnError(updateTerminationProtection),
  ),
})

/**
 * @hidden
 */
export const executeAfterDeployHooksOnError = <
  S extends InitialDeployStackState
>(
  step: StackOperationStep<S>,
): StackOperationStep<S> => async (state: S) => {
  try {
    return await step(state)
  } catch (error) {
    state.logger.error("An error occurred", error)
    return state.transitions.executeAfterDeployHooks({
      events: [],
      ...state,
      error,
      success: false,
      status: "FAILED",
      message: resolveResultMessage(state.operationType, false),
    })
  }
}
